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
  $$(".tabbar [data-nav], [data-nav]").forEach(btn => {
    btn.addEventListener("click", () => show(btn.getAttribute("data-nav")));
  });

  // Onboarding
  $("#onboardingForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    // read selected radio
    const focus = document.querySelector('input[name="focus"]:checked')?.value;
    const fd = new FormData(e.target);
    state.profile = {
      focus: focus || "",
      quitDate: fd.get("quitDate"),
      motivation: (fd.get("motivation") || "").trim()
    };
    save();
    show("advice"); // go straight to tailored tips
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

  // SOS timer
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

  // SOS save note
  $("#saveSos")?.addEventListener("click", () => {
    const text = ($("#sosNote").value || "").trim();
    if (!text) return;
    state.journal.push({ id: crypto.randomUUID(), text: `[SOS] ${text}`, ts: Date.now() });
    $("#sosNote").value = "";
    save();
    alert("Saved to journal.");
  });

  // Settings: profile save
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
    localStorage.removeItem(STORAGE.PROFILE);
    localStorage.removeItem(STORAGE.CHECKINS);
    localStorage.removeItem(STORAGE.JOURNAL);
    localStorage.removeItem(STORAGE.CHECKLIST_DONE);
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
  $("#year").textContent = new Date().getFullYear();
}

/* ---------- Firebase chat (optional; requires valid config) ---------- */
let auth = null, db = null, me = null, dmUnsub = null;
async function initFirebase() {
  if (!(window.firebase && firebase.apps?.length)) return; // not configured
  auth = firebase.auth(); db = firebase.firestore();
  await auth.signInAnonymously();
  me = auth.currentUser;
  await db.collection("users").doc(me.uid).set({ createdAt: Date.now() }, { merge: true });
}
function esc(s){ return String(s).replace(/[&<>\"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[m])); }
function wireCommunity() {
  if (!db || !me) return;

  // Global stream
  db.collection("rooms").doc("global").collection("messages")
    .orderBy("ts","asc").limit(200)
    .onSnapshot(snap => {
      const box = $("#globalChat"); if (!box) return;
      box.innerHTML = "";
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
  $("#myUid").textContent = me.uid;
  loadFriends();
  $("#addFriendForm")?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const uid = new FormData(e.target).get("uid")?.toString().trim();
    if (!uid) return;
    await db.collection("users").doc(me.uid).set({ friends: firebase.firestore.FieldValue.arrayUnion(uid) }, { merge: true });
    await db.collection("users").doc(uid).set({ friends: firebase.firestore.FieldValue.arrayUnion(me.uid) }, { merge: true });
    e.target.reset();
    loadFriends();
  });
}
async function loadFriends() {
  if (!db || !me) return;
  const meDoc = await db.collection("users").doc(me.uid).get();
  const friends = (meDoc.data()?.friends)||[];
  const ul = $("#friendList"); ul.innerHTML = "";
  friends.forEach(uid=>{
    const li = document.createElement("li");
    li.innerHTML = `<span>${uid}</span><button class="btn" data-dm="${uid}">Chat</button>`;
    li.querySelector("button").onclick = ()=> openDM(uid);
    ul.appendChild(li);
  });
}
function dmRoom(a,b){ return [a,b].sort().join("_"); }
function openDM(friendUid){
  if (!db || !me) return;
  dmUnsub?.();
  const roomId = dmRoom(me.uid, friendUid);
  dmUnsub = db.collection("rooms").doc(roomId).collection("messages")
    .orderBy("ts","asc").limit(200)
    .onSnapshot(snap=>{
      const box = $("#dmWrap"); box.innerHTML = "";
      snap.forEach(doc=>{
        const m = doc.data();
        const who = m.uid === me.uid ? "You" : m.uid.slice(0,6);
        const div = document.createElement("div");
        div.className = "chat-msg";
        div.innerHTML = `<strong>${esc(who)}:</strong> ${esc(m.text)} <small>${new Date(m.ts).toLocaleTimeString()}</small>`;
        box.appendChild(div);
      });
      box.scrollTop = box.scrollHeight;
    });

  const form = $("#dmForm");
  form.onsubmit = async (e)=>{
    e.preventDefault();
    const msg = new FormData(e.target).get("msg")?.toString().trim();
    if (!msg) return;
    await db.collection("rooms").doc(roomId).collection("messages").add({ uid: me.uid, text: msg, ts: Date.now() });
    e.target.reset();
  };

  show("friends");
}

/* ---------- BOOT ---------- */
load();

window.addEventListener("DOMContentLoaded", async () => {
  if (!state.profile) { show("onboarding"); }
  else { show("home"); }            // Home exists now, so it will render correctly

  wire();

  // Firebase (optional)
  try {
    await initFirebase();           // signs in anonymously if configured
    wireCommunity();
  } catch (err) { console.warn("Firebase not configured or failed:", err); }
});

// PWA service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  });
}
