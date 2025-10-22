/* Changes made ONLY per your latest list:
 - Bottom tabbar highlights active page (like drawer)
 - Hamburger button larger (CSS class used)
 - 10 Steps on Home -> checklist; success only allowed when checklist complete
 - Calendar “Success/Slip” localized in ES
 - Guide: removed “10 Steps” tab, merged “Tips + Materials”, pill-box layout; deep guide now pill boxes
 - Notes page now pill boxes showing [Check-in]/[SOS] + centered date/time
 - Chat titles colored to differentiate sobriety titles
*/
console.log("app.js loaded");

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ---------------- Storage & State ---------------- */
const STORAGE = {
  PROFILE:"rehabit_profile", CAL:"rehabit_calendar", JOURNAL:"rehabit_journal",
  MATERIALS:"rehabit_materials", BADGES:"rehabit_badges", SOCIAL:"rehabit_social",
  CHECKLIST:"rehabit_checklist"
};
const state = {
  profile:null,
  cal:{},
  journal:[],
  social:{chatted:false,friended:false},
  i18n:"en",
  researchChoice:null,
  checklist:{} // { "YYYY-MM-DD": { Addiction: [true,false,...] } }
};
function load(){
  state.profile = JSON.parse(localStorage.getItem(STORAGE.PROFILE)||"null");
  state.cal     = JSON.parse(localStorage.getItem(STORAGE.CAL)||"{}");
  state.journal = JSON.parse(localStorage.getItem(STORAGE.JOURNAL)||"[]");
  state.social  = JSON.parse(localStorage.getItem(STORAGE.SOCIAL)||'{"chatted":false,"friended":false}');
  state.checklist = JSON.parse(localStorage.getItem(STORAGE.CHECKLIST)||"{}");
  state.i18n    = state.profile?.lang || "en";
  document.documentElement.setAttribute("data-lang", state.i18n);
}
function save(){
  localStorage.setItem(STORAGE.PROFILE, JSON.stringify(state.profile));
  localStorage.setItem(STORAGE.CAL, JSON.stringify(state.cal));
  localStorage.setItem(STORAGE.JOURNAL, JSON.stringify(state.journal));
  localStorage.setItem(STORAGE.SOCIAL, JSON.stringify(state.social));
  localStorage.setItem(STORAGE.CHECKLIST, JSON.stringify(state.checklist));
}

/* ---------------- i18n ---------------- */
const D = {
  en:{
    home:"Home",
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
    chatNote:"Community chat: unmoderated peer support. Click a name (including bots) to send a friend request.",
    notes:"Notes", notesInfo:"Your Daily and SOS notes appear here (newest first).",
    notFound:"Friend not found.",
    streak:"Current streak",
    save:"Save",
    sobriety:"Sobriety badges",
    successWord:"Success",
    slipWord:"Slip",
    needChecklist:"Finish today’s 10-step checklist first."
  },
  es:{
    home:"Inicio",
    install:"Instalar",
    welcome:"Bienvenido/a 👋", selectFocus:"Elige tu(s) enfoque(s) y una fecha objetivo para comenzar a registrar tu progreso.",
    quitDate:"Fecha objetivo", motivation:"Tu principal motivación (opcional)", start:"Comenzar con ReHabit",
    danger:"Si estás en peligro, busca ayuda", homeTitle:"Bienvenido a ReHabit", homeLead:"Tu compañero privado para crear hábitos más saludables—día a día.",
    monthCard:"Calendario (este mes)", shortcuts:"Atajos de hoy", quickOpen:"Accesos rápidos", recent:"Notas recientes",
    checkin:"Revisión diaria", calendar:"Calendario", guide:"Guía", badges:"Insignias", research:"Investigación", chat:"Comunidad", friends:"Amigos", back:"Volver",
    value:"Valor:", mood:"Estado de ánimo (0–10)", urge:"Intensidad de impulso (0–10)", sleep:"Horas de sueño", cravingWindow:"Momento de mayor impulso", morning:"Mañana", afternoon:"Tarde", evening:"Atardecer", night:"Noche",
    actionTook:"Acción útil que hiciste", note:"Nota (opcional)", exposure:"Nivel de exposición hoy", low:"Bajo", medium:"Medio", high:"Alto",
    todayShortcuts:"Atajos de hoy", markSuccess:"Registrar logro de hoy", markSlip:"Registrar recaída de hoy",
    sos:"SOS por antojo", s1:"Retrasa 5 minutos. Inicia el temporizador y respira lento.", s2:"Surf del impulso. Observa cómo sube y baja.", s3:"Haz una acción alternativa. Caminar, ducharte, escribir a un amigo, beber agua.",
    timer:"Temporizador de respiración (1:00)", startBtn:"Iniciar", reset:"Reiniciar", quickNotes:"Notas rápidas", helpful:"Acciones útiles",
    calendarHelp:"Haz clic en un día para alternar: vacío → Logro → Recaída.",
    tips:"Consejos", steps:"10 Pasos", deep:"Guía profunda", materials:"Materiales útiles",
    contribTitle:"Aporta consejos (requiere 1 año)", yourTip:"Tu consejo o recurso", submit:"Enviar tip", contribNote:"Las contribuciones pueden mostrarse para tu adicción.",
    currentTitle:"Tu título actual en el chat", send:"Enviar", yourCode:"Tu código:", requests:"Solicitudes", friendsList:"Amigos",
    footer:"Solo para apoyo—no reemplaza tratamiento profesional.",
    a_tech:"Tecnología", a_smoke:"Fumar", a_alcohol:"Alcohol", a_gambling:"Ludopatía", a_other:"Otras drogas",
    w0:"Dom", w1:"Lun", w2:"Mar", w3:"Mié", w4:"Jue", w5:"Vie", w6:"Sáb",
    researchTitle:"Hoja de ruta basada en evidencia",
    settings:"Ajustes", displayName:"Nombre visible", chooseAddictions:"Elige adicciones",
    chooseAddiction:"Elige adicción", emergency:"Emergencia",
    chatNote:"Chat comunitario: apoyo entre pares no moderado. Pulsa un nombre (incluidos bots) para enviar solicitud de amistad.",
    notes:"Notas", notesInfo:"Aquí aparecen tus notas Diarias y de SOS (las más recientes primero).",
    notFound:"Amigo no encontrado.",
    streak:"Racha actual",
    save:"Guardar",
    sobriety:"Insignias de sobriedad",
    successWord:"Logro",
    slipWord:"Recaída",
    needChecklist:"Primero completa el checklist de 10 pasos de hoy."
  }
};
function t(k){ const L=document.documentElement.getAttribute("data-lang")||"en"; return (D[L] && D[L][k]) || D.en[k] || k; }
function applyI18N(){ $$("[data-i18n]").forEach(el => el.textContent = t(el.getAttribute("data-i18n"))); }

/* ---------------- Friend codes (offline demo) ---------------- */
const CODE_KEY = "rehabit_mycode";
function getMyCode(){
  let c = localStorage.getItem(CODE_KEY);
  if (!c) { c = "RH-" + crypto.randomUUID().slice(0,6).toUpperCase(); localStorage.setItem(CODE_KEY, c); }
  return c;
}
const BOT_CODES = {
  "RH-COACH": { uid:"bot_coach", name:"CoachBot" },
  "RH-CALM":  { uid:"bot_calm",  name:"CalmBot"  },
  "RH-PEER":  { uid:"bot_peer",  name:"PeerBot"  }
};

/* ---------------- Content (same as before, trimmed) ---------------- */
const ADDICTIONS = ["Technology","Smoking","Alcohol","Gambling","Other"];
const TIPS = {/* ... unchanged arrays (omitted here for brevity in this comment), present below in full code */};
const STEPS = {/* ... unchanged arrays (full below) */};
const MATERIALS = {/* ... unchanged arrays (full below) */};
const RESEARCH  = {/* ... unchanged arrays (full below) */};

/* (FULL CONTENT from previous step preserved) */
const TIPS = {
  Technology:{ en:[ "Define screen-time caps and ‘no-phone zones’.","Disable nonessential notifications.","Uninstall 2 high-temptation apps.","Use blockers during work / after 21:00.","Replace scrolling with a 10-min walk.","One-tab rule to cut switching.","Phone docks outside bedroom.","Pocket notebook for ideas.","Plan offline hobbies.","Track Success/Slip; review weekly." ],
              es:[ "Límites de pantalla y zonas sin teléfono.","Desactiva notificaciones no esenciales.","Desinstala 2 apps tentadoras.","Bloqueos en trabajo y tras 21:00.","Cambia scroll por caminar 10 min.","Regla de una pestaña.","Teléfono fuera del dormitorio.","Libreta para ideas.","Hobbies offline.","Registra Logro/Recaída; revisión semanal." ]},
  Smoking:{ en:[ "Set a quit date within 7–14 days.","NRT ready (patch + gum/lozenge).","Map triggers & substitutes.","Clean environment; remove cues.","Delay 5 min + long exhale.","Mouth/hands plan (gum, straws).","Adjust caffeine down.","Refusal script handy.","Brisk walk daily.","Reward milestones." ],
            es:[ "Fecha para dejar en 7–14 días.","TSN lista (parche + chicle/pastilla).","Mapa de disparadores y sustitutos.","Limpia entorno; retira señales.","Demora 5 min + exhalación larga.","Plan boca/manos (chicle, pajitas).","Ajusta cafeína a la baja.","Guion de rechazo listo.","Caminata diaria.","Recompensa hitos." ]},
  Alcohol:{ en:[ "Choose abstinence or caps.","Remove alcohol at home.","First-drink NA ritual.","HALT check before choices.","Evening routine set.","Delay + urge surf 2–3 min.","Avoid high-risk places early.","Accountability check-in.","If moderating, pre-commit units.","Celebrate AF weeks." ],
            es:[ "Abstinencia o límites.","Retira alcohol de casa.","Ritual sin alcohol para el primer trago.","HALT antes de decidir.","Rutina nocturna.","Demora + surf del impulso.","Evita lugares de riesgo al inicio.","Chequeo de responsabilidad.","Si moderas, precompromete unidades.","Celebra semanas AF." ]},
  Gambling:{ en:[ "Enable bank blocks & self-exclusion.","Install device/site blockers.","Budget firewall.","Share statements weekly.","Plan around risky windows.","Delay 10 min + surf.","Remove betting apps.","Limit cash; freeze cards.","Replace excitement safely.","Track triggers weekly." ],
            es:[ "Bloqueos bancarios y autoexclusión.","Bloqueadores en dispositivos/sitios.","Cortafuegos de presupuesto.","Comparte extractos semanales.","Plan ante ventanas de riesgo.","Demora 10 min + surf.","Elimina apps de apuestas.","Limita efectivo; congela tarjetas.","Sustituye la excitación.","Registra disparadores." ]},
  Other:{ en:[ "Consult a clinician first.","Abstinence or guided taper.","Remove paraphernalia/cues.","Daily structure (meals/move/sleep).","Coping kit ready.","Delay + urge surf.","Identify triggers & plans.","Accountability weekly.","Calendar self-monitoring.","Seek professional/peer support." ],
          es:[ "Consulta con profesional primero.","Abstinencia o reducción guiada.","Retira parafernalia/señales.","Estructura diaria.","Kit de afrontamiento listo.","Demora + surf del impulso.","Identifica disparadores y planes.","Responsabilidad semanal.","Calendario de monitoreo.","Apoyo profesional/pares." ]}
};
const STEPS = {
  Technology:{ en:[ "Define a clear goal.","Audit apps; uninstall two.","Set focus/bedtime modes.","Replacement list (3 quick).","One-tab + 25/5.","Phone outside bedroom.","Log urges (time/cue).","Weekly review.","Reset after lapses.","Celebrate streaks." ],
              es:[ "Objetivo claro.","Audita apps; quita dos.","Modos de enfoque/sueño.","Lista de reemplazos.","Una pestaña + 25/5.","Teléfono fuera del cuarto.","Registra impulsos.","Revisión semanal.","Reinicio tras recaída.","Celebra rachas." ]},
  Smoking:{ en:[ "Pick a quit date.","NRT ready.","Triggers→substitutes.","Clean spaces.","Delay + exhale.","Daily brisk walk.","Practice refusal.","Hydration & snacks.","Avoid alcohol early.","Weekly reward." ],
            es:[ "Elige fecha.","TSN lista.","Disparadores→sustitutos.","Limpia espacios.","Demora + exhala.","Caminata diaria.","Practica rechazo.","Hidratación & snacks.","Evita alcohol al inicio.","Recompensa semanal." ]},
  Alcohol:{ en:[ "Decide abstinence/caps.","Clear home of alcohol.","Refusal scripts.","HALT before choices.","Evening routine.","Delay + surfing.","Avoid risky places.","Accountability.","Track units/pace.","Reward AF weeks." ],
            es:[ "Abstinencia/límites.","Retira alcohol de casa.","Guiones de rechazo.","HALT antes de decidir.","Rutina nocturna.","Demora + surf.","Evita lugares de riesgo.","Responsabilidad.","Registra unidades/ritmo.","Recompensa semanas AF." ]},
  Gambling:{ en:[ "Bank blocks, exclusion.","Device/site blockers.","Budget firewall.","Share statements.","Plan risky windows.","Delay + surf.","Remove apps.","Limit cash.","Low-stim nights.","Weekly review." ],
             es:[ "Bloqueos y exclusión.","Bloqueadores.","Cortafuegos de presupuesto.","Comparte extractos.","Plan vent. de riesgo.","Demora + surf.","Elimina apps.","Limita efectivo.","Noches de baja estim.","Revisión semanal." ]},
  Other:{ en:[ "Assess safety.","Plan abstain/taper.","Remove cues.","Daily structure.","Coping kit.","Delay + surf.","Triggers→plans.","Accountability.","Track calendar.","Adjust weekly." ],
          es:[ "Evalúa seguridad.","Plan abstener/reducir.","Retira señales.","Estructura diaria.","Kit de afrontamiento.","Demora + surf.","Disparadores→planes.","Responsabilidad.","Calendario.","Ajuste semanal." ]}
};
const MATERIALS = {
  Technology:{ en:["Book: Digital Minimalism","App: Focus / site blockers","Article: Urge surfing basics"],
               es:["Libro: Minimalismo Digital","App: Bloqueadores","Artículo: Surf del impulso"] },
  Smoking:{ en:["Guide: Nicotine patches","App: Smoke-free counter","Article: Delay, breathe, water"],
            es:["Guía: Parches de nicotina","App: Contador libre de humo","Artículo: Demora, respira, agua"] },
  Alcohol:{ en:["Community: AF groups","NA drinks list","Article: HALT check"],
            es:["Comunidad: Grupos AF","Lista de bebidas sin alcohol","Artículo: HALT"] },
  Gambling:{ en:["Self-exclusion portals","Bank blocks","Article: Replacement dopamine"],
             es:["Portales de autoexclusión","Bloqueos bancarios","Artículo: Dopamina de reemplazo"] },
  Other:{ en:["SAMHSA treatment locator","Grounding techniques","Article: Coping skills"],
          es:["Buscador de tratamiento SAMHSA","Técnicas de enraizamiento","Artículo: Habilidades de afrontamiento"] }
};
const RESEARCH  = {
  Technology:{ en:[ "≤2h/day screen rule; no phone in bedroom.","Turn off nonessential notifications.","Move charger outside bedroom; analog alarm.","Uninstall 2 worst apps.","Blockers during work and after 21:00.","Three replacements for scrolling.","One-tab rule; 25/5 timer.","Urge surfing 2–3 min.","Delay 5 minutes before decisions.","Night screen-sabbath blocks.","Phone out of reach while working.","Break/wind-down reminders.","Track Success/Slip; weekly review.","Share goal with ally.","Swap dopamine: movement, sunlight, journaling.","Protect sleep (no screens in bed).","Add friction in high-risk contexts.","Slip → trigger/lesson/action.","Celebrate specific wins.","Consider CBT/DBT coaching." ],
                es:[ "≤2 h/día; sin teléfono en el dormitorio.","Apaga notificaciones no esenciales.","Cargador fuera del dormitorio.","Desinstala 2 apps problema.","Bloqueadores en trabajo y tras 21 h.","Tres reemplazos al scroll.","Regla de una pestaña; 25/5.","Surf del impulso 2–3 min.","Demora 5 minutos.","Bloques nocturnos sin pantallas.","Teléfono fuera de alcance.","Recordatorios de pausa y cierre.","Registra Logro/Recaída; revisión semanal.","Comparte objetivo con aliado.","Sustituye dopamina: movimiento, luz, escritura.","Protege el sueño.","Añade fricción en riesgo.","Recaída → disparador/lección/acción.","Celebra logros.","Considera TCC/DBT." ]},
  Smoking:{   en:[ "Set quit date in 7–14 days.","Use NRT correctly (patch + short-acting).","Trigger map (coffee, car) → substitutes.","Clean fabrics; remove lighters/ashtrays.","Delay 5 min + long exhale.","Mouth/hands plan (gum, straw).","Reduce caffeine early.","Refusal script: “No thanks, I’m quitting.”","Daily brisk walk 10–15 min.","Hydration + fruit/veg snacks.","Avoid alcohol early.","Accountability check-ins.","Stress skills (4-6 breathing).","Track cravings (time, cue, intensity).","Celebrate milestones.","If lapse: reset plan immediately.","Sleep window consistent.","Seek counseling if needed.","Use counters to reinforce.","Review progress weekly." ],
                es:[ "Fecha para dejar en 7–14 días.","TSN bien usada (parche + rescate).","Mapa de disparadores → sustitutos.","Lava tejidos; retira encendedores.","Demora 5 min + exhalación larga.","Plan boca/manos.","Baja la cafeína al inicio.","Guion: “No gracias, lo estoy dejando”.","Caminata diaria 10–15 min.","Hidratación + fruta/verdura.","Evita alcohol al inicio.","Chequeos de responsabilidad.","Estrategias de estrés (4-6).","Registra antojos (hora, señal, intensidad).","Celebra hitos.","Si recaes: reinicia el plan.","Ventana de sueño constante.","Apoyo profesional si es necesario.","Usa contadores.","Revisión semanal." ]},
  Alcohol:{   en:[ "Decide abstinence or caps.","Remove alcohol at home.","NA first-drink ritual.","HALT before choices.","Evening routine plan.","Delay + urge surfing.","Avoid high-risk places early.","Accountability with ally.","Track units & pace if moderating.","Reward AF weeks.","Identify triggers & alternatives.","Plan weekend structure.","Keep hydration high.","Eat before events.","Leave early if cues stack.","Practice refusal lines.","Schedule morning commitments.","Monitor sleep improvements.","Reflect on benefits weekly.","Seek therapy/support groups." ],
                es:[ "Elige abstinencia o límites.","Retira alcohol de casa.","Ritual del primer trago sin alcohol.","HALT antes de decidir.","Rutina nocturna.","Demora + surf del impulso.","Evita lugares de alto riesgo al inicio.","Responsabilidad con un aliado.","Si moderas, registra unidades/ritmo.","Recompensa semanas AF.","Identifica disparadores y alternativas.","Estructura de fin de semana.","Hidratación alta.","Come antes de eventos.","Vete antes si hay muchas claves.","Practica frases de rechazo.","Agenda compromisos matinales.","Monitorea el sueño.","Reflexiona beneficios semanalmente.","Apoyo terapéutico/grupos." ]},
  Gambling:{  en:[ "Enable bank gambling blocks.","Self-exclude on platforms.","Install site/app blockers.","Budget firewall for essentials.","Share statements weekly.","Plan around risky windows.","Delay 10 min + urge surf.","Remove betting apps/links.","Limit cash; freeze cards on risky days.","Replace excitement (exercise, volunteering).","Set deposit frictions.","Avoid sports triggers early.","Accountability buddy.","Track triggers & wins.","Schedule low-stimulation nights.","Financial check-ins.","If lapse: block & reset.","Mindfulness for urges.","Therapy/GA if needed.","Weekly review & reward." ],
                es:[ "Activa bloqueos bancarios.","Autoexclusión en plataformas.","Bloqueadores de sitios/apps.","Cortafuegos de presupuesto.","Comparte extractos semanales.","Plan ante ventanas de riesgo.","Demora 10 min + surf.","Elimina apps/enlaces de apuestas.","Limita efectivo; congela tarjetas.","Sustituye la emoción (ejercicio, voluntariado).","Aumenta fricción de depósitos.","Evita disparadores deportivos al inicio.","Aliado de responsabilidad.","Registra disparadores y logros.","Noches de baja estimulación.","Revisiones financieras.","Si recaes: bloquea y reinicia.","Mindfulness para antojos.","Terapia/GA si es necesario.","Revisión y recompensa semanal." ]},
  Other:{     en:[ "Consult clinician about safety.","Choose abstinence or supervised taper.","Remove paraphernalia/cues.","Daily structure (meals/move/sleep).","Coping kit (water, grounding).","Delay 5 + urge surfing.","Identify triggers & If-Then plans.","Accountability weekly.","Use calendar for outcomes.","Peer/professional support.","Emergency plan numbers.","Mind-body practices.","Nutrition focus.","Sleep hygiene.","Avoid high-risk people/places.","Celebrate small wins.","If lapse: trigger→lesson→action.","Track mood & cravings.","Adjust plan weekly.","Build sober routines." ],
                es:[ "Consulta a un profesional por seguridad.","Abstinencia o reducción supervisada.","Retira parafernalia/señales.","Estructura diaria (comida/mov/sueño).","Kit de afrontamiento (agua, enraizamiento).","Demora 5 + surf del impulso.","Planes Si-Entonces.","Responsabilidad semanal.","Usa el calendario para resultados.","Apoyo profesional/pares.","Plan de emergencia.","Prácticas mente-cuerpo.","Enfoque en nutrición.","Higiene del sueño.","Evita personas/lugares de riesgo.","Celebra logros pequeños.","Si recaes: disparador→lección→acción.","Registra ánimo y antojos.","Ajuste semanal.","Rutinas sobrias." ]}
};

/* ---------------- Badges & Titles ---------------- */
const SOBRIETY = [
  {days:7,   labelEN:"1 week",    labelES:"1 semana", title:"1-Week Strong",   descEN:"Mark 7 Success days. Title: 1-Week Strong",      descES:"Marca 7 días de Logro. Título: 1-Week Strong"},
  {days:30,  labelEN:"1 month",   labelES:"1 mes",    title:"1-Month Steady",  descEN:"Mark 30 Success days. Title: 1-Month Steady",    descES:"Marca 30 días de Logro. Título: 1-Month Steady"},
  {days:60,  labelEN:"2 months",  labelES:"2 meses",  title:"2-Month Builder", descEN:"Mark 60 Success days. Title: 2-Month Builder",   descES:"Marca 60 días de Logro. Título: 2-Month Builder"},
  {days:90,  labelEN:"3 months",  labelES:"3 meses",  title:"Quarter Champ",   descEN:"Mark 90 Success days. Title: Quarter Champ",     descES:"Marca 90 días de Logro. Título: Quarter Champ"},
  {days:120, labelEN:"4 months",  labelES:"4 meses",  title:"Momentum Maker",  descEN:"Mark 120 Success days. Title: Momentum Maker",   descES:"Marca 120 días de Logro. Título: Momentum Maker"},
  {days:150, labelEN:"5 months",  labelES:"5 meses",  title:"Five-Month Focus",descEN:"Mark 150 Success days. Title: Five-Month Focus", descES:"Marca 150 días de Logro. Título: Five-Month Focus"},
  {days:180, labelEN:"6 months",  labelES:"6 meses",  title:"Half-Year Hero",  descEN:"Mark 180 Success days. Title: Half-Year Hero",   descES:"Marca 180 días de Logro. Título: Half-Year Hero"},
  {days:365, labelEN:"1 year",    labelES:"1 año",    title:"1-Year Resilient",descEN:"Mark 365 Success days. Title: 1-Year Resilient", descES:"Marca 365 días de Logro. Título: 1-Year Resilient"}
];
const SOCIAL_BADGES = [
  {key:"chat", nameEN:"First Message", nameES:"Primer mensaje", descEN:"Send one chat message.", descES:"Envía un mensaje en el chat."},
  {key:"friend", nameEN:"First Friend", nameES:"Primer amigo", descEN:"Add one friend.", descES:"Añade un amigo."}
];

const pad = n=>String(n).padStart(2,"0");
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function isoNDaysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

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
  for(let i=SOBRIETY.length-1;i>=0;i--){
    if(earned.has(`S:${SOBRIETY[i].days}`)) return SOBRIETY[i].title;
  }
  return "Newcomer";
}

/* ---------------- Streak ---------------- */
function currentStreak(){
  let count = 0, day = 0;
  while(true){
    const iso = isoNDaysAgo(day);
    const mark = state.cal[iso];
    if(day===0){
      if(mark!=="ok") return 0;
      count = 1; day++;
    }else{
      if(mark==="ok"){ count++; day++; } else break;
    }
  }
  return count;
}
function renderStreak(whereId){
  const el = document.getElementById(whereId);
  if(!el) return;
  const s = currentStreak();
  const L = document.documentElement.getAttribute("data-lang")||"en";
  const label = t("streak");
  const unit  = (L==="es" ? (s===1?"día":"días") : (s===1?"day":"days"));
  el.textContent = s>0 ? `🔥 ${label}: ${s} ${unit} 🏆` : `🔥 ${label}: 0 🏆`;
}

/* ---------------- Calendar ---------------- */
let cursor = new Date();
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function firstDay(y,m){ return new Date(y,m,1).getDay(); }
function weekdayName(i){ return t(`w${i}`); }

function localizedMark(mark){
  if(!mark) return "";
  return mark==="ok" ? t("successWord") : t("slipWord");
}

function canMarkSuccessToday(){
  // success allowed only if today's checklist (current addiction shown on Home) completed
  const a = homeCurrentAddiction();
  const iso = todayISO();
  const row = state.checklist[iso]?.[a] || [];
  const L = document.documentElement.getAttribute("data-lang")||"en";
  const total = (STEPS[a] && STEPS[a][L]?.length) || 0;
  return total>0 && row.filter(Boolean).length===total;
}

function renderCalendar(gridId="calendarGrid", labelId="monthLabel"){
  const grid = document.getElementById(gridId), label = document.getElementById(labelId);
  const y=cursor.getFullYear(), m=cursor.getMonth();
  label.textContent = new Date(y,m,1).toLocaleString(undefined,{month:"long",year:"numeric"});
  grid.innerHTML="";
  for(let i=0;i<7;i++){ const hd=document.createElement("div"); hd.className="m"; hd.textContent=weekdayName(i); grid.appendChild(hd); }
  for(let i=0;i<firstDay(y,m);i++){ const blank=document.createElement("div"); grid.appendChild(blank); }
  const days=daysInMonth(y,m);
  const today=todayISO();
  for(let d=1; d<=days; d++){
    const iso=`${y}-${pad(m+1)}-${pad(d)}`;
    const isToday = iso===today;
    const cell=document.createElement("div");
    const mark=state.cal[iso];
    cell.className="day"+(mark==="ok"?" s":mark==="slip"?" f":"")+(isToday?"":" locked");
    cell.innerHTML=`<div class="d">${d}</div><div class="m">${localizedMark(mark)}</div>`;
    if(isToday){
      cell.addEventListener("click",()=>{
        const cur=state.cal[iso]||"";
        let next;
        if(cur===""){ next="ok"; }
        else if(cur==="ok"){ next="slip"; }
        else { next=""; }
        if(next==="ok" && !canMarkSuccessToday()){ alert(t("needChecklist")); return; }
        state.cal[iso]=next; save(); renderCalendar(gridId,labelId); updateSobrietyBadges();
        renderStreak("streakLabel"); renderStreak("streakLabel2");
      });
    }
    grid.appendChild(cell);
  }
  renderStreak("streakLabel");
}

function renderCalendarFull(){
  const gridId="calendarGrid2", labelId="monthLabel2";
  const grid = document.getElementById(gridId), label = document.getElementById(labelId);
  const y=cursor.getFullYear(), m=cursor.getMonth();
  label.textContent = new Date(y,m,1).toLocaleString(undefined,{month:"long",year:"numeric"});
  grid.innerHTML="";
  for(let i=0;i<7;i++){ const hd=document.createElement("div"); hd.className="m"; hd.textContent=weekdayName(i); grid.appendChild(hd); }
  for(let i=0;i<firstDay(y,m);i++){ const blank=document.createElement("div"); grid.appendChild(blank); }
  const days=daysInMonth(y,m);
  const today=todayISO();
  for(let d=1; d<=days; d++){
    const iso=`${y}-${pad(m+1)}-${pad(d)}`;
    const isToday = iso===today;
    const cell=document.createElement("div");
    const mark=state.cal[iso];
    cell.className="day"+(mark==="ok"?" s":mark==="slip"?" f":"")+(isToday?"":" locked");
    cell.innerHTML=`<div class="d">${d}</div><div class="m">${localizedMark(mark)}</div>`;
    if(isToday){
      cell.addEventListener("click",()=>{
        const cur=state.cal[iso]||"";
        let next;
        if(cur===""){ next="ok"; }
        else if(cur==="ok"){ next="slip"; }
        else { next=""; }
        if(next==="ok" && !canMarkSuccessToday()){ alert(t("needChecklist")); return; }
        state.cal[iso]=next; save(); renderCalendarFull(); updateSobrietyBadges();
        renderStreak("streakLabel"); renderStreak("streakLabel2");
      });
    }
    grid.appendChild(cell);
  }
  renderStreak("streakLabel2");
}

/* ---------------- Guide (no 10-step tab, pill boxes) ---------------- */
function translateAddiction(a){
  const key = a==="Technology"?"a_tech":a==="Smoking"?"a_smoke":a==="Alcohol"?"a_alcohol":a==="Gambling"?"a_gambling":"a_other";
  return t(key);
}
let guideChoice = null;
function currentGuideAddiction(){
  const adds = state.profile?.addictions || [];
  if(adds.length<=1) return adds[0] || state.profile?.primary || "Technology";
  return guideChoice || adds[0];
}
function renderGuideChoice(){
  const adds = state.profile?.addictions || [];
  const wrap = $("#guideChoiceWrap");
  if(!wrap) return;
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
function pillGrid(items){
  return `<div class="pill-grid">${items.map(x=>`<div class="pill">${x}</div>`).join("")}</div>`;
}
function renderGuideCore(){
  const a = currentGuideAddiction();
  $("#guideTitle").textContent = `${translateAddiction(a)} — ${t("guide")}`;
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const tipsArr = (TIPS[a][L]||[]);
  const matsArr = (MATERIALS[a][L]||[]);
  $("#tab-tipsmix").innerHTML = `
    <h3 class="fancy">${t("tips")} + ${t("materials")}</h3>
    ${pillGrid(tipsArr)}
    ${pillGrid(matsArr)}
  `;
  // “Deep” as pill boxes: split content into concise blocks
  const deepBlocks = (RESEARCH[a][L]||[]);
  $("#tab-deep").innerHTML = `<h3 class="fancy">${t("deep")}</h3>${pillGrid(deepBlocks)}`;
}
function renderGuide(){ renderGuideChoice(); renderGuideCore(); }
function wireGuideTabs(){
  $$(".guide-tabs .tab").forEach(btn=>{
    btn.onclick=()=>{
      const tab=btn.getAttribute("data-tab");
      ["tipsmix","deep"].forEach(k=>{ $(`#tab-${k}`).hidden = (k!==tab); });
    };
  });
  // default to Tips+Materials
  $("#tabbtn-tipsmix")?.click();
}

/* --- HOME: Ten steps CHECKLIST (gates success) --- */
let homeStepsChoice = null;
function homeCurrentAddiction(){
  const adds = state.profile?.addictions || [];
  if(adds.length<=1) return adds[0] || state.profile?.primary || "Technology";
  return homeStepsChoice || adds[0];
}
function ensureChecklistRow(iso, addiction, total){
  state.checklist[iso] = state.checklist[iso] || {};
  const cur = state.checklist[iso][addiction];
  if(!cur || cur.length!==total){ state.checklist[iso][addiction] = new Array(total).fill(false); }
}
function renderHomeStepsChoice(){
  const adds = state.profile?.addictions || [];
  const wrap = $("#homeStepsChoiceWrap");
  if(!wrap) return;
  if(adds.length<=1){ wrap.hidden=true; return; }
  wrap.hidden=false;
  const sel=$("#homeStepsChoice"); sel.innerHTML="";
  adds.forEach(a=>{
    const opt=document.createElement("option");
    opt.value=a; opt.textContent=translateAddiction(a);
    if(a===homeCurrentAddiction()) opt.selected=true;
    sel.appendChild(opt);
  });
  sel.onchange=()=>{ homeStepsChoice=sel.value; renderHomeChecklist(); };
}
function renderHomeChecklist(){
  const a = homeCurrentAddiction();
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const steps = (STEPS[a][L]||[]);
  const iso = todayISO();
  ensureChecklistRow(iso, a, steps.length);
  const row = state.checklist[iso][a];

  const ul = $("#homeStepsChecklist"); ul.innerHTML = "";
  steps.forEach((text, idx)=>{
    const li=document.createElement("li"); li.className="check-item";
    const id=`chk_${idx}`;
    li.innerHTML = `<label class="checkline"><input type="checkbox" id="${id}" ${row[idx]?"checked":""}> <span>${text}</span></label>`;
    ul.appendChild(li);
    li.querySelector("input").addEventListener("change",(e)=>{
      row[idx]=!!e.target.checked; save(); updateChecklistProgress();
    });
  });
  updateChecklistProgress();
}
function updateChecklistProgress(){
  const a=homeCurrentAddiction(), iso=todayISO();
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const total=(STEPS[a][L]||[]).length;
  const done=(state.checklist[iso]?.[a]||[]).filter(Boolean).length;
  const el=$("#homeStepsProgress");
  const msg = (L==="es")
    ? `Completado: ${done}/${total}${done===total?" — ✅":" — ⏳"}`
    : `Completed: ${done}/${total}${done===total?" — ✅":" — ⏳"}`;
  el.textContent = msg;
}

/* ---------------- Materials (unchanged renderer) ---------------- */
function renderMaterials(){
  const a = currentGuideAddiction();
  $("#programTitle").textContent = `${translateAddiction(a)} — ${t("materials")}`;
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const items = (MATERIALS[a] && MATERIALS[a][L]) ? MATERIALS[a][L] : [];
  $("#materialsList").innerHTML = items.map(m=>`<li>${m}</li>`).join("");
  $("#contribWrap").hidden = okDaysSinceStart()<365;
}

/* ---------------- Check-in & Notes (notes as pill boxes) ---------------- */
const ENCOURAGEMENTS = {
  en:[ "One step at a time. Today counts.","You’re building a stronger brain—keep going.","Small actions, huge momentum.","You’re not alone. Progress over perfection." ],
  es:[ "Paso a paso. Hoy cuenta.","Estás fortaleciendo tu cerebro—sigue.","Pequeñas acciones, gran impulso.","No estás solo/a. Progreso sobre perfección." ]
};
function randomEnc(){ const L=document.documentElement.getAttribute("data-lang")||"en"; const arr=ENCOURAGEMENTS[L]; return arr[Math.floor(Math.random()*arr.length)]; }
function renderCheckin(){
  $("#encouragement").textContent = randomEnc();
  const list=$("#recentNotes"); list.innerHTML="";
  const rec = [...state.journal].filter(j=>j.text.startsWith("[CHK]")||j.text.startsWith("[SOS]")).reverse().slice(0,5);
  if(!rec.length){ list.innerHTML=`<li><span>—</span></li>`; return; }
  rec.forEach(j=>{ const li=document.createElement("li"); li.innerHTML=`<span>${new Date(j.ts).toLocaleString()} — ${escapeHTML(localizeNoteBody(j.text))}</span>`; list.appendChild(li); });
}
function renderNotes(){
  const wrap=$("#notesPills"); wrap.innerHTML="";
  const rec=[...state.journal].filter(j=>j.text.startsWith("[CHK]")||j.text.startsWith("[SOS]")).sort((a,b)=>b.ts-a.ts);
  if(!rec.length){ wrap.innerHTML = `<div class="pill muted">—</div>`; return; }
  rec.forEach(j=>{
    const isCHK = j.text.startsWith("[CHK]");
    const label = (document.documentElement.getAttribute("data-lang")==="es") ? (isCHK?"Revisión diaria":"SOS") : (isCHK?"Check-in":"SOS");
    const body = escapeHTML(localizeNoteBody(j.text));
    const dt = new Date(j.ts).toLocaleString();
    const box=document.createElement("div");
    box.className="pill note-pill";
    box.innerHTML = `<div class="note-head">${label}</div><div class="note-when">${dt}</div><div class="note-body">${body}</div>`;
    wrap.appendChild(box);
  });
}
function localizeNoteBody(txt){
  const L=document.documentElement.getAttribute("data-lang")||"en";
  if(L!=="es") return txt;
  return txt
    .replace(/\[CHK\] success/gi, "[CHK] logro")
    .replace(/\[CHK\] slip/gi, "[CHK] recaída")
    .replace(/Tried:/g, "Probado:")
    .replace(/morning/gi,"mañana").replace(/afternoon/gi,"tarde")
    .replace(/evening/gi,"atardecer").replace(/night/gi,"noche")
    .replace(/low/gi,"bajo").replace(/medium/gi,"medio").replace(/high/gi,"alto");
}

/* ---------------- Research ---------------- */
function renderResearchChoice(){
  const adds = state.profile?.addictions || [];
  const wrap = $("#researchChoiceWrap");
  if(!wrap) return;
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
function researchText(){
  const a = researchCurrentAddiction();
  const L = document.documentElement.getAttribute("data-lang") || "en";
  const lines = (RESEARCH[a] && RESEARCH[a][L] && RESEARCH[a][L].length) ? RESEARCH[a][L] : (RESEARCH.Technology[L] || []);
  return pillGrid(lines);
}
function renderResearch(){ renderResearchChoice(); $("#researchBody").innerHTML = researchText(); }

/* ---------------- Friends (local demo) ---------------- */
const LOCAL_FRIENDS_KEY = "rehabit_local_friends";
const LOCAL_REQUESTS_KEY = "rehabit_local_requests";
function getLocalFriends(){ return JSON.parse(localStorage.getItem(LOCAL_FRIENDS_KEY) || "[]"); }
function setLocalFriends(arr){ localStorage.setItem(LOCAL_FRIENDS_KEY, JSON.stringify(arr)); }
function addLocalFriend(uid, label){
  const f=getLocalFriends(); if(!f.find(x=>x.uid===uid)) f.push({uid,label}); setLocalFriends(f);
}
function getLocalRequests(){ return JSON.parse(localStorage.getItem(LOCAL_REQUESTS_KEY) || "[]" ); }
function addLocalRequest(uid, label){
  const r=getLocalRequests(); if(!r.find(x=>x.uid===uid)) r.push({uid,label});
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(r));
}
function removeLocalRequest(uid){
  const r=getLocalRequests().filter(x=>x.uid!==uid);
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(r));
}
function renderFriendsLocal(){
  $("#myUid").textContent = getMyCode();

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
      alert(t("notFound"));
    };
  }

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

/* ---------------- Community (seed chat) with colored titles ---------------- */
function titleColorClass(title){
  switch(title){
    case "1-Week Strong": return "title-week";
    case "1-Month Steady": return "title-month";
    case "2-Month Builder": return "title-2m";
    case "Quarter Champ": return "title-quarter";
    case "Momentum Maker": return "title-4m";
    case "Five-Month Focus": return "title-5m";
    case "Half-Year Hero": return "title-half";
    case "1-Year Resilient": return "title-year";
    default: return "title-new";
  }
}
function seedChat(box){
  const now=new Date();
  const ex=[
    {uid:"bot_coach", who:"CoachBot", title:"Coach", text:"Tip: Try a 5-minute delay and breathe out longer than you breathe in."},
    {uid:"bot_calm",  who:"CalmBot",  title:"Calm",  text:"Reminder: urges rise and fall. Start a 60-second breathing timer."},
    {uid:"bot_peer",  who:"PeerBot",  title:"Peer",  text:"You’re not alone—log Success/Slip on your calendar, review weekly."},
    {uid:"maya111",   who:"Maya", title:"1-Week Strong", text:"Grayscale at night cuts my scrolling."},
    {uid:"alex222",   who:"Alex",  title:"1-Month Steady", text:"Marking Success each night keeps me honest."}
  ];
  ex.forEach((m,i)=>{
    const div=document.createElement("div");
    div.className="chat-msg";
    const badge = `<span class="title-badge ${titleColorClass(m.title)}">[${escapeHTML(m.title)}]</span>`;
    div.innerHTML=`<strong class="chat-name" data-uid="${m.uid}">${badge} ${escapeHTML(m.who)}</strong>: ${escapeHTML(m.text)} <small>${new Date(now-((5-i)*60000)).toLocaleTimeString()}</small>`;
    box.appendChild(div);
  });
  box.scrollTop=box.scrollHeight;
}
function nameWithTitle(name, isSelf=false, titleOverride=""){
  const title = titleOverride || (isSelf ? currentTitle() : "");
  return title ? `<span class="title-badge ${titleColorClass(title)}">[${escapeHTML(title)}]</span> ${escapeHTML(name)}` : escapeHTML(name);
}
function wireCommunity(){
  const box = $("#globalChat");
  if (!box) return;
  box.innerHTML = "";
  seedChat(box);

  $("#globalForm").onsubmit=(e)=>{
    e.preventDefault();
    const msg=(new FormData(e.target).get("msg")||"").toString().trim();
    if(!msg) return;
    state.social.chatted=true; save(); renderBadges();

    const rawName = (state.profile?.displayName || "").trim() || "Anonymous";
    const whoYouAre = nameWithTitle(rawName, true);
    const div=document.createElement("div");
    div.className="chat-msg";
    div.innerHTML = `<strong class="chat-name" data-uid="you">${whoYouAre}</strong>: ${escapeHTML(msg)} <small>${new Date().toLocaleTimeString()}</small>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    e.target.reset();
  };

  $("#globalChat").onclick=(e)=>{
    const n=e.target.closest(".chat-name"); if(!n) return;
    const uid=n.getAttribute("data-uid"); if(!uid) return;
    state.social.friended=true; save(); renderBadges();
    addLocalRequest(uid, n.textContent.replace(/\[[^\]]+\]\s*/,"").trim());
    alert((state.i18n==="es")?"Solicitud de amistad enviada.":"Friend request sent.");
    renderFriendsLocal();
  };
}

/* ---------------- Badges page render ---------------- */
function renderBadges(){
  updateSobrietyBadges();
  const earned = new Set(JSON.parse(localStorage.getItem(STORAGE.BADGES)||"[]"));
  const L=document.documentElement.getAttribute("data-lang")||"en";
  const sob = $("#sobrietyGrid"); if(!sob) return; sob.innerHTML="";
  SOBRIETY.forEach(b=>{
    const lock = !earned.has(`S:${b.days}`);
    const card=document.createElement("div"); card.className="badge-card"+(lock?" locked":"");
    const icon=document.createElement("div"); icon.className="badge-icon success"; icon.innerHTML="🏅";
    const name=document.createElement("div"); name.className="badge-name"; name.textContent = (L==="es"?b.labelES:b.labelEN);
    const desc=document.createElement("div"); desc.className="badge-desc"; desc.textContent = (L==="es"?b.descES:b.descEN);
    card.append(icon,name,desc); sob.appendChild(card);
  });
  const soc=$("#socialGrid"); if(!soc) return; soc.innerHTML="";
  SOCIAL_BADGES.forEach(b=>{
    const lock = (b.key==="chat" && !state.social.chatted) || (b.key==="friend" && !state.social.friended);
    const card=document.createElement("div"); card.className="badge-card"+(lock?" locked":"");
    const icon=document.createElement("div"); icon.className="badge-icon social"; icon.innerHTML = (b.key==="chat"?"💬":"🤝");
    const name=document.createElement("div"); name.className="badge-name"; name.textContent = (L==="es"?b.nameES:b.nameEN);
    const desc=document.createElement("div"); desc.className="badge-desc"; desc.textContent = (L==="es"?b.descES:b.descEN);
    card.append(icon,name,desc); soc.appendChild(card);
  });
  $("#currentTitle").innerHTML = `<span class="title-badge ${titleColorClass(currentTitle())}">[${escapeHTML(currentTitle())}]</span>`;
}

/* ---------------- Navigation & Wiring ---------------- */
const views = ["onboarding","home","calendar","checkin","sos","guide","program","badges","research","community","friends","settings","notes"];
function setActiveDrawer(target){
  $$(".drawer-link").forEach(b=>{
    if(b.getAttribute("data-nav")===target) b.classList.add("active");
    else b.classList.remove("active");
  });
}
function setActiveTabbar(target){
  ["home","community","friends"].forEach(id=>{
    const btn=$("#tabbtn-"+id);
    if(!btn) return;
    if(id===target) btn.classList.add("active"); else btn.classList.remove("active");
  });
}
function show(v){
  views.forEach(id => $(`#view-${id}`)?.setAttribute("hidden","true"));
  $(`#view-${v}`)?.removeAttribute("hidden");
  setActiveDrawer(v);
  setActiveTabbar(v);

  if(v==="home"){ renderCalendar("calendarGrid","monthLabel"); renderHomeStepsChoice(); renderHomeChecklist(); }
  if(v==="calendar"){ renderCalendarFull(); }
  if(v==="guide"){ renderGuide(); wireGuideTabs(); }
  if(v==="program"){ renderMaterials(); }
  if(v==="checkin"){ renderCheckin(); }
  if(v==="badges"){ renderBadges(); }
  if(v==="research"){ renderResearch(); }
  if(v==="community"){ wireCommunity(); }
  if(v==="notes"){ renderNotes(); }
  if(v==="friends"){ renderFriendsLocal(); }
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
  };
}

/* Drawer + global nav */
function openDrawer(){ $("#drawer").classList.add("open"); $("#backdrop").hidden=false; $("#drawer").setAttribute("aria-hidden","false"); }
function closeDrawer(){ $("#drawer").classList.remove("open"); $("#backdrop").hidden=true; $("#drawer").setAttribute("aria-hidden","true"); }

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
  chips.forEach(c=>{ const b=document.createElement("button"); b.className="chip"; b.type="button"; b.textContent=c; b.onclick=()=>{ $("#sosNote").value = ($("#sosNote").value+"\n"+(L==="es"?"Probado: ":"Tried: ")+c).trim(); }; wrap.appendChild(b); });
  upd();
}

/* ---------------- Boot ---------------- */
load();
window.addEventListener("DOMContentLoaded", ()=>{
  if(!state.profile) show("onboarding"); else show("home");

  // Global nav
  document.querySelectorAll("[data-nav]").forEach((btn)=>{
    btn.addEventListener("click",(e)=>{
      e.preventDefault();
      const target = btn.getAttribute("data-nav");
      if(target){ closeDrawer(); show(target); }
    });
  });

  // Drawer controls
  $("#menuBtn")?.addEventListener("click", (e)=>{ e.preventDefault(); openDrawer(); });
  $("#closeDrawer")?.addEventListener("click", (e)=>{ e.preventDefault(); closeDrawer(); });
  $("#backdrop")?.addEventListener("click", closeDrawer);

  // Onboarding
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

  // Language
  const ls=$("#langSelect");
  if(ls){
    ls.value = state.i18n;
    ls.onchange = (e)=>{
      const lang=e.target.value;
      document.documentElement.setAttribute("data-lang", lang);
      state.profile = {...(state.profile||{}), lang};
      save(); applyI18N();
      renderCalendar(); renderGuide(); renderCheckin(); renderBadges(); renderResearch(); renderNotes();
      renderHomeStepsChoice(); renderHomeChecklist();
      renderStreak("streakLabel"); renderStreak("streakLabel2");
    };
  }

  // Quick mark on Check-in page (gated by checklist)
  $("#markTodayOk2")?.addEventListener("click", ()=>{
    if(!canMarkSuccessToday()){ alert(t("needChecklist")); return; }
    const iso=todayISO(); state.cal[iso]="ok";
    state.journal.push({id:crypto.randomUUID(), text:`[CHK] success`, ts:Date.now()});
    save(); renderCheckin(); renderCalendar(); renderCalendarFull(); renderNotes();
    renderStreak("streakLabel"); renderStreak("streakLabel2");
  });
  $("#markTodaySlip2")?.addEventListener("click", ()=>{
    const iso=todayISO(); state.cal[iso]="slip";
    state.journal.push({id:crypto.randomUUID(), text:`[CHK] slip`, ts:Date.now()});
    save(); renderCheckin(); renderCalendar(); renderCalendarFull(); renderNotes();
    renderStreak("streakLabel"); renderStreak("streakLabel2");
  });

  // SOS
  wireSOS();

  // Footer year & i18n
  $("#year").textContent = new Date().getFullYear();
  applyI18N();

  // Initial renders
  renderStreak("streakLabel"); renderStreak("streakLabel2");
});

/* ---------------- Utils ---------------- */
function escapeHTML(s){return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
