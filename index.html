<!doctype html>
<html lang="en" data-lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>ReHabit — Your Recovery Companion</title>
  <meta name="theme-color" content="#1f3a8a"/>
  <link rel="icon" href="assets/favicon.png">
  <link rel="manifest" href="manifest.webmanifest">
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css"/>
</head>
<body>
  <header class="app-header">
    <button id="menuBtn" class="hamburger" aria-label="Menu" aria-haspopup="true" aria-controls="drawer">☰</button>

    <div class="brand">
      <h1 class="fancy app-title">ReHabit</h1>
      <div class="slogans-inline pill slogan-one">ReBuild · ReWire · <span class="accent">ReHabit</span></div>
    </div>

    <div class="header-actions">
      <select id="langSelect" aria-label="Language">
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
      <button id="installBtn" class="btn subtle" hidden data-i18n="install">Install</button>
    </div>
  </header>

  <!-- Drawer -->
  <aside id="drawer" class="drawer" aria-hidden="true">
    <div class="drawer-head">
      <strong class="fancy">Menu</strong>
      <button id="closeDrawer" class="btn subtle" aria-label="Close">×</button>
    </div>
    <nav class="drawer-nav">
      <button class="drawer-link" data-nav="home">
        <span>🏠</span><span data-i18n="home">Home</span>
      </button>
      <button class="drawer-link" data-nav="checkin">
        <span>📝</span><span data-i18n="checkin">Daily Check-in</span>
      </button>
      <button class="drawer-link" data-nav="calendar">
        <span>📅</span><span data-i18n="calendar">Calendar</span>
      </button>
      <button class="drawer-link" data-nav="guide">
        <span>📚</span><span data-i18n="guide">Guide</span>
      </button>
      <button class="drawer-link" data-nav="badges">
        <span>🏅</span><span data-i18n="badges">Badges</span>
      </button>
      <button class="drawer-link" data-nav="research">
        <span>🔎</span><span data-i18n="research">Research</span>
      </button>
      <button class="drawer-link" data-nav="notes">
        <span>🗒️</span><span data-i18n="notes">Notes</span>
      </button>
      <button class="drawer-link" data-nav="friends">
        <span>🤝</span><span data-i18n="friends">Friends</span>
      </button>
      <button class="drawer-link" data-nav="community">
        <span>💬</span><span data-i18n="chat">Community</span>
      </button>
      <button class="drawer-link" data-nav="settings">
        <span>⚙️</span><span data-i18n="settings">Settings</span>
      </button>
      <button class="drawer-link danger" data-nav="sos">
        <span>🚨</span><span data-i18n="emergency">Emergency</span>
      </button>
    </nav>
  </aside>
  <div id="backdrop" class="backdrop" hidden></div>

  <aside class="crisis-mini" role="note" aria-label="Crisis support">
    <a href="https://www.iasp.info/crisis-centres-helplines/" target="_blank" rel="noopener" data-i18n="danger">If in danger, get help</a>
  </aside>

  <main id="app" class="container">

    <!-- Onboarding -->
    <section id="view-onboarding" class="card">
      <div class="pill-title center" data-i18n="welcome">Welcome 👋</div>
      <p class="center" data-i18n="selectFocus">Select your focus and a target date to start tracking progress.</p>

      <div class="addiction-grid" style="margin-bottom:12px">
        <label class="addiction-card">
          <input type="checkbox" name="focus" value="Technology">
          <img src="assets/tech.png" alt="Technology"><span data-i18n="a_tech">Technology</span>
        </label>
        <label class="addiction-card">
          <input type="checkbox" name="focus" value="Smoking">
          <img src="assets/smoking.png" alt="Smoking"><span data-i18n="a_smoke">Smoking</span>
        </label>
        <label class="addiction-card">
          <input type="checkbox" name="focus" value="Alcohol">
          <img src="assets/alcohol.png" alt="Alcohol"><span data-i18n="a_alcohol">Alcohol</span>
        </label>
        <label class="addiction-card">
          <input type="checkbox" name="focus" value="Gambling">
          <img src="assets/gambling.png" alt="Gambling"><span data-i18n="a_gambling">Gambling</span>
        </label>
        <label class="addiction-card">
          <input type="checkbox" name="focus" value="Other">
          <img src="assets/other.png" alt="Other drugs"><span data-i18n="a_other">Other drugs</span>
        </label>
      </div>

      <form id="onboardingForm" class="grid" action="javascript:void(0)">
        <label><span data-i18n="quitDate">Quit/target date</span><input type="date" name="quitDate"></label>
        <label><span data-i18n="motivation">Your main motivation (optional)</span><input type="text" name="motivation" maxlength="120" placeholder=""></label>
        <button class="btn primary" type="submit" data-i18n="start">Start ReHabit</button>
      </form>
    </section>

    <!-- Home -->
    <section id="view-home" class="card" hidden>
      <div class="grid-2 home-pills">
        <div class="pill-card">
          <div class="pill-title center" data-i18n="monthCard">Calendar (this month)</div>
          <div class="calendar-head">
            <div id="streakWrap" class="streak center"></div>
            <div id="monthLabel"></div>
          </div>
          <div id="calendarGrid" class="calendar"></div>
        </div>

        <div class="pill-card">
          <div class="pill-title center" data-i18n="steps">10 Steps</div>
          <div id="homeStepsChoice" class="guide-choice center" hidden>
            <label><span data-i18n="chooseAddiction">Choose addiction</span>
              <select id="homeStepsSelect"></select>
            </label>
          </div>
          <ol id="homeStepsList" class="pill-list ordered"></ol>
        </div>
      </div>
    </section>

    <!-- Calendar Full -->
    <section id="view-calendar" class="card" hidden>
      <div class="pill-title center" data-i18n="calendar">Calendar</div>
      <div class="calendar-head up">
        <div id="streakWrap2" class="streak center"></div>
        <div id="monthLabel2"></div>
      </div>
      <div id="calendarGrid2" class="calendar"></div>
      <div class="actions push-down"><button class="btn subtle" data-nav="home" data-i18n="back">Back</button></div>
    </section>

    <!-- Daily Check-in -->
    <section id="view-checkin" class="card" hidden>
      <div class="pill-title center" data-i18n="checkin">Daily Check-in</div>
      <div class="grid-2">
        <div class="card soft">
          <p id="encouragement" class="encouragement big"></p>
          <form id="checkinForm" class="grid pro-form organized" action="javascript:void(0)">
            <div class="grid-2">
              <label><span data-i18n="mood">Mood (0–10)</span>
                <input type="range" name="mood" min="0" max="10" value="5" oninput="moodVal.textContent=this.value">
                <small><span data-i18n="value">Value:</span> <span id="moodVal">5</span></small>
              </label>
              <label><span data-i18n="urge">Urge (0–10)</span>
                <input type="range" name="urge" min="0" max="10" value="3" oninput="urgeVal.textContent=this.value">
                <small><span data-i18n="value">Value:</span> <span id="urgeVal">3</span></small>
              </label>
            </div>
            <div class="grid-2">
              <label><span data-i18n="sleep">Hours of sleep</span><input type="number" name="sleep" min="0" max="24" value="7"></label>
              <label><span data-i18n="cravingWindow">Craving window</span>
                <select name="window">
                  <option value="morning" data-i18n="morning">Morning</option>
                  <option value="afternoon" data-i18n="afternoon">Afternoon</option>
                  <option value="evening" data-i18n="evening">Evening</option>
                  <option value="night" data-i18n="night">Night</option>
                </select>
              </label>
            </div>
            <label><span data-i18n="actionTook">Helpful action you took</span><input type="text" name="action" maxlength="120"></label>
            <label><span data-i18n="note">Note (optional)</span><textarea name="note" rows="3"></textarea></label>
            <fieldset class="radios">
              <legend class="fancy" data-i18n="exposure">Exposure level today</legend>
              <label><input type="radio" name="exposure" value="low" checked> <span data-i18n="low">Low</span></label>
              <label><input type="radio" name="exposure" value="medium"> <span data-i18n="medium">Medium</span></label>
              <label><input type="radio" name="exposure" value="high"> <span data-i18n="high">High</span></label>
            </fieldset>
            <div class="actions">
              <button class="btn primary" type="submit" data-i18n="save">Save check-in</button>
              <button class="btn subtle" data-nav="home" type="button" data-i18n="back">Back</button>
            </div>
          </form>
        </div>

        <!-- Removed the "Today’s shortcuts" card per request -->
        <div class="card soft">
          <div class="pill-title center" data-i18n="recent">Recent notes</div>
          <ul id="recentNotes" class="pill-list notes-list"></ul>
        </div>
      </div>
    </section>

    <!-- SOS -->
    <section id="view-sos" class="card" hidden>
      <div class="pill-title center">🚨 <span data-i18n="sos">Craving SOS</span></div>
      <ol class="pill-list ordered">
        <li class="pill-item" data-i18n="s1">Delay 5 minutes. Start timer and breathe slowly.</li>
        <li class="pill-item" data-i18n="s2">Urge surfing. Notice the urge rising and falling.</li>
        <li class="pill-item" data-i18n="s3">Do one alternative action. Walk, shower, text a friend, drink water.</li>
      </ol>
      <div class="grid-2">
        <div class="card soft">
          <h3 data-i18n="timer">Breathing Timer (1:00)</h3>
          <div id="timer" aria-live="polite">01:00</div>
          <div class="actions"><button class="btn" id="startTimer" data-i18n="startBtn">Start</button><button class="btn subtle" id="resetTimer" data-i18n="reset">Reset</button></div>
        </div>
        <div class="card soft">
          <h3 data-i18n="quickNotes">Quick Notes</h3>
          <textarea id="sosNote" rows="3"></textarea>
          <div class="actions"><button class="btn" id="saveSos" data-i18n="save">Save</button></div>
        </div>
      </div>
      <div class="resources">
        <h3 data-i18n="helpful">Helpful actions</h3>
        <div class="chips" id="copingChips"></div>
      </div>
      <div class="actions push-down"><button class="btn subtle" data-nav="home" data-i18n="back">Back</button></div>
    </section>

    <!-- Guide -->
    <section id="view-guide" class="card" hidden>
      <div class="pill-title center" id="guideTitle">Guide</div>
      <div id="guideChoiceWrap" class="guide-choice center" hidden>
        <label><span data-i18n="chooseAddiction">Choose addiction</span>
          <select id="guideChoice"></select>
        </label>
      </div>

      <!-- Tips + Materials merged into pill list -->
      <div class="pill-title-sub center" data-i18n="tips">Tips</div>
      <ol id="tab-tips" class="pill-list ordered"></ol>

      <div class="pill-title-sub center" data-i18n="deep">Deep Guide</div>
      <ol id="tab-deep" class="pill-list ordered"></ol>

      <div class="actions push-down">
        <button class="btn subtle" data-nav="home" data-i18n="back">Back</button>
      </div>
    </section>

    <!-- Materials merged → handled in Guide above -->

    <!-- Badges -->
    <section id="view-badges" class="card" hidden>
      <div class="pill-title center" data-i18n="badges">Badges</div>
      <h3 class="fancy center" data-i18n="sobriety">Sobriety badges</h3>
      <div id="sobrietyGrid" class="badge-grid"></div>

      <h3 class="fancy center" data-i18n="social">Social badges</h3>
      <div id="socialGrid" class="badge-grid"></div>

      <h3 class="fancy center" data-i18n="currentTitle">Your current chat title</h3>
      <p id="currentTitle" class="muted center">—</p>

      <div class="actions push-down"><button class="btn subtle" data-nav="home" data-i18n="back">Back</button></div>
    </section>

    <!-- Research -->
    <section id="view-research" class="card" hidden>
      <div class="pill-title center" data-i18n="research">Research</div>
      <div id="researchChoiceWrap" class="guide-choice center" hidden>
        <label><span data-i18n="chooseAddiction">Choose addiction</span>
          <select id="researchChoice"></select>
        </label>
      </div>
      <ol id="researchBody" class="pill-list ordered"></ol>
      <p class="muted center" data-i18n="footer">For support only—does not replace professional treatment.</p>
      <div class="actions push-down"><button class="btn subtle" data-nav="home" data-i18n="back">Back</button></div>
    </section>

    <!-- Community -->
    <section id="view-community" class="card" hidden>
      <div class="pill-title center" data-i18n="chat">Community</div>
      <p class="muted center" data-i18n="chatNote">Community chat: unmoderated peer support. Click a name to send a friend request.</p>
      <div id="globalChat" class="chat-box"></div>
      <form id="globalForm" class="grid" style="grid-template-columns:1fr auto;" action="javascript:void(0)">
        <input type="text" name="msg" placeholder="Write a message…" maxlength="300">
        <button class="btn" data-i18n="send">Send</button>
      </form>
      <div class="actions push-down">
        <button class="btn" data-nav="friends" data-i18n="friends">Friends</button>
        <button class="btn subtle" data-nav="home" data-i18n="back">Back</button>
      </div>
    </section>

    <!-- Friends -->
    <section id="view-friends" class="card" hidden>
      <div class="pill-title center" data-i18n="friends">Friends</div>
      <p class="center"><span data-i18n="yourCode">Your code:</span> <code id="myUid">—</code></p>
      <form id="addFriendForm" class="grid" style="grid-template-columns:1fr auto; margin:8px 0;" action="javascript:void(0)">
        <input type="text" name="code" placeholder="Enter friend code (e.g., RH-COACH)" maxlength="40"/>
        <button class="btn" type="submit" data-i18n="send">Send</button>
      </form>
      <p class="muted center" id="friendCodeHint">Try codes: RH-COACH, RH-CALM, RH-PEER.</p>

      <h3 class="fancy center" data-i18n="requests">Requests</h3>
      <ul id="requestsList" class="list"></ul>
      <h3 class="fancy center" data-i18n="friendsList">Friends</h3>
      <ul id="friendList" class="list"></ul>

      <div class="actions push-down"><button class="btn subtle" data-nav="community" data-i18n="back">Back</button></div>
    </section>

    <!-- Settings -->
    <section id="view-settings" class="card" hidden>
      <div class="pill-title center" data-i18n="settings">Settings</div>
      <form id="settingsForm" class="grid" action="javascript:void(0)">
        <label class="center"><span data-i18n="displayName">Display Name</span>
          <input type="text" name="displayName" maxlength="40" placeholder="Your name">
        </label>
        <fieldset class="grid settings-addictions">
          <legend class="fancy center" data-i18n="chooseAddictions">Choose addictions</legend>
          <label class="sa-item"><span data-i18n="a_smoke">Smoking</span><input type="checkbox" name="addictions" value="Smoking"><img src="assets/smoking.png" alt="Smoking"></label>
          <label class="sa-item"><span data-i18n="a_alcohol">Alcohol</span><input type="checkbox" name="addictions" value="Alcohol"><img src="assets/alcohol.png" alt="Alcohol"></label>
          <label class="sa-item"><span data-i18n="a_tech">Technology</span><input type="checkbox" name="addictions" value="Technology"><img src="assets/tech.png" alt="Technology"></label>
          <label class="sa-item"><span data-i18n="a_gambling">Gambling</span><input type="checkbox" name="addictions" value="Gambling"><img src="assets/gambling.png" alt="Gambling"></label>
          <label class="sa-item"><span data-i18n="a_other">Other drugs</span><input type="checkbox" name="addictions" value="Other"><img src="assets/other.png" alt="Other"></label>
        </fieldset>
        <div class="actions push-down">
          <button class="btn primary" data-i18n="save">Save</button>
          <button class="btn subtle" type="button" data-nav="home" data-i18n="back">Back</button>
        </div>
      </form>
    </section>

    <!-- Notes -->
    <section id="view-notes" class="card" hidden>
      <div class="pill-title center" data-i18n="notes">Notes</div>
      <p class="muted center" data-i18n="notesInfo">Your Daily and SOS notes appear here (newest first).</p>
      <ul id="notesList" class="pill-list notes-list"></ul>
      <div class="actions push-down"><button class="btn subtle" data-nav="home" data-i18n="back">Back</button></div>
    </section>

  </main>

  <!-- Bottom Tabbar (kept) -->
  <nav class="tabbar" aria-label="Primary">
    <button data-nav="home" class="tabbtn"><svg viewBox="0 0 24 24" class="ico"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" fill="currentColor"/></svg><span data-i18n="home">Home</span></button>
    <button data-nav="community" class="tabbtn"><svg viewBox="0 0 24 24" class="ico"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2z" fill="currentColor"/></svg><span data-i18n="chat">Community</span></button>
    <button data-nav="friends" class="tabbtn"><svg viewBox="0 0 24 24" class="ico"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" fill="currentColor"/></svg><span data-i18n="friends">Friends</span></button>
  </nav>

  <footer class="legal">
    <small>© <span id="year"></span> ReHabit. <span data-i18n="footer">For support only—does not replace professional treatment.</span></small>
  </footer>

  <script src="app.js"></script>
</body>
</html>
