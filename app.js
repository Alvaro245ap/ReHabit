// ReHabit – calendar tracking, badges page, deep guide, friend requests, titles, multi-addiction + i18n (EN/ES)

const $ = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));

/* ---------------- State & Storage ---------------- */
const STORAGE = {
  PROFILE:"rehabit_profile",
  CHECKINS:"rehabit_checkins",
  JOURNAL:"rehabit_journal",
  CHECKLIST:"rehabit_checklist_done",
  NOTIFY:"rehabit_notify",
  BADGES:"rehabit_badges",
  MATERIALS:"rehabit_materials",
  CAL:"rehabit_calendar",
  SOCIAL:"rehabit_social" // {chatted:bool, friended:bool}
};

const state = {
  profile:null,               // {primary, addictions[], quitDate, motivation, lang}
  checkins:[],                // kept from older feature
  journal:[],
  cal: {},                    // { "YYYY-MM-DD": "ok"|"slip" }
  i18n: "en",
  social: { chatted:false, friended:false }
};

function load(){
  try{
    state.profile = JSON.parse(localStorage.getItem(STORAGE.PROFILE) || "null");
    state.checkins= JSON.parse(localStorage.getItem(STORAGE.CHECKINS)||"[]");
    state.journal = JSON.parse(localStorage.getItem(STORAGE.JOURNAL) ||"[]");
    state.cal     = JSON.parse(localStorage.getItem(STORAGE.CAL)     ||"{}");
    state.social  = JSON.parse(localStorage.getItem(STORAGE.SOCIAL)  ||"{\"chatted\":false,\"friended\":false}");
    if(state.profile?.lang) state.i18n = state.profile.lang;
    document.documentElement.setAttribute("data-lang", state.i18n);
  }catch(e){console.error(e);}
}
function save(){
  localStorage.setItem(STORAGE.PROFILE, JSON.stringify(state.profile));
  localStorage.setItem(STORAGE.CAL, JSON.stringify(state.cal));
  localStorage.setItem(STORAGE.JOURNAL, JSON.stringify(state.journal));
  localStorage.setItem(STORAGE.CHECKINS, JSON.stringify(state.checkins));
  localStorage.setItem(STORAGE.SOCIAL, JSON.stringify(state.social));
}

/* ---------------- I18N (tiny) ---------------- */
const dict = {
  en:{welcome:"Welcome 👋",selectFocus:"Select your focus and a target date to start tracking progress.",quitDate:"Quit/target date",motivation:"Your main motivation (optional)",start:"Start ReHabit"},
  es:{welcome:"Bienvenido/a 👋",selectFocus:"Elige tu enfoque y una fecha objetivo para empezar a registrar tu progreso.",quitDate:"Fecha objetivo",motivation:"Tu principal motivación (opcional)",start:"Comenzar con ReHabit"}
};
function tr(k){ const L = document.documentElement.getAttribute("data-lang")||"en"; return (dict[L]&&dict[L][k])||dict.en[k]||k; }
function applyI18N(){
  $$("[data-i18n]").forEach(el=>{ el.textContent = tr(el.getAttribute("data-i18n")); });
}

/* ---------------- Content: Advice / Programs / Deep Guide ---------------- */
const ADVICE = {
  "Technology":[
    "Set app limits (30–60 min blocks).",
    "Charge your phone outside the bedroom.",
    "Swap doom scrolling for a 10-minute walk."
  ],
  "Smoking":[
    "Delay 5 minutes; drink water; breathe slowly.",
    "Avoid triggers (coffee + phone) early on.",
    "Keep sugar-free gum or carrot sticks handy."
  ],
  "Alcohol":[
    "Plan alcohol-free evenings.",
    "Prepare a script to say “No thanks, I’m cutting down.”",
    "Stock non-alcoholic drinks you like."
  ],
  "Gambling":[
    "Self-exclude from sites; block payments/cards.",
    "Tell a trusted person; share progress weekly.",
    "Fill evenings with planned, low-stimulation tasks."
  ],
  "Other drugs":[
    "Avoid people/places tied to use.",
    "Eat, sleep, hydrate—withdrawal is harder when depleted.",
    "Seek professional help; consider support groups."
  ]
};
const PROGRAMS = {
  "Technology":[
    "Clarify target: screen hours per day and blackout hours (e.g., 10pm–7am).",
    "Remove friction: log out; uninstall 2 most problematic apps.",
    "Create a ‘ready’ phone: only essentials on Home Screen.",
    "Schedule 3 anchor activities daily (walk, call, read).",
    "Use timers: 25 min focus / 5 min break.",
    "Bedtime stack: phone docked away + analog alarm clock.",
    "Environment: charger outside bedroom; no phone at meals.",
    "Track urges: trigger → urge → action → result.",
    "Relapse plan: reset + one helpful action.",
    "Weekly review: adjust limits, celebrate wins."
  ],
  "Smoking":[
    "Set a quit date within 7–14 days; tell an ally.",
    "Map triggers (coffee, commute) + alternatives (gum, walk).",
    "NRT: patches/lozenges; prepare ahead.",
    "Clean environment: wash clothes; remove lighters/ashtrays.",
    "Delay: 5-min rule + water + deep exhale.",
    "Mouth & hands plan: gum, toothpicks, stress ball.",
    "Urge log: time, intensity, action, outcome.",
    "Move 10–15 min to reduce cravings.",
    "Relapse plan: one small reset; message ally.",
    "Weekly reward: spend saved money meaningfully."
  ],
  "Alcohol":[
    "Define goal: zero or a weekly limit.",
    "Remove cues at home; skip first rounds.",
    "Replacement ritual: NA drink in your glass.",
    "Scripts: 'No thanks, I’m taking a break.'",
    "Use HALT check (Hungry/Angry/Lonely/Tired).",
    "Evening routine: meal → walk → shower → wind-down.",
    "Social guardrails: arrive late, leave early.",
    "Stress plan: breathing, call, journal.",
    "Relapse plan: limit damage, hydrate, recommit.",
    "Weekly check-in with a friend."
  ],
  "Gambling":[
    "Self-exclude from sites; bank gambling blocks.",
    "Accountability: share statements with an ally.",
    "Budget firewall: separate essentials account.",
    "Trigger map: payday, sports events → alternative plan.",
    "Delay + urge surfing: ride the wave 10 min.",
    "Blockers: DNS/app blockers on all devices.",
    "Emergency: give cards to ally on trigger days.",
    "Relapse plan: call ally, lock access, review triggers.",
    "Build replacement dopamine: exercise/hobbies/volunteering.",
    "Weekly review with ally; adjust blockers."
  ],
  "Other drugs":[
    "Pick a start date; tell a trusted person.",
    "Medical check: ask a clinician about withdrawal risks.",
    "Environment reset: remove paraphernalia; clean spaces.",
    "Hydration/nutrition/sleep plan (first two weeks).",
    "Trigger list & avoidance plan (people/places).",
    "Coping set: breathing, cold water, walk, call list.",
    "Support: groups/counselling if possible.",
    "Relapse plan: single-use limit, dispose, contact support.",
    "Daily log: urges, actions, outcomes.",
    "Weekly reflection & reward."
  ]
};

/* A long Deep Guide (shared skeleton, varies by addiction name) */
function deepGuideFor(add){
  return `
  <p><strong>Overview.</strong> ${add} often persists because it solves a problem (relief, stimulation, belonging). Recovery works when we replace that function with healthier routines—then make those routines easier than the old ones.</p>
  <h3>1) Clarify your ‘why’</h3>
  <ul><li>Write 3 reasons that truly matter to you; put them where you’ll see them daily.</li></ul>
  <h3>2) Define success</h3>
  <ul><li>Be specific (e.g., “no ${add.toLowerCase()} after 9pm” or “0 days/week”).</li></ul>
  <h3>3) Shape your environment</h3>
  <ul><li>Remove cues; add friction to the old behavior; make healthy alternatives obvious and easy.</li></ul>
  <h3>4) Plan for urges</h3>
  <ul><li>Use Delay (5 min), Breathe (long exhale), and Do One Alternative Action (water, walk, text).</li></ul>
  <h3>5) Track tiny wins</h3>
  <ul><li>Mark the calendar daily (✅ or ❌). Streaks help, but consistency matters most.</li></ul>
  <h3>6) Build replacement rewards</h3>
  <ul><li>Novelty and progress release dopamine too—exercise, learning, creativity.</li></ul>
  <h3>7) Social accountability</h3>
  <ul><li>Tell one trusted person; check in weekly. Consider groups or counseling when possible.</li></ul>
  <h3>8) Sleep, food, movement</h3>
  <ul><li>Cravings are louder when you’re tired or under-fed. Protect basics.</li></ul>
  <h3>9) Lapse ≠ failure</h3>
  <ul><li>After a slip: record the trigger → one lesson → one action now.</li></ul>
  <h3>10) Review & adapt</h3>
  <ul><li>Every week: what worked? what to adjust? reward yourself.</li></ul>
  <p class="muted">This guide does not replace professional care. If you’re worried about safety or withdrawal, contact a clinician.</p>`;
}

/* Materials starter per addiction (for program page) */
const MATERIALS_DEFAULT = {
  "Technology":[ "Book: Digital Minimalism — Cal Newport","App: Focus modes / site blockers","Article: Urge surfing basics" ],
  "Smoking":[ "Guide: Nicotine patches & lozenges","App: Smoke-free day counter","Article: Delay, breathe, drink water" ],
  "Alcohol":[ "Community: Alcohol-free groups","NA drink ideas","Article: HALT check" ],
  "Gambling":[ "Self-exclusion portals","Bank gambling blocks","Article: Replacement dopamine" ],
  "Other drugs":[ "Hotlines & local services","Guide: Withdrawal safety","Article: Building a support network" ]
};

/* Badge thresholds + titles (for sobriety) */
const SOBRIETY = [
  {days:7,  label:"1 week",   title:"1-Week Strong"},
  {days:30, label:"1 month",  title:"1-Month Steady"},
  {days:60, label:"2 months", title:"2-Month Builder"},
  {days:90, label:"3 months", title:"Quarter Champion"},
  {days:120,label:"4 months", title:"Momentum Maker"},
  {days:150,label:"5 months", title:"Half-Year Near"},
  {days:365,label:"1 year",   title:"1-Year Resilient"},
  {days:730,label:"2 years",  title:"Twice-Forged"}
];

/* ---------------- Helpers ---------------- */
const fmtMonth = (y,m)=> new Date(y,m,1).toLocaleString(undefined,{month:"long",year:"numeric"});
const daysInMonth = (y,m)=> new Date(y,m+1,0).getDate();
const pad = n=>String(n).padStart(2,"0");
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function firstDayOffset(y,m){ return new Date(y,m,1).getDay(); } // 0 Sun..6 Sat
function setCal(dateISO,val){ state.cal[dateISO]=val; localStorage.setItem(STORAGE.CAL, JSON.stringify(state.cal)); }

/* ---------------- Navigation ---------------- */
const views = ["onboarding","home","calendar","checkin","sos","journal","settings","checklist","progress","advice","program","deepguide","community","friends","badges"];
function show(v){
  views.forEach(id=> $(`#view-${id}`)?.setAttribute("hidden","true"));
  $(`#view-${v}`)?.removeAttribute("hidden");
  if(v==="home") renderHome();
  if(v==="calendar") renderCalendar("calendarGrid2","monthLabel2","prevMonth2","nextMonth2");
  if(v==="advice") renderAdvice();
  if(v==="program") renderProgram();
  if(v==="deepguide") renderDeepGuide();
  if(v==="badges") renderBadges();
  if(v==="settings") renderSettings();
  if(v==="community") wireCommunityOnce();
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ---------------- Renders ---------------- */
function renderHome(){
  renderCalendar("calendarGrid","monthLabel","prevMonth","nextMonth");
}
let calCursor = new Date(); // month cursor
function renderCalendar(gridId,labelId,prevId,nextId){
  const grid = document.getElementById(gridId), lbl = document.getElementById(labelId);
  const y = calCursor.getFullYear(), m = calCursor.getMonth();
  lbl.textContent = fmtMonth(y,m);
  grid.innerHTML = "";
  const offset = firstDayOffset(y,m), days = daysInMonth(y,m);
  // headers
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(w=>{
    const hd=document.createElement("div"); hd.className="m muted"; hd.style.textAlign="center"; hd.textContent=w; grid.appendChild(hd);
  });
  // blanks for header row
  for(let i=0;i<offset;i++){ const b=document.createElement("div"); grid.appendChild(b); }
  for(let d=1; d<=days; d++){
    const iso = `${y}-${pad(m+1)}-${pad(d)}`;
    const cell = document.createElement("div");
    const mark = state.cal[iso]==="ok"?"✅": state.cal[iso]==="slip"?"❌":"";
    cell.className = "day" + (state.cal[iso]==="ok"?" s": state.cal[iso]==="slip"?" f":"");
    cell.innerHTML = `<div class="d">${d}</div><div class="m">${mark}</div>`;
    cell.tabIndex=0;
    cell.addEventListener("click", ()=>{
      const cur = state.cal[iso]||"";
      const next = cur===""?"ok": cur==="ok"?"slip":"";
      setCal(iso,next);
      renderCalendar(gridId,labelId,prevId,nextId);
      updateSobrietyBadges(); // auto badges
    });
    grid.appendChild(cell);
  }
  // hooks for nav
  const prevBtn = document.getElementById(prevId), nextBtn=document.getElementById(nextId);
  prevBtn.onclick=()=>{ calCursor.setMonth(calCursor.getMonth()-1); renderCalendar(gridId,labelId,prevId,nextId); };
  nextBtn.onclick=()=>{ calCursor.setMonth(calCursor.getMonth()+1); renderCalendar(gridId,labelId,prevId,nextId); };

  // quick mark today buttons (if on Home)
  $("#markTodayOk")?.addEventListener("click", ()=>{ setCal(todayISO(),"ok"); renderHome(); updateSobrietyBadges(); });
  $("#markTodaySlip")?.addEventListener("click", ()=>{ setCal(todayISO(),"slip"); renderHome(); });
}

function renderAdvice(){
  const a = state.profile?.primary || "Technology";
  $("#adviceTitle").textContent = `${a} — Helpful tips`;
  const items = ADVICE[a]||[];
  $("#adviceBody").innerHTML = items.length? `<ul>${items.map(x=>`<li>${x}</li>`).join("")}</ul>` : `<p>No advice yet.</p>`;
}

function renderProgram(){
  const a = state.profile?.primary || "Technology";
  $("#programTitle").textContent = `${a}: 10-step program`;
  $("#programList").innerHTML = (PROGRAMS[a]||[]).map(s=>`<li>${s}</li>`).join("");
  const mats = getMaterials()[a]||[];
  $("#materialsList").innerHTML = mats.map(m=>`<li>${m}</li>`).join("");
  const hasYear = currentBestBadgeDays()>=365;
  $("#contribWrap").hidden = !hasYear;
}

function renderDeepGuide(){
  const a = state.profile?.primary || "Technology";
  $("#deepTitle").textContent = `${a} — Deep Guide`;
  $("#deepBody").innerHTML = deepGuideFor(a);
}

/* -------- Materials storage (for contributions) -------- */
function getMaterials(){
  const raw = JSON.parse(localStorage.getItem(STORAGE.MATERIALS)||"{}");
  return {...MATERIALS_DEFAULT, ...raw};
}
function addMaterial(a, tip){
  const raw = JSON.parse(localStorage.getItem(STORAGE.MATERIALS)||"{}");
  raw[a]=raw[a]||[]; raw[a].push(tip);
  localStorage.setItem(STORAGE.MATERIALS, JSON.stringify(raw));
}

/* ---------------- Badges & Titles ---------------- */
function currentBestBadgeDays(){
  // total “ok” days since quitDate
  const start = state.profile?.quitDate ? new Date(state.profile.quitDate) : null;
  if(!start) return 0;
  let days=0;
  for(const iso in state.cal){
    if(state.cal[iso]==="ok" && new Date(iso)>=start) days++;
  }
  return days;
}
function updateSobrietyBadges(){
  const okDays = currentBestBadgeDays();
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  SOBRIETY.forEach(b=>{ if(okDays>=b.days) earned.add(`S:${b.days}`); });
  localStorage.setItem(STORAGE.BADGES, JSON.stringify([...earned]));
}
function renderBadges(){
  updateSobrietyBadges();
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  const sob = $("#sobrietyBadges"); sob.innerHTML="";
  SOBRIETY.forEach(b=>{
    const span=document.createElement("span");
    span.className="badge"+(earned.has(`S:${b.days}`)?" earned":"");
    span.textContent=b.label;
    sob.appendChild(span);
  });
  // Social badges
  const soc = $("#socialBadges"); soc.innerHTML="";
  const chatted = state.social.chatted, friended = state.social.friended;
  soc.appendChild(makeBadge("First chat message", chatted));
  soc.appendChild(makeBadge("First friend added", friended));

  // Current title (highest sobriety title)
  let title="—"; for(let i=SOBRIETY.length-1;i>=0;i--){ if(earned.has(`S:${SOBRIETY[i].days}`)){ title=SOBRIETY[i].title; break; } }
  $("#currentTitle").textContent = title;
}
function makeBadge(label, earned){
  const b=document.createElement("span"); b.className="badge"+(earned?" earned":""); b.textContent=label; return b;
}

/* ---------------- Settings (multi-addiction + language) ---------------- */
function renderSettings(){
  const f=$("#profileForm"); if(!f) return;
  const adds = state.profile?.addictions || [state.profile?.primary||"Technology"];
  const primary = state.profile?.primary || adds[0];
  f.primary.innerHTML = adds.map(a=>`<option ${a===primary?"selected":""}>${a}</option>`).join("");
  f.quitDate.value = state.profile?.quitDate || "";
  f.motivation.value = state.profile?.motivation || "";
  f.lang.value = state.profile?.lang || "en";
  // chips
  const wrap=$("#addictionsChips"); wrap.innerHTML="";
  adds.forEach(a=>{
    const btn=document.createElement("button");
    btn.className="chip"; btn.type="button"; btn.textContent=a+" ✕";
    btn.onclick=()=>{
      const list=(state.profile?.addictions||adds).filter(x=>x!==a);
      state.profile={...(state.profile||{}), addictions:list.length?list:[primary], primary:list[0]||primary};
      save(); renderSettings();
    };
    wrap.appendChild(btn);
  });
  // add btn
  $("#addAddictionBtn").onclick=()=>{
    const v=(f.addAddiction.value||"").trim(); if(!v) return;
    const list=new Set([...(state.profile?.addictions||adds), v]);
    state.profile={...(state.profile||{}), addictions:[...list]};
    if(!state.profile.primary) state.profile.primary=v;
    f.addAddiction.value="";
    save(); renderSettings();
  };
}

/* ---------------- Friends / Requests & Chat ---------------- */
let auth=null, db=null, me=null, unsubGlobal=null;
async function initFirebase(){
  if(!(window.firebase&&firebase.apps?.length)) return;
  auth=firebase.auth(); db=firebase.firestore();
  await auth.signInAnonymously(); me=auth.currentUser;
  await db.collection("users").doc(me.uid).set({createdAt:Date.now()}, {merge:true});
}
function currentTitle(){
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  for(let i=SOBRIETY.length-1;i>=0;i--){ if(earned.has(`S:${SOBRIETY[i].days}`)) return SOBRIETY[i].title; }
  return "";
}
function wireCommunityOnce(){
  if(unsubGlobal!==null) return; // already wired
  const box=$("#globalChat");
  // If Firebase not configured, seed example messages; names clickable but local only
  if(!(window.firebase&&firebase.apps?.length)){
    seedExamples(box);
    $("#globalForm").addEventListener("submit",e=>{
      e.preventDefault();
      const msg = new FormData(e.target).get("msg")?.toString().trim();
      if(!msg) return;
      state.social.chatted = true; save(); renderBadges(); // social badge
      const div=document.createElement("div");
      div.className="chat-msg";
      div.innerHTML = `<strong class="chat-name" data-uid="local">You (${currentTitle()||"Newcomer"})</strong>: ${esc(msg)} <small>${new Date().toLocaleTimeString()}</small>`;
      box.appendChild(div); box.scrollTop = box.scrollHeight;
      e.target.reset();
    });
    box.addEventListener("click",(e)=>{
      const t=e.target.closest(".chat-name"); if(!t) return;
      alert("Friend requests need Firebase enabled.\n(Your click works; enable Firebase to use real requests.)");
    });
    $("#myUid").textContent="—";
    renderFriendsLocal(); // shows empty lists
    return;
  }
  // With Firebase
  initFirebase().then(()=>{
    $("#myUid").textContent=me.uid;
    // stream
    unsubGlobal = db.collection("rooms").doc("global").collection("messages")
      .orderBy("ts","asc").limit(200).onSnapshot(snap=>{
        box.innerHTML="";
        if(snap.empty) seedExamples(box);
        snap.forEach(doc=>{
          const m=doc.data();
          const who = m.uid===me.uid ? `You (${currentTitle()||"Newcomer"})` : (m.name || m.uid.slice(0,6));
          const span = `<strong class="chat-name" data-uid="${m.uid}">${esc(who)}</strong>`;
          const div=document.createElement("div");
          div.className="chat-msg";
          div.innerHTML = `${span}: ${esc(m.text)} <small>${new Date(m.ts).toLocaleTimeString()}</small>`;
          box.appendChild(div);
        });
        box.scrollTop = box.scrollHeight;
      });

    // send
    $("#globalForm").addEventListener("submit",async e=>{
      e.preventDefault();
      const msg = new FormData(e.target).get("msg")?.toString().trim();
      if(!msg) return;
      await db.collection("rooms").doc("global").collection("messages").add({uid:me.uid,text:msg,ts:Date.now()});
      state.social.chatted=true; save(); // social badge
      e.target.reset();
    });

    // click name -> send request
    $("#globalChat").addEventListener("click", async (e)=>{
      const t=e.target.closest(".chat-name"); if(!t) return;
      const uid=t.getAttribute("data-uid"); if(!uid || uid===me.uid) return;
      await db.collection("users").doc(uid).set({requests: firebase.firestore.FieldValue.arrayUnion(me.uid)}, {merge:true});
      alert("Friend request sent.");
    });

    loadFriends();
  });
}
function seedExamples(box){
  const now=new Date();
  const ex=[
    {who:"Maya (2 wks)", text:"Grayscale at night cuts my scrolling.", t:new Date(now-300000)},
    {who:"Alex (1 mo)", text:"Calendar ✅ each night is my anchor.", t:new Date(now-180000)},
    {who:"You", text:"Welcome! Click a name to befriend.", t:new Date(now-60000)}
  ];
  ex.forEach(m=>{
    const div=document.createElement("div");
    div.className="chat-msg";
    div.innerHTML=`<strong class="chat-name" data-uid="sample">${esc(m.who)}</strong>: ${esc(m.text)} <small>${m.t.toLocaleTimeString()}</small>`;
    box.appendChild(div);
  });
  box.scrollTop=box.scrollHeight;
}
function esc(s){return String(s).replace(/[&<>\"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));}

async function loadFriends(){
  if(!db||!me) return;
  const meDoc = await db.collection("users").doc(me.uid).get();
  const data = meDoc.data()||{};
  const requests = data.requests||[];
  const friends  = data.friends ||[];
  const reqList=$("#requestsList"); reqList.innerHTML = requests.length? "" : `<li><span>No requests</span></li>`;
  requests.forEach(uid=>{
    const li=document.createElement("li");
    li.innerHTML=`<span>${uid}</span><div class="actions"><button class="btn" data-acc="${uid}">Accept</button><button class="btn subtle" data-rej="${uid}">Decline</button></div>`;
    reqList.appendChild(li);
  });
  reqList.onclick=async e=>{
    const uid=e.target.getAttribute("data-acc")||e.target.getAttribute("data-rej"); if(!uid) return;
    const accept= !!e.target.getAttribute("data-acc");
    await db.collection("users").doc(me.uid).set({requests: firebase.firestore.FieldValue.arrayRemove(uid)}, {merge:true});
    if(accept){
      await db.collection("users").doc(me.uid).set({friends: firebase.firestore.FieldValue.arrayUnion(uid)}, {merge:true});
      await db.collection("users").doc(uid).set({friends: firebase.firestore.FieldValue.arrayUnion(me.uid)}, {merge:true});
      state.social.friended = true; save(); // social badge
    }
    loadFriends();
  };
  const frList=$("#friendList"); frList.innerHTML = friends.length? "" : `<li><span>No friends yet</span></li>`;
  friends.forEach(uid=>{
    const li=document.createElement("li");
    li.innerHTML=`<span>${uid}</span><button class="btn subtle" data-rem="${uid}">Remove</button>`;
    frList.appendChild(li);
  });
  frList.onclick=async e=>{
    const uid=e.target.getAttribute("data-rem"); if(!uid) return;
    await db.collection("users").doc(me.uid).set({friends: firebase.firestore.FieldValue.arrayRemove(uid)}, {merge:true});
    await db.collection("users").doc(uid).set({friends: firebase.firestore.FieldValue.arrayRemove(me.uid)}, {merge:true});
    loadFriends();
  };
}

function renderFriendsLocal(){
  $("#requestsList").innerHTML=`<li><span>Requests need Firebase enabled</span></li>`;
  $("#friendList").innerHTML=`<li><span>No friends yet</span></li>`;
}

/* ---------------- Wire UI ---------------- */
function wire(){
  // Tab / buttons
  $$(".tabbar [data-nav], [data-nav]").forEach(b=> b.addEventListener("click",()=>show(b.getAttribute("data-nav"))));

  // Onboarding
  $("#onboardingForm")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const focus=document.querySelector('input[name="focus"]:checked')?.value || "Technology";
    const fd=new FormData(e.target);
    state.profile = {
      primary: focus, addictions: [focus],
      quitDate: fd.get("quitDate"),
      motivation: (fd.get("motivation")||"").trim(),
      lang: "en"
    };
    save(); applyI18N(); show("home");
  });

  // Journal
  $("#journalForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const t=(new FormData(e.target).get("entry")||"").trim(); if(!t) return;
    state.journal.push({id:crypto.randomUUID(), text:t, ts:Date.now()}); save(); e.target.reset();
    const list=$("#journalList"); const li=document.createElement("li"); li.innerHTML=`<span>${new Date().toLocaleString()} — ${t}</span>`; list.prepend(li);
  });

  // Program contribution
  $("#contribForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const tip=(new FormData(e.target).get("tip")||"").trim(); if(!tip) return;
    const a=state.profile?.primary||"Technology"; addMaterial(a, tip); e.target.reset(); alert("Thanks! Your tip was added."); renderProgram();
  });

  // SOS timer + note
  const tEl=$("#timer"); if(tEl){ let timer=null, remain=60;
    const upd=()=>{ tEl.textContent=`${String(Math.floor(remain/60)).padStart(2,"0")}:${String(remain%60).padStart(2,"0")}`; };
    $("#startTimer").onclick=()=>{ if(timer) return; remain=60; upd(); timer=setInterval(()=>{remain--; upd(); if(remain<=0){clearInterval(timer); timer=null;} },1000); };
    $("#resetTimer").onclick=()=>{ clearInterval(timer); timer=null; remain=60; upd(); };
    $("#saveSos").onclick=()=>{ const val=($("#sosNote").value||"").trim(); if(!val) return; state.journal.push({id:crypto.randomUUID(), text:`[SOS] ${val}`, ts:Date.now()}); $("#sosNote").value=""; save(); alert("Saved."); };
    upd();
  }

  // Settings save
  $("#profileForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const primary = fd.get("primary") || state.profile?.primary || "Technology";
    const lang = fd.get("lang") || "en";
    state.profile = {
      ...(state.profile||{addictions:[primary]}),
      primary,
      quitDate: fd.get("quitDate")||"",
      motivation: (fd.get("motivation")||"").trim(),
      lang
    };
    save(); document.documentElement.setAttribute("data-lang", lang); applyI18N(); alert(lang==="es"?"Guardado.":"Saved.");
  });

  // Install + notifications kept
  let deferred=null;
  window.addEventListener("beforeinstallprompt",(e)=>{ e.preventDefault(); deferred=e; $("#installBtn").hidden=false; });
  $("#installBtn").onclick=async()=>{ if(!deferred) return; deferred.prompt(); await deferred.userChoice; $("#installBtn").hidden=true; deferred=null; };

  $("#exportBtn").onclick=()=>{
    const data = {profile:state.profile, checkins:state.checkins, journal:state.journal, cal:state.cal, social:state.social};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(blob),download:"rehabit-backup.json"}); a.click(); URL.revokeObjectURL(a.href);
  };
  $("#importFile").onchange=async(e)=>{
    const f=e.target.files?.[0]; if(!f) return; const txt=await f.text(); const d=JSON.parse(txt);
    if(!confirm("Import will overwrite local data. Continue?")) return;
    state.profile=d.profile||state.profile; state.checkins=d.checkins||[]; state.journal=d.journal||[]; state.cal=d.cal||{}; state.social=d.social||state.social; save(); alert("Import complete."); show("home");
  };
  $("#resetBtn").onclick=()=>{ if(!confirm("Erase local data on this device?")) return; Object.values(STORAGE).forEach(k=>localStorage.removeItem(k)); location.reload(); };

  // Footer year + i18n
  $("#year").textContent=new Date().getFullYear();
  applyI18N();
}

/* ---------------- Boot ---------------- */
load();
window.addEventListener("DOMContentLoaded", async ()=>{
  if(!state.profile) show("onboarding"); else show("home");
  wire();
  try{ await initFirebase(); }catch{}
});

/* ---------------- Utilities for badges on actions ---------------- */
document.addEventListener("submit",(e)=>{
  if(e.target && e.target.id==="globalForm"){
    state.social.chatted=true; save();
  }
});
