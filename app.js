// ReHabit – PWA with addiction picker, home view, checklist+notify, charts, and Firebase chat

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  profile: null,
  checkins: [],   // {dateISO, mood, urge, note}
  journal: [],    // {id, text, ts}
  coping: [
    "Drink water",
    "Take a brisk 5-min walk",
    "Call/text a friend",
    "Breathe 4-6 (inhale 4s / exhale 6s)",
    "Cold splash on face",
    "10 pushups / 20 squats",
    "Write 3 reasons to stay on track",
    "Listen to a favorite song",
  ]
};

const STORAGE = {
  PROFILE: "rehabit_profile",
  CHECKINS: "rehabit_checkins",
  JOURNAL: "rehabit_journal",
  CHECKLIST_DONE: "rehabit_checklist_done",
  NOTIFY: "rehabit_notify"
};

// Advice per addiction
const ADVICE = {
  "Technology": [
    "Set app limits (start with 30–60 min blocks).",
    "Keep the phone outside the bedroom.",
    "Replace doom scrolling with a 10-minute walk."
  ],
  "Smoking": [
    "Delay 5 minutes; drink water; breathe slowly.",
    "Avoid triggers (coffee + phone) for first week.",
    "Keep sugar-free gum or carrot sticks handy."
  ],
  "Alcohol": [
    "Plan alcohol-free evenings.",
    "Have a script to say “No thanks, I’m cutting down.”",
    "Keep non-alcoholic drinks ready."
  ],
  "Gambling": [
    "Self-exclude from sites and block payments/cards.",
    "Tell a trusted person; share your goals.",
    "Fill evenings with planned, low-stim tasks."
  ],
  "Other drugs": [
    "Avoid people/places tied to use.",
    "Eat, sleep, hydrate—withdrawal is harder when depleted.",
    "Seek professional help; consider support groups."
  ]
};

// Daily checklist items
const CHECKLIST = [
  "Drink 2 glasses of water in the morning",
  "5-minute breathing / meditation",
  "Move your body for 10 minutes",
  "Review motivation statement",
  "Plan one healthy replacement activity"
];

/* ---------- Storage ---------- */
function load() {
  try {
    state.profile  = JSON.parse(localStorage.getItem(STORAGE.PROFILE)  || "null");
    state.checkins = JSON.parse(localStorage.getItem(STORAGE.CHECKINS) || "[]");
    state.journal  = JSON.parse(localStorage.getItem(STORAGE.JOURNAL)  || "[]");
  } catch (e) { console.error("Load error", e); }
}
function save() {
  localStorage.setItem(STORAGE.PROFILE,  JSON.stringify(state.profile));
  localStorage.setItem(STORAGE.CHECKINS, JSON.stringify(state.checkins));
  localStorage.setItem(STORAGE.JOURNAL,  JSON.stringify(state.journal));
}
const checklistStore = {
  get: () => JSON.parse(localStorage.getItem(STORAGE.CHECKLIST_DONE) || "{}"),
  set: (obj) => localStorage.setItem(STORAGE.CHECKLIST_DONE, JSON.stringify(obj))
};

/* ---------- Utils ---------- */
function formatDate(d) { return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(d); }
function daysSince(dateISO) {
  if (!dateISO) return 0;
  const ms = Date.now() - new Date(dateISO).getTime();
  return Math.max(0, Math.floor(ms / (1000*60*60*24)));
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function drawChart(canvas, values) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  // axes
  ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(30,10); ctx.lineTo(30,h-20); ctx.lineTo(w-10,h-20); ctx.stroke();
  if (!values.length) return;
  const max = Math.max(...values, 1);
  const dx = (w - 50) / (values.length - 1 || 1);
  ctx.strokeStyle = "#0ea5e9"; ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v,i) => {
    const x = 30 + i*dx;
    const y = (h-20) - (v/max)*(h-40);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

/* ---------- Navigation ---------- */
const views = ["onboarding","dashboard","home","checkin","sos","journal","settings","checklist","progress","advice","community","friends"];
function show(view) {
  views.forEach(v => $(`#view-${v}`)?.setAttribute("hidden", "true"));
  $(`#view-${view}`)?.removeAttribute("hidden");
  if (view === "dashboard") renderDashboard();
  if (view === "journal")   renderJournal();
  if (view === "settings")  renderSettings();
  if (view === "sos")       renderSOS();
  if (view === "home")      renderHome();
  if (view === "checklist") renderChecklist();
  if (view === "progress")  renderProgress();
  if (view === "advice")    renderAdvice();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Renders ---------- */
function renderDashboard() {
  $("#todayDate").textContent = formatDate(new Date());
  $("#focusLabel").textContent = state.profile?.focus || "—";
  $("#streakDays").textContent = daysSince(state.profile?.quitDate);

  const recent = [...state.checkins].reverse().slice(0, 5);
  const list = $("#recentNotes");
  list.innerHTML = "";
  if (!recent.length) { list.innerHTML = `<li><span>No notes yet.</span></li>`; return; }
  recent.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${new Date(c.dateISO).toLocaleDateString()} — Mood ${c.mood} / Urge ${c.urge}${c.note ? " — " + escapeHTML(c.note) : ""}</span>
      <button class="btn subtle" data-del="${c.dateISO}">Delete</button>
    `;
    li.querySelector("button").onclick = () => {
      state.checkins = state.checkins.filter(x => x.dateISO !== c.dateISO);
      save(); renderDashboard();
    };
    list.appendChild(li);
  });
}

function renderJournal() {
  const list = $("#journalList");
  list.innerHTML = "";
  if (!state.journal.length) { list.innerHTML = `<li><span>No entries yet.</span></li>`; return; }
  [...state.journal].reverse().forEach(j => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${new Date(j.ts).toLocaleString()} — ${escapeHTML(j.text)}</span>
      <button class="btn subtle" data-del="${j.id}">Delete</button>
    `;
    li.querySelector("button").onclick = () => {
      state.journal = state.journal.filter(x => x.id !== j.id);
      save(); renderJournal();
    };
    list.appendChild(li);
  });
}

function renderSettings() {
  const f = $("#profileForm");
  if (!f) return;
  f.focus.value = state.profile?.focus || "";
  f.quitDate.value = state.profile?.quitDate || "";
  f.motivation.value = state.profile?.motivation || "";
}

function renderSOS() {
  const chipWrap = $("#copingChips");
  chipWrap.innerHTML = "";
  state.coping.forEach(text => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = text;
    b.onclick = () => {
      $("#sosNote").value = ($("#sosNote").value + "\nTried: " + text).trim();
    };
    chipWrap.appendChild(b);
  });
}

function renderHome() {
  $("#streakHome").textContent = daysSince(state.profile?.quitDate);
  // last 14 days — 1 if any check-in that day, else 0
  const last14 = [];
  const today = new Date();
  for (let i=13; i>=0; i--) {
    const d = new Date(today); d.setDate(today.getDate()-i);
    const dayISO = d.toISOString().slice(0,10);
    const has = state.checkins.some(c => c.dateISO.slice(0,10) === dayISO);
    last14.push(has ? 1 : 0);
  }
  drawChart($("#streakChart"), last14);

  // Today checklist
  const ul = $("#checklistToday");
  ul.innerHTML = "";
  const store = checklistStore; const map = store.get();
  const key = new Date().toISOString().slice(0,10);
  if (!map[key]) map[key] = {};
  CHECKLIST.forEach((text, idx) => {
    const li = document.createElement("li");
    const id = `today-${idx}`;
    const checked = !!map[key][idx];
    li.innerHTML = `
      <label style="display:flex; gap:8px; align-items:center;">
        <input type="checkbox" id="${id}" ${checked?"checked":""}>
        <span>${text}</span>
      </label>`;
    li.querySelector("input").onchange = (e) => { map[key][idx] = e.target.checked; store.set(map); };
    ul.appendChild(li);
  });
}

function renderChecklist() {
  const ul = $("#checklistFull");
  ul.innerHTML = "";
  const store = checklistStore; const map = store.get();
  const key = new Date().toISOString().slice(0,10);
  if (!map[key]) map[key] = {};
  CHECKLIST.forEach((text, idx) => {
    const li = document.createElement("li");
    const id = `full-${idx}`;
    const checked = !!map[key][idx];
    li.innerHTML = `
      <label style="display:flex; gap:8px; align-items:center;">
        <input type="checkbox" id="${id}" ${checked?"checked":""}>
        <span>${text}</span>
      </label>`;
    li.querySelector("input").onchange = (e) => { map[key][idx] = e.target.checked; store.set(map); };
    ul.appendChild(li);
  });
}

function renderProgress() {
  $("#streakProgress").textContent = daysSince(state.profile?.quitDate);
  const last30 = [];
  const today = new Date();
  for (let i=29; i>=0; i--) {
    const d = new Date(today); d.setDate(today.getDate()-i);
    const dayISO = d.toISOString().slice(0,10);
    const has = state.checkins.some(c => c.dateISO.slice(0,10) === dayISO);
    last30.push(has ? 1 : 0);
  }
  drawChart($("#streakChartBig"), last30);
}

function renderAdvice() {
  const a = state.profile?.focus || "Technology";
  $("#adviceTitle").textContent = `${a} — Helpful tips`;
  const body = $("#adviceBody");
  const items = ADVICE[a] || [];
  body.innerHTML = items.length ? `<ul>${items.map(t=>`<li>${escapeHTML(t)}</li>`).join("")}</ul>`
                                : `<p>No advice found yet.</p>`;
}

/* ---------- Wiring ---------- */
function wire() {
  // Nav buttons
  $$(".ta
