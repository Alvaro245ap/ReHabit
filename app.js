/* ReHabit – Drawer menu; bottom tabs reduced to Home/Community/Friends;
   Settings (name + multi-addictions incl. Other drugs); bots in chat
   (click name to befriend); Guide fully localized EN/ES and tailored per
   addiction; choose addiction on entering Guide if multiple; richer Tips/Steps/Deep.

   ADDITIONS IN THIS VERSION (as requested):
   - Friend code helpers + BOT_CODES
   - Community chat sends with Display Name or Anonymous
   - Offline chat works; bots can be befriended by click or code
   - Friends page: show my code + add-by-code (offline + Firebase)
   - i18n key for chatNote
*/

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ---------------- Storage & State ---------------- */
const STORAGE = {
  PROFILE:"rehabit_profile", CAL:"rehabit_calendar", JOURNAL:"rehabit_journal",
  MATERIALS:"rehabit_materials", BADGES:"rehabit_badges", SOCIAL:"rehabit_social"
};
const state = {
  profile:null,        // {displayName, primary, addictions[], quitDate, motivation, lang}
  cal:{},              // {YYYY-MM-DD:"ok"|"slip"}
  journal:[],
  social:{chatted:false,friended:false},
  i18n:"en"
};
function load(){
  state.profile = JSON.parse(localStorage.getItem(STORAGE.PROFILE)||"null");
  state.cal     = JSON.parse(localStorage.getItem(STORAGE.CAL)||"{}");
  state.journal = JSON.parse(localStorage.getItem(STORAGE.JOURNAL)||"[]");
  state.social  = JSON.parse(localStorage.getItem(STORAGE.SOCIAL)||'{"chatted":false,"friended":false}');
  state.i18n    = state.profile?.lang || "en";
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
    install:"Install",
    welcome:"Welcome 👋", selectFocus:"Select your focus and a target date to start tracking progress.",
    quitDate:"Quit/target date", motivation:"Your main motivation (optional)", start:"Start ReHabit",
    danger:"If in danger, get help", homeTitle:"Welcome to ReHabit", homeLead:"Your private companion to build healthier habits—one day at a time.",
    monthCard:"Calendar (this month)", shortcuts:"Today’s shortcuts", quickOpen:"Quick open", recent:"Recent notes",
    checkin:"Daily Check-in", calendar:"Calendar", guide:"Guide", badges:"Badges", research:"Research", chat:"Community", friends:"Friends", back:"Back",
    value:"Value:", mood:"Mood (0–10)", urge:"Urge (0–10)", sleep:"Hours of sleep", cravingWindow:"Craving window", morning:"Morning", afternoon:"Afternoon", evening:"Evening", night:"Night",
    actionTook:"Helpful action you took", note:"Note (optional)", exposure:"Exposure level today", low:"Low", medium:"Medium", high:"High",
    todayShortcuts:"Today’s shortcuts", markSuccess:"Record success today", markSlip:"Record slip today",
    sos:"Craving SOS", s1:"Delay 5 minutes. Start timer and breathe slowly.", s2:"Urge surfing. Notice the urge rising and falling.", s3:"Do one alternative action. Walk, shower, text a friend, drink water.",
    timer:"Breathing Timer (1:00)", startBtn:"Start", reset:"Reset", quickNotes:"Quick Notes", helpful:"Helpful actions",
    calendarHelp:"Click a day to toggle: blank → Success → Slip.",
    tips:"Tips", steps:"10 Steps", deep:"Deep Guide", materials:"Helpful materials",
    contribTitle:"Contribute tips (1-year badge required)", yourTip:"Your tip or resource", submit:"Submit tip", contribNote:"Contributions may appear for your addiction.",
    currentTitle:"Your current chat title", send:"Send", yourCode:"Your code:", requests:"Requests", friendsList:"Friends",
    footer:"For support only—does not replace professional treatment.",
    a_tech:"Technology", a_smoke:"Smoking", a_alcohol:"Alcohol", a_gambling:"Gambling", a_other:"Other drugs",
    w0:"Sun", w1:"Mon", w2:"Tue", w3:"Wed", w4:"Thu", w5:"Fri", w6:"Sat",
    researchTitle:"Evidence-based roadmap",
    settings:"Settings", displayName:"Display name", chooseAddictions:"Choose addictions",
    chooseAddiction:"Choose addiction", emergency:"Emergency",
    // NEW i18n key for Community note:
    chatNote:"Community chat: unmoderated peer support. Click a name (including bots) to send a friend request."
  },
  es:{
    install:"Instalar",
    welcome:"Bienvenido/a 👋", selectFocus:"Elige tu(s) enfoque(s) y una fecha objetivo para comenzar a registrar tu progreso.",
    quitDate:"Fecha objetivo", motivation:"Tu principal motivación (opcional)", start:"Comenzar con ReHabit",
    danger:"Si estás en peligro, busca ayuda", homeTitle:"Bienvenido a ReHabit", homeLead:"Tu compañero privado para crear hábitos más saludables—día a día.",
    monthCard:"Calendario (este mes)", shortcuts:"Atajos de hoy", quickOpen:"Accesos rápidos", recent:"Notas recientes",
    checkin:"Revisión diaria", calendar:"Calendario", guide:"Guía", badges:"Insignias", research:"Investigación", chat:"Comunidad", friends:"Amigos", back:"Volver",
    value:"Valor:", mood:"Estado de ánimo (0–10)", urge:"Intensidad de impulso (0–10)", sleep:"Horas de sueño", cravingWindow:"Momento de mayor impulso", morning:"Mañana", afternoon:"Tarde", evening:"Atardecer", night:"Noche",
    actionTook:"Acción útil que hiciste", note:"Nota (opcional)", exposure:"Nivel de exposición hoy", low:"Bajo", medium:"Medio", high:"Alto",
    todayShortcuts:"Atajos de hoy", markSuccess:"Registrar logro de hoy", markSlip:"Registrar recaída de hoy",
    sos:"SOS por antojo", s1:"Retrasa 5 minutos. Inicia el temporizador y respira lento.", s2:"Surf del impulso. Observa cómo sube y baja.", s3:"Haz una acción alternativa. Caminar, ducharte, escribir a alguien, beber agua.",
    timer:"Temporizador de respiración (1:00)", startBtn:"Iniciar", reset:"Reiniciar", quickNotes:"Notas rápidas", helpful:"Acciones útiles",
    calendarHelp:"Haz clic en un día para alternar: vacío → Logro → Recaída.",
    tips:"Consejos", steps:"10 Pasos", deep:"Guía profunda", materials:"Materiales útiles",
    contribTitle:"Aporta consejos (requiere 1 año)", yourTip:"Tu consejo o recurso", submit:"Enviar", contribNote:"Las contribuciones pueden mostrarse para tu adicción.",
    currentTitle:"Tu título actual en el chat", send:"Enviar", yourCode:"Tu código:", requests:"Solicitudes", friendsList:"Amigos",
    footer:"Solo para apoyo—no reemplaza tratamiento profesional.",
    a_tech:"Tecnología", a_smoke:"Cigarro", a_alcohol:"Alcohol", a_gambling:"Juego", a_other:"Otras drogas",
    w0:"Dom", w1:"Lun", w2:"Mar", w3:"Mié", w4:"Jue", w5:"Vie", w6:"Sáb",
    researchTitle:"Hoja de ruta basada en evidencia",
    settings:"Ajustes", displayName:"Nombre visible", chooseAddictions:"Elige adicciones",
    chooseAddiction:"Elige adicción", emergency:"Emergencia",
    // NEW translation
    chatNote:"Chat comunitario: apoyo entre pares no moderado. Pulsa un nombre (incluidos bots) para enviar solicitud de amistad."
  }
};
function t(k){ const L=document.documentElement.getAttribute("data-lang")||"en"; return (D[L] && D[L][k]) || D.en[k] || k; }
function applyI18N(){ $$("[data-i18n]").forEach(el => el.textContent = t(el.getAttribute("data-i18n"))); }

/* ---------------- NEW: Friend code + Bot codes ---------------- */
const CODE_KEY = "rehabit_mycode";
function getMyCode(){
  if (window.firebase && firebase.apps?.length && firebase.auth()?.currentUser?.uid) {
    return "RH-" + firebase.auth().currentUser.uid.slice(0,6).toUpperCase();
  }
  let c = localStorage.getItem(CODE_KEY);
  if (!c) { c = "RH-" + crypto.randomUUID().slice(0,6).toUpperCase(); localStorage.setItem(CODE_KEY, c); }
  return c;
}
const BOT_CODES = {
  "RH-COACH": { uid:"bot_coach", name:"CoachBot" },
  "RH-CALM":  { uid:"bot_calm",  name:"CalmBot"  },
  "RH-PEER":  { uid:"bot_peer",  name:"PeerBot"  }
};

/* ---------------- Content (per addiction, EN/ES) ---------------- */
const ADDICTIONS = ["Technology","Smoking","Alcohol","Gambling","Other"]; // Other = Other drugs

// (tips/steps/deep/materials/badges etc. unchanged from previous version)
// ...  (keeping the rest of the content blocks exactly as before)
const TIPS = { /* ... unchanged content ... */ };
const STEPS = { /* ... unchanged content ... */ };

// For brevity in this snippet: keep your previous deepGuideFor, MATERIALS_DEFAULT,
// SOBRIETY, SOCIAL_BADGES, okDaysSinceStart, updateSobrietyBadges, currentTitle
// exactly as in your last working version.

/* ---------------- Calendar (unchanged) ---------------- */
// ... renderCalendar, markToday ...

/* ---------------- Guide (unchanged) ---------------- */
// ... translateAddiction, currentGuideAddiction, renderGuideChoice, renderGuideCore, renderGuide, wireGuideTabs ...

/* ---------------- Materials (unchanged) ---------------- */
// ... getMaterials, addMaterial, renderMaterials ...

/* ---------------- Check-in (unchanged) ---------------- */
// ... ENCOURAGEMENTS, randomEnc, renderCheckin ...

/* ---------------- Badges page (unchanged) ---------------- */
// ... renderBadges ...

/* ---------------- Research (unchanged) ---------------- */
// ... RESEARCH, researchText, renderResearch ...

/* ---------------- Local friends storage (unchanged) ---------------- */
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

/* ---------------- Chat & Friends ---------------- */
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
    {uid:"bot_coach", who:"CoachBot", text:"Tip: Try a 5-minute delay and breathe out longer than you breathe in."},
    {uid:"bot_calm",  who:"CalmBot",  text:"Reminder: urges rise and fall. Start a 60-second breathing timer."},
    {uid:"bot_peer",  who:"PeerBot",  text:"You’re not alone—log Success/Slip on your calendar, review weekly."},
    {uid:"maya111",   who:"Maya (2 wks)", text:"Grayscale at night cuts my scrolling."},
    {uid:"alex222",   who:"Alex (1 mo)",  text:"Marking Success each night keeps me honest."},
    // NEW example lines
    {uid:"bot_coach", who:"CoachBot", text:"Small actions, big momentum. What’s one helpful thing you can do now?"},
    {uid:"bot_calm",  who:"CalmBot",  text:"Breathing idea: 4 seconds in, 6 seconds out — for 1 minute."}
  ];
  ex.forEach((m,i)=>{
    const div=document.createElement("div");
    div.className="chat-msg";
    div.innerHTML=`<strong class="chat-name" data-uid="${m.uid}">${escapeHTML(m.who)}</strong>: ${escapeHTML(m.text)} <small>${new Date(now-((5-i)*60000)).toLocaleTimeString()}</small>`;
    box.appendChild(div);
  });
  box.scrollTop=box.scrollHeight;
}
function wireCommunity(){
  const box=$("#globalChat"); box.innerHTML="";
  if(!(window.firebase&&firebase.apps?.length)){
    seedChat(box);

    // show my friend code in offline mode
    $("#myUid").textContent = getMyCode();

    $("#globalForm").onsubmit=(e)=>{ e.preventDefault();
      const msg=new FormData(e.target).get("msg")?.toString().trim(); if(!msg) return;
      state.social.chatted=true; save(); renderBadges();
      const rawName = (state.profile?.displayName || "").trim();
      const whoYouAre = rawName ? `${rawName} (${currentTitle()})` : "Anonymous";
      const div=document.createElement("div"); div.className="chat-msg";
      div.innerHTML=`<strong class="chat-name" data-uid="you">${escapeHTML(whoYouAre)}</strong>: ${escapeHTML(msg)} <small>${new Date().toLocaleTimeString()}</small>`;
      box.appendChild(div); box.scrollTop=box.scrollHeight; e.target.reset();
    };

    box.onclick=(e)=>{
      const n=e.target.closest(".chat-name"); if(!n) return;
      const uid=n.getAttribute("data-uid"); if(!uid) return;
      state.social.friended=true; save(); renderBadges();
      addLocalRequest(uid, n.textContent.trim());
      alert((state.i18n==="es")?"Solicitud de amistad enviada.":"Friend request sent.");
      renderFriendsLocal();
    };

    renderFriendsLocal();
    return;
  }
  // Live mode
  initFirebase().then(()=>{
    $("#myUid").textContent= getMyCode();
    unsub = db.collection("rooms").doc("global").collection("messages").orderBy("ts","asc").limit(200)
      .onSnapshot(snap=>{
        box.innerHTML=""; if(snap.empty) seedChat(box);
        snap.forEach(doc=>{
          const m=doc.data();
          const who = (m.uid===me.uid)
            ? ((state.profile?.displayName||"Anonymous")+" ("+currentTitle()+")")
            : (m.name || m.uid.slice(0,6));
          const div=document.createElement("div"); div.className="chat-msg";
          div.innerHTML=`<strong class="chat-name" data-uid="${m.uid}">${escapeHTML(who)}</strong>: ${escapeHTML(m.text)} <small>${new Date(m.ts).toLocaleTimeString()}</small>`;
          box.appendChild(div);
        }); box.scrollTop=box.scrollHeight;
      });

    $("#globalForm").onsubmit=async (e)=>{
      e.preventDefault();
      const msg=new FormData(e.target).get("msg")?.toString().trim(); if(!msg) return;
      const rawName = (state.profile?.displayName || "").trim();
      const nameToStore = rawName ? rawName : "Anonymous";
      await db.collection("rooms").doc("global").collection("messages").add({uid:me.uid,text:msg,ts:Date.now(),name:nameToStore});
      state.social.chatted=true; save(); renderBadges(); e.target.reset();
    };

    $("#globalChat").onclick=async (e)=>{ const n=e.target.closest(".chat-name"); if(!n) return;
      const uid=n.getAttribute("data-uid"); if(!uid||uid===me.uid) return;
      await db.collection("users").doc(uid).set({requests: firebase.firestore.FieldValue.arrayUnion(me.uid)}, {merge:true});
      state.social.friended=true; save(); renderBadges();
      alert((state.i18n==="es")?"Solicitud de amistad enviada.":"Friend request sent.");
    };

    loadFriends();
  });
}
function renderFriendsLocal(){
  // Show my code
  $("#myUid").textContent = getMyCode();

  // "Add by code" form (offline demo supports bot codes)
  const form = $("#addFriendForm");
  if(form){
    form.onsubmit = (e)=>{
      e.preventDefault();
      const code = (new FormData(form).get("code") || "").trim().toUpperCase();
      if(!code) return;
      if(BOT_CODES[code]){
        addLocalRequest(BOT_CODES[code].uid, BOT_CODES[code].name);
        alert((state.i18n==="es")?"Solicitud enviada.":"Request sent.");
        renderFriendsLocal();
        form.reset();
        return;
      }
      alert((state.i18n==="es")?"Código no encontrado en modo sin conexión.":"Code not found in offline demo.");
    };
  }

  // Requests
  const reqs = getLocalRequests();
  const reqList=$("#requestsList"); reqList.innerHTML=reqs.length?"":`<li><span>No requests (offline demo)</span></li>`;
  reqs.forEach(r=>{
    const li=document.createElement("li");
    li.innerHTML=`<span>${escapeHTML(r.label||r.uid)}</span>
      <div class="actions">
        <button class="btn" data-acc="${r.uid}">Accept</button>
        <button class="btn subtle" data-rej="${r.uid}">Decline</button>
      </div>`;
    reqList.appendChild(li);
  });
  reqList.onclick=(e)=>{
    const acc=e.target.getAttribute("data-acc");
    const rej=e.target.getAttribute("data-rej");
    if(acc){
      addLocalFriend(acc, (reqs.find(x=>x.uid===acc)?.label)||acc);
      removeLocalRequest(acc);
      renderFriendsLocal();
    }else if(rej){
      removeLocalRequest(rej);
      renderFriendsLocal();
    }
  };

  // Friends
  const fr=getLocalFriends();
  const frList=$("#friendList"); frList.innerHTML=fr.length?"":`<li><span>No friends yet</span></li>`;
  fr.forEach(x=>{
    const li=document.createElement("li");
    li.innerHTML=`<span>${escapeHTML(x.label||x.uid)}</span><button class="btn subtle" data-rem="${x.uid}">Remove</button>`;
    frList.appendChild(li);
  });
  frList.onclick=(e)=>{
    const uid=e.target.getAttribute("data-rem"); if(!uid) return;
    const next=getLocalFriends().filter(x=>x.uid!==uid);
    setLocalFriends(next); renderFriendsLocal();
  };
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

  // add-by-code in Firebase (bots supported)
  const codeForm = $("#addFriendForm");
  if(codeForm){
    codeForm.onsubmit = async (e)=>{
      e.preventDefault();
      const code = (new FormData(codeForm).get("code") || "").trim().toUpperCase();
      if(!code) return;
      if(BOT_CODES[code]){
        await db.collection("users").doc(BOT_CODES[code].uid).set({requests: firebase.firestore.FieldValue.arrayUnion(me.uid)}, {merge:true});
        alert((state.i18n==="es")?"Solicitud enviada.":"Request sent.");
        codeForm.reset(); return;
      }
      alert((state.i18n==="es")?"Código no encontrado.":"Code not found.");
    };
  }
}

/* ---------------- Navigation, Drawer & Wiring ---------------- */
const views = ["onboarding","home","calendar","checkin","sos","guide","program","badges","research","community","friends","settings"];
function show(v){
  views.forEach(id => $(`#view-${id}`)?.setAttribute("hidden","true"));
  $(`#view-${v}`)?.removeAttribute("hidden");
  if(v==="home"){ renderCalendar("calendarGrid","monthLabel","prevMonth","nextMonth"); }
  if(v==="calendar"){ renderCalendar("calendarGrid2","monthLabel2","prevMonth2","nextMonth2"); }
  if(v==="guide"){ renderGuide(); wireGuideTabs(); }
  if(v==="program"){ renderMaterials(); }
  if(v==="checkin"){ renderCheckin(); }
  if(v==="badges"){ renderBadges(); }
  if(v==="research"){ renderResearch(); }
  if(v==="community"){ wireCommunity(); }

  // NEW: ensure Friends page is fully wired and shows your code
  if(v==="friends"){
    if (window.firebase && firebase.apps?.length) {
      $("#myUid").textContent = getMyCode();
      loadFriends();
    } else {
      renderFriendsLocal();
    }
  }

  if(v==="settings"){ renderSettings(); }
  window.scrollTo({top:0,behavior:"smooth"});
}
function wire(){
  // bottom nav
  $$(".tabbar [data-nav], [data-nav]").forEach(b=>{
    b.addEventListener("click",()=>{
      const target=b.getAttribute("data-nav");
      if(target){ closeDrawer(); show(target); }
    });
  });

  // onboarding
  $("#onboardingForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const chosen = $$('input[name="focus"]:checked').map(i=>i.value).filter(v=>ADDICTIONS.includes(v));
    if(!chosen.length) { alert("Pick at least one focus."); return; }
    const fd=new FormData(e.target);
    state.profile = {
      displayName: "",
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
    save(); applyI18N();
    renderCalendar(); renderGuide(); renderCheckin(); renderBadges(); renderResearch();
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
    save(); alert((state.i18n==="es")?"Guardado.":"Saved."); renderCheckin();
  });

  // quick mark buttons
  $("#markTodayOk")?.addEventListener("click", ()=>markToday("ok"));
  $("#markTodaySlip")?.addEventListener("click", ()=>markToday("slip"));
  $("#markTodayOk2")?.addEventListener("click", ()=>markToday("ok"));
  $("#markTodaySlip2")?.addEventListener("click", ()=>markToday("slip"));

  // materials contrib
  $("#contribForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const tip=(new FormData(e.target).get("tip")||"").trim(); if(!tip) return;
    addMaterial(currentGuideAddiction(), tip);
    e.target.reset(); alert((state.i18n==="es")?"¡Gracias!":"Thanks!");
    renderMaterials();
  });

  // SOS
  wireSOS();

  // drawer
  $("#menuBtn").onclick=openDrawer;
  $("#closeDrawer").onclick=closeDrawer;
  $("#backdrop").onclick=closeDrawer;

  // footer year + i18n
  $("#year").textContent = new Date().getFullYear();
  applyI18N();
}
function openDrawer(){ $("#drawer").classList.add("open"); $("#backdrop").hidden=false; }
function closeDrawer(){ $("#drawer").classList.remove("open"); $("#backdrop").hidden=true; }

function wireSOS(){
  const tEl=$("#timer"); if(!tEl) return;
  let timer=null, remain=60;
  const upd=()=>{ tEl.textContent=`${String(Math.floor(remain/60)).padStart(2,"0")}:${String(remain%60).padStart(2,"0")}`; };
  $("#startTimer").onclick=()=>{ if(timer) return; remain=60; upd(); timer=setInterval(()=>{ remain--; upd(); if(remain<=0){ clearInterval(timer); timer=null; }},1000); };
  $("#resetTimer").onclick=()=>{ clearInterval(timer); timer=null; remain=60; upd(); };
  $("#saveSos").onclick=()=>{ const v=($("#sosNote").value||"").trim(); if(!v) return; state.journal.push({id:crypto.randomUUID(), text:`[SOS] ${v}`, ts:Date.now()}); $("#sosNote").value=""; save(); alert((state.i18n==="es")?"Guardado.":"Saved."); };
  const chips=["Drink water","Cold splash","Walk 5 min","Text a friend","4-6 breathing"];
  const wrap=$("#copingChips"); wrap.innerHTML=""; chips.forEach(c=>{ const b=document.createElement("button"); b.className="chip"; b.textContent=c; b.onclick=()=>{ $("#sosNote").value = ($("#sosNote").value+"\nTried: "+c).trim(); }; wrap.appendChild(b); });
  upd();
}

/* ---------------- Settings ---------------- */
function renderSettings(){
  const f=$("#settingsForm");
  if(!f) return;
  f.displayName.value = state.profile?.displayName || "";
  // check addictions
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
  };
}

/* ---------------- Boot ---------------- */
load();
window.addEventListener("DOMContentLoaded", ()=>{
  if(!state.profile) show("onboarding"); else show("home");
  wire();
});

/* ---------------- Utils ---------------- */
function escapeHTML(s){return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
