/* ReHabit — app.js (fixed full) */
console.log("app.js loaded");

// ==== BACKEND CONFIG ====
const API_BASE = ""; // same-origin API: fetch('/api/...'), ws to wss://host

let myServerUser = null;
let ws = null;
let WS_OPENED = false;

const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const pad = (n) => String(n).padStart(2,"0");
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function escapeHTML(s){
  const map = { "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#039;" };
  return String(s).replace(/[&<>"']/g, ch => map[ch]);
}

/* ---------------- state & storage ---------------- */
const STORAGE = {
  PROFILE:"rehabit_profile", CAL:"rehabit_calendar", JOURNAL:"rehabit_journal",
  SOCIAL:"rehabit_social", BADGES:"rehabit_badges", CHECK:"rehabit_check"
};
const state = {
  profile:null, cal:{}, journal:[], social:{chatted:false,friended:false}, i18n:"en",
  researchChoice:null, guideChoice:null, check:{}
};
function load(){
  state.profile = JSON.parse(localStorage.getItem(STORAGE.PROFILE)||"null");
  state.cal     = JSON.parse(localStorage.getItem(STORAGE.CAL)||"{}");
  state.journal = JSON.parse(localStorage.getItem(STORAGE.JOURNAL)||"[]");
  state.social  = JSON.parse(localStorage.getItem(STORAGE.SOCIAL)||'{"chatted":false,"friended":false}');
  state.check   = JSON.parse(localStorage.getItem(STORAGE.CHECK)||"{}");
  state.i18n    = state.profile?.lang || "en";
  document.documentElement.setAttribute("data-lang", state.i18n);
}
function save(){
  localStorage.setItem(STORAGE.PROFILE, JSON.stringify(state.profile));
  localStorage.setItem(STORAGE.CAL, JSON.stringify(state.cal));
  localStorage.setItem(STORAGE.JOURNAL, JSON.stringify(state.journal));
  localStorage.setItem(STORAGE.SOCIAL, JSON.stringify(state.social));
  localStorage.setItem(STORAGE.CHECK, JSON.stringify(state.check));
}

/* ---------------- i18n (EN/ES minimal) ---------------- */
const D = {
  en:{ welcome:"Welcome 👋", selectFocus:"Select your focus and a target date to start tracking progress.",
      quitDate:"Quit/target date", motivation:"Your main motivation (optional)", start:"Start ReHabit",
      monthCard:"Calendar (this month)", checkin:"Daily Check-in", calendar:"Calendar", guide:"Guide",
      badges:"Badges", research:"Research", chat:"Community", friends:"Friends", settings:"Settings", notes:"Notes",
      steps:"10 Steps", tips:"Tips", deep:"Deep Guide", recent:"Recent notes",
      mood:"Mood (0–10)", urge:"Urge (0–10)", sleep:"Hours of sleep", cravingWindow:"Craving window",
      morning:"Morning", afternoon:"Afternoon", evening:"Evening", night:"Night",
      actionTook:"Helpful action you took", note:"Note (optional)", exposure:"Exposure level today", low:"Low", medium:"Medium", high:"High",
      sos:"Craving SOS", success:"Success", slip:"Slip", yourCode:"Your code:", requests:"Requests", friendsList:"Friends",
      a_tech:"Technology", a_smoke:"Smoking", a_alcohol:"Alcohol", a_gambling:"Gambling", a_other:"Other drugs" },
  es:{ welcome:"Bienvenido/a 👋", selectFocus:"Elige tu(s) enfoque(s) y una fecha objetivo para comenzar a registrar tu progreso.",
      quitDate:"Fecha objetivo", motivation:"Tu principal motivación (opcional)", start:"Comenzar con ReHabit",
      monthCard:"Calendario (este mes)", checkin:"Revisión diaria", calendar:"Calendario", guide:"Guía",
      badges:"Insignias", research:"Investigación", chat:"Comunidad", friends:"Amigos", settings:"Ajustes", notes:"Notas",
      steps:"10 Pasos", tips:"Consejos", deep:"Guía profunda", recent:"Notas recientes",
      mood:"Estado de ánimo (0–10)", urge:"Impulso (0–10)", sleep:"Horas de sueño", cravingWindow:"Momento de mayor impulso",
      morning:"Mañana", afternoon:"Tarde", evening:"Atardecer", night:"Noche",
      actionTook:"Acción útil que hiciste", note:"Nota (opcional)", exposure:"Nivel de exposición hoy", low:"Bajo", medium:"Medio", high:"Alto",
      sos:"SOS por antojo", success:"Logro", slip:"Recaída", yourCode:"Tu código:", requests:"Solicitudes", friendsList:"Amigos",
      a_tech:"Tecnología", a_smoke:"Fumar", a_alcohol:"Alcohol", a_gambling:"Ludopatía", a_other:"Otras drogas" }
};
function t(k){ const L=document.documentElement.getAttribute("data-lang")||"en"; return (D[L] && D[L][k]) || D.en[k] || k; }
function applyI18N(){ $$("[data-i18n]").forEach(el => el.textContent = t(el.getAttribute("data-i18n"))); }

/* ---------------- content (short) ---------------- */
const ADDICTIONS=["Technology","Smoking","Alcohol","Gambling","Other"];
const TIPS={
  Technology:{en:["Screen-time caps","Disable notifications"],es:["Límites de pantalla","Desactiva notificaciones"]},
  Smoking:{en:["Set quit date","Use NRT"],es:["Fija fecha","Usa TSN"]},
  Alcohol:{en:["Abstinence or caps","Remove alcohol at home"],es:["Abstinencia o límites","Retira alcohol en casa"]},
  Gambling:{en:["Bank blocks","Device/site blockers"],es:["Bloqueos bancarios","Bloqueadores de dispositivos"]},
  Other:{en:["Consult clinician","Remove cues"],es:["Consulta a un profesional","Retira señales"]}
};
const DEEP={
  Technology:{en:["Delay 5 + long exhale"],es:["Demora 5 + exhalación larga"]},
  Smoking:{en:["Urge surfing 2–3 min"],es:["Surf del impulso 2–3 min"]},
  Alcohol:{en:["HALT check"],es:["Revisión HALT"]},
  Gambling:{en:["Budget firewall"],es:["Cortafuegos presupuestario"]},
  Other:{en:["Coping kit"],es:["Kit de afrontamiento"]}
};
const STEPS={
  Technology:{en:["Goal","Audit apps","Focus mode","Replacements","One-tab 25/5","Phone dock","Log urges","Weekly review","Relapse reset","Celebrate"],es:["Objetivo","Audita apps","Modo enfoque","Reemplazos","Una pestaña 25/5","Teléfono fuera","Registra impulsos","Revisión semanal","Reinicio","Celebra"]},
  Smoking:{en:["Pick date","Get NRT","Map triggers","Clean spaces","Delay + exhale","Walk","Refusal script","Hydration","Avoid alcohol","Reward"],es:["Elige fecha","Prepara TSN","Mapa disparadores","Limpia espacios","Demora + exhala","Camina","Guion rechazo","Hidratación","Evita alcohol","Recompensa"]},
  Alcohol:{en:["Commit limits","Clear alcohol","NA ritual","HALT","Evening routine","Delay + surf","Avoid risky places","Accountability","Track units","Reward"],es:["Compromiso límites","Retira alcohol","Ritual sin alcohol","HALT","Rutina nocturna","Demora + surf","Evita lugares de riesgo","Responsabilidad","Registra unidades","Recompensa"]},
  Gambling:{en:["Bank blocks","Blockers","Budget","Share statements","Plan risky windows","Delay + surf","Remove apps","Limit cash","Low-stimulation nights","Review"],es:["Bloqueos bancarios","Bloqueadores","Presupuesto","Comparte extractos","Planifica ventanas","Demora + surf","Elimina apps","Limita efectivo","Noches tranquilas","Revisión"]},
  Other:{en:["Assess safety","Taper plan","Remove paraphernalia","Daily structure","Coping kit","Delay + surf","Identify triggers","Accountability","Track calendar","Adjust weekly"],es:["Evalúa seguridad","Plan de reducción","Retira parafernalia","Estructura diaria","Kit de afrontamiento","Demora + surf","Identifica disparadores","Responsabilidad","Registra calendario","Ajuste semanal"]}
};

/* ---------------- badges ---------------- */
const SOBRIETY=[{days:7,title:"1-Week Strong"},{days:30,title:"1-Month Steady"},{days:90,title:"Quarter Champ"}];
function okDaysSinceStart(){ const start=state.profile?.quitDate?new Date(state.profile.quitDate):null; if(!start) return 0; let n=0; for(const iso in state.cal){ if(state.cal[iso]==="ok" && new Date(iso)>=start) n++; } return n; }
function updateSobrietyBadges(){ const earned=new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]")); const days=okDaysSinceStart(); SOBRIETY.forEach(b=>{ if(days>=b.days) earned.add(`S:${b.days}`); }); localStorage.setItem(STORAGE.BADGES", JSON.stringify([...earned])); }
function currentTitle(){ const earned=new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]")); if(earned.has("S:90")) return "Quarter Champ"; if(earned.has("S:30")) return "1-Month Steady"; if(earned.has("S:7")) return "1-Week Strong"; return "Newcomer"; }

/* ---------------- calendar ---------------- */
let cursor = new Date();
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function firstDay(y,m){ return new Date(y,m,1).getDay(); }
function getChecklist(iso=todayISO()){ if(!state.check[iso]) state.check[iso]=Array(10).fill(false); return state.check[iso]; }
function setChecklistAt(i,v,iso=todayISO()){ const a=getChecklist(iso); a[i]=!!v; state.check[iso]=a; save(); }
function checklistComplete(iso=todayISO()){ return getChecklist(iso).every(Boolean); }

function renderCalendar(gridId="calendarGrid", labelId="monthLabel", streakId="streakWrap"){
  const grid=$("#"+gridId), label=$("#"+labelId);
  const y=cursor.getFullYear(), m=cursor.getMonth();
  label.textContent=new Date(y,m,1).toLocaleString(undefined,{month:"long",year:"numeric"});
  grid.innerHTML="";
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(x=>{ const hd=document.createElement("div"); hd.className="m"; hd.textContent=x; grid.appendChild(hd); });
  for(let i=0;i<firstDay(y,m);i++) grid.appendChild(document.createElement("div"));
  const days=daysInMonth(y,m), today=todayISO();
  for(let d=1; d<=days; d++){
    const iso=`${y}-${pad(m+1)}-${pad(d)}`, isToday=(iso===today);
    const cell=document.createElement("div");
    const mark=state.cal[iso]==="ok"?t("success"):(state.cal[iso]==="slip"?t("slip"):"");
    cell.className="day"+(state.cal[iso]==="ok"?" s":state.cal[iso]==="slip"?" f":"");
    cell.innerHTML=`<div class="d">${d}</div><div class="m">${mark}</div>`;
    if(isToday){
      cell.style.cursor="pointer";
      cell.onclick=()=>{
        const cur=state.cal[iso]||"";
        const next = cur===""?"ok":(cur==="ok"?"slip":"");
        if(next==="ok" && !checklistComplete(iso)){
          alert(state.i18n==="es"?"Marca los 10 pasos antes de completar.":"Complete all 10 Steps first.");
          return;
        }
        state.cal[iso]=next; save(); renderCalendar(gridId,labelId,streakId); updateSobrietyBadges();
      };
    }
    grid.appendChild(cell);
  }
  renderStreak(streakId);
}
function renderCalendarFull(){ renderCalendar("calendarGrid2","monthLabel2","streakWrap2"); }
function currentStreak(){ let s=0; let d=new Date(); for(;;){ const iso=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; if(state.cal[iso]==="ok"){ s++; d.setDate(d.getDate()-1);} else break; } return s; }
function renderStreak(id){ const el=$("#"+id); if(!el) return; const s=currentStreak(); el.innerHTML=s?`🔥 <strong>${s}</strong> day${s>1?"s":""} streak`:"—"; }

/* ---------------- guide/research ---------------- */
function translateAddiction(a){ const k=a==="Technology"?"a_tech":a==="Smoking"?"a_smoke":a==="Alcohol"?"a_alcohol":a==="Gambling"?"a_gambling":"a_other"; return t(k); }
function renderPillList(el, items){ el.innerHTML = (items||[]).map(x=>`<li class="pill-item">${escapeHTML(x)}</li>`).join(""); }
function currentGuideAddiction(){ const adds=state.profile?.addictions||[]; return adds[0] || state.profile?.primary || "Technology"; }
function renderGuide(){ const a=currentGuideAddiction(); $("#guideTitle").textContent=`${translateAddiction(a)} — ${t("guide")}`; const L=document.documentElement.getAttribute("data-lang")||"en"; renderPillList($("#tab-tips"), TIPS[a][L]); renderPillList($("#tab-deep"), DEEP[a][L]); }
function renderResearch(){ const a=currentGuideAddiction(); const L=document.documentElement.getAttribute("data-lang")||"en"; renderPillList($("#researchBody"), STEPS[a][L]); }

/* ---------------- notes ---------------- */
function renderNotes(){ const ul=$("#notesList"); ul.innerHTML=""; const rec=[...state.journal].filter(j=>j.text.startsWith("[CHK]")||j.text.startsWith("[SOS]")).sort((a,b)=>b.ts-a.ts); if(!rec.length){ ul.innerHTML=`<li class="pill-item center">—</li>`; return; } rec.forEach(j=>{ const li=document.createElement("li"); li.className="pill-item"; li.innerHTML=`<div class="meta center">${new Date(j.ts).toLocaleString()}</div><div>${escapeHTML(j.text)}</div>`; ul.appendChild(li); }); }

/* ---------------- check-in ---------------- */
const ENCOURAGEMENTS={en:["Today counts.","Small actions, big momentum."],es:["Hoy cuenta.","Pequeñas acciones, gran impulso."]};
function renderCheckin(){ $("#encouragement").textContent = (document.documentElement.getAttribute("data-lang")==="es"?ENCOURAGEMENTS.es[0]:ENCOURAGEMENTS.en[0]); const list=$("#recentNotes"); list.innerHTML=""; const rec=[...state.journal].filter(j=>j.text.startsWith("[CHK]")||j.text.startsWith("[SOS]")).reverse().slice(0,5); if(!rec.length){ list.innerHTML=`<li class="pill-item center">—</li>`; return; } rec.forEach(j=>{ const li=document.createElement("li"); li.className="pill-item"; li.innerHTML=`<div class="meta center">${new Date(j.ts).toLocaleString()}</div><div>${escapeHTML(j.text)}</div>`; list.appendChild(li); }); }

/* ---------------- crypto helpers ---------------- */
const ENC={algo:{name:'ECDH',namedCurve:'P-256'},aes:{name:'AES-GCM',length:256}};
async function loadOrCreateKeyPair(){
  const existing=localStorage.getItem('rehabit_keypair');
  if(existing){
    const jwks=JSON.parse(existing);
    const priv=await crypto.subtle.importKey('jwk', jwks.privateKey, ENC.algo, true, ['deriveKey']);
    const pub =await crypto.subtle.importKey('jwk', jwks.publicKey, ENC.algo, true, []);
    return { privateKey:priv, publicKey:pub, publicJwk:jwks.publicKey };
  }
  const kp=await crypto.subtle.generateKey(ENC.algo, true, ['deriveKey']);
  const pubJwk=await crypto.subtle.exportKey('jwk', kp.publicKey);
  const privJwk=await crypto.subtle.exportKey('jwk', kp.privateKey);
  localStorage.setItem('rehabit_keypair', JSON.stringify({ publicKey:pubJwk, privateKey:privJwk }));
  return { privateKey:kp.privateKey, publicKey:kp.publicKey, publicJwk:pubJwk };
}
async function importPeerPublicKey(jwk){ return crypto.subtle.importKey('jwk', jwk, ENC.algo, true, []); }
async function deriveSharedSecret(myPriv, peerPub){ return crypto.subtle.deriveKey({name:'ECDH', public:peerPub}, myPriv, ENC.aes, false, ['encrypt','decrypt']); }
function b64(buf){ return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function ub64(s){ return Uint8Array.from(atob(s), c=>c.charCodeAt(0)); }
async function encryptFor(sharedKey, text){ const enc=new TextEncoder().encode(text); const iv=crypto.getRandomValues(new Uint8Array(12)); const ct=await crypto.subtle.encrypt({name:'AES-GCM', iv}, sharedKey, enc); return {ciphertext:b64(ct), nonce:b64(iv)}; }
async function decryptFor(sharedKey, cB64, nB64){ const ct=ub64(cB64), iv=ub64(nB64); const pt=await crypto.subtle.decrypt({name:'AES-GCM', iv}, sharedKey, ct); return new TextDecoder().decode(pt); }

/* ---------------- badges & community (short) ---------------- */
function renderBadges(){ $("#currentTitle") && ($("#currentTitle").textContent=currentTitle()); }
function wireCommunity(){
  const box=$("#globalChat"); box.innerHTML="";
  const seed=document.createElement("div"); seed.textContent="Welcome to ReHabit chat 👋"; box.appendChild(seed);
  $("#globalForm").onsubmit=(e)=>{ e.preventDefault(); const msg=new FormData(e.target).get("msg")?.toString().trim(); if(!msg) return; state.social.chatted=true; save(); const div=document.createElement("div"); div.textContent=msg; box.appendChild(div); e.target.reset(); };
}

/* ---------------- friends (server) ---------------- */
async function renderFriendsLocal(){
  const code=localStorage.getItem('my_code');
  if($("#myUid")) $("#myUid").textContent = code || "—";

  // send request
  const form=$("#addFriendForm");
  if(form){
    form.onsubmit=async (e)=>{
      e.preventDefault();
      const toCode=(new FormData(form).get("code")||"").trim().toUpperCase();
      if(!toCode) return;
      await fetch(`${API_BASE}/api/friends/request`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ fromCode: code, toCode })
      });
      alert("Request sent.");
      form.reset();
      await renderFriendsLocal();
    };
  }

  const res=await fetch(`${API_BASE}/api/friends/${encodeURIComponent(code)}`);
  const data=await res.json();

  const reqList=$("#requestsList"); reqList.innerHTML="";
  if(!data.requests.length){ reqList.innerHTML="<li>No requests</li>"; }
  else{
    data.requests.forEach(r=>{
      const li=document.createElement("li");
      li.innerHTML=`<span>${escapeHTML(r.display_name)} (${r.code})</span>
        <div class="actions">
          <button class="btn" data-acc="${r.code}">Accept</button>
        </div>`;
      reqList.appendChild(li);
    });
    reqList.onclick=async (e)=>{
      const acc=e.target.getAttribute("data-acc");
      if(acc){
        await fetch(`${API_BASE}/api/friends/accept`,{
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ meCode: code, fromCode: acc })
        });
        await renderFriendsLocal();
      }
    };
  }

  const frList=$("#friendList"); frList.innerHTML="";
  if(!data.friends.length){ frList.innerHTML="<li>No friends yet</li>"; }
  else{
    data.friends.forEach(f=>{
      const li=document.createElement("li");
      li.innerHTML=`<span>${escapeHTML(f.display_name)} (${f.code})</span>
        <button class="btn" data-chat="${f.code}">Chat</button>`;
      frList.appendChild(li);
    });
    frList.onclick=(e)=>{ const peer=e.target.getAttribute("data-chat"); if(peer) openChatWith(peer); };
  }
}

/* ---------------- chat UI ---------------- */
function openChatWith(peerCode){
  const box=document.createElement('div');
  box.className='chat-box';
  box.innerHTML=`
    <div class="chat-head">Chat with ${escapeHTML(peerCode)}</div>
    <div class="chat-body" id="chatBody"></div>
    <div class="chat-send"><input id="chatInput" placeholder="Type..."><button id="chatSend">Send</button></div>
  `;
  document.body.appendChild(box);
  loadHistory(peerCode);
  box.querySelector('#chatSend').onclick=async ()=>{
    const text=box.querySelector('#chatInput').value.trim();
    if(!text) return;
    await sendEncrypted(peerCode, text);
    appendChatBubble(localStorage.getItem('my_code'), text);
    box.querySelector('#chatInput').value='';
  };
}
function appendChatBubble(fromCode, text){
  const body=$("#chatBody"); if(!body) return;
  const mine=(fromCode===localStorage.getItem('my_code'));
  const div=document.createElement('div'); div.className='bubble '+(mine?'me':'them'); div.textContent=text;
  body.appendChild(div); body.scrollTop=body.scrollHeight;
}
async function sendEncrypted(toCode, text){
  const peerJwk = await (await fetch(`${API_BASE}/api/user/${encodeURIComponent(toCode)}`)).json().then(r=>r.public_key_jwk);
  const peerPub = await importPeerPublicKey(peerJwk);
  const { privateKey } = await loadOrCreateKeyPair();
  const shared = await deriveSharedSecret(privateKey, peerPub);
  const { ciphertext, nonce } = await encryptFor(shared, text);
  ws && ws.readyState===1 && ws.send(JSON.stringify({type:'msg', fromCode:localStorage.getItem('my_code'), toCode, ciphertext, nonce}));
}
async function loadHistory(peerCode){
  const me=localStorage.getItem('my_code');
  const data=await (await fetch(`${API_BASE}/api/history?aCode=${encodeURIComponent(me)}&bCode=${encodeURIComponent(peerCode)}`)).json();
  const peerJwk = await (await fetch(`${API_BASE}/api/user/${encodeURIComponent(peerCode)}`)).json().then(r=>r.public_key_jwk);
  const peerPub = await importPeerPublicKey(peerJwk);
  const { privateKey } = await loadOrCreateKeyPair();
  const shared = await deriveSharedSecret(privateKey, peerPub);
  $("#chatBody").innerHTML="";
  for(const m of data.rows){
    const fromCode = m.from_user===myServerUser?.id ? me : peerCode;
    const text = await decryptFor(shared, m.ciphertext, m.nonce);
    appendChatBubble(fromCode, text);
  }
}

/* ---------------- navigation ---------------- */
const views = ["onboarding","home","calendar","checkin","sos","guide","badges","research","community","friends","settings","notes"];
function setActiveDrawer(v){ $$(".drawer-link").forEach(a=> a.classList.toggle("active", a.getAttribute("data-nav")===v)); }
function setActiveTabbar(v){ $$(".tabbar .tabbtn").forEach(b=> b.classList.toggle("active", b.getAttribute("data-nav")===v)); }
function show(v){
  views.forEach(id => $(`#view-${id}`)?.setAttribute("hidden","true"));
  $(`#view-${v}`)?.removeAttribute("hidden");
  setActiveDrawer(v); setActiveTabbar(v);
  if(v==="home"){ renderCalendar("calendarGrid","monthLabel","streakWrap"); renderHomeSteps(); }
  if(v==="calendar"){ renderCalendarFull(); }
  if(v==="guide"){ renderGuide(); }
  if(v==="checkin"){ renderCheckin(); }
  if(v==="badges"){ renderBadges(); }
  if(v==="research"){ renderResearch(); }
  if(v==="community"){ wireCommunity(); }
  if(v==="friends"){ renderFriendsLocal(); }
  if(v==="notes"){ renderNotes(); }
  if(v==="settings"){ renderSettings(); }
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ---------------- settings ---------------- */
function renderSettings(){
  const f=$("#settingsForm"); if(!f) return;
  f.displayName.value = state.profile?.displayName || "";
  const set=new Set(state.profile?.addictions||[]);
  $$('input[name="addictions"]').forEach(i=> i.checked=set.has(i.value));
  f.onsubmit=(e)=>{
    e.preventDefault();
    const fd=new FormData(f);
    const adds=$$('input[name="addictions"]:checked').map(i=>i.value);
    if(!adds.length) return alert(state.i18n==="es"?"Elige al menos una adicción.":"Pick at least one addiction.");
    const primary = adds.includes(state.profile?.primary) ? state.profile.primary : adds[0];
    state.profile = {...(state.profile||{}), displayName:(fd.get("displayName")||"").trim(), addictions:adds, primary};
    save(); alert(state.i18n==="es"?"Ajustes guardados.":"Settings saved."); renderHomeSteps(); renderGuide(); renderResearch();
  };
}

/* ---------------- SOS ---------------- */
function wireSOS(){ const tEl=$("#timer"); if(!tEl) return; let timer=null, remain=60;
  const upd=()=>{ tEl.textContent=`${String(Math.floor(remain/60)).padStart(2,"0")}:${String(remain%60).padStart(2,"0")}`; };
  $("#startTimer").onclick=()=>{ if(timer) return; remain=60; upd(); timer=setInterval(()=>{ remain--; upd(); if(remain<=0){ clearInterval(timer); timer=null; }},1000); };
  $("#resetTimer").onclick = ()=>{ clearInterval(timer); timer=null; remain=60; upd(); };
  $("#saveSos").onclick = ()=>{ const v=($("#sosNote").value||"").trim(); if(!v) return; state.journal.push({id:crypto.randomUUID(), text:`[SOS] ${v}`, ts:Date.now()}); $("#sosNote").value=""; save(); renderNotes(); };
}

/* ---------------- boot & wiring (SINGLE DOMContentLoaded) ---------------- */
function openDrawer(){ $("#drawer").classList.add("open"); $("#backdrop").hidden=false; }
function closeDrawer(){ $("#drawer").classList.remove("open"); $("#backdrop").hidden=true; }

function wire(){
  $("#menuBtn").onclick=openDrawer; $("#closeDrawer").onclick=closeDrawer; $("#backdrop").onclick=closeDrawer;
  $$(".tabbar [data-nav], [data-nav].drawer-link").forEach(b=> b.addEventListener("click", ()=>{ const v=b.getAttribute("data-nav"); if(v){ closeDrawer(); show(v);} }));
  $("#onboardingForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const chosen=$$('input[name="focus"]:checked').map(i=>i.value).filter(v=>ADDICTIONS.includes(v));
    if(!chosen.length) return alert(state.i18n==="es"?"Elige al menos un enfoque.":"Pick at least one focus.");
    const fd=new FormData(e.target);
    state.profile = { displayName:"", primary:chosen[0], addictions:chosen, quitDate:fd.get("quitDate")||todayISO(), motivation:(fd.get("motivation")||"").trim(), lang:document.documentElement.getAttribute("data-lang")||"en" };
    save(); applyI18N(); show("home");
  });
  $("#langSelect").value=state.i18n;
  $("#langSelect").onchange=(e)=>{ const lang=e.target.value; document.documentElement.setAttribute("data-lang",lang); state.profile={...(state.profile||{}),lang}; save(); applyI18N(); renderCalendar(); renderGuide(); renderCheckin(); renderResearch(); renderNotes(); renderHomeSteps(); };
  $("#checkinForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const entry = { ts:Date.now(), mood:Number(fd.get("mood")), urge:Number(fd.get("urge")), sleep:Number(fd.get("sleep")), window:fd.get("window"), exposure:fd.get("exposure"), action:(fd.get("action")||"").trim(), text:(fd.get("note")||"").trim() };
    state.journal.push({ id:crypto.randomUUID(), text:`[CHK] mood ${entry.mood}/urge ${entry.urge} | sleep ${entry.sleep}h | ${entry.window}/${entry.exposure} | ${entry.action} | ${entry.text}`, ts:entry.ts });
    save(); renderCheckin(); renderNotes();
  });
  $("#year").textContent=new Date().getFullYear();
  wireSOS();
}
async function registerAndOpenWS(){
  if(WS_OPENED) return; WS_OPENED=true;
  await loadOrCreateKeyPair();
  let code = localStorage.getItem('my_code') || `RH-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
  localStorage.setItem('my_code', code);
  $("#myUid") && ($("#myUid").textContent = code);
  const displayName = state.profile?.displayName || "User";
  const reg = await fetch(`${API_BASE}/api/register`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ code, displayName, publicKeyJwk:(await loadOrCreateKeyPair()).publicJwk })
  });
  myServerUser = await reg.json();

  ws = new WebSocket(location.origin.replace('http','ws'));
  ws.addEventListener('open', ()=> ws.send(JSON.stringify({type:'hello', code})));
  ws.addEventListener('message', async (e)=>{
    const data = JSON.parse(e.data);
    if(data.type==='msg'){
      const peer = await (await fetch(`${API_BASE}/api/user/${encodeURIComponent(data.fromCode)}`)).json();
      const peerPub = await importPeerPublicKey(peer.public_key_jwk);
      const { privateKey } = await loadOrCreateKeyPair();
      const shared = await deriveSharedSecret(privateKey, peerPub);
      const text = await decryptFor(shared, data.ciphertext, data.nonce);
      appendChatBubble(data.fromCode, text);
    }
  });
}

load();
document.addEventListener("DOMContentLoaded", () => {
  if(!state.profile) show("onboarding"); else show("home");
  wire();
  applyI18N();
  registerAndOpenWS();
});
