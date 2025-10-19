# ReHabit (PWA)

ReHabit is a private, offline-first recovery companion for daily check-ins, cravings SOS tools, daily checklist, progress charts, and (optional) community/private chat. All personal data (except chat) is stored locally on your device.

> **Safety**: ReHabit is a self-help companion and does **not** replace professional care. If you’re in immediate danger or feel at risk, contact local emergency services or a crisis hotline.

## Features
- Addiction type picker with images → tailored **Advice** page
- **Home** view: streak, mini chart, daily checklist, one-click reminder
- **Daily check-in** (mood/urge/note), **Journal**, **SOS** timer
- **Progress** charts (no external libs)
- **Export/Import JSON**, **Factory Reset**
- Installable **PWA** (offline)
- **Community chat & private DMs** via Firebase (optional)

## Setup
1. Add images to `assets/`: `tech.png`, `smoking.png`, `alcohol.png`, `gambling.png`, `drugs.png`.
2. (Optional chat) Create a Firebase project → enable **Anonymous Auth** + **Firestore** → put your config in `index.html`.
3. Deploy with GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).

## Run locally
```bash
python -m http.server 8080
# open http://localhost:8080
