// server/index.js

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import pkg from 'pg';
const { Pool } = pkg;

// WebCrypto (for SHA-256 hash chain)
import { webcrypto as crypto } from 'crypto';

// Filesystem + paths (ONE set of imports only)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---------------- DB ----------------
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const q = (text, params = []) => pool.query(text, params);

// ---------------- Helpers ----------------
const hash = async (input) => {
  // input: Buffer
  const buf = await crypto.subtle.digest('SHA-256', input);
  return Buffer.from(buf);
};
const chatKey = (a, b) => (a < b) ? `${a}-${b}` : `${b}-${a}`;

// Ensure a user exists by code; create if missing (bots too)
async function ensureUser(code, displayName = null) {
  const got = await q('SELECT id, code FROM users WHERE code=$1', [code]);
  if (got.rows.length) return got.rows[0];

  const label = displayName || (
    code === 'RH-COACH' ? 'Coach Bot' :
    code === 'RH-CALM'  ? 'Calm Bot'  :
    code === 'RH-PEER'  ? 'Peer Bot'  :
    code
  );

  const ins = await q(
    'INSERT INTO users(code, display_name) VALUES($1,$2) RETURNING id, code',
    [code, label]
  );
  return ins.rows[0];
}

// ---------------- REST API ----------------

// Register (or login) by code + displayName + publicKeyJwk
app.post('/api/register', async (req, res) => {
  const { code, displayName, publicKeyJwk } = req.body;
  if (!code || !displayName || !publicKeyJwk) {
    return res.status(400).json({ error: 'missing fields' });
  }
  const client = await pool.connect();
  try {
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
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'register failed' });
  } finally {
    client.release();
  }
});

// Get public key & minimal profile by code
app.get('/api/user/:code', async (req, res) => {
  const { rows } = await q(
    `SELECT u.id, u.code, u.display_name, k.public_key_jwk
       FROM users u LEFT JOIN user_keys k ON u.id = k.user_id
      WHERE u.code = $1`,
    [req.params.code]
  );
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

// Send a friend request (by code) — mirrors a pending request back
app.post('/api/friends/request', async (req, res) => {
  const { fromCode, toCode } = req.body;
  const from = await ensureUser(fromCode);
  const to   = await ensureUser(toCode);

  await q(
    `INSERT INTO friend_requests(from_user,to_user,status)
     VALUES ($1,$2,'pending')
     ON CONFLICT (from_user,to_user) DO NOTHING`,
    [from.id, to.id]
  );

  await q(
    `INSERT INTO friend_requests(from_user,to_user,status)
     VALUES ($1,$2,'pending')
     ON CONFLICT (from_user,to_user) DO NOTHING`,
    [to.id, from.id]
  );

  res.json({ ok: true });
});

// Accept request → adds to friends (both sides)
app.post('/api/friends/accept', async (req, res) => {
  const { meCode, fromCode } = req.body;
  const me   = (await q('SELECT id FROM users WHERE code=$1', [meCode])).rows[0]?.id;
  const from = (await q('SELECT id FROM users WHERE code=$1', [fromCode])).rows[0]?.id;
  if (!me || !from) return res.status(404).json({ error: 'not found' });

  await q(
    `UPDATE friend_requests SET status='accepted'
      WHERE from_user=$1 AND to_user=$2 AND status='pending'`,
    [from, me]
  );

  await q(`INSERT INTO friends(user_a,user_b) VALUES($1,$2) ON CONFLICT DO NOTHING`, [me, from]);
  await q(`INSERT INTO friends(user_a,user_b) VALUES($1,$2) ON CONFLICT DO NOTHING`, [from, me]);
  res.json({ ok: true });
});

// List friends & pending for a user code
app.get('/api/friends/:code', async (req, res) => {
  const meRow = await q('SELECT id FROM users WHERE code=$1', [req.params.code]);
  if (!meRow.rows.length) return res.status(404).json({ error: 'not found' });
  const me = meRow.rows[0].id;

  const friends = (
    await q(
      `SELECT u.code, u.display_name
         FROM friends f JOIN users u ON u.id = f.user_b
        WHERE f.user_a = $1`,
      [me]
    )
  ).rows;

  const requests = (
    await q(
      `SELECT u.code, u.display_name
         FROM friend_requests r JOIN users u ON u.id = r.from_user
        WHERE r.to_user = $1 AND r.status = 'pending'`,
      [me]
    )
  ).rows;

  res.json({ friends, requests });
});

// Fetch encrypted history for a pair
app.get('/api/history', async (req, res) => {
  const { aCode, bCode } = req.query;
  const a = (await q('SELECT id FROM users WHERE code=$1', [aCode])).rows[0]?.id;
  const b = (await q('SELECT id FROM users WHERE code=$1', [bCode])).rows[0]?.id;
  if (!a || !b) return res.status(404).json({ error: 'not found' });
  const key = chatKey(a, b);
  const rows = (
    await q(
      `SELECT from_user, to_user, ciphertext, nonce, prev_hash, hash, created_at
         FROM messages
        WHERE chat_key = $1
        ORDER BY id ASC`,
      [key]
    )
  ).rows;
  res.json({ rows });
});

// ---------------- WebSocket ----------------
const server = createServer(app);
const wss = new WebSocketServer({ server });

const sockets = new Map(); // userId -> ws

wss.on('connection', (ws) => {
  ws.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      if (data.type === 'hello') {
        const u = await q('SELECT id FROM users WHERE code=$1', [data.code]);
        if (!u.rows.length) { ws.close(); return; }
        const uid = u.rows[0].id;
        sockets.set(uid, ws);
        ws.uid = uid;
        ws.send(JSON.stringify({ type: 'ready' }));
        return;
      }

      // { type: "msg", fromCode, toCode, ciphertext(base64), nonce(base64) }
      if (data.type === 'msg' && ws.uid) {
        const to = (await q('SELECT id FROM users WHERE code=$1', [data.toCode])).rows[0]?.id;
        if (!to) return;

        const key  = chatKey(ws.uid, to);
        const prev = (await q(
          `SELECT hash FROM messages WHERE chat_key=$1 ORDER BY id DESC LIMIT 1`,
          [key]
        )).rows[0]?.hash;

        const ts = Buffer.from(new Date().toISOString());
        const toHashInput = Buffer.concat([
          Buffer.from(prev || ''),
          Buffer.from(data.ciphertext, 'base64'),
          Buffer.from(data.nonce, 'base64'),
          ts
        ]);
        const h = await hash(toHashInput);

        await q(
          `INSERT INTO messages(chat_key, from_user, to_user, ciphertext, nonce, prev_hash, hash)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            key, ws.uid, to,
            Buffer.from(data.ciphertext, 'base64'),
            Buffer.from(data.nonce, 'base64'),
            prev || null, h
          ]
        );

        const rcpt = sockets.get(to);
        if (rcpt) {
          rcpt.send(JSON.stringify({
            type: 'msg',
            fromCode: data.fromCode,
            ciphertext: data.ciphertext,
            nonce: data.nonce
          }));
        }
      }
    } catch (e) {
      console.error('ws error', e);
    }
  });

  ws.on('close', () => { if (ws.uid) sockets.delete(ws.uid); });
});

// ---------------- Static Frontend ----------------
// Frontend lives at repo root (parent of /server). Override with STATIC_DIR env var if needed.
const STATIC_DIR = process.env.STATIC_DIR || '.';
const staticDir  = path.resolve(__dirname, '..', STATIC_DIR);
console.log('Serving static from:', staticDir);

// serve assets (css/js/images/sw/etc.)
app.use(express.static(staticDir));

// explicit route for /
app.get('/', (req, res) => {
  const idx = path.join(staticDir, 'index.html');
  if (!fs.existsSync(idx)) {
    console.error('index.html NOT FOUND at:', idx);
    return res.status(500).send('index.html not found at staticDir. Set STATIC_DIR env var if needed.');
  }
  res.sendFile(idx);
});

// SPA fallback (keep API endpoints intact)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(staticDir, 'index.html'));
});

// ---------------- Start ----------------
const port = process.env.PORT || 10000;
server.listen(port, () => console.log('server on', port));
