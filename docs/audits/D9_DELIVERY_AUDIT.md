# M1: PUBLIC/LANDING-V2 → NEXT.JS MIGRATION AUDIT

> Date: 2026-03-23
> Mode: VERIFY_AND_PLAN — no implementation

---

## 1. FILE INVENTORY & CLASSIFICATION

### `public/landing-v2/` — 10 files total

| # | File | ~Lines | Classification | DOM? | Globals? |
|---|------|--------|---------------|------|----------|
| 1 | `CYB_Calc.js` | 13 | **Pure logic** | No | `bmiCat()` reads `UI.bmiCategories` |
| 2 | `CYB_Copy.js` | 264 | **Embedded data (i18n/copy)** | No | Declares global `COPY` |
| 3 | `CYB_Engine_STABLE.js` | 216 | **Pure logic** (scoring, routing, messaging) | No | Declares `ROUTES`, `ENGINE_MESSAGES`, etc. |
| 4 | `CYB_Psych.js` | ~800 | **Pure logic** (tone, fragments, personal letter) | No | Calls Engine functions via globals |
| 5 | `CYB_Steps.js` | 247 | **Embedded data + glue** (step defs, aliases) | No | Declares `UI`, `STEPS_MINI`, `STEPS_COMPLET`; reads `COPY`, `calcBMI` |
| 6 | `CYB_Render.js` | ~500 | **DOM-coupled UI logic** (HTML string renderers) | **YES** — `btn.textContent`, `btn.disabled`, inline `onclick`/`oninput`, `STATE.*` mutation | All previous + `STATE`, `dispatchRender` |
| 7 | `CYB_Recipes.js` | ~500 | **Embedded data + pure logic** (recipe DB + meal planner) | Partial — `formatDayPlanHtml`/`formatShoppingListHtml` return HTML strings | `calcBMR`, `calcTDEE` |
| 8 | `CYB_Training.js` | ~600 | **Embedded data + pure logic** (session DB + planner) | Partial — `formatTrainingPlanHtml` returns HTML strings | `getSafetyTags` |
| 9 | `CYB_Chestionar_Unified.html` | 537 | **Static HTML shell + browser runtime** | **YES** — full DOM runtime, localStorage, iframe postMessage, Stripe checkout, GA4/FB Pixel, keyboard/focus handlers | All JS files loaded via `<script>`, `STATE` object, `render()` dispatcher |
| 10 | `index.html` | 2615 | **Landing page shell** | **YES** — IntersectionObserver, scroll handler, iframe embed, FAQ accordion | GA4/FB Pixel inline, nav scroll |

---

## 2. DESTINATION MAP

| Source | Target | Format |
|--------|--------|--------|
| `CYB_Calc.js` | `lib/cyb-calc.ts` | ES module, typed exports |
| `CYB_Copy.js` | `lib/cyb-copy.ts` | ES module, typed const |
| `CYB_Engine_STABLE.js` | `lib/cyb-engine.ts` | ES module, typed exports |
| `CYB_Psych.js` | `lib/cyb-psych.ts` | ES module, typed exports |
| `CYB_Steps.js` | `lib/cyb-steps.ts` | ES module (data only; UI aliases removed) |
| `CYB_Render.js` | `components/questionnaire/*.tsx` (multiple) | React components — **FULL REWRITE** |
| `CYB_Recipes.js` | `lib/cyb-recipes.ts` (data+logic) + `components/report/meal-plan.tsx` (render) | Split: data→ES module, render→React |
| `CYB_Training.js` | `lib/cyb-training.ts` (data+logic) + `components/report/training-plan.tsx` (render) | Split: data→ES module, render→React |
| `CYB_Chestionar_Unified.html` | Replace `app/chestionar/page.tsx` content | React page — **FULL REWRITE** of runtime |
| `index.html` | `app/page.tsx` (new Next.js landing) | React SSR page — **FULL REWRITE** |

---

## 3. MIGRATION READINESS

### READY TO EXTRACT (as-is, wrap in TypeScript)

| File | Effort | Notes |
|------|--------|-------|
| `CYB_Calc.js` | **Trivial** | 6 pure functions. Fix `bmiCat()` to accept categories as param. Already duplicated in `lib/metabolic-report.ts` — consolidate. |
| `CYB_Engine_STABLE.js` | **Trivial** | 8 pure functions: `interpretSignals`, `resolveRoute`, `selectMessage`, `personalize`, `calcStressScore`, `calcHormonalScore`, `getMetabolicProfile`, `getSafetyTags`. Zero DOM. |
| `CYB_Copy.js` | **Trivial** | Pure data object. Add `export const`. Convert `function()` → arrow functions. |

### READY WITH SMALL ADAPTER

| File | Effort | Notes |
|------|--------|-------|
| `CYB_Psych.js` | **Small** | Pure logic. Change global function calls to imports. ~800 lines, all deterministic. |
| `CYB_Steps.js` | **Small** | Step defs are pure data. Remove `UI`/`R_UI`/`U_UI`/`emoMessages` aliases. `buildVisible`, `totalQ`, `curQ` are pure. |
| `CYB_Recipes.js` | **Small** | Recipe DB is pure data. Planning logic is pure. Only `format*Html` functions need separate React treatment. |
| `CYB_Training.js` | **Small** | Session DB is pure data. Planning logic is pure. Only `formatTrainingPlanHtml` needs React. |

### MUST BE REWRITTEN INTO REACT/NEXT

| File | Effort | Why |
|------|--------|-----|
| `CYB_Render.js` | **Large** | Every function returns HTML strings with inline `onclick`/`oninput` that mutate `STATE`. 14+ render functions → 14+ React components. |
| `CYB_Chestionar_Unified.html` | **Large** | Full browser runtime: `STATE` object, `goNext()`/`goBack()` navigation, `render()` dispatcher, `localStorage` persistence, iframe `postMessage`, Stripe checkout, GA4/FB tracking, keyboard handlers. → React hooks + state management. |
| `index.html` | **Large** | Full landing page: hero, 6 sections, testimonials, FAQ accordion, scroll animations, `IntersectionObserver`, iframe embedding. → Next.js SSR page. |

---

## 4. GLOBAL-SCRIPT DEPENDENCIES

### Load Order (strict — scripts depend on prior globals)
```
CYB_Copy.js      → declares COPY
CYB_Calc.js      → declares calcBMI, calcBMR, calcTDEE, bmiCat, bmiPercent, idealWeight, projWeeks
                    (bmiCat reads UI.bmiCategories — not yet available!)
CYB_Engine_STABLE.js → declares interpretSignals, resolveRoute, selectMessage, personalize,
                        calcStressScore, calcHormonalScore, getMetabolicProfile, getSafetyTags,
                        ROUTES, ENGINE_MESSAGES
CYB_Psych.js     → declares resolveToneProfile, buildPsychContext, composePsychContext,
                    buildFlowMessage, buildPersonalLetter, PSYCH_FRAGMENTS
                    (calls Engine functions via globals)
CYB_Steps.js     → declares UI, R_UI, U_UI, emoMessages, STEPS_MINI, STEPS_COMPLET,
                    buildVisible, totalQ, curQ, _transBlockMap
                    (reads COPY.*, calcBMI)
CYB_Render.js    → declares renderWelcome, renderTextInput, ..., renderCompletResults, dispatchRender
                    (reads ALL previous globals + STATE + DOM elements)
CYB_Recipes.js   → declares RECIPES, buildDayPlan, filterRecipes, shoppingList, format*Html
                    (reads calcBMR, calcTDEE)
CYB_Training.js  → declares SESSIONS, buildTrainingPlan, filterSessions, format*Html
                    (reads getSafetyTags)
```

### DOM Selectors (in runtime + CYB_Render.js)
- `document.getElementById('main')` — render target
- `document.getElementById('btnNext')` — next button
- `document.getElementById('btnBack')` — back button
- `document.getElementById('progBar')` — progress bar fill
- `document.getElementById('stepInfo')` — step counter text
- `document.getElementById('emo')` — emotional message div
- `document.querySelector('.main')` — scroll container
- `document.querySelectorAll('[data-pkg]')` — checkout buttons

### `localStorage`
- Key: `CYB_STATE`
- Shape: `{ profile, ans, phase, step, _miniEmailSent, _completEmailSent, _miniResultsTracked, _completResultsTracked, _v }`
- 4 functions: `saveState()`, `restoreState()`, `hasSavedState()`, `resetState()`

### iframe Messaging
- `CYB_Chestionar_Unified.html` → `window.parent.postMessage({type:'CYB_HEIGHT', height}, '*')` (on every render)
- `index.html` → `window.addEventListener('message', ...)` → resizes iframe height
- `cybCheckout()` → `window.top.location.href = url` (exits iframe for Stripe redirect)

### Inline Event Handlers (CYB_Render.js)
- `onclick="STATE.profile['name']=this.value;document.getElementById('btnNext').disabled=!this.value.trim();showEmo('name')"`
- `oninput="var v=parseInt(this.value);STATE.profile['age']=isNaN(v)?undefined:v;..."`
- All render functions embed `STATE.*` mutation directly in HTML strings

### Analytics (inline throughout)
- `gtag('event', 'mini_complete', {...})` — in `renderMiniResults`
- `fbq('track', 'Lead')` — in `renderMiniResults`
- `gtag('event', 'begin_checkout', {...})` — in `cybCheckout`
- `fbq('track', 'InitiateCheckout', {...})` — in `cybCheckout`
- ~10 more tracking calls scattered through navigation/render

---

## 5. PHASED MIGRATION

### Phase 1: Pure Modules (ZERO RISK)

Extract pure logic into `lib/` as TypeScript ES modules. No production impact.

| Action | Source → Target |
|--------|-----------------|
| 1a | `CYB_Calc.js` → `lib/cyb-calc.ts` (7 functions, fix `bmiCat` param) |
| 1b | `CYB_Copy.js` → `lib/cyb-copy.ts` (typed COPY export) |
| 1c | `CYB_Engine_STABLE.js` → `lib/cyb-engine.ts` (8 functions + ROUTES + ENGINE_MESSAGES) |
| 1d | `CYB_Psych.js` → `lib/cyb-psych.ts` (tone, fragments, letter builder — imports from engine) |
| 1e | `CYB_Steps.js` → `lib/cyb-steps.ts` (STEPS_MINI, STEPS_COMPLET, buildVisible, totalQ, curQ) |
| 1f | `CYB_Recipes.js` → `lib/cyb-recipes.ts` (RECIPES array + buildDayPlan/filterRecipes/shoppingList — no HTML formatters) |
| 1g | `CYB_Training.js` → `lib/cyb-training.ts` (SESSIONS array + buildTrainingPlan/filterSessions — no HTML formatter) |
| 1h | Consolidate `lib/metabolic-report.ts` to import from `lib/cyb-calc.ts` (remove duplicated formulas) |

**Validation**: Unit tests for all extracted functions.
**Blocker**: None.

### Phase 2: Questionnaire Runtime (CORE)

Rewrite the `CYB_Chestionar_Unified.html` runtime as a React app.

| Action | Detail |
|--------|--------|
| 2a | Create questionnaire state with `useReducer` or Zustand (replace `STATE` global) |
| 2b | Create `localStorage` persistence hook (replace `saveState`/`restoreState`) |
| 2c | Create navigation functions as reducer actions (replace `goNext`/`goBack`) |
| 2d | Create progress component (replace DOM progress bar) |
| 2e | Create analytics hook (replace inline `gtag`/`fbq`) |
| 2f | Create Stripe checkout function (replace `cybCheckout()` — no iframe escape needed) |

**CRITICAL DECISION**: Two divergent questionnaire systems exist:
- `app/questionnaire.data.ts` — 40 questions, single-phase, different IDs (q1-q40)
- `CYB_Steps.js` — MINI (8 steps) + COMPLET (30+ steps), two-phase flow, different IDs

These are **DIFFERENT questionnaires**. The landing-v2 version is the production one. The `/chestionar` version is older/alternative. Must decide: **replace `app/questionnaire.*` entirely**, or keep both.

**Blocker**: B1 (divergent questionnaires — see section 6).

### Phase 3: Renderers/Components (UI)

Rewrite `CYB_Render.js` as React components.

| New Component | From Function |
|---------------|---------------|
| `WelcomeStep.tsx` | `renderWelcome()` |
| `TextInputStep.tsx` | `renderTextInput()` |
| `NumberInputStep.tsx` | `renderNumberInput()` |
| `MeasuresStep.tsx` | `renderMeasures()` |
| `ActivityStep.tsx` | `renderActivity()` |
| `CardsStep.tsx` | `renderCards()` |
| `GdprEmailStep.tsx` | `renderGdprEmail()` |
| `SingleSelectStep.tsx` | `renderCompletSingle()` |
| `MultiSelectStep.tsx` | `renderCompletMulti()` |
| `ScaleStep.tsx` | `renderCompletScale()` |
| `TextareaStep.tsx` | `renderCompletTextarea()` |
| `TransitionStep.tsx` | `renderCompletTransition()` |
| `MiniResultsView.tsx` | `renderMiniResults()` (~200 lines, BMI gauge, blurred sections, upgrade plans) |
| `CompletResultsView.tsx` | `renderCompletResults()` (~200 lines, stress/hormonal scores, safety tags, Stripe packages, personal letter) |

**Blocker**: Results views are the hardest — complex layout with conditional rendering, inline calculations, and Stripe integration.

### Phase 4: Landing Page Integration

Rewrite `index.html` as Next.js page.

| Action | Detail |
|--------|--------|
| 4a | Create `app/page.tsx` — SSR landing with hero, sections, testimonials, FAQ |
| 4b | Remove iframe — embed questionnaire as React component directly |
| 4c | Extract CSS design tokens from inline `<style>` to shared module |
| 4d | Port scroll animations (IntersectionObserver → React intersection hook) |
| 4e | Move GA4/Meta Pixel to `layout.tsx` |
| 4f | Update `next.config.ts` — remove `/` → `/landing-v2/index.html` rewrite |

**Blocker**: B2 (routing — `next.config.ts` rewrites `/` to static HTML).

### Phase 5: Delete `public/landing-v2`

- Remove all 10 files
- Remove all rewrites from `next.config.ts`
- Verify routes: `/`, `/chestionar`, `/report`, `/checkout/success`
- Verify Stripe checkout flow end-to-end
- Verify analytics tracking

---

## 6. BLOCKERS

| # | Blocker | Severity | Detail |
|---|---------|----------|--------|
| **B1** | **Two divergent questionnaires** | **HIGH** | `app/questionnaire.data.ts` has 40 questions with IDs q1-q40, single-phase flow, different branching logic. `CYB_Steps.js` has MINI (8 steps) + COMPLET (30+ steps), two-phase flow, IDs like `name`, `age`, `q1`-`q21`. Different data shapes (`profile` vs `answers`). The landing-v2 version is production. The `/chestionar` version appears unused in production (not linked from landing). **Decision required before Phase 2.** |
| **B2** | **Routing via static rewrite** | **MEDIUM** | `next.config.ts` rewrites `/` → `/landing-v2/index.html`. The root URL serves static HTML, bypassing Next.js entirely. Must update to serve a Next.js page. |
| **B3** | **Inline event handlers** | **MEDIUM** | `CYB_Render.js` builds HTML strings with `onclick="STATE.profile[...]=..."`. Cannot be incrementally ported. All-or-nothing React rewrite per component. |
| **B4** | **innerHTML render pipeline** | **MEDIUM** | `main.innerHTML = dispatchRender(...)` replaces entire DOM on each step. No partial updates, no transition animations without full React rewrite. |
| **B5** | **iframe escape for Stripe** | **MEDIUM** | `cybCheckout()` uses `window.top.location.href` to break out of iframe. Once iframe is removed (Phase 4), this simplifies to `window.location.href`. But during transition, both paths must work. |
| **B6** | **localStorage schema** | **LOW** | `CYB_STATE` persists full questionnaire state. React version must use same schema during transition (users may have in-progress questionnaires). After migration, can evolve schema. |
| **B7** | **CSS duplication** | **LOW** | Both HTML files have 200+ lines of inline CSS with shared design tokens. No shared CSS module exists. Must extract before or during Phase 3/4. |
| **B8** | **Analytics coupling** | **LOW** | ~15 inline `gtag()`/`fbq()` calls throughout navigation and render code. Must extract to tracking utility. |

---

## 7. EXACT RECOMMENDED FIRST STEP

**Phase 1, Step 1a: Extract `CYB_Calc.js` → `lib/cyb-calc.ts`**

Why:
1. Smallest file (13 lines, 6 functions)
2. Zero DOM dependencies
3. Only one external ref (`UI.bmiCategories` in `bmiCat`) — parameterize it
4. Already duplicated in `lib/metabolic-report.ts` — consolidate
5. Enables unit tests before touching anything else
6. Zero risk to production

Concrete target:
```typescript
// lib/cyb-calc.ts
export interface BmiCategory { max: number; label: string; cls: string }

export function calcBMI(w: number, h: number): number
export function calcBMR(w: number, h: number, a: number): number
export function calcTDEE(bmr: number, act: number): number
export function bmiCat(bmi: number, categories: BmiCategory[]): { label: string; cls: string }
export function bmiPercent(bmi: number): number
export function idealWeight(h: number): string
export function projWeeks(current: number, target: number): number
```

Then update `lib/metabolic-report.ts` to `import { calcBMI, calcBMR, calcTDEE } from './cyb-calc'` and delete its duplicated formulas.

Follow with: `1b` (Copy) → `1c` (Engine) → `1d` (Psych) → `1e` (Steps) → `1f` (Recipes) → `1g` (Training) → `1h` (consolidate metabolic-report).
