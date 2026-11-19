# VaaniAccess — बोलो, जानो, पाओ 🎙

Dialect-Adaptive Public Scheme Voice Navigator — Hindi voice-first web app.
Bolie apni boli me, paaie sahi sarkari yojana + 3 aasaan kadam (voice + text).

## 🌐 Live site

**https://ns2ytu8h.insforge.site** (InsForge hosting, auto Env: `VITE_INSFORGE_URL` + `VITE_INSFORGE_ANON_KEY`)

Redeploy: `npx -y @insforge/cli deployments deploy vaani-access` (from `/home/user`)

## Live chalana

```bash
cd vaani-access
npm install
npm run dev      # http://localhost:5173
```

Production build: `npm run build` → `dist/` (preview: `npm run preview`).

## Quality gates (6-dimension report: `TEST-REPORT.md`)

```bash
npm test              # 40/40 vitest pass
npm run test:coverage # v8 coverage (matcher ~86%)
npm run lint          # eslint clean
npm audit --omit=dev  # 0 vulnerabilities
```

## Backend — InsForge (Postgres)

- Project: **VaaniAcess** (`1b7d6c13-...`)
- API base: `https://ns2ytu8h.ap-southeast.insforge.app`
- Keys: `vaani-access/.env` me (`VITE_INSFORGE_URL`, `VITE_INSFORGE_ANON_KEY`)
- Table: `public.schemes` (33 seeded rows) — migrations `migrations/` me:
  - `20260907070725_create-schemes.sql` — schema + RLS (public read of `active=true`)
  - `20260907070752_seed-schemes.sql` — pehli 15 yojanaon ka data
  - `20260907081303_seed-schemes-round-2.sql` — agli 18 yojanaon ka data (kul 33)

PRD API mapping (tiny fetch-based REST client — same InsForge API, zero SDK dependency):

| PRD endpoint | Implementation |
|---|---|
| `POST /api/recommend` | `scoreSchemes()` (deterministic, explainable) + `fetchSchemes()` |
| `GET /api/schemes` | `fetchSchemes()` — anon key, RLS read |
| `GET /api/schemes/{id}` | `getScheme(id)` |
| `GET /api/health` | `checkHealth()` |

Backend down ho to app **offline snapshot** (wahi seeded data) se chalti hai + banner dikhati hai.
Koi fake recommendation nahi.

## Features (MVP — PRD §6 ke hisab se)

- 🎙 Hindi voice input (Web Speech API, hi-IN) + live transcript
- 🧠 Intent detection: kisan, student, health, housing, mahila, rojgar, business, pension, banking…
- 🗣 Dialect-adaptive: Bhojpuri, Haryanvi, Rajasthani, Awadhi, Maithili, Braj… (“समझा गया” box)
- 📊 Explainable matching — “यह योजना क्यों?” reasons ke saath
- 🏛 Verified official apply links (URL kabhi bola nahi jata)
- 🔊 Hindi voice output (SpeechSynthesis) + 🔊/🔇 toggle
- ✍️ Text fallback + `M` key mic shortcut + बड़े अक्षर (T) mode
- 🛡 Privacy: Aadhaar/mobile numbers auto-mask, koi recording save nahi
- ⬇ Checklist download (`.txt`), 🔍 search + category filters, 📋 scheme detail modal
- ⚠️ Error states: mic denied, unsupported browser, no-speech, no-match, backend offline

## 60-second demo script (judges)

1. **“डेमो चलाएं”** dabao (Live Demo section) — ya console me mic dabakar bolo:
   *“Main college student hoon, fees ke liye scholarship chahiye”*
2. Transcript + intent chips + **National Scholarship — पक्का मेल ✓** dekho
3. Hindi voice jawab suno → **चेकलिस्ट** download karo → **Official Website** button dikhao
4. Dialect dikhao: demo chip *“हमको गैस सिलेंडर चाहिए”* dabao → Ujjwala match

## Project structure

```
vaani-access/
├── src/
│   ├── App.jsx              # sab sections + state
│   ├── lib/
│   │   ├── insforge.js      # DB client: fetchSchemes/getScheme/checkHealth
│   │   ├── matcher.js       # intent + scoring engine, dialects, demo data
│   │   ├── speech.js        # SpeechRecognition / SpeechSynthesis helpers
│   │   └── fallbackSchemes.js  # offline snapshot (33 schemes)
│   └── index.css            # neo-brutalist cream theme
├── public/hero-family.png   # hero illustration
└── .env                     # InsForge URL + anon key
migrations/                  # InsForge DB migrations (schema + seed)
```
