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

const TIPS = {
  Technology:{
    en:[
      "Define screen-time caps and ‘no-phone zones’ (bedroom/meals).",
      "Disable nonessential notifications; batch the rest twice daily.",
      "Uninstall 2 high-temptation apps; remove social feeds from home screen.",
      "Use app/site blockers during work and after 21:00.",
      "Replace scrolling with a 10-min walk or 10 pages of reading.",
      "One-tab rule: complete before switching; reduce context switching.",
      "Phone docks outside bedroom; use analog alarm.",
      "Carry a pocket notebook for ideas so phone stays away.",
      "Plan offline hobbies: music, drawing, cooking.",
      "Track Success/Slip daily; weekly review with one ally."
    ],
    es:[
      "Define límites de pantalla y ‘zonas sin teléfono’ (dormitorio/comidas).",
      "Desactiva notificaciones no esenciales; agrupa el resto dos veces al día.",
      "Desinstala 2 apps tentadoras; quita feeds de la pantalla principal.",
      "Bloquea apps/sitios en trabajo y después de las 21:00.",
      "Sustituye el desplazamiento por 10 min de caminata o 10 páginas de lectura.",
      "Regla de una pestaña: termina antes de cambiar; menos cambio de contexto.",
      "Cargador fuera del dormitorio; usa despertador analógico.",
      "Lleva una libreta para ideas y así evitar el teléfono.",
      "Planifica hobbies offline: música, dibujo, cocina.",
      "Registra Logro/Recaída diaria; revisión semanal con un aliado."
    ]
  },
  Smoking:{
    en:[
      "Set quit date in 7–14 days; tell one supporter.",
      "Prepare NRT (patch + gum/lozenge) per instructions.",
      "Trigger map (coffee, car, stress) → planned substitutes.",
      "Clean environment: wash fabrics; remove lighters/ashtrays.",
      "5-minute delay with long exhale when urges hit.",
      "Mouth/hands plan: gum, straws, toothpicks, stress ball.",
      "Adjust caffeine; it may feel stronger after quitting.",
      "Refusal script ready: “No thanks, I’m quitting.”",
      "10–15 min brisk walk daily to blunt withdrawal.",
      "Use counters and reward milestones meaningfully."
    ],
    es:[
      "Fecha para dejar en 7–14 días; cuéntaselo a un apoyo.",
      "Prepara TSN (parche + chicle/pastilla) según indicaciones.",
      "Mapa de disparadores (café, coche, estrés) → sustitutos.",
      "Limpia entorno: lava tejidos; retira encendedores/ceniceros.",
      "Demora 5 min con exhalación larga ante el impulso.",
      "Plan boca/manos: chicle, pajitas, palillos, pelota antiestrés.",
      "Ajusta cafeína; puede sentirse más fuerte al dejar.",
      "Guion de rechazo: “No gracias, lo estoy dejando”.",
      "Camina 10–15 min diarios para reducir abstinencia.",
      "Usa contadores y recompensa hitos con sentido."
    ]
  },
  Alcohol:{
    en:[
      "Choose abstinence or caps; write a one-line commitment.",
      "Remove alcohol at home; stock NA options you enjoy.",
      "First-drink alternative ritual (pour NA when others order).",
      "HALT check before decisions (Hungry/Angry/Lonely/Tired).",
      "Set evening routine: meal → walk → shower → wind-down.",
      "Delay 5 min + urge surfing for 2–3 min.",
      "Avoid high-risk places early; leave early if cues stack.",
      "Accountability: weekly check-in with a trusted person.",
      "If moderating, pre-commit units and pace with water.",
      "Celebrate alcohol-free weeks with meaningful rewards."
    ],
    es:[
      "Elige abstinencia o límites; escribe un compromiso breve.",
      "Retira alcohol de casa; guarda bebidas sin alcohol que te gusten.",
      "Ritual de alternativa al ‘primer trago’ (sirve sin alcohol).",
      "Usa HALT antes de decidir (Hambre/Enojo/Soledad/Cansancio).",
      "Rutina nocturna: cena → caminata → ducha → relajación.",
      "Demora 5 min + surf del impulso 2–3 min.",
      "Evita lugares de alto riesgo al inicio; sal antes si hay muchas señales.",
      "Responsabilidad: chequeo semanal con alguien de confianza.",
      "Si moderas, pre-compromete unidades y alterna con agua.",
      "Celebra semanas sin alcohol con recompensas con sentido."
    ]
  },
  Gambling:{
    en:[
      "Enable bank gambling blocks and platform self-exclusion.",
      "Install device/site blockers on all devices.",
      "Create a budget firewall (essentials in separate, inaccessible account).",
      "Weekly statements shared with a trusted ally.",
      "Identify risky windows (payday/sports) and pre-plan alternatives.",
      "Delay 10 minutes + urge surfing when cravings spike.",
      "Remove betting apps/shortcuts; add friction to deposits.",
      "Carry limited cash; freeze cards on risky days.",
      "Replace excitement: exercise, non-money games, volunteering.",
      "Track triggers and review weekly patterns."
    ],
    es:[
      "Activa bloqueos bancarios y auto-exclusión en plataformas.",
      "Instala bloqueadores en todos los dispositivos.",
      "Crea un cortafuegos de presupuesto (cuenta de esenciales separada).",
      "Comparte extractos semanales con alguien de confianza.",
      "Detecta ventanas de riesgo (pago/deportes) y pre-planea alternativas.",
      "Demora 10 min + surf del impulso cuando suba el deseo.",
      "Elimina apps/atajos; añade fricción a los depósitos.",
      "Lleva efectivo limitado; congela tarjetas en días críticos.",
      "Sustituye la excitación: ejercicio, juegos sin dinero, voluntariado.",
      "Registra disparadores y revisa patrones semanales."
    ]
  },
  Other:{
    en:[
      "Consult a clinician about safety/withdrawal risks first.",
      "Choose abstinence or a medically guided taper.",
      "Remove paraphernalia/cues; clean environment.",
      "Daily structure: meals, movement, sleep window consistent.",
      "Coping kit: water, breathing, grounding, ally to text.",
      "Delay 5 minutes + urge surfing; cravings crest and fall.",
      "Identify triggers; create ‘If X then Y’ plans.",
      "Build accountability: weekly check-ins.",
      "Self-monitor with the calendar (Success/Slip).",
      "Seek professional/peer support; adjust plan weekly."
    ],
    es:[
      "Consulta primero a un profesional por seguridad/abstinencia.",
      "Elige abstinencia o reducción médica supervisada.",
      "Retira parafernalia/señales; limpia el entorno.",
      "Estructura diaria: comidas, movimiento, ventana de sueño constante.",
      "Kit de afrontamiento: agua, respiración, enraizamiento, aliado para escribir.",
      "Demora 5 min + surf del impulso; los antojos suben y bajan.",
      "Identifica disparadores; planes ‘Si X entonces Y’.",
      "Construye responsabilidad: chequeos semanales.",
      "Automonitorea con el calendario (Logro/Recaída).",
      "Busca apoyo profesional/pares; ajusta el plan semanalmente."
    ]
  }
};

const STEPS = {
  Technology:{
    en:[
      "Define a goal: limit hours/day and no-phone zones.",
      "Audit your apps; uninstall two highest-risk apps.",
      "Set system focus modes and bedtime schedules.",
      "Create a replacement list (3 quick activities).",
      "One-tab work method with 25/5 timer.",
      "Dock phone outside bedroom; morning routine without phone.",
      "Log urges (time/cue/intensity/action).",
      "Weekly review: screen-time, mood, sleep.",
      "Relapse reset: remove triggers, one lesson, one action.",
      "Celebrate streaks with healthy rewards."
    ],
    es:[
      "Define un objetivo: horas/día y zonas sin teléfono.",
      "Audita tus apps; desinstala las dos de mayor riesgo.",
      "Configura modos de concentración y horario de sueño.",
      "Crea una lista de reemplazos (3 actividades rápidas).",
      "Método una pestaña con temporizador 25/5.",
      "Teléfono fuera del dormitorio; rutina matinal sin pantalla.",
      "Registra impulsos (hora/señal/intensidad/acción).",
      "Revisión semanal: tiempo de pantalla, ánimo, sueño.",
      "Reinicio tras recaída: retira disparadores, una lección, una acción.",
      "Celebra rachas con recompensas saludables."
    ]
  },
  Smoking:{
    en:[
      "Pick a quit date within 7–14 days.",
      "Get NRT ready (patch + gum/lozenge).",
      "Map triggers and pair substitutes.",
      "Clean living spaces and clothes.",
      "Use delay + long exhale for urges.",
      "Daily 10–15 min brisk walk.",
      "Refusal script practice.",
      "Hydration + fruit/veggie snacks.",
      "Avoid alcohol early on.",
      "Weekly review and reward."
    ],
    es:[
      "Elige una fecha para dejar en 7–14 días.",
      "Prepara TSN (parche + chicle/pastilla).",
      "Mapa de disparadores y sustitutos.",
      "Limpia espacios y ropa.",
      "Demora + exhalación larga ante el impulso.",
      "Caminata diaria de 10–15 min.",
      "Practica guion de rechazo.",
      "Hidratación + fruta/verdura.",
      "Evita alcohol al inicio.",
      "Revisión y recompensa semanal."
    ]
  },
  Alcohol:{
    en:[
      "Decide abstinence or caps; write commitment.",
      "Clear alcohol at home; stock NA options.",
      "Plan refusal scripts and first-drink ritual.",
      "HALT check before choices.",
      "Evening routine scheduled.",
      "Delay urges + urge surfing.",
      "Avoid high-risk places early.",
      "Accountability check-ins.",
      "If moderating, track units and pace.",
      "Reward sober weeks."
    ],
    es:[
      "Decide abstinencia o límites; escribe compromiso.",
      "Vacía alcohol en casa; guarda opciones sin alcohol.",
      "Plan de rechazos y ritual de primer trago.",
      "HALT antes de decidir.",
      "Rutina nocturna programada.",
      "Demora + surf del impulso.",
      "Evita lugares de alto riesgo al inicio.",
      "Chequeos de responsabilidad.",
      "Si moderas, registra unidades y ritmo.",
      "Recompensa semanas sobrias."
    ]
  },
  Gambling:{
    en:[
      "Enable bank blocks and self-exclusion.",
      "Install device/site blockers.",
      "Set budget firewall.",
      "Share statements weekly.",
      "Plan for risky windows.",
      "Delay 10 + urge surfing.",
      "Remove apps/shortcuts.",
      "Limit cash; freeze cards.",
      "Schedule low-stimulation nights.",
      "Weekly review and rewards."
    ],
    es:[
      "Activa bloqueos bancarios y auto-exclusión.",
      "Instala bloqueadores en dispositivos/sitios.",
      "Crea cortafuegos de presupuesto.",
      "Comparte extractos semanalmente.",
      "Planifica ventanas de riesgo.",
      "Demora 10 + surf del impulso.",
      "Elimina apps/atajos.",
      "Limita efectivo; congela tarjetas.",
      "Agenda noches de baja estimulación.",
      "Revisión y recompensas semanales."
    ]
  },
  Other:{
    en:[
      "Assess safety with a clinician.",
      "Choose abstinence or taper plan.",
      "Remove cues and paraphernalia.",
      "Daily structure (meals/move/sleep).",
      "Coping kit ready.",
      "Delay + urge surf basics.",
      "Identify triggers and plans.",
      "Set accountability check-ins.",
      "Track calendar outcomes.",
      "Adjust weekly with support."
    ],
    es:[
      "Evalúa seguridad con un profesional.",
      "Elige abstinencia o reducción.",
      "Retira señales y parafernalia.",
      "Estructura diaria (comida/mov/sueño).",
      "Kit de afrontamiento listo.",
      "Demora + surf del impulso.",
      "Identifica disparadores y planes.",
      "Chequeos de responsabilidad.",
      "Registra resultados en calendario.",
      "Ajusta semanalmente con apoyo."
    ]
  }
};

function deepGuideFor(name){
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const isES = L==="es";
  const lower = isES
    ? (name==="Technology"?"tecnología":name==="Smoking"?"fumar":name==="Alcohol"?"alcohol":name==="Gambling"?"juego":"otras drogas")
    : name.toLowerCase();
  const blocks = {
    en: `
    <p><strong>Why it works.</strong> Target the <em>function</em> (${name} often provides relief, stimulation, or connection), not just the behavior.</p>
    <h3>Plan</h3>
    <ul>
      <li>3 reasons to change, visible daily.</li>
      <li>One clear rule (e.g., “no ${lower} after 9pm”).</li>
      <li>Environment: remove cues; add friction to ${lower}; make alternatives easy.</li>
    </ul>
    <h3>Skills</h3>
    <ul>
      <li>Delay 5; long exhale; urge surf 2–3 min.</li>
      <li>Implementation intentions: “If X then Y”.</li>
      <li>Problem-solving loop: define → options → pick → test → review.</li>
    </ul>
    <h3>Recovery basics</h3>
    <ul>
      <li>Sleep, nutrition, movement—lower baseline cravings.</li>
      <li>Accountability: weekly message to one ally.</li>
    </ul>
    <h3>Lapses</h3>
    <ul>
      <li>Not failure; log trigger → lesson → one action now. Continue.</li>
    </ul>
    <p class="muted">Guidance only; not a substitute for professional care.</p>`,
    es: `
    <p><strong>Por qué funciona.</strong> Apunta a la <em>función</em> (la ${lower} suele dar alivio, estimulación o conexión), no solo a la conducta.</p>
    <h3>Plan</h3>
    <ul>
      <li>3 razones para cambiar, visibles a diario.</li>
      <li>Una regla clara (p. ej., “sin ${lower} después de las 21 h”).</li>
      <li>Entorno: elimina claves; añade fricción a la ${lower}; facilita alternativas.</li>
    </ul>
    <h3>Habilidades</h3>
    <ul>
      <li>Demora 5; exhalación larga; surf del impulso 2–3 min.</li>
      <li>Intenciones de implementación: “Si X entonces Y”.</li>
      <li>Resolución de problemas: definir → opciones → elegir → probar → revisar.</li>
    </ul>
    <h3>Fundamentos</h3>
    <ul>
      <li>Sueño, nutrición y movimiento—reducen antojos basales.</li>
      <li>Responsabilidad: mensaje semanal a un aliado.</li>
    </ul>
    <h3>Recaídas</h3>
    <ul>
      <li>No es fracaso; registra disparador → lección → una acción ahora. Continúa.</li>
    </ul>
    <p class="muted">Guía informativa; no reemplaza la atención profesional.</p>`
  };
  return isES ? blocks.es : blocks.en;
}

const MATERIALS_DEFAULT = {
  Technology:["Book: Digital Minimalism","App: Focus / site blockers","Article: Urge surfing basics"],
  Smoking:["Guide: Nicotine patches","App: Smoke-free counter","Article: Delay, breathe, water"],
  Alcohol:["Community: AF groups","NA drinks list","Article: HALT check"],
  Gambling:["Self-exclusion portals","Bank blocks","Article: Replacement dopamine"],
  Other:["SAMHSA treatment locator","Grounding techniques","Article: Coping skills"]
};

/* ---------------- Badges & Titles (unchanged visuals) ---------------- */
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

/* ---------------- Guide (tailored + language) ---------------- */
function translateAddiction(a){
  const key = a==="Technology"?"a_tech":a==="Smoking"?"a_smoke":a==="Alcohol"?"a_alcohol":a==="Gambling"?"a_gambling":"a_other";
  return t(key);
}
let guideChoice = null; // last selection if multiple
function currentGuideAddiction(){
  const adds = state.profile?.addictions || [];
  if(adds.length<=1) return adds[0] || state.profile?.primary || "Technology";
  return guideChoice || adds[0];
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
  sel.onchange=()=>{ guideChoice=sel.value; renderGuideCore(); };
}
function renderGuideCore(){
  const a = currentGuideAddiction();
  $("#guideTitle").textContent = `${translateAddiction(a)} — ${t("guide")}`;
  const L=document.documentElement.getAttribute("data-lang")||"en";
  $("#tab-tips").innerHTML = `<ul>${(TIPS[a][L]||[]).map(x=>`<li>${x}</li>`).join("")}</ul>`;
  $("#tab-steps").innerHTML = (STEPS[a][L]||[]).map(s=>`<li>${s}</li>`).join("");
  $("#tab-deep").innerHTML = deepGuideFor(a);
}
function renderGuide(){
  renderGuideChoice();
  renderGuideCore();
}
function wireGuideTabs(){
  $$(".guide-tabs .tab").forEach(btn=>{
    btn.onclick=()=>{
      const tab=btn.getAttribute("data-tab");
      ["tips","steps","deep"].forEach(k=>{ $(`#tab-${k}`).hidden = (k!==tab); });
    };
  });
}

/* ---------------- Materials ---------------- */
function getMaterials(){ const raw=JSON.parse(localStorage.getItem(STORAGE.MATERIALS)||"{}"); return {...MATERIALS_DEFAULT, ...raw}; }
function addMaterial(add, tip){ const raw=JSON.parse(localStorage.getItem(STORAGE.MATERIALS)||"{}"); raw[add]=raw[add]||[]; raw[add].push(tip); localStorage.setItem(STORAGE.MATERIALS, JSON.stringify(raw)); }
function renderMaterials(){
  const a=currentGuideAddiction();
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

/* ---------------- Research page (per addiction, EN/ES, ~20 lines) ---------------- */
const RESEARCH = {
  Technology: { en:[
    "Define a clear screen-time rule (≤2h/day; no phone in bedroom).",
    "Turn off nonessential notifications; batch the rest.",
    "Move the charger outside the bedroom; analog alarm.",
    "Uninstall 2 worst apps; remove social feeds from home screen.",
    "Focus/blockers during work and after 21:00.",
    "Three replacements for scrolling (walk, call, read).",
    "One-tab rule; reduce switching costs.",
    "Urge surfing 2–3 min; observe rise and fall.",
    "Delay 5 minutes; then choose deliberately.",
    "Plan screen-sabbath blocks nightly.",
    "Out-of-reach phone while working; 25/5 timer.",
    "Calendar reminders for breaks and wind-down.",
    "Track Success/Slip; weekly review.",
    "Share goal + screenshot with an ally.",
    "Swap dopamine: micro-workouts, sunlight, journaling.",
    "Protect sleep; no screens in bed.",
    "Add friction in high-risk contexts.",
    "If you slip: trigger → lesson → one action.",
    "Celebrate specific wins.",
    "Consider CBT/DBT coaching if needed."
  ], es:[
    "Define una regla clara (≤2 h/día; sin teléfono en el dormitorio).",
    "Apaga notificaciones no esenciales; agrupa el resto.",
    "Cargador fuera del dormitorio; despertador analógico.",
    "Desinstala 2 apps problemáticas; quita feeds de inicio.",
    "Enfoque/bloqueadores en trabajo y después de las 21 h.",
    "Tres reemplazos al desplazamiento (caminar, llamar, leer).",
    "Regla de una pestaña; menos cambios de tarea.",
    "Surf del impulso 2–3 min; observa subida y bajada.",
    "Demora 5 minutos; decide con intención.",
    "Bloques nocturnos sin pantallas.",
    "Teléfono fuera de alcance al trabajar; temporizador 25/5.",
    "Recordatorios para pausas y rutina nocturna.",
    "Registra Logro/Recaída; revisión semanal.",
    "Comparte objetivo + captura con un aliado.",
    "Sustituye dopamina: micro-ejercicio, luz, escritura.",
    "Protege el sueño; sin pantallas en la cama.",
    "Añade fricción en contextos de riesgo.",
    "Si recaes: disparador → lección → una acción.",
    "Celebra logros concretos.",
    "Considera TCC/DBT si lo necesitas."
  ]},
  Smoking: { en:[
    "Quit date in 7–14 days; tell one supporter.",
    "Start NRT (patch + gum/lozenge) per instructions.",
    "Map triggers and pair substitutes.",
    "Clean environment; remove lighters/ashtrays.",
    "5-minute delay + long exhale for urges.",
    "Mouth/hand plan (gum, straws, stress ball).",
    "Adjust caffeine during the first weeks.",
    "Practice refusal scripts out loud.",
    "10–15 min brisk walk daily.",
    "Log urges (time/intensity/action).",
    "Hydration and nutritious snacks.",
    "Consistent sleep window.",
    "Avoid alcohol early.",
    "Use counters; reward milestones.",
    "Treat slips as data; recommit fast.",
    "Group/phone counseling boosts success.",
    "Keep NRT handy in risk windows.",
    "Ask clinician about meds if needed.",
    "Calendar Success/Slip; weekly review.",
    "Celebrate smoke-free days."
  ], es:[
    "Fecha para dejar en 7–14 días; cuéntaselo a un apoyo.",
    "Inicia TSN (parche + chicle/pastilla) según indicación.",
    "Mapa de disparadores y sustitutos.",
    "Limpia el entorno; retira encendedores/ceniceros.",
    "Demora 5 min + exhalación larga.",
    "Plan boca/manos (chicle, pajitas, pelota).",
    "Ajusta cafeína las primeras semanas.",
    "Practica guiones de rechazo en voz alta.",
    "Camina 10–15 min diarios.",
    "Registra impulsos (hora/intensidad/acción).",
    "Hidratación y snacks nutritivos.",
    "Ventana de sueño constante.",
    "Evita alcohol al inicio.",
    "Usa contadores; recompensa hitos.",
    "Toma recaídas como datos; recomponte rápido.",
    "Consejería/grupos aumentan éxito.",
    "TSN a mano en ventanas de riesgo.",
    "Consulta fármacos si es necesario.",
    "Calendario Logro/Recaída; revisión semanal.",
    "Celebra días sin fumar."
  ]},
  Alcohol: { en:[
    "Decide abstinence or caps; write a commitment.",
    "Remove alcohol at home; stock NA options.",
    "Plan a first-drink alternative ritual.",
    "HALT check before choices.",
    "Evening routine scheduled.",
    "Delay 5 + urge surfing.",
    "Avoid high-risk contexts early.",
    "Accountability with one ally.",
    "If moderating, pre-commit units and pace.",
    "Protect sleep quality.",
    "Identify trigger chains; reroute.",
    "If lapse: hydrate, eat, sleep, one lesson.",
    "Contingency rewards for sober streaks.",
    "Refusal practice to boost confidence.",
    "Plan transport and leaving time.",
    "Replace dopamine: exercise, music.",
    "Consider therapy/meds if needed.",
    "Mark Success/Slip daily.",
    "Review weekly trends.",
    "Celebrate AF weeks."
  ], es:[
    "Decide abstinencia o límites; escribe un compromiso.",
    "Retira alcohol de casa; guarda opciones sin alcohol.",
    "Plan de alternativa al primer trago.",
    "HALT antes de decidir.",
    "Rutina nocturna programada.",
    "Demora 5 + surf del impulso.",
    "Evita contextos de alto riesgo al inicio.",
    "Responsabilidad con un aliado.",
    "Si moderas, pre-compromete unidades y ritmo.",
    "Protege la calidad del sueño.",
    "Detecta cadenas de disparadores; redirígelas.",
    "Si hay lapsus: hidrátate, come, duerme, una lección.",
    "Recompensas por rachas sobrias.",
    "Practica rechazos para ganar confianza.",
    "Planifica transporte y hora de salida.",
    "Sustituye dopamina: ejercicio, música.",
    "Considera terapia/fármacos si hace falta.",
    "Marca Logro/Recaída diaria.",
    "Revisa tendencias semanales.",
    "Celebra semanas sin alcohol."
  ]},
  Gambling: { en:[
    "Self-exclude and activate bank gambling blocks.",
    "Install device/DNS blockers across devices.",
    "Budget firewall: essentials account separated.",
    "Share statements weekly with a trusted ally.",
    "Identify risky windows; pre-plan alternatives.",
    "Delay 10 + urge surfing when cravings spike.",
    "Remove betting apps/shortcuts; add deposit friction.",
    "Limit cash; freeze cards on risky days.",
    "Replace excitement with safe alternatives.",
    "Avoid tip groups/streams; mute keywords.",
    "Schedule low-stimulation evenings.",
    "Track triggers/spending urges.",
    "If lapse: cap losses, call ally, review.",
    "Meaningful rewards for no-bet weeks.",
    "Self-ban in physical venues if available.",
    "Debt plan if needed; face numbers with support.",
    "Attend support groups/counseling.",
    "Use calendar to mark Success/Slip.",
    "Rehearse exits via visualization.",
    "Protect sleep and stress load."
  ], es:[
    "Auto-exclusión y bloqueos bancarios para juego.",
    "Instala bloqueadores/DNS en dispositivos.",
    "Cortafuegos de presupuesto: cuenta de esenciales aparte.",
    "Comparte extractos semanalmente con un aliado.",
    "Identifica ventanas de riesgo; alternativas planificadas.",
    "Demora 10 + surf del impulso en antojos.",
    "Elimina apps/atajos; añade fricción a los depósitos.",
    "Limita efectivo; congela tarjetas en días críticos.",
    "Sustituye la excitación con alternativas seguras.",
    "Evita grupos/streams de ‘tips’; silencia palabras.",
    "Agenda tardes de baja estimulación.",
    "Registra disparadores/ganas de gasto.",
    "Si hay lapsus: limita pérdidas, llama al aliado, revisa.",
    "Recompensas con sentido por semanas sin apostar.",
    "Auto-prohibición en locales si existe.",
    "Plan de deudas si hace falta; afronta números con apoyo.",
    "Asiste a grupos/terapia.",
    "Usa el calendario para Logro/Recaída.",
    "Ensaya salidas con visualización.",
    "Protege sueño y carga de estrés."
  ]},
  Other: { en:[
    "Assess safety/withdrawal risk with a clinician.",
    "Choose abstinence or a supervised taper.",
    "Remove paraphernalia/cues; clean space.",
    "Establish daily structure (meals/movement/sleep).",
    "Coping kit (water, breathing, grounding, ally).",
    "Delay 5 + urge surfing basics.",
    "Identify triggers; create If-Then plans.",
    "Weekly accountability check-ins.",
    "Mark Success/Slip on calendar.",
    "Use professional/peer support.",
    "Hydration/nutrition prioritized.",
    "Practice stress regulation daily.",
    "Emergency plan: timer, walk, text ally.",
    "Block access routes/sources.",
    "Track mood/sleep interactions.",
    "Consider therapy/medication support.",
    "Plan rewards for sober streaks.",
    "Debrief lapses into lessons.",
    "Adjust plan weekly.",
    "Protect sleep window."
  ], es:[
    "Evalúa seguridad/riesgo de abstinencia con un profesional.",
    "Elige abstinencia o reducción supervisada.",
    "Retira parafernalia/señales; limpia el espacio.",
    "Estructura diaria (comida/movimiento/sueño).",
    "Kit de afrontamiento (agua, respiración, enraizamiento, aliado).",
    "Demora 5 + surf del impulso.",
    "Identifica disparadores; planes Si-Entonces.",
    "Chequeos semanales de responsabilidad.",
    "Marca Logro/Recaída en el calendario.",
    "Apoyo profesional/de pares.",
    "Prioriza hidratación/nutrición.",
    "Practica regulación del estrés a diario.",
    "Plan de emergencia: temporizador, caminar, escribir a un aliado.",
    "Bloquea rutas/fuentes de acceso.",
    "Registra interacciones ánimo/sueño.",
    "Considera terapia/soporte farmacológico.",
    "Recompensas por rachas sobrias.",
    "Convierte lapsus en lecciones.",
    "Ajuste semanal del plan.",
    "Protege la ventana de sueño."
  ]}
};

function researchText(){
  const a = currentGuideAddiction();
  const L = document.documentElement.getAttribute("data-lang") || "en";
  const lines = (RESEARCH[a] && RESEARCH[a][L]) ? RESEARCH[a][L] : RESEARCH.Technology.en;
  const list = lines.map(x=>`<li>${x}</li>`).join("");
  return `<h3 class="fancy">${t("researchTitle")} — ${translateAddiction(a)}</h3><ol class="program">${list}</ol><p class="muted">${t("footer")}</p>`;
}
function renderResearch(){ $("#researchBody").innerHTML = researchText(); }

/* ---------------- NEW: Local friends storage (offline demo) ---------------- */
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

/* ---------------- Chat & Friends (bots + friend on click/code) ---------------- */
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
    {uid:"alex222",   who:"Alex (1 mo)",  text:"Marking Success each night keeps me honest."}
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

  // NEW: add-by-code in Firebase (bots supported)
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
