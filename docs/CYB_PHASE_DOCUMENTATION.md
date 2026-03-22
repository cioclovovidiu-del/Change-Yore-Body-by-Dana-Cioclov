# CYB — Project Documentation: All Phases Complete

**Project:** Change Your Body (CYB) — Unified Questionnaire System
**Date:** March 2026
**Technical Lead:** Ovidiu
**Brand:** Dana Cioclov (@cioclov_dana)

---

# PHASE 1 — DATA (Questionnaire Extraction)

## Status: COMPLETE

## Scope
Extraction and audit of all questionnaire data from source HTML files.

## Deliverables Completed

### MINI Extraction (7 input fields)
- **Source:** `CYB_Chestionar_MINI.html`
- **Fields:** name (text), age (number), measures (dual: height+weight), activity (single select), goal (cards), moment (cards), email (email)
- **Copy source:** `CYB_Copy_MINI.js` — title, sub, label, ph for all 7 fields
- **Steps source:** `CYB_Steps_MINI.js` — STEPS array, emoMessages, UI aliases

### COMPLET Extraction (23 input fields + 3 conditional)
- **Source:** `CYB_Chestionar_COMPLET.html` (inline `<script>`)
- **Fields:** q1–q21, q4b, q9b, q13b
- **Types:** single (15), multi (6), scale (2), textarea (1)
- **Conditional fields:**
  - q4b (postpartum only, moment=0)
  - q9b (burnout only, moment=3)
  - q13b (hormonal only, moment=2)
- **Copy source:** `CYB_Copy_COMPLET.js` — title, sub, note for all 23 fields + 5 transitions
- **Steps source:** Inline Q array in COMPLET HTML (no separate steps file existed)

### Structural Comparison
- MINI uses semantic ids (name, age, goal...), COMPLET uses numbered ids (q1, q2...)
- MINI uses unique types (text, number, measures, activity, cards, email), COMPLET uses (single, multi, scale, textarea)
- Zero id overlap between MINI and COMPLET
- COMPLET depends on MINI seed data via `_moment` convention in showIf

### Source-of-Truth Map
| Data | Source File |
|------|------------|
| MINI field structure | `CYB_Steps_MINI.js` |
| MINI copy | `CYB_Copy_MINI.js` |
| COMPLET field structure | `CYB_Chestionar_COMPLET.html` inline script |
| COMPLET copy | `CYB_Copy_COMPLET.js` |

---

# PHASE 2 — ENGINE (Logic / Tagging / Scoring)

## Status: COMPLETE

## Scope
Extraction, deduplication, and canonicalization of all engine logic into a single source file.

## Deliverables Completed

### Engine Audit
- Identified duplicated engine code across 3 files:
  - `CYB_Engine_STABLE.js` (canonical, 14 messages)
  - `CYB_Chestionar_COMPLET.html` inline (duplicate + extended, 20 messages)
  - `CYB_Chestionar_MINI.html` (loads engine via script src)

### Canonical Engine (`CYB_Engine_STABLE.js`)
**Existing functions (kept):**
- `interpretSignals(mini, ans)` — 7 signal dimensions
- `resolveRoute(mini, signals)` — 6 routes + signal-detected burnout override
- `selectMessage(opts)` — upgraded with `block` parameter for transition matching
- `personalize(text, name)` — `[Prenume]` replacement

**Functions merged from COMPLET:**
- `calcStressScore(ans)` — refactored to pure function
- `calcHormonalScore(mini, ans)` — refactored to pure function
- `getMetabolicProfile(mini, ans, profiles, fallback)` — refactored to pure function
- `getSafetyTags(mini, ans)` — refactored to pure function

**Messages merged:**
- 14 original (VALIDATION + RESULTS per route) with `block:null` added
- 6 TRANSITION messages from COMPLET with block keys (despre_tine, stil_viata, sanatate, alimentatie, motivatie, final)
- Total: 20 ENGINE_MESSAGES + 1 SAFE_MSG fallback

### COMPLET HTML Cleanup
- Removed all inlined engine code (interpretSignals, resolveRoute, selectMessage, personalize, scoring functions, safety tags, ENGINE_MESSAGES, SAFE_MSG, ROUTES, MOMENT_TO_ROUTE)
- Added `<script src="CYB_Calc.js">` and `<script src="CYB_Engine_STABLE.js">` to load order
- Updated all callers to use explicit parameters instead of closure variables
- Replaced inline BMR/TDEE formulas with `calcBMR()`/`calcTDEE()` from Calc module

### Calc Module (`CYB_Calc.js`)
**Unchanged — 7 pure functions:**
- `calcBMI(w, h)`
- `calcBMR(w, h, a)`
- `calcTDEE(bmr, act)`
- `bmiCat(bmi)` — depends on `UI.bmiCategories` alias
- `bmiPercent(bmi)`
- `idealWeight(h)`
- `projWeeks(current, target)`

---

# PHASE 3 — MERGE (Unification)

## Status: COMPLETE

## Scope
Merge MINI + COMPLET into one single-page unified questionnaire with shared runtime.

## Deliverables Completed

### Unified Copy (`CYB_Copy.js`)
**Namespace structure:**
- `COPY.route` — shared route labels (6 routes)
- `COPY.shared` — bmiCategories, goalNames, gaugeLabels
- `COPY.ui` — shared buttons (start, next, seeResults)
- `COPY.mini.questions` — 7 MINI question definitions
- `COPY.mini.emotional` — 6 emotional message functions + fallback
- `COPY.mini.ui` — welcome, measures, emailPreResults, results, upgrade
- `COPY.complet.questions` — 23 COMPLET question definitions
- `COPY.complet.transitions` — 5 transition definitions
- `COPY.complet.ui` — textareaPlaceholder, miniResultLabel, results
- `COPY.metabolicProfiles` — 6 profile definitions
- `COPY.fallback` — metabolicProfile fallback
- `COPY.q(id)` / `COPY.t(id)` — accessors for COMPLET

### Unified Steps (`CYB_Steps.js`)
**Exports:**
- `UI` — backward-compatible alias object
- `R_UI`, `U_UI` — MINI results/upgrade aliases
- `emoMessages` — 6 MINI emotional message handlers
- `STEPS_MINI` — 10 entries (welcome, name, age, measures, activity, goal, moment, gdpr, email, mini_results)
- `STEPS_COMPLET` — 30 entries (5 transitions + 21 questions + 3 conditional + complet_results)
- `buildVisible(profile, ans)` — filters COMPLET steps by showIf
- `totalQ(list)`, `curQ(list, index)` — question counters
- `_transBlockMap` — transition-to-block mapping

**showIf normalization:**
- `_moment` convention replaced with `profile.moment`
- `buildVisible` evaluates `field === 'profile.moment'` → reads `profile.moment`

### Unified HTML (`CYB_Chestionar_Unified.html`)
**State model:**
```
STATE = { profile:{}, ans:{}, phase:'MINI', step:0 }
```

**Render dispatch — 14 step types:**
- MINI: welcome, text, number, measures, activity, cards, email, gdpr, mini_results
- COMPLET: transition, single, multi, scale, textarea, complet_results

**Navigation:**
- `goNext()` / `goBack()` — operate on active steps array
- `startComplet()` — phase transition MINI → COMPLET
- Back button hidden on step 0 and results screens
- COMPLET step 0 cannot go back to MINI

**Auto-advance delays:**
- Cards (MINI): 400ms
- Single (COMPLET): 350ms
- Scale (COMPLET): 300ms

### Production Cutover
- `index.html` iframe src updated to `CYB_Chestionar_Unified.html`
- `README.md` updated with canonical/legacy file tables + rollback instructions
- Legacy files retained untouched for rollback
- Git tag `v1-live-stable` available for full rollback

---

# PHASE 4 — FLOW (User Journey)

## Status: COMPLETE

## Scope
Complete the user journey from questionnaire to conversion with production-ready features.

## Deliverables Completed

### 1. Iframe Height Sync
**Files modified:** `CYB_Chestionar_Unified.html`, `index.html`

- `postHeight()` — sends `{type:'CYB_HEIGHT', height}` via `postMessage` after every render (50ms delay)
- Parent listener in `index.html` — receives message, sets iframe height
- Standalone safe: `window.parent !== window` guard + try/catch
- CSS fallback: `min-height:100vh` preserved on iframe

### 2. COMPLET Final Results CTA
**Files modified:** `CYB_Copy.js`, `CYB_Chestionar_Unified.html`

**Copy keys added to `COPY.complet.ui.results`:**
- `ctaHeading` — "Ești pregătită pentru următorul pas?"
- `ctaBody` — "Intră în grupul nostru de WhatsApp..."
- `ctaButton` — "Intră în grupul CYB pe WhatsApp →"
- `ctaWhatsApp` — WhatsApp group link

**Render:** Gold button after final quote, opens WhatsApp in new tab.

### 3. MINI Results CTA
**Files modified:** `CYB_Copy.js`, `CYB_Chestionar_Unified.html`

**Copy keys added to `COPY.mini.ui.upgrade`:**
- `ctaBody` — "Între timp, intră gratuit în grupul nostru de WhatsApp..."
- `ctaButton` — "Intră în grupul CYB gratuit →"
- `ctaWhatsApp` — WhatsApp group link

**Render:** Teal button + supporting text inside upgrade box, before existing gold "Continuă" button.

### 4. GDPR Consent Step
**Files modified:** `CYB_Copy.js`, `CYB_Steps.js`, `CYB_Chestionar_Unified.html`

**Copy keys added to `COPY.mini.questions`:**
- `gdpr.label` — "Consimțământ"
- `gdpr.title` — "Înainte de rezultate"
- `gdpr.sub` — "Pentru a-ți calcula profilul..."
- `gdpr.consent` — Full consent text

**Step:** Inserted at STEPS_MINI index 7 (after moment, before email).
**Type:** `gdpr` — checkbox using `.chk` CSS, toggles `STATE.profile.gdpr`.
**Validation:** Next disabled until `STATE.profile.gdpr === true`.
**STEPS_MINI total:** 10 entries (was 9).

### 5. localStorage Persistence
**Files modified:** `CYB_Chestionar_Unified.html`

**Storage key:** `CYB_STATE`

**Functions:**
- `saveState()` — writes `JSON.stringify(STATE)` after every render
- `restoreState()` — reads/validates/restores at init, clamps step to bounds
- Validation: checks phase string, step number, profile object, ans object
- Wrapped in try/catch — disabled storage doesn't break runtime

### 6. Reset/Start-Over Control
**Files modified:** `CYB_Copy.js`, `CYB_Chestionar_Unified.html`

**Copy key:** `COPY.ui.resetButton` — "Începe din nou"

**Functions:**
- `hasSavedState()` — checks for meaningful progress (phase COMPLET, step > 0, profile non-empty, ans non-empty)
- `resetState()` — clears localStorage, resets STATE to defaults, re-renders welcome

**Visibility:** Subtle underlined link (0.75rem, 30% opacity) on welcome, mini_results, complet_results — only when meaningful saved progress exists.

### 7. MINI Email Notification
**Files modified:** `CYB_Chestionar_Unified.html`

**Trigger:** Inside `startComplet()`, before phase transition.
**Payload:** `{type:'mini', profile: STATE.profile}`
**Guards:** `if(STATE.profile.gdpr)` — GDPR-gated.
**Safety:** Fire-and-forget, try/catch + .catch, non-blocking.
**Endpoint:** `/api/send-email`

### 8. COMPLET Email Notification
**Files modified:** `CYB_Chestionar_Unified.html`

**Trigger:** Inside `complet_results` render block, first render only.
**Payload:** `{type:'complet', profile: STATE.profile, ans: STATE.ans}`
**Guards:** `if(STATE.profile.gdpr && !STATE._completEmailSent)` — GDPR + dedup.
**Dedup flag:** `STATE._completEmailSent` — persists via saveState, cleared on resetState.
**Safety:** Fire-and-forget, try/catch + .catch, non-blocking.
**Endpoint:** `/api/send-email`

---

# PHASE 6 — DEPLOY (Production Integration Audit)

## Status: AUDITED — Ready for implementation

## Production Integration Map

### Current Live Architecture
- **Domain:** changeyourbody.ro
- **Stack:** Next.js 16 + React 19 + TypeScript + Tailwind 4 + Resend
- **Deploy:** GitHub → Vercel auto-deploy
- **Root `/`:** `app/page.tsx` (React landing page, links to `/chestionar`)
- **`/chestionar`:** V1 questionnaire (40Q, existing)
- **`/api/send-email`:** Resend API route (existing)

### Unified System File Set (6 canonical files)

| File | Size | Purpose |
|------|------|---------|
| `index.html` | ~74KB | Landing page V2 (standalone, all CSS/JS inline) |
| `CYB_Chestionar_Unified.html` | ~44KB | Unified questionnaire (single page) |
| `CYB_Copy.js` | ~20KB | Unified copy/text module |
| `CYB_Steps.js` | ~12KB | Unified steps/wiring module |
| `CYB_Calc.js` | ~1KB | Shared math functions (unchanged) |
| `CYB_Engine_STABLE.js` | ~16KB | Canonical engine (signals, routes, messages, scoring, tags) |

### Deploy Path
1. Copy 6 files to `public/landing-v2/` in repo
2. Update `app/api/send-email/route.ts` to accept `{type:'mini', profile}` and `{type:'complet', profile, ans}` payload shapes
3. Git push to main → Vercel auto-deploy
4. Verify at `changeyourbody.ro/landing-v2/`

### Email API Compatibility
- Unified HTML sends to `/api/send-email` (relative path)
- From iframe at `/landing-v2/CYB_Chestionar_Unified.html`, resolves to `changeyourbody.ro/api/send-email` — same domain, correct
- Existing route.ts must be updated to handle new payload types
- Fire-and-forget ensures mismatch doesn't break UX

### Rollback
- Single-line revert: change iframe src back to `CYB_Chestionar_MINI.html`
- Legacy files kept in directory
- Git tag `v1-live-stable` for full rollback

---

# CANONICAL FILE INVENTORY

## Active (Production)

| File | Phase Created | Last Modified |
|------|--------------|---------------|
| `CYB_Copy.js` | Phase 3 | Phase 4 (CTAs, GDPR copy, reset copy) |
| `CYB_Steps.js` | Phase 3 | Phase 4 (GDPR step) |
| `CYB_Chestionar_Unified.html` | Phase 3 | Phase 4 (all features) |
| `CYB_Engine_STABLE.js` | Phase 2 | Phase 2 (canonical extraction) |
| `CYB_Calc.js` | Original | Never modified |
| `index.html` | Original V2 | Phase 4 (iframe sync listener, unified src) |
| `README.md` | Original | Phase 3 (cutover documentation) |

## Legacy (Retired, Rollback Only)

| File | Replaced By |
|------|------------|
| `CYB_Chestionar_MINI.html` | `CYB_Chestionar_Unified.html` |
| `CYB_Chestionar_COMPLET.html` | `CYB_Chestionar_Unified.html` |
| `CYB_Copy_MINI.js` | `CYB_Copy.js` |
| `CYB_Copy_COMPLET.js` | `CYB_Copy.js` |
| `CYB_Steps_MINI.js` | `CYB_Steps.js` |

---

# OPEN ITEMS

## Business Decisions Pending
- Upgrade plans pricing in MINI results (COPY has old 15€–399€ range, latest spec says 199€/299€/499€)
- WhatsApp group rules checkbox before WhatsApp CTA links
- GDPR decline branch (currently user is stuck if they don't accept)

## Technical Gaps
- `/api/send-email` route must be updated for new payload shapes
- No analytics/tracking events
- No "return to landing" link from results screens
- No loading indicator after email send

## Not Started
- Phase 5 UI (landing page React integration) — skipped, standalone HTML approach used instead
- Payment/checkout integration
- Franchise system infrastructure
