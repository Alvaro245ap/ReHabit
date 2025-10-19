/* ReHabit – vivid UI, calendar on Home, professional shortcuts, pro Check-in,
   combined Guide, Research page (~20 lines, evidence-based), posh titles,
   full EN/ES i18n, badges with icons + lock/earn visuals, 8-tab nav, chat+friends. */

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ---------------- Storage & State ---------------- */
const STORAGE = {
  PROFILE:"rehabit_profile", CAL:"rehabit_calendar", JOURNAL:"rehabit_journal",
  MATERIALS:"rehabit_materials", BADGES:"rehabit_badges", SOCIAL:"rehabit_social"
};
const state = {
  profile:null,        // {primary, addictions[], quitDate, motivation, lang}
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
    a_tech:"Technology", a_smoke:"Smoking", a_alcohol:"Alcohol", a_gambling:"Gambling",
    // Weekdays
    w0:"Sun", w1:"Mon", w2:"Tue", w3:"Wed", w4:"Thu", w5:"Fri", w6:"Sat",
    // Research heading
    researchTitle:"Evidence-based roadmap",
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
    a_tech:"Tecnología", a_smoke:"Cigarro", a_alcohol:"Alcohol", a_gambling:"Juego",
    w0:"Dom", w1:"Lun", w2:"Mar", w3:"Mié", w4:"Jue", w5:"Vie", w6:"Sáb",
    researchTitle:"Hoja de ruta basada en evidencia",
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
  const lower = (document.documentElement.getAttribute("data-lang")==="es")
    ? (name==="Technology"?"tecnología":name==="Smoking"?"fumar":name==="Alcohol"?"alcohol":"juego")
    : name.toLowerCase();
  const base = `
  <p><strong>Overview.</strong> ${name} can meet needs (relief, stimulation, belonging). Replace the function, not just the behavior.</p>
  <h3>Plan</h3>
  <ul><li>Why list (3 reasons), visible daily.</li><li>Specific rule (e.g., “no ${lower} after 9pm”).</li><li>Environment: remove cues, add friction to ${lower}; make alternatives easy.</li></ul>
  <h3>Urges</h3>
  <ul><li>Delay 5, long exhale, do one alternative.</li><li>Calendar Success/Slip each day; consistency beats perfection.</li></ul>
  <h3>Basics</h3>
  <ul><li>Sleep, food, movement—lower craving intensity.</li></ul>
  <h3>Social</h3>
  <ul><li>One honest ally beats ten vague promises. Weekly check-in.</li></ul>
  <h3>Lapses</h3>
  <ul><li>Write trigger → lesson → one action now. Continue.</li></ul>
  <p class="muted">Guidance only; not a substitute for professional care.</p>`;
  if(document.documentElement.getAttribute("data-lang")==="es"){
    return base
    .replace("Overview.","Resumen.")
    .replace("Plan","Plan")
    .replace("Urges","Impulsos")
    .replace("Basics","Básicos")
    .replace("Social","Social")
    .replace("Lapses","Recaídas")
    .replace("Guidance only; not a substitute for professional care.","Guía informativa; no reemplaza la atención profesional.");
  }
  return base;
}
const MATERIALS_DEFAULT = {
  Technology:["Book: Digital Minimalism","App: Focus / site blockers","Article: Urge surfing basics"],
  Smoking:["Guide: Nicotine patches","App: Smoke-free counter","Article: Delay, breathe, water"],
  Alcohol:["Community: AF groups","NA drinks list","Article: HALT check"],
  Gambling:["Self-exclusion portals","Bank blocks","Article: Replacement dopamine"]
};

/* ---------------- Badges & Titles ---------------- */
const SOBRIETY = [
  {days:7, labelEN:"1 week", labelES:"1 semana", title:"1-Week Strong", descEN:"Mark 7 Success days.", descES:"Marca 7 días de Logro."},
  {days:30,labelEN:"1 month",labelES:"1 mes",    title:"1-Month Steady", descEN:"Mark 30 Success days.",descES:"Marca 30 días de Logro."},
  {days:60,labelEN:"2 months",labelES:"2 meses", title:"2-Month Builder",descEN:"Mark 60 Success days.",descES:"Marca 60 días de Logro."},
  {days:90,labelEN:"3 months",labelES:"3 meses", title:"Quarter Champion",descEN:"Mark 90 Success days.",descES:"Marca 90 días de Logro."},
  {days:120,labelEN:"4 months",labelES:"4 meses",title:"Momentum Maker", descEN:"Mark 120 Success days.",descES:"Marca 120 días de Logro."},
  {days:150,labelEN:"5 months",labelES:"5 meses",title:"Half-Year Near", descEN:"Mark 150 Success days.",descES:"Marca 150 días de Logro."},
  {days:365,labelEN:"1 year",  labelES:"1 año",  title:"1-Year Resilient",descEN:"Mark 365 Success days.",descES:"Marca 365 días de Logro."}
];
const SOCIAL_BADGES = [
  {key:"chat", nameEN:"First Message", nameES:"Primer mensaje", descEN:"Send one chat message.", descES:"Envía un mensaje en el chat."},
  {key:"friend", nameEN:"First Friend", nameES:"Primer amigo", descEN:"Add one friend.", descES:"Añade un amigo."}
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
function weekdayName(i){ return t(`w${i}`); }

function renderCalendar(gridId="calendarGrid", labelId="monthLabel", prevId="prevMonth", nextId="nextMonth"){
  const grid = document.getElementById(gridId), label = document.getElementById(labelId);
  const y=cursor.getFullYear(), m=cursor.getMonth();
  label.textContent = new Date(y,m,1).toLocaleString(undefined,{month:"long",year:"numeric"});
  grid.innerHTML="";
  for(let i=0;i<7;i++){ const hd=document.createElement("div"); hd.className="m"; hd.textContent=weekdayName(i); grid.appendChild(hd); }
  for(let i=0;i<firstDay(y,m);i++){ const blank=document.createElement("div"); grid.appendChild(blank); }
  const days=daysInMonth(y,m);
  for(let d=1; d<=days; d++){
    const iso=`${y}-${pad(m+1)}-${pad(d)}`;
    const cell=document.createElement("div");
    const mark=state.cal[iso]==="ok"?"Success":state.cal[iso]==="slip"?"Slip":"";
    cell.className="day"+(state.cal[iso]==="ok"?" s":state.cal[iso]==="slip"?" f":"");
    cell.innerHTML=`<div class="d">${d}</div><div class="m">${mark}</div>`;
    cell.addEventListener("click",()=>{
      const cur=state.cal[iso]||"";
      const next= cur===""?"ok":(cur==="ok"?"slip":"");
      state.cal[iso]=next; save(); renderCalendar(gridId,labelId,prevId,nextId); updateSobrietyBadges();
    });
    grid.appendChild(cell);
  }
  const prevBtn = document.getElementById(prevId), nextBtn=document.getElementById(nextId);
  if(prevBtn){ prevBtn.onclick=()=>{ cursor.setMonth(cursor.getMonth()-1); renderCalendar(gridId,labelId,prevId,nextId); }; }
  if(nextBtn){ nextBtn.onclick=()=>{ cursor.setMonth(cursor.getMonth()+1); renderCalendar(gridId,labelId,prevId,nextId); }; }
}
function markToday(val){ state.cal[todayISO()] = val; save(); renderCalendar(); updateSobrietyBadges(); }

/* ---------------- Guide (combined) ---------------- */
function translateAddiction(a){
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const key = a==="Technology"?"a_tech":a==="Smoking"?"a_smoke":a==="Alcohol"?"a_alcohol":"a_gambling";
  return t(key);
}
function renderGuide(){
  const a = state.profile?.primary || "Technology";
  $("#guideTitle").textContent = `${translateAddiction(a)} — ${t("guide")}`;
  $("#tab-tips").innerHTML = `<ul>${(ADVICE[a]||[]).map(x=>`<li>${x}</li>`).join("")}</ul>`;
  $("#tab-steps").innerHTML = (PROGRAMS[a]||[]).map(s=>`<li>${s}</li>`).join("");
  $("#tab-deep").innerHTML = deepGuideFor(a);
}
function wireGuideTabs(){
  $$(".guide-tabs .tab").forEach(btn=>{
    btn.onclick=()=>{
      const tab=btn.getAttribute("data-tab");
      ["tips","steps","deep"].forEach(k=>{ $(`#tab-${k}`).hidden = (k!==tab); });
    };
  });
}

/* ---------------- Materials (separate) ---------------- */
function getMaterials(){ const raw=JSON.parse(localStorage.getItem(STORAGE.MATERIALS)||"{}"); return {...MATERIALS_DEFAULT, ...raw}; }
function addMaterial(add, tip){ const raw=JSON.parse(localStorage.getItem(STORAGE.MATERIALS)||"{}"); raw[add]=raw[add]||[]; raw[add].push(tip); localStorage.setItem(STORAGE.MATERIALS, JSON.stringify(raw)); }
function renderMaterials(){
  const a=state.profile?.primary||"Technology";
  $("#programTitle").textContent = `${translateAddiction(a)} — ${t("materials")}`;
  $("#materialsList").innerHTML = (getMaterials()[a]||[]).map(m=>`<li>${m}</li>`).join("");
  $("#contribWrap").hidden = okDaysSinceStart()<365;
}

/* ---------------- Check-in ---------------- */
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
  const list=$("#recentNotes"); list.innerHTML="";
  const rec = [...state.journal].reverse().slice(0,5);
  if(!rec.length){ list.innerHTML=`<li><span>—</span></li>`; return; }
  rec.forEach(j=>{ const li=document.createElement("li"); li.innerHTML=`<span>${new Date(j.ts).toLocaleString()} — ${escapeHTML(j.text)}</span>`; list.appendChild(li); });
}

/* ---------------- Badges page with visuals ---------------- */
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
    const desc=document.createElement("div"); desc.className="badge-desc"; desc.textContent = (L==="es"?b.descES:b.descEN);
    card.append(icon,name,desc); sob.appendChild(card);
  });

  const soc=$("#socialGrid"); soc.innerHTML="";
  SOCIAL_BADGES.forEach(b=>{
    const lock = (b.key==="chat" && !state.social.chatted) || (b.key==="friend" && !state.social.friended);
    const card=document.createElement("div"); card.className="badge-card"+(lock?" locked":"");
    const icon=document.createElement("div"); icon.className="badge-icon social"; icon.innerHTML = (b.key==="chat"?"💬":"🤝");
    const name=document.createElement("div"); name.className="badge-name"; name.textContent = (L==="es"?b.nameES:b.nameEN);
    const desc=document.createElement("div"); desc.className="badge-desc"; desc.textContent = (L==="es"?b.descES:b.descEN);
    card.append(icon,name,desc); soc.appendChild(card);
  });

  $("#currentTitle").textContent = currentTitle();
}

/* ---------------- Research page (≈20 lines) ---------------- */
function researchText(){
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const bulletsEN = [
    "Clarify your goal (abstinence or limits) and write a 1–2 sentence commitment (MI studies show written commitments increase follow-through).",
    "Identify triggers with an ABC log (Antecedent → Behavior → Consequence); this is core to CBT for addictions.",
    "Restructure environment: remove cues and add friction (e.g., app/site blockers, no cash at risky times)—behavioral economics supports ‘default’ effects.",
    "Schedule replacement rewards (exercise, social contact, learning); behavioral activation reduces craving intensity.",
    "Practice urge surfing: notice sensations rising/falling for 2–3 minutes; mindfulness trials show reduced lapse rates.",
    "Use the 5-minute delay rule with paced breathing (longer exhale); autonomic down-shift reduces arousal.",
    "Plan coping scripts: one sentence you’ll say in risky moments; implementation intentions (‘If X, then Y’) improve adherence.",
    "Track daily outcomes on the calendar (Success/Slip) and review weekly; self-monitoring is a robust change mechanism.",
    "Build accountability: one ally you message weekly with your calendar screenshot; social support predicts better outcomes.",
    "Install guardrails: time/location limits, content filters, or financial blocks (contingency management principles).",
    "Protect basics—sleep, nutrition, movement—since deprivation magnifies cravings (homeostatic models).",
    "Use problem-solving steps: define, brainstorm 3 options, pick one, test, review; core CBT skill.",
    "Reframe lapses as data: identify trigger → one lesson → one action now; relapse-prevention models emphasize rapid recommitment.",
    "Celebrate small wins with immediate, healthy rewards; reinforcement increases likelihood of repetition.",
    "Stack habits onto stable cues (after dinner → 10-min walk); habit research supports cue-routine consistency.",
    "Limit decision fatigue: plan tomorrow’s evening routine in the morning to reduce late-day willpower load.",
    "Reduce exposure windows (e.g., ‘no phone in bedroom’); stimulus control improves outcomes.",
    "Prepare an SOS plan: timer, water, movement, message a friend; practice it once when calm.",
    "Review data weekly and adjust one lever (environment, schedule, coping) rather than many at once.",
    "Seek professional help if withdrawal risks exist or progress stalls—therapy and medical support improve safety and success."
  ];
  const bulletsES = [
    "Aclara tu objetivo (abstinencia o límites) y escribe un compromiso de 1–2 frases (la MI muestra mayor adherencia con compromisos escritos).",
    "Identifica disparadores con un registro ABC (Antecedente → Conducta → Consecuencia); núcleo del TCC para adicciones.",
    "Reestructura el entorno: elimina claves y añade fricción (bloqueadores, no efectivo en momentos de riesgo)—la economía conductual respalda los ‘predeterminados’.",
    "Programa recompensas de reemplazo (ejercicio, contacto social, aprendizaje); la activación conductual reduce la intensidad del deseo.",
    "Practica el ‘surf del impulso’: observa sensaciones 2–3 min; ensayos de mindfulness muestran menos recaídas.",
    "Usa la regla de 5 minutos con respiración pausada (exhalación larga); reduce la activación autonómica.",
    "Prepara guiones de afrontamiento: una frase para momentos de riesgo; las ‘intenciones de implementación’ mejoran la adherencia.",
    "Registra resultados diarios en el calendario (Logro/Recaída) y revisa semanalmente; el automonitoreo es un mecanismo robusto de cambio.",
    "Construye responsabilidad: una persona aliada a quien envías tu calendario cada semana; el apoyo social predice mejores resultados.",
    "Instala barandillas: límites de tiempo/lugar, filtros de contenido o bloqueos financieros (principios de manejo de contingencias).",
    "Protege básicos—sueño, nutrición, movimiento—porque la privación amplifica los antojos.",
    "Usa resolución de problemas: define, piensa 3 opciones, elige una, prueba, revisa; habilidad central de TCC.",
    "Reformula recaídas como datos: disparador → lección → acción ahora; la prevención de recaídas enfatiza la recomposición rápida.",
    "Celebra pequeñas victorias con recompensas saludables inmediatas; el refuerzo aumenta la repetición.",
    "Apila hábitos sobre señales estables (después de cenar → caminata de 10 min); la investigación en hábitos respalda consistencia.",
    "Reduce la fatiga decisional: planifica la rutina nocturna por la mañana.",
    "Reduce ventanas de exposición (p. ej., ‘sin teléfono en el dormitorio’); el control de estímulos mejora resultados.",
    "Prepara un plan SOS: temporizador, agua, movimiento, mensaje a un amigo; practícalo una vez cuando estés tranquilo/a.",
    "Revisa datos semanalmente y ajusta una palanca (entorno, horario, afrontamiento) en lugar de muchas.",
    "Busca ayuda profesional si hay riesgos de abstinencia o si el progreso se estanca—la terapia y el apoyo médico mejoran la seguridad y el éxito."
  ];
  const list = (L==="es"?bulletsES:bulletsEN).map(x=>`<li>${x}</li>`).join("");
  return `<h3 class="fancy">${t("researchTitle")}</h3><ol class="program">${list}</ol><p class="muted">${t("footer")}</p>`;
}
function renderResearch(){ $("#researchBody").innerHTML = researchText(); }

/* ---------------- Chat & Friends (demo with offline examples) ---------------- */
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
    {uid:"alex222", who:"Alex (1 mo)", text:"Marking Success each night keeps me honest."},
    {uid:"sam333",  who:"Sam (3 wks)",  text:"Breathing timer helps me ride the wave."}
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
    box.onclick=(e)=>{ const n=e.target.closest(".chat-name"); if(!n) return; state.social.friended=true; save(); renderBadges(); alert("Friend request simulated (enable Firebase for real)."); };
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
    $("#globalChat").onclick=async (e)=>{ const n=e.target.closest(".chat-name"); if(!n) return;
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

/* ---------------- Navigation & Wiring ---------------- */
const views = ["onboarding","home","calendar","checkin","sos","guide","program","badges","research","community","friends"];
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
  window.scrollTo({top:0,behavior:"smooth"});
}
function wire(){
  // nav
  $$(".tabbar [data-nav], [data-nav]").forEach(b=> b.addEventListener("click",()=>show(b.getAttribute("data-nav"))));

  // onboarding (multi-select within allowed)
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
    save(); applyI18N();
    // re-render dynamic copy
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

  // quick mark buttons (home + check-in)
  $("#markTodayOk")?.addEventListener("click", ()=>markToday("ok"));
  $("#markTodaySlip")?.addEventListener("click", ()=>markToday("slip"));
  $("#markTodayOk2")?.addEventListener("click", ()=>markToday("ok"));
  $("#markTodaySlip2")?.addEventListener("click", ()=>markToday("slip"));

  // materials contrib
  $("#contribForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const tip=(new FormData(e.target).get("tip")||"").trim(); if(!tip) return;
    addMaterial(state.profile?.primary||"Technology", tip);
    e.target.reset(); alert((state.i18n==="es")?"¡Gracias!":"Thanks!");
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
  $("#saveSos").onclick=()=>{ const v=($("#sosNote").value||"").trim(); if(!v) return; state.journal.push({id:crypto.randomUUID(), text:`[SOS] ${v}`, ts:Date.now()}); $("#sosNote").value=""; save(); alert((state.i18n==="es")?"Guardado.":"Saved."); };
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
