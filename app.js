// ReHabit – bright UI, slogans, logo, robust boot, programs, badges, chat samples

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
  NOTIFY: "rehabit_notify",
  BADGES: "rehabit_badges",
  MATERIALS: "rehabit_materials"
};

// Advice per addiction (short)
const ADVICE = {
  "Technology": [
    "Set app limits (30–60 min blocks).",
    "Charge your phone outside the bedroom.",
    "Swap doom scrolling for a 10-minute walk."
  ],
  "Smoking": [
    "Delay 5 minutes; drink water; breathe slowly.",
    "Avoid triggers (coffee + phone) early on.",
    "Keep sugar-free gum or carrot sticks handy."
  ],
  "Alcohol": [
    "Plan alcohol-free evenings.",
    "Prepare a script to say “No thanks, I’m cutting down.”",
    "Stock non-alcoholic drinks you like."
  ],
  "Gambling": [
    "Self-exclude from sites; block payments/cards.",
    "Tell a trusted person; share progress weekly.",
    "Fill evenings with planned, low-stimulation tasks."
  ],
  "Other drugs": [
    "Avoid people/places tied to use.",
    "Eat, sleep, hydrate—withdrawal is harder when depleted.",
    "Seek professional help; consider support groups."
  ]
};

// 10-step programs per addiction (actionable)
const PROGRAMS = {
  "Technology": [
    "Clarify target: screen hours per day and blackout hours (e.g., 10pm–7am).",
    "Remove friction: log out, uninstall 2 most problematic apps.",
    "Create a ‘ready’ phone: only essentials on Home Screen.",
    "Schedule 3 anchor activities daily (walk, call, read).",
    "Use timers: 25 min focus, 5 min break; repeat.",
    "Bedtime stack: phone docked away + analog alarm clock.",
    "Environment: charger outside bedroom; no phone at meals.",
    "Track urges: trigger → urge → action → result.",
    "Relapse plan: what to do after lapses (reset + one action).",
    "Weekly review: adjust limits, celebrate wins, share with friend."
  ],
  "Smoking": [
    "Set a quit date within 7–14 days; tell one ally.",
    "List triggers (coffee, commute) and alternatives (gum, walk).",
    "NRT options: patches/lozenges; prepare ahead.",
    "Clean environment: wash clothes, remove lighters/ashtrays.",
    "Delay strategy: 5-min rule + water + deep exhale.",
    "Mouth & hands: gum, toothpicks, stress ball.",
    "Urge log: time, intensity, action, outcome.",
    "Exercise: 10–15 min brisk walk to reduce cravings.",
    "Relapse plan: one small reset, message your ally.",
    "Weekly reward: spend saved money on something meaningful."
  ],
  "Alcohol": [
    "Define goal: zero or specific weekly limit.",
    "Remove cues: clear alcohol at home; avoid first rounds.",
    "Replacement ritual: NA drink in your glass.",
    "Plan scripts: 'No thanks, I’m taking a break.'",
    "Track urges: HALT (Hungry/Angry/Lonely/Tired) check.",
    "Evening routine: meal → walk → shower → wind-down.",
    "Social guardrails: arrive late, leave early.",
    "Stress plan: breathing, call, journaling prompt.",
    "Relapse plan: limit damage, hydrate, recommit.",
    "Weekly check-in with a friend; celebrate sober wins."
  ],
  "Gambling": [
    "Self-exclude from sites; enable bank gambling blocks.",
    "Accountability: share statements with a trusted ally.",
    "Budget firewall: separate essentials account.",
    "Trigger map: payday, sports events—add alternative plans.",
    "Delay + urge surfing: ride the wave 10 min.",
    "Blockers: DNS/app blockers on all devices.",
    "Emergency actions: hand cards to ally on trigger days.",
    "Relapse plan: call ally, lock access, review triggers.",
    "Build replacement dopamine: exercise, hobbies, volunteering.",
    "Weekly review with ally; adjust blockers and plans."
  ],
  "Other drugs": [
    "Pick a start date; tell a trusted person.",
    "Medical check: consult a clinician about withdrawal risks.",
    "Environment reset: remove paraphernalia; clean spaces.",
    "Hydration/nutrition/sleep plan for first two weeks.",
    "Trigger list & avoidance plan (people/places).",
    "Coping set: breathing, cold water, walk, call list.",
    "Support: consider groups or counselling.",
    "Relapse plan: single-use limit, disposal, contact support.",
    "Daily log: urges, actions, outcomes.",
    "Weekly reflection & reward; adjust plan with support."
  ]
};

// Starter materials per addiction
const MATERIALS_DEFAULT = {
  "Technology": [
    "Book: Digital Minimalism — Cal Newport",
    "App: Focus modes / site blockers",
    "Article: The value of stopping (urge surfing basics)"
  ],
  "Smoking": [
    "Guide: How to use nicotine patches safely",
    "App: Smoke-free day counter",
    "Article: Delay, deep breathing, drink water"
  ],
  "Alcohol": [
    "Community: Alcohol-free groups",
    "Drink ideas: NA beers & mocktails",
    "Article: HALT check before drinking"
  ],
  "Gambling": [
    "Self-exclusion portals",
    "Bank gambling transaction blocks",
    "Article: Dopamine replacement activities"
  ],
  "Other drugs": [
    "Hotlines & local services",
    "Guide: Withdrawal safety basics",
    "Article: Building a support network"
  ]
};

// Badge thresholds (days)
const BADGE_THRESHOLDS = [
  { days: 7,  label: "1 week" },
  { days: 30, label: "1 month" },
  { days: 60, label: "2 months" },
  { days: 90, label: "3 months" },
  { days: 120,label: "4 months" },
  { days: 150,label: "5 months" },
  { days: 365,label: "1 year" },
  { days: 730,label: "2 years" }
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
function getBadges() { return JSON.parse(localStorage.getItem(STORAGE.BADGES) || "[]"); }
function setBadges(arr) { localStorage.setItem(STORAGE.BADGES, JSON.stringify(arr)); }
function getMaterials() {
  const raw = JSON.parse(localStorage.getItem(STORAGE.MATERIALS) || "{}");
  return { ...MATERIALS_DEFAULT, ...raw };
}
function addMaterial(focus, tip) {
  const map = JSON.parse(localStorage.getItem(STORAGE.MATERIALS) || "{}");
  map[focus] = map[focus] || [];
  map[focus].push(tip);
  localStorage.setItem(STORAGE.MATERIALS, JSON.stringify(map));
}

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
  ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v,i) => {
    const x = 30 + i*dx;
    const y = (h-20) - (v/max)*(h-40);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

/* ---------- Navigation ---------- */
const views = ["onboarding","dashboard","home","checkin","sos","journal","settings","checklist","progress","advice","program","community","friends"];
function show(view) {
  views.forEach(v => $(`#view-${v}`)?.setAttribute("hidden", "true"));
  const el = $(`#view-${view}`);
  if (el) el.removeAttribute("hidden");
  if (view === "dashboard") renderDashboard();
  if (view === "journal")   renderJournal();
  if (view === "settings")  renderSettings();
  if (view === "sos")       renderSOS();
  if (view === "home")      renderHome();
  if (view === "checklist") renderChecklist();
  if (view === "progress")  renderProgress();
  if (view === "advice")    renderAdvice();
  if (view === "program")   renderProgram();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Renders ---------- */
function renderDashboard() {
  $("#todayDate") && ($("#todayDate").textContent = formatDate(new Date()));
  $("#focusLabel") && ($("#focusLabel").textContent = state.profile?.focus || "—");
  $("#streakDays") && ($("#streakDays").textContent = daysSince(state.profile?.quitDate));

  const list = $("#recentNotes");
  if (!list) return;
  const recent = [...state.checkins].reverse().slice(0, 5);
  list.innerHTML = recent.length ? "" : `<li><span>No notes yet.</span></li>`;
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
  const list = $("#journalList"); if (!list) return;
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
  const f = $("#profileForm"); if (!f) return;
  f.focus.value = state.profile?.focus || "";
  f.quitDate.value = state.profile?.quitDate || "";
  f.motivation.value = state.profile?.motivation || "";
}
function renderSOS() {
  const chipWrap = $("#copingChips"); if (!chipWrap) return;
  chipWrap.innerHTML = "";
  state.coping.forEach(text => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = text;
    b.onclick = () => { $("#sosNote").value = ($("#sosNote").value + "\nTried: " + text).trim(); };
    chipWrap.appendChild(b);
  });
}
function renderHome() {
  const days = daysSince(state.profile?.quitDate);
  $("#streakHome") && ($("#streakHome").textContent = days);

  // badges
  const have = new Set(getBadges());
  BADGE_THRESHOLDS.forEach(b => { if (days >= b.days) have.add(b.days); });
  setBadges([...have]);
  const wrap = $("#badgeWrap"); if (wrap) {
    wrap.innerHTML = "";
    BADGE_THRESHOLDS.forEach(b => {
      const div = document.createElement("span");
      div.className = "badge" + (have.has(b.days) ? " earned" : "");
      div.textContent = b.label;
      wrap.appendChild(div);
    });
  }

  // chart last 14 days
  const c = $("#streakChart");
  if (c) {
    const last14 = [];
    const today = new Date();
    for (let i=13; i>=0; i--) {
      const d = new Date(today); d.setDate(today.getDate()-i);
      const dayISO = d.toISOString().slice(0,10);
      const has = state.checkins.some(x => x.dateISO.slice(0,10) === dayISO);
      last14.push(has ? 1 : 0);
    }
    drawChart(c, last14);
  }

  // Today checklist
  const ul = $("#checklistToday"); if (ul) {
    ul.innerHTML = "";
    const store = checklistStore; const map = store.get();
    const key = new Date().toISOString().slice(0,10);
    if (!map[key]) map[key] = {};
    ["Drink 2 glasses of water in the morning","5-minute breathing / meditation","Move your body for 10 minutes","Review motivation statement","Plan one healthy replacement activity"].forEach((text, idx) => {
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
}
function renderChecklist() {
  const ul = $("#checklistFull"); if (!ul) return;
  ul.innerHTML = "";
  const store = checklistStore; const map = store.get();
  const key = new Date().toISOString().slice(0,10);
  if (!map[key]) map[key] = {};
  const CHECKLIST = ["Drink 2 glasses of water in the morning","5-minute breathing / meditation","Move your body for 10 minutes","Review motivation statement","Plan one healthy replacement activity"];
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
  $("#streakProgress") && ($("#streakProgress").textContent = daysSince(state.profile?.quitDate));
  const canvas = $("#streakChartBig"); if (!canvas) return;
  const last30 = [];
  const today = new Date();
  for (let i=29; i>=0; i--) {
    const d = new Date(today); d.setDate(today.getDate()-i);
    const dayISO = d.toISOString().slice(0,10);
    const has = state.checkins.some(c => c.dateISO.slice(0,10) === dayISO);
    last30.push(has ? 1 : 0);
  }
  drawChart(canvas, last30);
}
function renderAdvice() {
  const a = state.profile?.focus || "Technology";
  $("#adviceTitle") && ($("#adviceTitle").textContent = `${a} — Helpful tips`);
  const body = $("#adviceBody"); if (!body) return;
  const items = ADVICE[a] || [];
  body.innerHTML = items.length ? `<ul>${items.map(t=>`<li>${escapeHTML(t)}</li>`).join("")}</ul>`
                                : `<p>No advice found yet.</p>`;
}
function renderProgram() {
  const a = state.profile?.focus || "Technology";
  $("#programTitle") && ($("#programTitle").textContent = `${a}: 10-step program`);
  const steps = PROGRAMS[a] || [];
  const pl = $("#programList"); if (pl) pl.innerHTML = steps.map(s=>`<li>${escapeHTML(s)}</li>`).join("");

  const materials = getMaterials()[a] || [];
  const ml = $("#materialsList"); if (ml) ml.innerHTML = materials.map(m=>`<li>${escapeHTML(m)}</li>`).join("");

  // 1-year badge gate
  const hasYear = getBadges().includes(365);
  const wrap = $("#contribWrap"); if (wrap) wrap.hidden = !hasYear;
}

/* ---------- Wiring ---------- */
function wire() {
  // Nav buttons
  $$(".tabbar [data-nav], [data-nav]").forEach(btn => {
    btn.addEventListener("click", () => show(btn.getAttribute("data-nav")));
  });

  // Onboarding
  $("#onboardingForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const focus = document.querySelector('input[name="focus"]:checked')?.value;
    const fd = new FormData(e.target);
    state.profile = {
      focus: focus || "",
      quitDate: fd.get("quitDate"),
      motivation: (fd.get("motivation") || "").trim()
    };
    save();
    show("home");
  });

  // Check-in
  $("#checkinForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const entry = {
      dateISO: new Date().toISOString(),
      mood: Number(fd.get("mood")),
      urge: Number(fd.get("urge")),
      note: (fd.get("note") || "").trim()
    };
    state.checkins.push(entry);
    save();
    e.target.reset();
    show("dashboard");
  });

  // Journal
  $("#journalForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const text = (fd.get("entry") || "").trim();
    if (!text) return;
    state.journal.push({ id: crypto.randomUUID(), text, ts: Date.now() });
    save();
    e.target.reset();
    renderJournal();
  });

  // Program contribution (1-year badge holders)
  $("#contribForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const tip = (new FormData(e.target).get("tip") || "").trim();
    if (!tip) return;
    const a = state.profile?.focus || "Technology";
    addMaterial(a, tip);
    e.target.reset();
    alert("Thanks! Your tip was added.");
    renderProgram();
  });

  // SOS timer & note
  const timerEl = $("#timer");
  if (timerEl) {
    let timerId = null, remaining = 60;
    const updateTimer = () => {
      const m = String(Math.floor(remaining / 60)).padStart(2, "0");
      const s = String(remaining % 60).padStart(2, "0");
      timerEl.textContent = `${m}:${s}`;
    };
    $("#startTimer")?.addEventListener("click", () => {
      if (timerId) return;
      remaining = 60; updateTimer();
      timerId = setInterval(() => {
        remaining -= 1; updateTimer();
        if (remaining <= 0) { clearInterval(timerId); timerId = null; }
      }, 1000);
    });
    $("#resetTimer")?.addEventListener("click", () => {
      clearInterval(timerId); timerId = null; remaining = 60; updateTimer();
    });
    updateTimer();
  }
  $("#saveSos")?.addEventListener("click", () => {
    const text = ($("#sosNote").value || "").trim();
    if (!text) return;
    state.journal.push({ id: crypto.randomUUID(), text: `[SOS] ${text}`, ts: Date.now() });
    $("#sosNote").value = "";
    save();
    alert("Saved to journal.");
  });

  // Settings
  $("#profileForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.profile = {
      ...(state.profile || {}),
      focus: fd.get("focus") || "",
      quitDate: fd.get("quitDate") || "",
      motivation: (fd.get("motivation") || "").trim()
    };
    save();
    alert("Profile saved.");
  });

  // Export / Import / Reset
  $("#exportBtn")?.addEventListener("click", () => {
    const data = { profile: state.profile, checkins: state.checkins, journal: state.journal };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "rehabit-backup.json" });
    a.click(); URL.revokeObjectURL(url);
  });
  $("#importFile")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const txt = await file.text(); const data = JSON.parse(txt);
    if (confirm("Import will overwrite current local data. Continue?")) {
      state.profile = data.profile || null;
      state.checkins = data.checkins || [];
      state.journal  = data.journal || [];
      save();
      alert("Import complete.");
      renderDashboard(); renderJournal(); renderSettings(); renderHome();
    }
    e.target.value = "";
  });
  $("#resetBtn")?.addEventListener("click", () => {
    if (!confirm("This will erase local data on this device. Continue?")) return;
    Object.values(STORAGE).forEach(k => localStorage.removeItem(k));
    load();
    show("onboarding");
  });

  // Install prompt
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $("#installBtn").hidden = false;
  });
  $("#installBtn")?.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $("#installBtn").hidden = true;
  });

  // Notifications (while app is open)
  $("#notifyBtn")?.addEventListener("click", async () => {
    if (!("Notification" in window)) return alert("Notifications not supported");
    let perm = Notification.permission;
    if (perm !== "granted") perm = await Notification.requestPermission();
    if (perm !== "granted") return alert("Notifications blocked");
    localStorage.setItem(STORAGE.NOTIFY, "1");
    alert("Daily reminder enabled (fires around 09:00 while the app is open).");
  });
  setInterval(() => {
    if (localStorage.getItem(STORAGE.NOTIFY) !== "1") return;
    const d = new Date();
    if (d.getHours() === 9 && d.getMinutes() === 0) {
      new Notification("ReHabit — daily check", { body: "Take 1 minute to check in and review your checklist." });
    }
  }, 60 * 1000);

  // Footer year
  $("#year") && ($("#year").textContent = new Date().getFullYear());
}

/* ---------- Firebase chat (optional; samples shown if not configured) ---------- */
let auth = null, db = null, me = null, dmUnsub = null;
async function initFirebase() {
  if (!(window.firebase && firebase.apps?.length)) return; // not configured
  auth = firebase.auth(); db = firebase.firestore();
  await auth.signInAnonymously();
  me = auth.currentUser;
  await db.collection("users").doc(me.uid).set({ createdAt: Date.now() }, { merge: true });
}
function esc(s){ return String(s).replace(/[&<>\"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[m])); }
function seedExampleChatIfEmpty(box) {
  if (!box || box.childElementCount) return;
}
function seedExamples(box){
  if (!box || box.childElementCount) return;
  const now = new Date();
  const ex = [
    { who: "Maya (2 wks)", text: "Tip that helps me: grayscale at night cuts scrolling.", t: new Date(now - 300000) },
    { who: "Alex (1 mo)",  text: "Daily check-ins keep my streak honest. Small wins add up.", t: new Date(now - 180000) },
    { who: "You",          text: "Welcome! Say hi and share one thing that helped you today.", t: new Date(now - 60000) }
  ];
  ex.forEach(m=>{
    const div = document.createElement("div");
    div.className = "chat-msg";
    div.innerHTML = `<strong>${esc(m.who)}:</strong> ${esc(m.text)} <small>${m.t.toLocaleTimeString()}</small>`;
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}
function wireCommunity() {
  const box = $("#globalChat");
  // If Firebase not configured, just seed example messages & basic send
  if (!(window.firebase && firebase.apps?.length)) {
    seedExamples(box);
    $("#globalForm")?.addEventListener("submit", (e)=>{ e.preventDefault(); });
    $("#myUid") && ($("#myUid").textContent = "—");
    return;
  }

  if (!auth || !db || !me) { seedExamples(box); return; }

  // Global stream
  db.collection("rooms").doc("global").collection("messages")
    .orderBy("ts","asc").limit(200)
    .onSnapshot(snap => {
      box.innerHTML = "";
      if (snap.empty) seedExamples(box);
      snap.forEach(doc => {
        const m = doc.data();
        const who = m.uid === me.uid ? "You" : (m.name || m.uid.slice(0,6));
        const div = document.createElement("div");
        div.className = "chat-msg";
        div.innerHTML = `<strong>${esc(who)}:</strong> ${esc(m.text)} <small>${new Date(m.ts).toLocaleTimeString()}</small>`;
        box.appendChild(div);
      });
      box.scrollTop = box.scrollHeight;
    });

  // Send to global
  $("#globalForm")?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const msg = new FormData(e.target).get("msg")?.toString().trim();
    if (!msg) return;
    await db.collection("rooms").doc("global").collection("messages").add({ uid: me.uid, text: msg, ts: Date.now() });
    e.target.reset();
  });

  // Friends
  $("#myUid") && ($("#myUid").textContent = me.uid);
}

/* ---------- BOOT ---------- */
load();

// Safe boot: always show something even if errors occur
window.addEventListener("DOMContentLoaded", async () => {
  try {
    if (!state.profile) { show("onboarding"); }
    else { show("home"); }

    wire();

    try {
      await initFirebase();   // ok if not configured
    } catch {}
    wireCommunity();
  } catch (err) {
    console.error(err);
    // last resort: reveal onboarding so the page isn't empty
    const onboarding = document.getElementById("view-onboarding");
    if (onboarding) onboarding.removeAttribute("hidden");
  }
});

// PWA SW
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  });
}
