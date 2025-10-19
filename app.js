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
  { days: 30, label: "1 m
