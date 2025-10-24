/* ReHabit — app.js (full) */
console.log("app.js loaded");
// ==== BACKEND CONFIG (ADD) ====
const API_BASE = 'https://rehabit.onrender.com'; // <-- change to your Render URL
let myServerUser = null;  // { id, code, display_name }
let ws = null;                 // single, shared socket
window.__WS_READY = false;     // guard flag: don’t reconnect on every render

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const pad = n => String(n).padStart(2,"0");
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function escapeHTML(s){
  const map = { "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#039;" };
  return String(s).replace(/[&<>"']/g, ch => map[ch]);
}


const STORAGE = {
  PROFILE:"rehabit_profile", CAL:"rehabit_calendar", JOURNAL:"rehabit_journal",
  SOCIAL:"rehabit_social", BADGES:"rehabit_badges"
};
const state = {
  profile:null, cal:{}, journal:[], social:{chatted:false,friended:false}, i18n:"en",
  researchChoice:null, guideChoice:null,
  check:{} // per-day 10-steps checklist, keyed by ISO date
};

function load(){
  state.profile = JSON.parse(localStorage.getItem(STORAGE.PROFILE)||"null");
  state.cal     = JSON.parse(localStorage.getItem(STORAGE.CAL)||"{}");
  state.journal = JSON.parse(localStorage.getItem(STORAGE.JOURNAL)||"[]");
  state.check   = JSON.parse(localStorage.getItem("rehabit_check")||"{}");
  state.social  = JSON.parse(localStorage.getItem(STORAGE.SOCIAL)||'{"chatted":false,"friended":false}');
  state.i18n    = state.profile?.lang || "en";
  document.documentElement.setAttribute("data-lang", state.i18n);
}
function save(){
  localStorage.setItem(STORAGE.PROFILE, JSON.stringify(state.profile));
  localStorage.setItem(STORAGE.CAL, JSON.stringify(state.cal));
  localStorage.setItem(STORAGE.JOURNAL, JSON.stringify(state.journal));
  localStorage.setItem(STORAGE.SOCIAL, JSON.stringify(state.social));
  localStorage.setItem("rehabit_check", JSON.stringify(state.check));
}

/* i18n */
const D = {
  en:{ install:"Install", home:"Home", welcome:"Welcome 👋", selectFocus:"Select your focus and a target date to start tracking progress.",
      quitDate:"Quit/target date", motivation:"Your main motivation (optional)", start:"Start ReHabit",
      danger:"If in danger, get help", homeTitle:"Welcome to ReHabit", homeLead:"Your private companion to build healthier habits—one day at a time.",
      monthCard:"Calendar (this month)", recent:"Recent notes", checkin:"Daily Check-in", calendar:"Calendar", guide:"Guide",
      badges:"Badges", research:"Research", chat:"Community", friends:"Friends", settings:"Settings", notes:"Notes",
      back:"Back", value:"Value:", mood:"Mood (0–10)", urge:"Urge (0–10)", sleep:"Hours of sleep", cravingWindow:"Craving window",
      morning:"Morning", afternoon:"Afternoon", evening:"Evening", night:"Night", actionTook:"Helpful action you took",
      note:"Note (optional)", exposure:"Exposure level today", low:"Low", medium:"Medium", high:"High",
      sos:"Craving SOS", s1:"Delay 5 minutes. Start timer and breathe slowly.", s2:"Urge surfing. Notice the urge rising and falling.",
      s3:"Do one alternative action. Walk, shower, text a friend, drink water.", timer:"Breathing Timer (1:00)", startBtn:"Start",
      reset:"Reset", quickNotes:"Quick Notes", helpful:"Helpful actions", chooseAddictions:"Choose addictions",
      chooseAddiction:"Choose addiction", emergency:"Emergency", yourCode:"Your code:", requests:"Requests", friendsList:"Friends",
      currentTitle:"Your current chat title", footer:"For support only—does not replace professional treatment.",
      a_tech:"Technology", a_smoke:"Smoking", a_alcohol:"Alcohol", a_gambling:"Gambling", a_other:"Other drugs",
      steps:"10 Steps", tips:"Tips", deep:"Deep Guide",
      success:"Success", slip:"Slip"
  },
  es:{ install:"Instalar", home:"Inicio", welcome:"Bienvenido/a 👋", selectFocus:"Elige tu(s) enfoque(s) y una fecha objetivo para comenzar a registrar tu progreso.",
      quitDate:"Fecha objetivo", motivation:"Tu principal motivación (opcional)", start:"Comenzar con ReHabit",
      danger:"Si estás en peligro, busca ayuda", homeTitle:"Bienvenido a ReHabit", homeLead:"Tu compañero privado para crear hábitos más saludables—día a día.",
      monthCard:"Calendario (este mes)", recent:"Notas recientes", checkin:"Revisión diaria", calendar:"Calendario", guide:"Guía",
      badges:"Insignias", research:"Investigación", chat:"Comunidad", friends:"Amigos", settings:"Ajustes", notes:"Notas",
      back:"Volver", value:"Valor:", mood:"Estado de ánimo (0–10)", urge:"Impulso (0–10)", sleep:"Horas de sueño", cravingWindow:"Momento de mayor impulso",
      morning:"Mañana", afternoon:"Tarde", evening:"Atardecer", night:"Noche", actionTook:"Acción útil que hiciste",
      note:"Nota (opcional)", exposure:"Nivel de exposición hoy", low:"Bajo", medium:"Medio", high:"Alto",
      sos:"SOS por antojo", s1:"Retrasa 5 minutos. Inicia el temporizador y respira lento.", s2:"Surf del impulso. Observa cómo sube y baja.",
      s3:"Haz una acción alternativa. Caminar, ducharte, escribir a un amigo, beber agua.", timer:"Temporizador de respiración (1:00)", startBtn:"Iniciar",
      reset:"Reiniciar", quickNotes:"Notas rápidas", helpful:"Acciones útiles", chooseAddictions:"Elige adicciones",
      chooseAddiction:"Elige adicción", emergency:"Emergencia", yourCode:"Tu código:", requests:"Solicitudes", friendsList:"Amigos",
      currentTitle:"Tu título actual en el chat", footer:"Solo para apoyo—no reemplaza la atención profesional.",
      a_tech:"Tecnología", a_smoke:"Fumar", a_alcohol:"Alcohol", a_gambling:"Ludopatía", a_other:"Otras drogas",
      steps:"10 Pasos", tips:"Consejos", deep:"Guía profunda",
      success:"Logro", slip:"Recaída"
  }
};
function t(k){ const L=document.documentElement.getAttribute("data-lang")||"en"; return (D[L] && D[L][k]) || D.en[k] || k; }
function applyI18N(){ $$("[data-i18n]").forEach(el => el.textContent = t(el.getAttribute("data-i18n"))); }

/* Content */
const ADDICTIONS = ["Technology","Smoking","Alcohol","Gambling","Other"];
const TIPS = {
  Technology:{ en:["Screen-time caps","Disable nonessential notifications","Blockers after 21:00"], es:["Límites de pantalla","Desactiva notificaciones no esenciales","Bloqueadores después de las 21 h"]},
  Smoking:{ en:["Set quit date","Use NRT (patch+gum)","Map triggers → substitutes"], es:["Fija fecha para dejar","Usa TSN (parche+chicle)","Mapa de disparadores → sustitutos"]},
  Alcohol:{ en:["Abstinence or caps","Remove alcohol at home","HALT before choices"], es:["Abstinencia o límites","Retira alcohol de casa","HALT antes de decidir"]},
  Gambling:{ en:["Bank blocks","Device/site blockers","Self-exclusion"], es:["Bloqueos bancarios","Bloqueadores de dispositivos/sitios","Autoexclusión"]},
  Other:{ en:["Consult clinician first","Remove cues","Daily structure (meals/move/sleep)"], es:["Consulta a un profesional","Retira señales","Estructura diaria (comida/mov/sueño)"]}
};
const DEEP = {
  Technology:{ en:["Target the function, not just behavior","Delay 5 + long exhale","If X then Y plans"], es:["Apunta a la función, no solo a la conducta","Demora 5 + exhalación larga","Planes Si X entonces Y"]},
  Smoking:{ en:["Prepare NRT plan","Urge surfing 2–3 min","Accountability weekly"], es:["Prepara plan de TSN","Surf del impulso 2–3 min","Responsabilidad semanal"]},
  Alcohol:{ en:["Refusal scripts","Evening routine","Avoid high-risk places"], es:["Guiones de rechazo","Rutina nocturna","Evita lugares de alto riesgo"]},
  Gambling:{ en:["Budget firewall","Share statements weekly","Friction to deposits"], es:["Cortafuegos de presupuesto","Comparte extractos semanales","Fricción para depósitos"]},
  Other:{ en:["Safety first / taper with clinician","Coping kit","Track calendar outcomes"], es:["Seguridad primero / reducción supervisada","Kit de afrontamiento","Registra resultados en calendario"]}
};
const STEPS = {
  Technology:{ en:[
    "Define a goal (hours/day, no-phone zones)","Audit apps; uninstall two risks","Focus modes & bedtime","Make 3 replacement activities",
    "One-tab method 25/5","Phone dock outside bedroom","Log urges (time/cue/intensity)","Weekly review: screen-time/mood/sleep",
    "Relapse reset: trigger → lesson → action","Celebrate streaks"
  ], es:[
    "Define objetivo (horas/día, zonas sin teléfono)","Audita apps; desinstala 2 riesgos","Modos de enfoque y hora de dormir","Crea 3 actividades de reemplazo",
    "Método una pestaña 25/5","Teléfono fuera del dormitorio","Registra impulsos (hora/señal/intensidad)","Revisión semanal: pantalla/ánimo/sueño",
    "Reinicio: disparador → lección → acción","Celebra rachas"
  ]},
  Smoking:{ en:["Pick quit date","Get NRT ready","Map triggers","Clean spaces","Delay + long exhale","Daily brisk walk","Refusal script","Hydration + snacks","Avoid alcohol early","Weekly reward"],
            es:["Elige fecha","Prepara TSN","Mapa de disparadores","Limpia espacios","Demora + exhalación larga","Caminata diaria","Guion de rechazo","Hidratación + snacks","Evita alcohol al inicio","Recompensa semanal"]},
  Alcohol:{ en:["Commit caps/abstinence","Clear alcohol at home","First-drink ritual NA","HALT check","Evening routine","Delay + surf","Avoid risky places","Accountability","Track units pace","Reward AF weeks"],
            es:["Compromiso límites/abstinencia","Retira alcohol en casa","Ritual primer trago sin alcohol","Revisión HALT","Rutina nocturna","Demora + surf","Evita lugares de riesgo","Responsabilidad","Registra unidades y ritmo","Recompensa semanas AF"]},
  Gambling:{ en:["Bank blocks","Device/site blockers","Budget firewall","Share statements","Plan risky windows","Delay + surf","Remove apps","Limit cash; freeze cards","Low-stimulation nights","Weekly review"],
             es:["Bloqueos bancarios","Bloqueadores","Cortafuegos presupuestario","Comparte extractos","Planifica ventanas de riesgo","Demora + surf","Elimina apps","Limita efectivo; congela tarjetas","Noches de baja estimulación","Revisión semanal"]},
  Other:{ en:["Assess safety","Abstinence or taper","Remove paraphernalia","Daily structure","Coping kit","Delay + surf","Identify triggers","Accountability","Track calendar","Adjust weekly"],
          es:["Evalúa seguridad","Abstinencia o reducción","Retira parafernalia","Estructura diaria","Kit de afrontamiento","Demora + surf","Identifica disparadores","Responsabilidad","Registra calendario","Ajuste semanal"]}
};

/* Badges & titles (simple) */
const SOBRIETY = [
  {days:7,   labelEN:"1 week",   labelES:"1 semana",  title:"1-Week Strong"},
  {days:30,  labelEN:"1 month",  labelES:"1 mes",     title:"1-Month Steady"},
  {days:60,  labelEN:"2 months", labelES:"2 meses",   title:"2-Month Builder"},
  {days:90,  labelEN:"3 months", labelES:"3 meses",   title:"Quarter Champ"},
  {days:120, labelEN:"4 months", labelES:"4 meses",   title:"Momentum Maker"},
  {days:150, labelEN:"5 months", labelES:"5 meses",   title:"Five-Month Focus"},
  {days:180, labelEN:"6 months", labelES:"6 meses",   title:"Half-Year Hero"},
  {days:365, labelEN:"1 year",   labelES:"1 año",     title:"1-Year Resilient"}
];
function okDaysSinceStart(){
  const start = state.profile?.quitDate ? new Date(state.profile.quitDate) : null;
  if(!start) return 0;
  let n=0; for(const iso in state.cal){ if(state.cal[iso]==="ok" && new Date(iso)>=start) n++; }
  return n;
}
function updateSobrietyBadges(){
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  const days = okDaysSinceStart();
  SOBRIETY.forEach(b=>{ if(days>=b.days) earned.add(`S:${b.days}`); });
  localStorage.setItem(STORAGE.BADGES, JSON.stringify([...earned]));
}
function currentTitle(){
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  for(let i=SOBRIETY.length-1;i>=0;i--){
    if(earned.has(`S:${SOBRIETY[i].days}`)) return SOBRIETY[i].title;
  }
  return "Newcomer";
}

/* Calendar */
let cursor = new Date();
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function firstDay(y,m){ return new Date(y,m,1).getDay(); }


/* Checklist helpers */
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function getChecklist(iso=todayISO()){
  if(!state.check[iso]) state.check[iso]=Array(10).fill(false);
  return state.check[iso];
}
function setChecklistAt(idx, val, iso=todayISO()){
  const arr=getChecklist(iso);
  arr[idx]=!!val;
  state.check[iso]=arr; save();
}
function checklistComplete(iso=todayISO()){
  const arr=getChecklist(iso);
  return arr.every(Boolean);
}

function renderCalendar(gridId="calendarGrid", labelId="monthLabel", streakId="streakWrap"){
  const grid = document.getElementById(gridId), label = document.getElementById(labelId);
  const y=cursor.getFullYear(), m=cursor.getMonth();
  label.textContent = new Date(y,m,1).toLocaleString(undefined,{month:"long",year:"numeric"});
  grid.innerHTML="";
  for(let i=0;i<7;i++){ const hd=document.createElement("div"); hd.className="m"; hd.textContent=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]; grid.appendChild(hd); }
  for(let i=0;i<firstDay(y,m);i++){ const blank=document.createElement("div"); grid.appendChild(blank); }
  const days=daysInMonth(y,m); const today=todayISO();

  for(let d=1; d<=days; d++){
    const iso=`${y}-${pad(m+1)}-${pad(d)}`;
    const isToday = iso===today;
    const cell=document.createElement("div");
    const mark = state.cal[iso]==="ok" ? t("success") : state.cal[iso]==="slip" ? t("slip") : "";
    cell.className="day"+(state.cal[iso]==="ok"?" s":state.cal[iso]==="slip"?" f":"")+(isToday?"":" locked");
    cell.innerHTML=`<div class="d">${d}</div><div class="m">${mark}</div>`;
    if(isToday){
      cell.addEventListener("click",()=>{
        const cur=state.cal[iso]||"";
        let next = cur===""?"ok":(cur==="ok"?"slip":"");
        if(next==="ok" && !checklistComplete(iso)){
          alert((state.i18n==="es")?"Marca todas las casillas de los 10 Pasos antes de completar el día.":"Complete all 10 Steps checkboxes before marking success.");
          return;
        }
        state.cal[iso]=next; save(); renderCalendar(gridId,labelId,streakId); updateSobrietyBadges();
      });
    }
    grid.appendChild(cell);
  }
  renderStreak(streakId);
}
function renderCalendarFull(){ renderCalendar("calendarGrid2","monthLabel2","streakWrap2"); }

/* Streak (visual & centered) */
function currentStreak(){
  // count consecutive "ok" days ending today
  let streak=0;
  let d=new Date();
  while(true){
    const iso=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    if(state.cal[iso]==="ok"){ streak++; d.setDate(d.getDate()-1); } else break;
  }
  return streak;
}
function renderStreak(id){
  const el = document.getElementById(id);
  if(!el) return;
  const s = currentStreak();
  el.innerHTML = s ? `🔥 <strong>${s}</strong> day${s>1?"s":""} streak` : "—";
}


/* Extra content to enrich Guide & Research */
const EXTRA_GUIDE_LINES = {
  en:[
    "Set a tiny daily promise and keep it.",
    "Write one sentence about why you chose this goal."
  ],
  es:[
    "Haz una promesa diaria pequeña y cúmplela.",
    "Escribe una frase sobre por qué elegiste este objetivo."
  ]
};

/* Guide helpers */
function translateAddiction(a){
  const key = a==="Technology"?"a_tech":a==="Smoking"?"a_smoke":a==="Alcohol"?"a_alcohol":a==="Gambling"?"a_gambling":"a_other";
  return t(key);
}
function currentGuideAddiction(){
  const adds = state.profile?.addictions || [];
  if(adds.length<=1) return adds[0] || state.profile?.primary || "Technology";
  return state.guideChoice || adds[0];
}
function renderGuideChoice(){
  const adds = state.profile?.addictions || [];
  const wrap = $("#guideChoiceWrap");
  if(adds.length<=1){ wrap.hidden=true; return; }
  wrap.hidden=false;
  const sel=$("#guideChoice"); sel.innerHTML="";
  adds.forEach(a=>{
    const opt=document.createElement("option");
    opt.value=a; opt.textContent=translateAddiction(a);
    if(a===currentGuideAddiction()) opt.selected=true;
    sel.appendChild(opt);
  });
  sel.onchange=()=>{ state.guideChoice=sel.value; renderGuideCore(); };
}
function renderPillList(listEl, items){
  listEl.innerHTML = (items||[]).map(x=>`<li class="pill-item">${escapeHTML(x)}</li>`).join("");
}
function renderGuideCore(){
  const a = currentGuideAddiction();
  $("#guideTitle").textContent = `${translateAddiction(a)} — ${t("guide")}`;
  const L=document.documentElement.getAttribute("data-lang")||"en";
  renderPillList($("#tab-tips"), (TIPS[a][L]||[]));
  renderPillList($("#tab-deep"), (DEEP[a][L]||[]));
}
function renderGuide(){ renderGuideChoice(); renderGuideCore(); }

/* Materials merged into tips already */

/* Research */
function renderResearchChoice(){
  const adds = state.profile?.addictions || [];
  const wrap = $("#researchChoiceWrap");
  if(adds.length<=1){ wrap.hidden=true; return; }
  wrap.hidden=false;
  const sel=$("#researchChoice"); sel.innerHTML="";
  (adds.length?adds:["Technology"]).forEach(a=>{
    const opt=document.createElement("option");
    opt.value=a; opt.textContent=translateAddiction(a);
    if(a===(state.researchChoice||adds[0])) opt.selected=true;
    sel.appendChild(opt);
  });
  sel.onchange=()=>{ state.researchChoice=sel.value; renderResearch(); };
}
function researchCurrentAddiction(){
  const adds = state.profile?.addictions||[];
  return state.researchChoice || adds[0] || state.profile?.primary || "Technology";
}
function renderResearch(){
  renderResearchChoice();
  const a = researchCurrentAddiction();
  const L = document.documentElement.getAttribute("data-lang") || "en";
  const lines = (STEPS[a] && STEPS[a][L]) ? STEPS[a][L] : STEPS.Technology.en;
  const add = (state.i18n==="es")?EXTRA_GUIDE_LINES.es:EXTRA_GUIDE_LINES.en; renderPillList($("#researchBody"), lines.concat(add));
}

/* Notes */
function renderNotes(){
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const ul=$("#notesList"); ul.innerHTML="";
  const rec=[...state.journal].filter(j=>j.text.startsWith("[CHK]")||j.text.startsWith("[SOS]")).sort((a,b)=>b.ts-a.ts);
  if(!rec.length){ ul.innerHTML=`<li class="pill-item center">—</li>`; return; }
  rec.forEach(j=>{
    const when = new Date(j.ts).toLocaleString();
    const kind = j.text.startsWith("[CHK]") ? "Check-in" : "SOS";
    const li=document.createElement("li");
    li.className="pill-item";
    li.innerHTML=`<div class="meta center"><strong>${kind}</strong> • ${when}</div><div>${escapeHTML(j.text)}</div>`;
    ul.appendChild(li);
  });
}

/* Check-in */
const ENCOURAGEMENTS = {
  en:["One step at a time. Today counts.","You’re building a stronger brain—keep going.","Small actions, huge momentum.","You’re not alone. Progress over perfection."],
  es:["Paso a paso. Hoy cuenta.","Estás fortaleciendo tu cerebro—sigue.","Pequeñas acciones, gran impulso.","No estás solo/a. Progreso sobre perfección."]
};
function randomEnc(){ const L=document.documentElement.getAttribute("data-lang")||"en"; const arr=ENCOURAGEMENTS[L]; return arr[Math.floor(Math.random()*arr.length)]; }
function renderCheckin(){
  $("#encouragement").textContent = randomEnc();
  const list=$("#recentNotes"); list.innerHTML="";
  const rec = [...state.journal].filter(j=>j.text.startsWith("[CHK]")||j.text.startsWith("[SOS]")).reverse().slice(0,5);
  if(!rec.length){ list.innerHTML=`<li class="pill-item center">—</li>`; return; }
  rec.forEach(j=>{ const li=document.createElement("li"); li.className="pill-item"; li.innerHTML=`<div class="meta center">${new Date(j.ts).toLocaleString()}</div><div>${escapeHTML(j.text)}</div>`; list.appendChild(li); });
}
// ==== E2E ENCRYPTION HELPERS (ADD) ====
// We generate and store an ECDH P-256 keypair per device.
// Private key is stored locally (optionally you can wrap with a password later).
const ENC = {
  algo: { name: 'ECDH', namedCurve: 'P-256' },
  aes:  { name: 'AES-GCM', length: 256 }
};

async function loadOrCreateKeyPair(){
  const existing = localStorage.getItem('rehabit_keypair');
  if(existing){
    const jwks = JSON.parse(existing);
    const priv = await crypto.subtle.importKey('jwk', jwks.privateKey, ENC.algo, true, ['deriveKey']);
    const pub  = await crypto.subtle.importKey('jwk', jwks.publicKey, ENC.algo, true, []);
    return { privateKey:priv, publicKey:pub, publicJwk:jwks.publicKey };
  }
  const kp = await crypto.subtle.generateKey(ENC.algo, true, ['deriveKey']);
  const pubJwk = await crypto.subtle.exportKey('jwk', kp.publicKey);
  const privJwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
  localStorage.setItem('rehabit_keypair', JSON.stringify({ publicKey:pubJwk, privateKey:privJwk }));
  return { privateKey:kp.privateKey, publicKey:kp.publicKey, publicJwk:pubJwk };
}

async function getPublicKeyJwkOf(code){
  const res = await fetch(`${API_BASE}/api/user/${encodeURIComponent(code)}`);
  if(!res.ok) throw new Error('user not found');
  const data = await res.json();
  return data.public_key_jwk;
}

async function importPeerPublicKey(jwk){
  return crypto.subtle.importKey('jwk', jwk, ENC.algo, true, []);
}

async function deriveSharedSecret(myPriv, peerPub){
  return crypto.subtle.deriveKey(
    { name:'ECDH', public: peerPub },
    myPriv,
    ENC.aes,
    false,
    ['encrypt','decrypt']
  );
}

function b64(buf){ return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function ub64(s){ return Uint8Array.from(atob(s), c=>c.charCodeAt(0)); }

async function encryptFor(sharedKey, text){
  const enc = new TextEncoder().encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, sharedKey, enc);
  return { ciphertext:b64(ct), nonce:b64(iv) };
}

async function decryptFor(sharedKey, ciphertextB64, nonceB64){
  const ct = ub64(ciphertextB64);
  const iv = ub64(nonceB64);
  const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv}, sharedKey, ct);
  return new TextDecoder().decode(pt);
}

/* Badges page */
function renderBadges(){
  updateSobrietyBadges();
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const sob = $("#sobrietyGrid"); sob.innerHTML="";
  SOBRIETY.forEach(b=>{
    const lock = !earned.has(`S:${b.days}`);
    const card=document.createElement("div"); card.className="badge-card"+(lock?" locked":"");
    const icon=document.createElement("div"); icon.className="badge-icon success"; icon.innerHTML="🏅";
    const name=document.createElement("div"); name.className="badge-name"; name.textContent = (L==="es"?b.labelES:b.labelEN);
    const desc=document.createElement("div"); desc.className="badge-desc"; desc.textContent = b.title;
    card.append(icon,name,desc); sob.appendChild(card);
  });
  const soc=$("#socialGrid"); soc.innerHTML="";
  const socials=[{k:"chat",n:{en:"First Message",es:"Primer mensaje"}},{k:"friend",n:{en:"First Friend",es:"Primer amigo"}}];
  socials.forEach(b=>{
    const have = (b.k==="chat" && state.social.chatted) || (b.k==="friend" && state.social.friended);
    const card=document.createElement("div"); card.className="badge-card"+(have?"":" locked");
    const icon=document.createElement("div"); icon.className="badge-icon"; icon.innerHTML = (b.k==="chat"?"💬":"🤝");
    const name=document.createElement("div"); name.className="badge-name"; name.textContent = (L==="es"?b.n.es:b.n.en);
    const desc=document.createElement("div"); desc.className="badge-desc"; desc.textContent = have ? "Unlocked" : "Locked";
    card.append(icon,name,desc); soc.appendChild(card);
  });
  $("#currentTitle").textContent = currentTitle();
}

/* Chat (seed + colored titles) */
function seedChat(box){
  const titleColor = name=>{
    return (name.includes("1-Week")?"#38bdf8":
            name.includes("1-Month")?"#a78bfa":
            name.includes("Quarter")?"#f59e0b":
            name.includes("Momentum")?"#10b981":
            name.includes("Half-Year")?"#ef4444":"#0ea5a6");
  };
  const now=Date.now();
  const msgs=[
    {uid:"bot_coach", who:"CoachBot", title:"Coach", text:"Tip: Try a 5-minute delay and longer exhales."},
    {uid:"bot_calm",  who:"CalmBot",  title:"Calm",  text:"Urges rise and fall. Start a 60s breathing timer."},
    {uid:"peer1",     who:"Maya",     title:"1-Week Strong", text:"Grayscale at night cuts my scrolling."},
    {uid:"peer2",     who:"Alex",     title:"1-Month Steady", text:"Marking Success nightly keeps me honest."}
  ];
  msgs.forEach((m,i)=>{
    const div=document.createElement("div");
    const chip = `<span class="badge-chip" style="background:${titleColor(m.title)}">${escapeHTML(m.title)}</span>`;
    div.className="chat-msg";
    div.innerHTML=`<strong class="chat-name" data-uid="${m.uid}">${chip}${escapeHTML(m.who)}</strong>: ${escapeHTML(m.text)} <small>${new Date(now-((5-i)*60000)).toLocaleTimeString()}</small>`;
    box.appendChild(div);
  });
  box.scrollTop=box.scrollHeight;
}
function wireCommunity(){
  const box = $("#globalChat");
  box.innerHTML="";
  seedChat(box);
  $("#globalForm").onsubmit=(e)=>{
    e.preventDefault();
    const msg=new FormData(e.target).get("msg")?.toString().trim(); if(!msg) return;
    state.social.chatted=true; save(); renderBadges();
    const rawName = (state.profile?.displayName || "You").trim();
    const div=document.createElement("div"); div.className="chat-msg";
    const chip = `<span class="badge-chip" style="background:#22c55e">${currentTitle()}</span>`;
    div.innerHTML=`<strong class="chat-name" data-uid="you">${chip}${escapeHTML(rawName)}</strong>: ${escapeHTML(msg)} <small>${new Date().toLocaleTimeString()}</small>`;
    box.appendChild(div); box.scrollTop=box.scrollHeight; e.target.reset();
  };
  $("#globalChat").onclick=(e)=>{
    const n=e.target.closest(".chat-name"); if(!n) return;
    state.social.friended=true; save(); renderBadges();
    alert((state.i18n==="es")?"Solicitud de amistad enviada.":"Friend request sent.");
  };
}

/* Friends (local demo) */
const LOCAL_FRIENDS_KEY = "rehabit_local_friends";
const LOCAL_REQUESTS_KEY = "rehabit_local_requests";
function getLocalFriends(){ return JSON.parse(localStorage.getItem(LOCAL_FRIENDS_KEY) || "[]"); }
function setLocalFriends(arr){ localStorage.setItem(LOCAL_FRIENDS_KEY, JSON.stringify(arr)); }
function addLocalFriend(uid, label){
  const f=getLocalFriends(); if(!f.find(x=>x.uid===uid)) f.push({uid,label}); setLocalFriends(f);
}
function getLocalRequests(){ return JSON.parse(localStorage.getItem(LOCAL_REQUESTS_KEY) || "[]"); }
function addLocalRequest(uid, label){
  const r=getLocalRequests(); if(!r.find(x=>x.uid===uid)) r.push({uid,label});
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(r));
}
function removeLocalRequest(uid){
  const r=getLocalRequests().filter(x=>x.uid!==uid);
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(r));
}
/* Friends (SERVER) -- REPLACE START */
async function renderFriendsLocal(){
  // Show my code
  const code = localStorage.getItem('my_code');
  if($("#myUid")) $("#myUid").textContent = code;

  // Send request form
  const form = $("#addFriendForm");
  if(form){
    form.onsubmit = async (e)=>{
      e.preventDefault();
      const toCode = (new FormData(form).get("code") || "").trim().toUpperCase();
      if(!toCode) return;
      await fetch(`${API_BASE}/api/friends/request`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ fromCode: code, toCode })
      });
      alert((state.i18n==="es")?"Solicitud enviada.":"Request sent.");
      form.reset();
      await renderFriendsLocal();
    };
  }

  // Load lists
  const res = await fetch(`${API_BASE}/api/friends/${encodeURIComponent(code)}`);
  const data = await res.json();

  // Requests
  const reqList=$("#requestsList"); reqList.innerHTML = "";
  if(!data.requests.length){
    reqList.innerHTML = `<li><span>No requests</span></li>`;
  }else{
    data.requests.forEach(r=>{
      const li=document.createElement("li");
      li.innerHTML=`<span>${escapeHTML(r.display_name)} (${r.code})</span>
        <div class="actions">
          <button class="btn" data-acc="${r.code}">Accept</button>
          <button class="btn subtle" data-rej="${r.code}">Decline</button>
        </div>`;
      reqList.appendChild(li);
    });
    reqList.onclick = async (e)=>{
      const acc=e.target.getAttribute("data-acc");
      const rej=e.target.getAttribute("data-rej");
      if(acc){
        await fetch(`${API_BASE}/api/friends/accept`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ meCode: code, fromCode: acc })
        });
        await renderFriendsLocal();
      }else if(rej){
        alert('Decline not implemented server-side (optional).');
      }
    };
  }

  // Friends
  const frList=$("#friendList"); frList.innerHTML="";
  if(!data.friends.length){
    frList.innerHTML = `<li><span>No friends yet</span></li>`;
  }else{
    data.friends.forEach(f=>{
      const li=document.createElement("li");
      li.innerHTML=`<span>${escapeHTML(f.display_name)} (${f.code})</span>
        <button class="btn" data-chat="${f.code}">Chat</button>`;
      frList.appendChild(li);
    });
    frList.onclick = (e)=>{
      const code = e.target.getAttribute('data-chat');
      if(code) openChatWith(code);
    };
  }
}
/* Friends (SERVER) -- REPLACE END */

// ==== Chat helpers (ADD) ====
function openChatWith(peerCode){
  // simple modal-less chat box; you can style as you wish
  const box = document.createElement('div');
  box.className = 'chat-box';
  box.innerHTML = `
    <div class="chat-head">Chat with ${escapeHTML(peerCode)}</div>
    <div class="chat-body" id="chatBody"></div>
    <div class="chat-send"><input id="chatInput" placeholder="Type..."><button id="chatSend">Send</button></div>
  `;
  document.body.appendChild(box);

  // load history
  loadHistory(peerCode);

  box.querySelector('#chatSend').onclick = async ()=>{
    const text = box.querySelector('#chatInput').value.trim();
    if(!text) return;
    await sendEncrypted(peerCode, text);
    appendChatBubble(localStorage.getItem('my_code'), text);
    box.querySelector('#chatInput').value = '';
  };
}

function appendChatBubble(fromCode, text){
  const body = document.getElementById('chatBody');
  if(!body) return;
  const mine = (fromCode === localStorage.getItem('my_code'));
  const div = document.createElement('div');
  div.className = 'bubble ' + (mine?'me':'them');
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}
async function sendEncrypted(toCode, text){
  const peerJwk = await getPublicKeyJwkOf(toCode);
  const peerPub = await importPeerPublicKey(peerJwk);
  const { privateKey } = await loadOrCreateKeyPair();
  const shared = await deriveSharedSecret(privateKey, peerPub);
  const { ciphertext, nonce } = await encryptFor(shared, text);

  ws?.send(JSON.stringify({
    type:'msg',
    fromCode: localStorage.getItem('my_code'),
    toCode,
    ciphertext,
    nonce
  }));
}

async function loadHistory(peerCode){
  const me = localStorage.getItem('my_code');
  const res = await fetch(`${API_BASE}/api/history?aCode=${encodeURIComponent(me)}&bCode=${encodeURIComponent(peerCode)}`);
  const data = await res.json();
  const { privateKey } = await loadOrCreateKeyPair();
  const peerJwk = await getPublicKeyJwkOf(peerCode);
  const peerPub = await importPeerPublicKey(peerJwk);
  const shared = await deriveSharedSecret(privateKey, peerPub);

  const body = document.getElementById('chatBody');
  if(body) body.innerHTML = '';
  for(const m of data.rows){
    const fromCode = (m.from_user === myServerUser.id) ? me : peerCode;
    const text = await decryptFor(shared, Buffer.from(m.ciphertext,'base64').toString('base64'), Buffer.from(m.nonce,'base64').toString('base64'));
    appendChatBubble(fromCode, text);
  }
}


/* Home 10 steps panel */
function renderHomeSteps(){
  const adds = state.profile?.addictions || [];
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const choiceWrap = $("#homeStepsChoice");
  const sel = $("#homeStepsSelect");
  const list = $("#homeStepsList");
  const cur = adds.length? (state.guideChoice || adds[0]) : (state.profile?.primary || "Technology");
  if(adds.length<=1){ choiceWrap.hidden=true; } else {
    choiceWrap.hidden=false; sel.innerHTML="";
    adds.forEach(a=>{ const o=document.createElement("option"); o.value=a; o.textContent=translateAddiction(a); if(a===cur) o.selected=true; sel.appendChild(o); });
    sel.onchange = ()=>{ state.guideChoice=sel.value; renderHomeSteps(); };
  }
  const steps = (STEPS[cur] && STEPS[cur][L]) ? STEPS[cur][L] : STEPS.Technology.en;
  const iso=todayISO(); const arr=getChecklist(iso);
  list.innerHTML = steps.map((s,i)=>`<li class="pill-item"><label class="chk"><input type="checkbox" data-step="${i}" ${arr[i]?"checked":""}/> <span>${escapeHTML(s)}</span></label></li>`).join("");
  list.querySelectorAll("input[type=\"checkbox\"]").forEach(cb=>{
    cb.addEventListener("change", (e)=>{
      const i=Number(e.target.getAttribute("data-step"));
      setChecklistAt(i, e.target.checked, iso);
      renderStreak("streakWrap"); // refresh badges if needed
    });
  });
}

/* Navigation */
const views = ["onboarding","home","calendar","checkin","sos","guide","badges","research","community","friends","settings","notes"];
function setActiveDrawer(target){
  $$(".drawer-link").forEach(b=>{
    if(b.getAttribute("data-nav")===target) b.classList.add("active");
    else b.classList.remove("active");
  });
}
function setActiveTabbar(target){
  $$(".tabbar .tabbtn").forEach(b=>{
    if(b.getAttribute("data-nav")===target) b.classList.add("active");
    else b.classList.remove("active");
  });
}
function show(v){
  views.forEach(id => $(`#view-${id}`)?.setAttribute("hidden","true"));
  $(`#view-${v}`)?.removeAttribute("hidden");
  setActiveDrawer(v);
  setActiveTabbar(v);

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

/* Settings */
function renderSettings(){
  const f=$("#settingsForm");
  if(!f) return;
  f.displayName.value = state.profile?.displayName || "";
  const set=new Set(state.profile?.addictions||[]);
  $$('input[name="addictions"]').forEach(i=>{ i.checked=set.has(i.value); });
  f.onsubmit=(e)=>{
    e.preventDefault();
    const fd=new FormData(f);
    const adds = $$('input[name="addictions"]:checked').map(i=>i.value);
    if(adds.length===0){ alert((state.i18n==="es")?"Elige al menos una adicción.":"Pick at least one addiction."); return; }
    const primary = adds.includes(state.profile?.primary) ? state.profile.primary : adds[0];
    state.profile = {...(state.profile||{}), displayName: (fd.get("displayName")||"").trim(), addictions:adds, primary};
    save();
    alert((state.i18n==="es")?"Ajustes guardados.":"Settings saved.");
    renderHomeSteps(); renderGuide(); renderResearch();
  };
}

/* SOS */
function wireSOS(){
  const tEl=$("#timer"); if(!tEl) return;
  let timer=null, remain=60;
  const upd=()=>{ tEl.textContent=`${String(Math.floor(remain/60)).padStart(2,"0")}:${String(remain%60).padStart(2,"0")}`; };
  $("#startTimer").onclick=()=>{ if(timer) return; remain=60; upd(); timer=setInterval(()=>{ remain--; upd(); if(remain<=0){ clearInterval(timer); timer=null; }},1000); };
  $("#resetTimer").onclick=()=>{ clearInterval(timer); timer=null; remain=60; upd(); };
  $("#saveSos").onclick=()=>{ const v=($("#sosNote").value||"").trim(); if(!v) return; state.journal.push({id:crypto.randomUUID(), text:`[SOS] ${v}`, ts:Date.now()}); $("#sosNote").value=""; save(); alert((state.i18n==="es")?"Guardado.":"Saved."); renderNotes(); };

  const chipsEN=["Drink water","Cold splash","Walk 5 min","Text a friend","4-6 breathing"];
  const chipsES=["Beber agua","Agua fría en la cara","Caminar 5 min","Escribir a un amigo","Respiración 4-6"];
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const chips = L==="es" ? chipsES : chipsEN;
  const wrap=$("#copingChips"); wrap.innerHTML="";
  chips.forEach(c=>{ const b=document.createElement("button"); b.className="chip"; b.type="button"; b.textContent=c; b.onclick=()=>{ $("#sosNote").value = ($("#sosNote").value+"\nTried: "+c).trim(); }; wrap.appendChild(b); });
}

/* Boot + wiring */
function openDrawer(){ $("#drawer").classList.add("open"); $("#backdrop").hidden=false; }
function closeDrawer(){ $("#drawer").classList.remove("open"); $("#backdrop").hidden=true; }

function wire(){
  // drawer + nav buttons
  $("#menuBtn").onclick=openDrawer;
  $("#closeDrawer").onclick=closeDrawer;
  $("#backdrop").onclick=closeDrawer;

  $$(".tabbar [data-nav], [data-nav].drawer-link").forEach(b=>{
    b.addEventListener("click",()=>{
      const target=b.getAttribute("data-nav");
      if(target){ closeDrawer(); show(target); }
    });
  });

  // onboarding
  $("#onboardingForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const chosen = $$('input[name="focus"]:checked').map(i=>i.value).filter(v=>ADDICTIONS.includes(v));
    if(!chosen.length) { alert(state.i18n==="es" ? "Elige al menos un enfoque." : "Pick at least one focus."); return; }
    const fd=new FormData(e.target);
    state.profile = {
      displayName: "",
      primary: chosen[0],
      addictions: chosen,
      quitDate: fd.get("quitDate") || todayISO(),
      motivation: (fd.get("motivation")||"").trim(),
      lang: document.documentElement.getAttribute("data-lang")||"en"
    };
    save(); applyI18N(); show("home");
  });

  // language
  $("#langSelect").value = state.i18n;
  $("#langSelect").onchange = (e)=>{
    const lang=e.target.value;
    document.documentElement.setAttribute("data-lang", lang);
    state.profile = {...(state.profile||{}), lang};
    save(); applyI18N();
    renderCalendar(); renderGuide(); renderCheckin(); renderBadges(); renderResearch(); renderNotes(); renderHomeSteps();
  };

  // check-in form
  $("#checkinForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const entry = {
      ts: Date.now(),
      mood: Number(fd.get("mood")), urge: Number(fd.get("urge")),
      sleep: Number(fd.get("sleep")), window: fd.get("window"),
      exposure: fd.get("exposure"),
      action: (fd.get("action")||"").trim(),
      text: (fd.get("note")||"").trim()
    };
    state.journal.push({id:crypto.randomUUID(), text:`[CHK] mood ${entry.mood}/urge ${entry.urge} | sleep ${entry.sleep}h | ${entry.window}/${entry.exposure} | ${entry.action} | ${entry.text}`, ts: entry.ts});
    save(); alert((state.i18n==="es")?"Guardado.":"Saved."); renderCheckin(); renderNotes();
  });

  // footer year
  $("#year").textContent = new Date().getFullYear();

  // SOS widgets
  wireSOS();
}

load();
window.addEventListener("DOMContentLoaded", ()=>{
  if(!state.profile) show("onboarding"); else show("home");
  wire();
  applyI18N();
});


/* Override: Home 10 Steps with checkboxes & completion gating */
function renderHomeSteps(){
  const adds = state.profile?.addictions || [];
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const choiceWrap = document.getElementById("homeStepsChoice");
  const sel = document.getElementById("homeStepsSelect");
  const list = document.getElementById("homeStepsList");
  if(!list) return;
  const cur = adds.length? (state.guideChoice || adds[0]) : (state.profile?.primary || "Technology");
  if(adds.length<=1){ choiceWrap && (choiceWrap.hidden=true); }
  else {
    choiceWrap && (choiceWrap.hidden=false);
    sel.innerHTML="";
    adds.forEach(a=>{
      const o=document.createElement("option");
      o.value=a; o.textContent=translateAddiction(a);
      if(a===cur) o.selected=true;
      sel.appendChild(o);
    });
    sel.onchange=()=>{ state.guideChoice=sel.value; renderHomeSteps(); };
  }
  const steps = (STEPS[cur] && STEPS[cur][L]) ? STEPS[cur][L] : STEPS.Technology.en;
  const iso=todayISO(); const arr=getChecklist(iso);
  list.innerHTML = steps.map((s,i)=>`<li class="pill-item"><label class="chk"><input type="checkbox" data-step="${i}" ${arr[i]?"checked":""}/> <span>${escapeHTML(s)}</span></label></li>`).join("");
  list.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
    cb.addEventListener("change",(e)=>{
      const i=Number(e.target.getAttribute("data-step"));
      setChecklistAt(i, e.target.checked, iso);
    });
  });
}
// ==== REGISTER WITH SERVER + OPEN WS (ADD) ====
document.addEventListener('DOMContentLoaded', async () => {
document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (window.__WS_READY) return;   // <-- prevents re-initializing on nav
    window.__WS_READY = true;

    const kp = await loadOrCreateKeyPair();
    const code = ($("#myUid")?.textContent && $("#myUid").textContent !== "—")
      ? $("#myUid").textContent.trim()
      : (state.profile?.code || localStorage.getItem('my_code') || `RH-${crypto.randomUUID().slice(0,6).toUpperCase()}`);

    localStorage.setItem('my_code', code);
    if($("#myUid")) $("#myUid").textContent = code;

    const displayName = state.profile?.name || state.profile?.displayName || "User";
    const res = await fetch(`${API_BASE}/api/register`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code, displayName, publicKeyJwk: (await loadOrCreateKeyPair()).publicJwk })
    });
    myServerUser = await res.json();

    if (!ws || ws.readyState > 1) {
      ws = new WebSocket(API_BASE.replace('http','ws'));
      ws.addEventListener('open', ()=> {
        ws.send(JSON.stringify({type:'hello', code}));
      });
      ws.addEventListener('message', onWsMessage); // see handler below
    }
  } catch(e) { console.error('register/init failed', e); }
});


    // WebSocket hello
    ws = new WebSocket(API_BASE.replace('http','ws'));
    ws.addEventListener('open', ()=> {
      ws.send(JSON.stringify({type:'hello', code}));
    });
    ws.addEventListener('message', async (e)=>{
      const data = JSON.parse(e.data);
      if(data.type==='msg'){
        // decrypt and display
        const peerJwk = await getPublicKeyJwkOf(data.fromCode);
        const peerPub = await importPeerPublicKey(peerJwk);
        const { privateKey } = await loadOrCreateKeyPair();
        const shared = await deriveSharedSecret(privateKey, peerPub);
        const text = await decryptFor(shared, data.ciphertext, data.nonce);
        appendChatBubble(data.fromCode, text); // you'll add this UI helper below
      }
    });
  }catch(e){ console.error('register/init failed', e); }
});

function onWsMessage(e){
  (async ()=>{
    const data = JSON.parse(e.data);
    if(data.type==='msg'){
      const peerJwk = await getPublicKeyJwkOf(data.fromCode);
      const peerPub = await importPeerPublicKey(peerJwk);
      const { privateKey } = await loadOrCreateKeyPair();
      const shared = await deriveSharedSecret(privateKey, peerPub);
      const text = await decryptFor(shared, data.ciphertext, data.nonce);
      appendChatBubble(data.fromCode, text);
    }
  })().catch(console.error);
}
/* Onboarding form handler (Start ReHabit) — ROBUST */
(function(){
  // Single function that reads the form, saves, and navigates
  function handleStartRehabit(){
    const f = document.getElementById('onboardingForm');
    if(!f) return;

    // read selections safely
    const selected = Array.from(document.querySelectorAll('#onboardingForm input[name="focus"]:checked'))
      .map(i => i.value);
    const quitDate = (f.querySelector('input[name="quitDate"]')?.value || "").trim();
    const motivation = (f.querySelector('input[name="motivation"]')?.value || "").trim();

    // store to profile
    window.state = window.state || {};
    state.profile = state.profile || {};
    state.profile.addictions = selected;
    state.profile.quitDate = quitDate;
    state.profile.motivation = motivation;

    // STORAGE.PROFILE should already exist in your app; if not, fallback key:
    const PROFILE_KEY = (typeof STORAGE !== 'undefined' && STORAGE.PROFILE) ? STORAGE.PROFILE : 'rehabit_profile';
    localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));

    // go home
    if (typeof navigate === 'function') navigate('home');
  }

  // 1) Attach to form submit (works if button is type="submit")
  document.addEventListener('submit', function(e){
    const f = e.target;
    if (f && f.id === 'onboardingForm'){
      e.preventDefault();
      handleStartRehabit();
    }
  });

  // 2) Fallback: attach to clicks on any button inside onboardingForm
  document.addEventListener('click', function(e){
    const btn = e.target.closest('#onboardingForm button');
    if (btn){
      // prevent accidental page reloads
      e.preventDefault();
      handleStartRehabit();
    }
  });

  // 3) Also run once when DOM is ready (covers cases where the view is present immediately)
  document.addEventListener('DOMContentLoaded', function(){
    // no-op; listeners above are already active at document level
  });
})();
