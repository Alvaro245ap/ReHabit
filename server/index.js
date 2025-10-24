import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ---- Helpers
const q = (text, params=[]) => pool.query(text, params);
const hash = async (input) => {
  const buf = await crypto.subtle.digest('SHA-256', input);
  return Buffer.from(buf);
};
const chatKey = (a, b) => (a < b) ? `${a}-${b}` : `${b}-${a}`;

// ---- REST

// Register (or login) by code + displayName + publicKeyJwk
app.post('/api/register', async (req,res) => {
  const { code, displayName, publicKeyJwk } = req.body;
  if(!code || !displayName || !publicKeyJwk) return res.status(400).json({error:'missing fields'});
  const client = await pool.connect();
  try{
    await client.query('BEGIN');
    const upsertUser = `
      INSERT INTO users(code, display_name)
      VALUES($1,$2)
      ON CONFLICT (code) DO UPDATE SET display_name = EXCLUDED.display_name
      RETURNING id, code, display_name;
    `;
    const u = await client.query(upsertUser, [code, displayName]);
    const user = u.rows[0];
    const upsertKey = `
      INSERT INTO user_keys(user_id, public_key_jwk)
      VALUES($1,$2)
      ON CONFLICT (user_id) DO UPDATE SET public_key_jwk = EXCLUDED.public_key_jwk, updated_at = now();
    `;
    await client.query(upsertKey, [user.id, publicKeyJwk]);
    await client.query('COMMIT');
    res.json(user);
  }catch(e){
    await client.query('ROLLBACK'); console.error(e); res.status(500).json({error:'register failed'});
  }finally{ client.release(); }
});

// Get public key & minimal profile by code
app.get('/api/user/:code', async (req,res)=>{
  const { rows } = await q(`SELECT u.id, u.code, u.display_name, k.public_key_jwk
                             FROM users u LEFT JOIN user_keys k ON u.id=k.user_id
                             WHERE u.code=$1`, [req.params.code]);
  if(!rows.length) return res.status(404).json({error:'not found'});
  res.json(rows[0]);
});

// Send a friend request (by code)
app.post('/api/friends/request', async (req,res)=>{
  const { fromCode, toCode } = req.body;
  const { rows: R1 } = await q('SELECT id FROM users WHERE code=$1',[fromCode]);
  const { rows: R2 } = await q('SELECT id FROM users WHERE code=$1',[toCode]);
  if(!R1.length || !R2.length) return res.status(404).json({error:'user not found'});
  const from = R1[0].id, to = R2[0].id;
  await q(`INSERT INTO friend_requests(from_user,to_user,status)
           VALUES ($1,$2,'pending')
           ON CONFLICT (from_user,to_user) DO NOTHING`, [from,to]);
  // Mirror request back so the other user sees it, like you asked
  await q(`INSERT INTO friend_requests(from_user,to_user,status)
           VALUES ($1,$2,'pending')
           ON CONFLICT (from_user,to_user) DO NOTHING`, [to,from]);
  res.json({ok:true});
});

// Accept request
app.post('/api/friends/accept', async (req,res)=>{
  const { meCode, fromCode } = req.body;
  const me = (await q('SELECT id FROM users WHERE code=$1',[meCode])).rows[0]?.id;
  const from = (await q('SELECT id FROM users WHERE code=$1',[fromCode])).rows[0]?.id;
  if(!me || !from) return res.status(404).json({error:'not found'});

  await q(`UPDATE friend_requests SET status='accepted'
           WHERE from_user=$1 AND to_user=$2 AND status='pending'`, [from, me]);

  // create both sides friendship
  await q(`INSERT INTO friends(user_a,user_b) VALUES($1,$2) ON CONFLICT DO NOTHING`, [me, from]);
  await q(`INSERT INTO friends(user_a,user_b) VALUES($1,$2) ON CONFLICT DO NOTHING`, [from, me]);
  res.json({ok:true});
});

// List friends & pending
app.get('/api/friends/:code', async (req,res)=>{
  const meRow = await q('SELECT id FROM users WHERE code=$1',[req.params.code]);
  if(!meRow.rows.length) return res.status(404).json({error:'not found'});
  const me = meRow.rows[0].id;

  const friends = (await q(`SELECT u.code, u.display_name
                            FROM friends f JOIN users u ON u.id=f.user_b
                            WHERE f.user_a=$1`, [me])).rows;

  const requests = (await q(`SELECT u.code, u.display_name
                             FROM friend_requests r JOIN users u ON u.id=r.from_user
                             WHERE r.to_user=$1 AND r.status='pending'`, [me])).rows;

  res.json({ friends, requests });
});

// Fetch history (ciphertexts) for a chat pair
app.get('/api/history', async (req,res)=>{
  const { aCode, bCode } = req.query;
  const a = (await q('SELECT id FROM users WHERE code=$1',[aCode])).rows[0]?.id;
  const b = (await q('SELECT id FROM users WHERE code=$1',[bCode])).rows[0]?.id;
  if(!a || !b) return res.status(404).json({error:'not found'});
  const key = chatKey(a, b);
  const rows = (await q(`SELECT from_user, to_user, ciphertext, nonce, prev_hash, hash, created_at
                         FROM messages WHERE chat_key=$1 ORDER BY id ASC`, [key])).rows;
  res.json({ rows });
});

// ---- WebSocket for live messages (encrypted)

const server = createServer(app);
const wss = new WebSocketServer({ server });

const sockets = new Map(); // userId -> ws

wss.on('connection', (ws, req) => {
  // client must send: {type:"hello", code:"RH-XXXX"}
  ws.on('message', async msg => {
    try{
      const data = JSON.parse(msg.toString());
      if(data.type === 'hello'){
        const u = await q('SELECT id FROM users WHERE code=$1',[data.code]);
        if(!u.rows.length){ ws.close(); return; }
        const uid = u.rows[0].id;
        sockets.set(uid, ws);
        ws.uid = uid;
        ws.send(JSON.stringify({type:'ready'}));
      }
      // {type:"msg", toCode, ciphertext(base64), nonce(base64)}
      if(data.type === 'msg' && ws.uid){
        const to = (await q('SELECT id FROM users WHERE code=$1',[data.toCode])).rows[0]?.id;
        if(!to) return;
        const key = chatKey(ws.uid, to);
        const prev = (await q(`SELECT hash FROM messages WHERE chat_key=$1 ORDER BY id DESC LIMIT 1`, [key])).rows[0]?.hash;
        const ts = Buffer.from(new Date().toISOString());
        const toHashInput = Buffer.concat([
          Buffer.from(prev || ''), Buffer.from(data.ciphertext,'base64'),
          Buffer.from(data.nonce,'base64'), ts
        ]);
        const h = await hash(toHashInput);
        await q(`INSERT INTO messages(chat_key,from_user,to_user,ciphertext,nonce,prev_hash,hash)
                 VALUES($1,$2,$3,$4,$5,$6,$7)`,
          [key, ws.uid, to, Buffer.from(data.ciphertext,'base64'), Buffer.from(data.nonce,'base64'), prev || null, h]);

        // push to recipient if online
        const rcpt = sockets.get(to);
        if(rcpt){
          rcpt.send(JSON.stringify({
            type:'msg', fromCode:data.fromCode, ciphertext:data.ciphertext, nonce:data.nonce
          }));
        }
      }
    }catch(e){
      console.error('ws error', e);
    }
  });

  ws.on('close', ()=>{ if(ws.uid) sockets.delete(ws.uid); });
});

const port = process.env.PORT || 10000;
server.listen(port, ()=>console.log('server on', port));
