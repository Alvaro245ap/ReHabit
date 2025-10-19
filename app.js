/* ReHabit – posh header, restricted addictions, combined Guide page, richer Check-in, SOS red,
   chat samples with befriend, full EN/ES i18n switch, calendar + badges kept. */

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ---------------- Storage & State ---------------- */
const STORAGE = {
  PROFILE:"rehabit_profile", CAL:"rehabit_calendar", JOURNAL:"rehabit_journal",
  MATERIALS:"rehabit_materials", BADGES:"rehabit_badges", SOCIAL:"rehabit_social"
};
const state = {
  profile:null,               // {primary, addictions[], quitDate, motivation, lang}
  cal:{},                     // {YYYY-MM-DD:"ok"|"slip"}
  journal:[],
  social:{ chatted:false, friended:false },
  i18n:"en"
};
function load(){
  state.profile = JSON.parse(localStorage.getItem(STORAGE.PROFILE)||"null");
  state.cal     = JSON.parse(localStorage.getItem(STORAGE.CAL)||"{}");
  state.journal = JSON.parse(localStorage.getItem(STORAGE.JOURNAL)||"[]");
  state.social  = JSON.parse(localStorage.getItem(STORAGE.SOCIAL)||'{"chatted":false,"friended":false}');
  state.i18n = state.profile?.lang || "en";
  document.documentElement.setAttribute("data-lang", state.i18n);
}
function save(){
  localStorage.setItem(STORAGE.PROFILE, JSON.stringify(state.profile));
  localStorage.setItem(STORAGE.CAL, JSON.stringify(state.cal));
  localStorage.setItem(STORAGE.JOURNAL, JSON.stringify(state.journal));
  localStorage.setItem(STORAGE.SOCIAL, JSON.stringify(state.social));
}

/* ---------------- i18n ---------------- */
const D = {
  en:{
    welcome:"Welcome 👋", selectFocus:"Select your focus and a target date to start tracking progress.",
    quitDate:"Quit/target date", motivation:"Your main motivation (optional)", start:"Start ReHabit",
    danger:"If in danger, get help", homeTitle:"Welcome to ReHabit", homeLead:"Your private companion to build healthier habits—one day at a time.",
    checkin:"Daily Check-in", calendar:"Calendar", guide:"Guide", chat:"Community", back:"Back",
    value:"Value:", mood:"Mood (0–10)", urge:"Urge (0–10)", sleep:"Hours of sleep", actionTook:"Helpful action you took", note:"Note (optional)",
    todayShortcuts:"Today’s shortcuts", markSuccess:"Mark success", markSlip:"Mark slip",
    sos:"Craving SOS", s1:"Delay 5 minutes. Start timer and breathe slowly.", s2:"Urge surfing. Notice the urge rising and falling.", s3:"Do one alternative action. Walk, shower, text a friend, drink water.",
    timer:"Breathing Timer (1:00)", reset:"Reset", quickNotes:"Quick Notes", helpful:"Helpful actions",
    tips:"Tips", steps:"10 Steps", deep:"Deep Guide", materials:"Helpful materials",
    contribTitle:"Contribute tips (1-year badge required)", yourTip:"Your tip or resource", submit:"Submit tip", contribNote:"Contributions may appear for your addiction.",
    badges:"Badges & Titles", sobriety:"Sobriety badges", social:"Social badges", currentTitle:"Your current chat title",
    send:"Send", friends:"Friends", yourCode:"Your code:", requests:"Requests", friendsList:"Friends",
    footer:"For support only—does not replace professional treatment.",
    a_tech:"Technology", a_smoke:"Smoking", a_alcohol:"Alcohol", a_gambling:"Gambling"
  },
  es:{
    welcome:"Bienvenido/a 👋", selectFocus:"Elige tu(s) enfoque(s) y una fecha objetivo para comenzar a registrar tu progreso.",
    quitDate:"Fecha objetivo", motivation:"Tu principal motivación (opcional)", start:"Comenzar con ReHabit",
    danger:"Si estás en peligro, busca ayuda", homeTitle:"Bienvenido a ReHabit", homeLead:"Tu compañero privado para crear hábitos más saludables—día a día.",
    checkin:"Revisión diaria", calendar:"Calendario", guide:"Guía", chat:"Comunidad", back:"Volver",
    value:"Valor:", mood:"Estado de ánimo (0–10)", urge:"Intensidad de impulso (0–10)", sleep:"Horas de sueño", actionTook:"Acción útil que hiciste", note:"Nota (opcional)",
    todayShortcuts:"Atajos de hoy", markSuccess:"Marcar logro", markSlip:"Marcar recaída",
    sos:"SOS por antojo", s1:"Retrasa 5 minutos. Inicia el temporizador y respira lento.", s2:"Surf del impulso. Observa cómo sube y baja.", s3:"Haz una acción alternativa. Caminar, ducharte, escribir a alguien, beber agua.",
    timer:"Temporizador de respiración (1:00)", reset:"Reiniciar", quickNotes:"Notas rápidas", helpful:"Acciones útiles",
    tips:"Consejos", steps:"10 Pasos", deep:"Guía profunda", materials:"Materiales útiles",
    contribTitle:"Aporta consejos (requiere insignia de 1 año)", yourTip:"Tu consejo o recurso", submit:"Enviar", contribNote:"Las contribuciones pueden mostrarse para tu adicción.",
    badges:"Insignias y Títulos", sobriety:"Insignias de sobriedad", social:"Insignias sociales", currentTitle:"Tu título actual en el chat",
    send:"Enviar", friends:"Amigos", yourCode:"Tu código:", requests:"Solicitudes", friendsList:"Amigos",
    footer:"Solo para apoyo—no reemplaza tratamiento profesional.",
    a_tech:"Tecnología", a_smoke:"Cigarro", a_alcohol:"Alcohol", a_gambling:"Juego"
  }
};
function t(k){ const L=document.documentElement.getAttribute("data-lang")||"en"; return (D[L] && D[L][k]) || D.en[k] || k; }
function applyI18N(){ $$("[data-i18n]").forEach(el => el.textContent = t(el.getAttribute("data-i18n"))); }

/* ---------------- Content ---------------- */
const ALLOWED = ["Technology","Smoking","Alcohol","Gambling"];
const ADVICE = {
  Technology:["Set app limits (30–60 min).","Charge phone outside bedroom.","Swap scrolling for a 10-min walk."],
  Smoking:["Delay 5 min; drink water.","Avoid triggers early on.","Keep sugar-free gum handy."],
  Alcohol:["Plan alcohol-free evenings.","Use a simple refusal script.","Stock NA drinks you like."],
  Gambling:["Self-exclude & bank blocks.","Tell a trusted ally weekly.","Plan low-stimulation evenings."]
};
const PROGRAMS = {
  Technology:["Clarify target screen-time.","Uninstall 2 problem apps.","‘Ready’ phone homescreen.","3 daily anchors.","25/5 focus timer.","Phone docked at night.","No phone at meals.","Urge log.","Relapse reset plan.","Weekly review."],
  Smoking:["Quit date + ally.","Trigger map + alternatives.","NRT ready.","Clean environment.","Delay 5 + water + exhale.","Mouth/hands plan.","Urge log.","Move 10–15 min.","Relapse tiny reset.","Weekly reward."],
  Alcohol:["Define goal.","Remove cues at home.","NA ritual.","Refusal scripts.","HALT check.","Evening routine.","Social guardrails.","Stress plan: breathe/call/journal.","Relapse limit + hydrate.","Weekly check-in."],
  Gambling:["Self-exclude + bank blocks.","Accountability ally.","Budget firewall.","Trigger map & plans.","Delay + urge surfing.","Device blockers.","Emergency: hand over cards.","Relapse lock + review.","Replacement dopamine.","Weekly review."]
};
function deepGuideFor(name){
  const lower = name.toLowerCase();
  return `
  <p><strong>Overview.</strong> ${name} can meet needs (relief, stimulation, belonging). Replace the function, not just the behavior.</p>
  <h3>Plan</h3>
  <ul><li>Why list (3 reasons), visible daily.</li><li>Specific rule (e.g., “no ${lower} after 9pm”).</li><li>Environment: remove cues, add friction to ${lower}; make alternatives easy.</li></ul>
  <h3>Urges</h3>
  <ul><li>Delay 5, long exhale, do one alternative.</li><li>Calendar ✅/❌ each day; perfection not required.</li></ul>
  <h3>Basics</h3>
  <ul><li>Sleep, food, movement—lower craving intensity.</li></ul>
  <h3>Social</h3>
  <ul><li>One honest ally beats ten vague promises. Weekly check-in.</li></ul>
  <h3>Lapses</h3>
  <ul><li>Write trigger → lesson → one action now. Continue.</li></ul>
  <p class="muted">Guidance only; not a substitute for professional care.</p>`;
}
const MATERIALS_DEFAULT = {
  Technology:["Book: Digital Minimalism","App: Focus / site blockers","Article: Urge surfing basics"],
  Smoking:["Guide: Nicotine patches","App: Smoke-free counter","Article: Delay, breathe, water"],
  Alcohol:["Community: AF groups","NA drinks list","Article: HALT check"],
  Gambling:["Self-exclusion portals","Bank blocks","Article: Replacement dopamine"]
};

/* ---------------- Badges & Titles ---------------- */
const SOBRIETY = [
  {days:7,label:"1 week",title:"1-Week Strong"},
  {days:30,label:"1 month",title:"1-Month Steady"},
  {days:60,label:"2 months",title:"2-Month Builder"},
  {days:90,label:"3 months",title:"Quarter Champion"},
  {days:120,label:"4 months",title:"Momentum Maker"},
  {days:150,label:"5 months",title:"Half-Year Near"},
  {days:365,label:"1 year",title:"1-Year Resilient"}
];
function okDaysSinceStart(){
  const start = state.profile?.quitDate ? new Date(state.profile.quitDate) : null;
  if(!start) return 0;
  let n=0; for(const iso in state.cal){ if(state.cal[iso]==="ok" && new Date(iso)>=start) n++; } return n;
}
function updateSobrietyBadges(){
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  const days = okDaysSinceStart();
  SOBRIETY.forEach(b=>{ if(days>=b.days) earned.add(`S:${b.days}`); });
  localStorage.setItem(STORAGE.BADGES, JSON.stringify([...earned]));
}
function currentTitle(){
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  for(let i=SOBRIETY.length-1;i>=0;i--){ if(earned.has(`S:${SOBRIETY[i].days}`)) return SOBRIETY[i].title; }
  return "Newcomer";
}

/* ---------------- Calendar ---------------- */
const pad = n=>String(n).padStart(2,"0");
let cursor = new Date();
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function firstDay(y,m){ return new Date(y,m,1).getDay(); }
function renderCalendar(){
  const grid=$("#calendarGrid"), label=$("#monthLabel");
  const y=cursor.getFullYear(), m=cursor.getMonth();
  label.textContent = new Date(y,m,1).toLocaleString(undefined,{month:"long",year:"numeric"});
  grid.innerHTML="";
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(w=>{ const hd=document.createElement("div"); hd.className="m"; hd.textContent=w; grid.appendChild(hd); });
  for(let i=0;i<firstDay(y,m);i++){ const blank=document.createElement("div"); grid.appendChild(blank); }
  const days=daysInMonth(y,m);
  for(let d=1; d<=days; d++){
    const iso=`${y}-${pad(m+1)}-${pad(d)}`;
    const cell=document.createElement("div");
    const mark=state.cal[iso]==="ok"?"✅":state.cal[iso]==="slip"?"❌":"";
    cell.className="day"+(state.cal[iso]==="ok"?" s":state.cal[iso]==="slip"?" f":"");
    cell.innerHTML=`<div class="d">${d}</div><div class="m">${mark}</div>`;
    cell.addEventListener("click",()=>{
      const cur=state.cal[iso]||"";
      const next= cur===""?"ok":(cur==="ok"?"slip":"");
      state.cal[iso]=next; save(); renderCalendar(); updateSobrietyBadges();
    });
    grid.appendChild(cell);
  }
  $("#prevMonth").onclick=()=>{ cursor.setMonth(cursor.getMonth()-1); renderCalendar(); };
  $("#nextMonth").onclick=()=>{ cursor.setMonth(cursor.getMonth()+1); renderCalendar(); };
}
function markToday(val){ state.cal[todayISO()] = val; save(); renderCalendar(); updateSobrietyBadges(); }

/* ---------------- Guide (combined) ---------------- */
function renderGuide(){
  const a = state.profile?.primary || "Technology";
  $("#guideTitle").textContent = `${translateAddiction(a)} — ${t("guide")}`;
  $("#tab-tips").innerHTML = `<ul>${(ADVICE[a]||[]).map(x=>`<li>${x}</li>`).join("")}</ul>`;
  $("#tab-steps").innerHTML = (PROGRAMS[a]||[]).map(s=>`<li>${s}</li>`).join("");
  $("#tab-deep").innerHTML = deepGuideFor(a);
}
/* tab switching */
function wireGuideTabs(){
  $$(".guide-tabs .tab").forEach(btn=>{
    btn.onclick=()=>{
      const tab=btn.getAttribute("data-tab");
      ["tips","steps","deep"].forEach(k=>{
        $(`#tab-${k}`).hidden = (k!==tab);
      });
    };
  });
}

/* ---------------- Materials (separate page) ---------------- */
function getMaterials(){ const raw=JSON.parse(localStorage.getItem(STORAGE.MATERIALS)||"{}"); return {...MATERIALS_DEFAULT, ...raw}; }
function addMaterial(add, tip){ const raw=JSON.parse(localStorage.getItem(STORAGE.MATERIALS)||"{}"); raw[add]=raw[add]||[]; raw[add].push(tip); localStorage.setItem(STORAGE.MATERIALS, JSON.stringify(raw)); }
function renderMaterials(){
  const a=state.profile?.primary||"Technology";
  $("#programTitle").textContent = `${translateAddiction(a)} — ${t("materials")}`;
  $("#materialsList").innerHTML = (getMaterials()[a]||[]).map(m=>`<li>${m}</li>`).join("");
  const canContrib = okDaysSinceStart()>=365;
  $("#contribWrap").hidden = !canContrib;
}

/* ---------------- Check-in enhancements ---------------- */
const ENCOURAGEMENTS = {
  en:[
    "One step at a time. Today counts.",
    "You’re building a stronger brain—keep going.",
    "Small actions, huge momentum.",
    "You’re not alone. Progress over perfection."
  ],
  es:[
    "Paso a paso. Hoy cuenta.",
    "Estás fortaleciendo tu cerebro—sigue.",
    "Pequeñas acciones, gran impulso.",
    "No estás solo/a. Progreso sobre perfección."
  ]
};
function randomEnc(){ const L=document.documentElement.getAttribute("data-lang")||"en"; const arr=ENCOURAGEMENTS[L]; return arr[Math.floor(Math.random()*arr.length)]; }
function renderCheckin(){
  $("#encouragement").textContent = randomEnc();
  // recent notes from journal
  const list=$("#recentNotes"); list.innerHTML="";
  const rec = [...state.journal].reverse().slice(0,5);
  if(!rec.length){ list.innerHTML=`<li><span>No entries yet.</span></li>`; return; }
  rec.forEach(j=>{
    const li=document.createElement("li");
    li.innerHTML=`<span>${new Date(j.ts).toLocaleString()} — ${escapeHTML(j.text)}</span>`;
    list.appendChild(li);
  });
}

/* ---------------- Badges page ---------------- */
function renderBadges(){
  updateSobrietyBadges();
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  const sob = $("#sobrietyBadges"); sob.innerHTML="";
  SOBRIETY.forEach(b=>{
    const div=document.createElement("span");
    div.className="badge"+(earned.has(`S:${b.days}`)?" earned":"");
    div.textContent=b.label;
    sob.appendChild(div);
  });
  const soc=$("#socialBadges"); soc.innerHTML="";
  soc.appendChild(makeBadge("First chat message", state.social.chatted));
  soc.appendChild(makeBadge("First friend added", state.social.friended));
  $("#currentTitle").textContent = currentTitle();
}
function makeBadge(label, ok){ const s=document.createElement("span"); s.className="badge"+(ok?" earned":""); s.textContent=label; return s; }

/* ---------------- Friends & Chat ---------------- */
let auth=null, db=null, me=null, unsub=null;
async function initFirebase(){
  if(!(window.firebase&&firebase.apps?.length)) return;
  auth=firebase.auth(); db=firebase.firestore();
  await auth.signInAnonymously(); me=auth.currentUser;
  await db.collection("users").doc(me.uid).set({createdAt:Date.now()},{merge:true});
}
function seedChat(box){
  const now=new Date();
  const ex=[
    {uid:"maya111", who:"Maya (2 wks)", text:"Grayscale at night cuts my scrolling."},
    {uid:"alex222", who:"Alex (1 mo)", text:"Marking ✅ every night keeps me honest."},
    {uid:"sam333", who:"Sam (3 wks)", text:"Breathing timer helps me ride the wave."}
  ];
  ex.forEach((m,i)=>{
    const div=document.createElement("div");
    div.className="chat-msg";
    div.innerHTML=`<strong class="chat-name" data-uid="${m.uid}">${escapeHTML(m.who)}</strong>: ${escapeHTML(m.text)} <small>${new Date(now-((3-i)*60000)).toLocaleTimeString()}</small>`;
    box.appendChild(div);
  });
  box.scrollTop=box.scrollHeight;
}
function wireCommunity(){
  const box=$("#globalChat"); box.innerHTML="";
  if(!(window.firebase&&firebase.apps?.length)){
    seedChat(box);
    $("#globalForm").onsubmit=(e)=>{ e.preventDefault();
      const msg=new FormData(e.target).get("msg")?.toString().trim(); if(!msg) return;
      state.social.chatted=true; save(); renderBadges();
      const div=document.createElement("div"); div.className="chat-msg";
      div.innerHTML=`<strong class="chat-name" data-uid="you">${escapeHTML("You ("+currentTitle()+")")}</strong>: ${escapeHTML(msg)} <small>${new Date().toLocaleTimeString()}</small>`;
      box.appendChild(div); box.scrollTop=box.scrollHeight; e.target.reset();
    };
    box.onclick=(e)=>{ const n=e.target.closest(".chat-name"); if(!n) return; state.social.friended=true; save(); renderBadges(); alert("Friend request simulated (enable Firebase for real requests)."); };
    $("#myUid").textContent="—"; renderFriendsLocal();
    return;
  }
  // Live mode
  initFirebase().then(()=>{
    $("#myUid").textContent=me.uid;
    unsub = db.collection("rooms").doc("global").collection("messages").orderBy("ts","asc").limit(200)
      .onSnapshot(snap=>{
        box.innerHTML=""; if(snap.empty) seedChat(box);
        snap.forEach(doc=>{
          const m=doc.data(); const who = m.uid===me.uid ? `You (${currentTitle()})` : (m.name||m.uid.slice(0,6));
          const div=document.createElement("div"); div.className="chat-msg";
          div.innerHTML=`<strong class="chat-name" data-uid="${m.uid}">${escapeHTML(who)}</strong>: ${escapeHTML(m.text)} <small>${new Date(m.ts).toLocaleTimeString()}</small>`;
          box.appendChild(div);
        }); box.scrollTop=box.scrollHeight;
      });
    $("#globalForm").onsubmit=async (e)=>{ e.preventDefault();
      const msg=new FormData(e.target).get("msg")?.toString().trim(); if(!msg) return;
      await db.collection("rooms").doc("global").collection("messages").add({uid:me.uid,text:msg,ts:Date.now()});
      state.social.chatted=true; save(); renderBadges(); e.target.reset();
    };
    box.onclick=async (e)=>{ const n=e.target.closest(".chat-name"); if(!n) return;
      const uid=n.getAttribute("data-uid"); if(!uid||uid===me.uid) return;
      await db.collection("users").doc(uid).set({requests: firebase.firestore.FieldValue.arrayUnion(me.uid)}, {merge:true});
      state.social.friended=true; save(); renderBadges();
      alert("Friend request sent.");
    };
    loadFriends();
  });
}
function renderFriendsLocal(){
  $("#requestsList").innerHTML=`<li><span>No requests (offline demo)</span></li>`;
  $("#friendList").innerHTML=`<li><span>No friends yet</span></li>`;
}
async function loadFriends(){
  if(!db||!me) return;
  const meDoc=await db.collection("users").doc(me.uid).get(); const d=meDoc.data()||{};
  const req=d.requests||[]; const fr=d.friends||[];
  const reqList=$("#requestsList"); reqList.innerHTML=req.length?"":`<li><span>No requests</span></li>`;
  req.forEach(uid=>{
    const li=document.createElement("li");
    li.innerHTML=`<span>${uid}</span><div class="actions"><button class="btn" data-acc="${uid}">Accept</button><button class="btn subtle" data-rej="${uid}">Decline</button></div>`;
    reqList.appendChild(li);
  });
  reqList.onclick=async e=>{
    const uid=e.target.getAttribute("data-acc")||e.target.getAttribute("data-rej"); if(!uid) return;
    const accept=!!e.target.getAttribute("data-acc");
    await db.collection("users").doc(me.uid).set({requests: firebase.firestore.FieldValue.arrayRemove(uid)},{merge:true});
    if(accept){
      await db.collection("users").doc(me.uid).set({friends: firebase.firestore.FieldValue.arrayUnion(uid)},{merge:true});
      await db.collection("users").doc(uid).set({friends: firebase.firestore.FieldValue.arrayUnion(me.uid)},{merge:true});
    }
    loadFriends();
  };
  const frList=$("#friendList"); frList.innerHTML=fr.length?"":`<li><span>No friends yet</span></li>`;
  fr.forEach(uid=>{
    const li=document.createElement("li");
    li.innerHTML=`<span>${uid}</span><button class="btn subtle" data-rem="${uid}">Remove</button>`;
    frList.appendChild(li);
  });
  frList.onclick=async e=>{
    const uid=e.target.getAttribute("data-rem"); if(!uid) return;
    await db.collection("users").doc(me.uid).set({friends: firebase.firestore.FieldValue.arrayRemove(uid)},{merge:true});
    await db.collection("users").doc(uid).set({friends: firebase.firestore.FieldValue.arrayRemove(me.uid)},{merge:true});
    loadFriends();
  };
}

/* ---------------- Helpers ---------------- */
function escapeHTML(s){ return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }
function translateAddiction(a){
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const key = a==="Technology"?"a_tech":a==="Smoking"?"a_smoke":a==="Alcohol"?"a_alcohol":"a_gambling";
  return t(key);
}

/* ---------------- Navigation & Wiring ---------------- */
const views = ["onboarding","home","calendar","checkin","sos","guide","program","badges","community","friends"];
function show(v){
  views.forEach(id => $(`#view-${id}`)?.setAttribute("hidden","true"));
  $(`#view-${v}`)?.removeAttribute("hidden");
  if(v==="calendar") renderCalendar();
  if(v==="guide"){ renderGuide(); wireGuideTabs(); }
  if(v==="program") renderMaterials();
  if(v==="checkin") renderCheckin();
  if(v==="badges") renderBadges();
  if(v==="community") wireCommunity();
  window.scrollTo({top:0,behavior:"smooth"});
}

function wire(){
  // nav
  $$(".tabbar [data-nav], [data-nav]").forEach(b=> b.addEventListener("click",()=>show(b.getAttribute("data-nav"))));

  // onboarding (only 4 allowed, multi-select)
  $("#onboardingForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const chosen = $$('input[name="focus"]:checked').map(i=>i.value).filter(v=>ALLOWED.includes(v));
    if(!chosen.length) { alert("Pick at least one focus."); return; }
    const fd=new FormData(e.target);
    state.profile = {
      primary: chosen[0],
      addictions: chosen,
      quitDate: fd.get("quitDate"),
      motivation: (fd.get("motivation")||"").trim(),
      lang: document.documentElement.getAttribute("data-lang")||"en"
    };
    save(); applyI18N(); show("home");
  });

  // language switch
  $("#langSelect").value = state.i18n;
  $("#langSelect").onchange = (e)=>{
    const lang=e.target.value;
    document.documentElement.setAttribute("data-lang", lang);
    state.profile = {...(state.profile||{}), lang};
    save(); applyI18N(); renderGuide(); renderCheckin(); renderCalendar();
  };

  // check-in form
  $("#checkinForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const entry = {
      ts: Date.now(),
      mood: Number(fd.get("mood")), urge: Number(fd.get("urge")),
      sleep: Number(fd.get("sleep")), action: (fd.get("action")||"").trim(),
      text: (fd.get("note")||"").trim()
    };
    state.journal.push({id:crypto.randomUUID(), text:`[CHK] mood ${entry.mood}/urge ${entry.urge} | sleep ${entry.sleep}h | ${entry.action} | ${entry.text}`, ts: entry.ts});
    save(); alert(t("save")||"Saved"); renderCheckin();
  });

  // quick mark buttons
  $("#markTodayOk")?.addEventListener("click", ()=>markToday("ok"));
  $("#markTodaySlip")?.addEventListener("click", ()=>markToday("slip"));

  // materials contrib
  $("#contribForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const tip=(new FormData(e.target).get("tip")||"").trim(); if(!tip) return;
    addMaterial(state.profile?.primary||"Technology", tip);
    e.target.reset(); alert("Thanks!");
    renderMaterials();
  });

  // SOS timer & chips
  wireSOS();

  // footer year + i18n
  $("#year").textContent = new Date().getFullYear();
  applyI18N();
}

function wireSOS(){
  const tEl=$("#timer"); if(!tEl) return;
  let timer=null, remain=60;
  const upd=()=>{ tEl.textContent=`${String(Math.floor(remain/60)).padStart(2,"0")}:${String(remain%60).padStart(2,"0")}`; };
  $("#startTimer").onclick=()=>{ if(timer) return; remain=60; upd(); timer=setInterval(()=>{ remain--; upd(); if(remain<=0){ clearInterval(timer); timer=null; }},1000); };
  $("#resetTimer").onclick=()=>{ clearInterval(timer); timer=null; remain=60; upd(); };
  $("#saveSos").onclick=()=>{ const v=($("#sosNote").value||"").trim(); if(!v) return; state.journal.push({id:crypto.randomUUID(), text:`[SOS] ${v}`, ts:Date.now()}); $("#sosNote").value=""; save(); alert("Saved"); };
  const chips=["Drink water","Cold splash","Walk 5 min","Text a friend","4-6 breathing"];
  const wrap=$("#copingChips"); wrap.innerHTML=""; chips.forEach(c=>{ const b=document.createElement("button"); b.className="chip"; b.textContent=c; b.onclick=()=>{ $("#sosNote").value = ($("#sosNote").value+"\nTried: "+c).trim(); }; wrap.appendChild(b); });
  upd();
}

/* ---------------- Boot ---------------- */
load();
window.addEventListener("DOMContentLoaded", ()=>{
  if(!state.profile) show("onboarding"); else show("home");
  wire();
});

/* ---------------- Utils ---------------- */
function escapeHTML(s){return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
