# ReHabit (PWA)

ReHabit is a private, offline-first recovery companion for daily check-ins, cravings SOS tools, and simple progress tracking. All data is stored locally on your device.

> **Safety**: ReHabit is a self-help companion and does **not** replace professional care.  
> If you’re in immediate danger or feel at risk, contact local emergency services or a crisis hotline.

## Features (MVP)
- Onboarding: focus area, target date, motivations
- Daily check-in: mood + urge + note
- SOS: 1-minute breathing timer, coping chips, quick note to journal
- Journal: triggers & entries list with delete
- Progress: streak days on dashboard
- Settings: export/import JSON backups, profile edit, factory reset
- PWA: installable, offline via service worker

## Run locally
Just open `index.html` in a local server, e.g.:

```bash
# Python 3
python -m http.server 8080
# then open http://localhost:8080
```

## Deploy to GitHub Pages
1. Create a repo named `rehabit` (or any name).
2. Add files, commit, and push to `main` (or upload via the GitHub website).
3. In GitHub → *Settings* → *Pages*:
   - Source: **Deploy from a branch**
   - Branch: **main** → **/ (root)** → Save
4. The site will build; your URL will be:  
   `https://<your-username>.github.io/<repo-name>/`
5. Test install on mobile (Add to Home Screen).

## License
MIT
