# VaaniAccess — 6-Dimension Test Report 🧪

**Date:** 7 Sep 2026 (Round 4 — content expansion) • **Live:** https://ns2ytu8h.insforge.site • **Stack:** React 19 + Vite + InsForge Postgres (REST)

## Scorecard

| # | Dimension | Start | R2 | R3 | R4 (now) | Key evidence |
|---|-----------|-------|----|----|----------|--------------|
| 1 | Code Quality | 84 | ~97 | ~98 | **~98** | ESLint 0/0; REST client; zero build warnings |
| 2 | Security | 65 | ~94 | ~97 | **~97** | CSP live + render-verified; 6 headers; RLS read-only proven |
| 3 | Efficiency | 100 | 100 | 100 | **100** | Bundle 284KB (84KB gzip, +18 schemes); build 0.17s |
| 4 | Testing | 0 | ~95 | ~97 | **~98** | **82/82 pass (5 files)**; 10/10 demos; 33-scheme integrity |
| 5 | Accessibility | 45 | ~94 | ~96 | **~96** | `<main>` landmark, `role=alert/status`; all text ≥ 4.5:1 |
| 6 | Problem Alignment | 87 | ~95 | ~97 | **~98** | **33 schemes** (15→33), 3 new categories; 9/9 §17 criteria |

Run everything: `npm test` • `npm run test:coverage` • `npm run lint` • `npm run build`

---

## 1. Code Quality (84 → ~98)

- **ESLint** (`@eslint/js` + `react` + `react-hooks`): **0 errors, 0 warnings**
- R3: decoded the SDK's REST calls and replaced `@insforge/sdk` (96KB) with a ~40-line `fetch` client —
  same InsForge backend, zero new deps, `crypto externalized` build warning gone
- Dead code removed, boolean guards, hardened `scrollTo`, `.npmrc` for reproducible installs

## 2. Security (65 → ~97)

| Check | Result |
|---|---|
| `npm audit` (prod **and** dev) | **0 vulnerabilities** |
| Admin (`ik_…`) / user (`uak_…`) keys in `src/`+`dist/` | **absent** ✓ |
| Anon key in bundle | publishable by design; RLS restricts it to read-only |
| RLS anon `SELECT` / `INSERT` / `UPDATE`+`DELETE` | ALLOWED / **DENIED** / **0 rows, data unchanged** ✓ |
| External links | `target=_blank` + `rel="noreferrer"` |
| Live headers | `nosniff`, `SAMEORIGIN`, strict `Referrer-Policy`, `microphone=(self)`, **HSTS**, **CSP** — all 6 verified live |
| CSP | `script-src 'self'` (dist has zero inline scripts — verified), fonts/InsForge allow-listed, `object-src 'none'`, `frame-ancestors 'self'` — **full-page render verified with CSP active** |
| Privacy | Aadhaar/mobile/bank masked (tested); no recordings; TTS never speaks numbers/URLs; history is in-memory only |
| `.env` / `.insforge/` | git-ignored, excluded from deploys |

## 3. Efficiency (100 → 100)

| Metric | Before | Now |
|---|---|---|
| JS bundle | 425 KB / 120 KB gzip | **259 KB / 78 KB gzip (−39%)** |
| Hero image | 2.2 MB PNG | **171 KB progressive JPG** (`fetchPriority="high"`) |
| CSS | 18 KB | 18 KB (4 KB gzip) |
| Build time | ~0.3 s | **~0.18 s** |
| Runtime | one DB fetch, in-memory scoring, no polling (unchanged) | ✅ |

## 4. Testing (0 → ~97)

- **82/82 pass** across 5 files:
  - `matcher.test.js` (53) — 10/10 demo queries; HI/Hinglish/dialects; food/energy intents; 9 new-scheme tops (incl. not-stealing guards); 33-scheme integrity + new-category coverage
  - `download.test.js` (2, jsdom) — checklist file + content
  - `speech.test.js` (8, jsdom) — guards, recognizer wiring, Hindi voice pick
  - `insforge.test.js` (8, mocked `fetch`) — REST paths, auth header, errors, unconfigured
  - `App.test.jsx` (11, Testing Library) — hero, 33 cards, filter (+राशन), search, demo→pipeline, offline fallback, dialog + Esc, **Tab trap**, **toggles**, **history re-run**
- Coverage (v8): **96% stmts / 98.7% lines** (matcher 100% lines)
- Tests caught real bugs across rounds: `undefined` guards, missing `.jsx` include, multi-match assertions

## 5. Accessibility (45 → ~96)

**Shipped:** skip link, `lang="hi"`, `<main>` landmark, single `h1`, `role="status"` transcript,
`aria-live` results, `role="alert"` errors, `aria-label` icon buttons, `aria-pressed` toggles,
dialog (`aria-modal`, auto-focus, **Tab trap**, Esc), `aria-haspopup`, decorative art hidden,
`:focus-visible` outlines, full keyboard support, `prefers-reduced-motion`, targets ≥ 34px.

**Contrast (WCAG AA, computed):** kicker 6.08, buttons 4.96, badges 6.55, interim 6.51,
placeholder 6.36, recording 5.46, body 11.65 — all ≥ 4.5 ✅ (hero display 3.34 ≥ 3.0 ✅)

## 6. Problem Statement Alignment (87 → ~97)

- PRD §17 — 9/9 verified (voice→transcript, intents, DB schemes, *why* reasons, eligibility/docs/steps, official URLs, Hindi TTS, text fallback, clean run)
- R3: **“हाल के सवाल” session history** (PRD §18 conversation-history, privacy-safe: in-memory only, clear label) with one-click re-run

---

## Release verification (live site, this round)

| Check | Result |
|---|---|
| `GET /` | **HTTP 200**, correct title |
| Security headers | **6/6 present** incl. CSP + HSTS |
| JS render with CSP active | full page content verified (hero, console, library, demo sections) |
| CORS preflight (browser flow) | **204** + `allow-origin: https://ns2ytu8h.insforge.site` |
| Live data API | **200 in ~0.8s** |
| Note | static snapshots may show the brief loading state; a failed fetch would show the offline banner + 33 fallback schemes instead |

## Appendix — commands

```bash
npm test                  # 69/69 pass
npm run test:coverage     # v8: 98% lines on src/lib
npm run lint              # eslint clean
npm run build             # 259KB JS / 78KB gzip
npm audit                 # 0 vulnerabilities
```

---

## Round 4 — Content expansion: 15 → 33 schemes (this round)

- **DB:** new migration `20260907081303_seed-schemes-round-2.sql` (+18 rows); live table verified = **33 rows**
- **18 new, all verified** (official URL + benefit + helpline via web search): PM SVANidhi, e-Shram, PMMVY,
  PMSBY, PMJJBY, NFSA/PMGKAY, PMAY-U 2.0, PM-KUSUM, Jan Aushadhi (helpline corrected to 1800-180-8080),
  Vaya Vandana 70+, PM Surya Ghar, PM Internship, PMEGP, PM-SYM, Kanya Sumangala, UP old-age pension,
  UP widow pension, UP ration card
- **Matcher:** 3 new categories (`insurance/food/energy` — बीमा/राशन/ऊर्जा) + `food`/`energy` intents;
  keywords extended; **all 8 original demo tops unchanged** (verified pre/post via node script)
- **UI:** 3 new filter pills, 2 new demo chips (राशन, सोलर) — 10 demos total
- **Tests:** 69 → **82 pass**; lint 0/0; build 284KB JS / 84KB gzip
