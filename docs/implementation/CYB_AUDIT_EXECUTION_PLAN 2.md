# CYB AUDIT EXECUTION PLAN

**Source:** 3-Stage Full Project Audit (March 2026)
**Scope:** Entire CYB system — landing, questionnaire, engine, funnel, monetization
**Status:** Execution-ready

---

## 1. EXECUTIVE DIAGNOSIS

- The MINI → COMPLET funnel is live and functional. All 6 canonical files deploy correctly via Vercel.
- The engine (signals, routes, messages) is the strongest technical asset — 7 signal dimensions, 6 routes, burnout signal override. Solid foundation but running at ~30% capacity.
- **Biggest weakness:** Entire monetization depends on WhatsApp. Zero digital checkout. Zero payment integration. The funnel ends in a manual channel.
- **Second weakness:** 20 fixed messages total. Users on the same route see identical messages. Personalization is shallow — template variables, not narrative.
- **Third weakness:** render() is a 270+ line monolith. All new modules (psych, recipes, training) must go through it. Adding anything is risky without splitting it first.
- Scoring functions (stress, hormonal, metabolic profile, safety tags) exist duplicated — inline in HTML AND referenced as Engine canonical. Single source of truth is broken.
- Prices in COPY are outdated (not 199€/299€/499€). GDPR decline blocks the user completely. Both are live bugs.
- Zero backend persistence. Every lead exists only in localStorage + fire-and-forget email. If email API fails silently, leads are lost with no trace.
- Content assets exist (video library, training plans, shopping guide, recipes) but are not structured as machine-readable data.
- Landing page (index.html) and iframe communication (postMessage height sync) are stable and should not be touched.

---

## 2. PRIORITY FRAMEWORK

### CRITICAL — Blocks revenue, data collection, or safe development

| # | Item | Source |
|---|------|--------|
| C1 | Verify /api/send-email actually works with new payload shapes (mini + complet) | Stage 1 — Audit |
| C2 | Fix GDPR decline branch — user is stuck if they refuse | Stage 1 — Audit |
| C3 | Update prices in COPY to 199€/299€/499€ | Stage 1 — Audit |
| C4 | Move scoring functions from inline HTML to CYB_Engine_STABLE.js | Stage 3 — Modularity |
| C5 | Split render() into per-type renderer functions | Stage 3 — Modularity |

### HIGH — Strongly improves conversion, value perception, or unlocks next phase

| # | Item | Source |
|---|------|--------|
| H1 | Build CYB_Psych.js — Tone Resolver + Narrative Builder (flow messages) | Stage 2 — Psych Layer |
| H2 | Build Personal Letter (5-section narrative on COMPLET results) | Stage 2 — Psych Layer |
| H3 | Build CYB_Recipes.js — Recipe Database + Meal Planner | Stage 2 — Recipe Generator |
| H4 | Build CYB_Training.js — Exercise Database + Workout Builder | Stage 2 — Training Generator |
| H5 | Add missing questionnaire fields (allergies, cooking time, refused foods) | Stage 2 — Recipe Generator |
| H6 | Integrate recipe + training preview on COMPLET results screen | Stage 2 — Recipe + Training |

### MEDIUM — Important optimization, maintainability, UX

| # | Item | Source |
|---|------|--------|
| M1 | Fix bmiCat() dependency on UI.bmiCategories — make Calc independent | Stage 3 — Modularity |
| M2 | Add WhatsApp group rules checkbox before CTA | Stage 1 — Audit |
| M3 | MINI results screen — reduce information overload, prioritize narrative | Stage 1 — UX |
| M4 | COMPLET results screen — add narrative focus before data dump | Stage 1 — UX |
| M5 | Add behavioral tracking (time per question, back-navigation patterns) | Stage 1 — Missing Layers |
| M6 | Template system to replace HTML string concatenation | Stage 3 — Modularity |

### LOW — Useful later, not urgent now

| # | Item | Source |
|---|------|--------|
| L1 | Stripe Checkout integration (3 packages) | Stage 3 — Roadmap Step 3 |
| L2 | Backend persistence (Supabase/Firebase) | Stage 3 — Roadmap Step 3 |
| L3 | PDF report generation (personalized downloadable) | Stage 3 — Roadmap Step 3 |
| L4 | Email follow-up automation (24h reminders via MailerLite) | Stage 3 — Roadmap Step 3 |
| L5 | AI-augmented letter generation (API call per user) | Stage 2 — Psych Layer Phase 2 |
| L6 | Training progression system (12-week auto-adjustment) | Stage 2 — Training |
| L7 | Franchise system infrastructure | Memory — long-term vision |
| L8 | Multi-language support | Stage 3 — Roadmap backlog |

---

## 3. MASTER EXECUTION ORDER

**1. Verify email API endpoint**
- Why now: If this is broken, every lead since deployment is lost silently
- Depends on: Nothing
- Expected impact: Confirms or fixes core data collection
- Files affected: `/api/send-email/route.ts`

**2. Fix GDPR decline branch**
- Why now: Users who decline are stuck — broken UX, potential legal issue
- Depends on: Nothing
- Expected impact: Unblocks all users, enables GDPR-declined flow without email
- Files affected: `CYB_Chestionar_Unified.html`

**3. Update prices in COPY**
- Why now: Wrong prices displayed to users on live site
- Depends on: Nothing
- Expected impact: Correct commercial information
- Files affected: `CYB_Copy.js`

**4. Move scoring functions to Engine**
- Why now: Pre-requisite for Psych Layer and any new module. Eliminates duplication risk.
- Depends on: Nothing
- Expected impact: Single source of truth for all calculations
- Files affected: `CYB_Engine_STABLE.js`, `CYB_Chestionar_Unified.html`

**5. Split render() into per-type functions**
- Why now: Pre-requisite for adding any new section to results screens safely
- Depends on: Task 4 (scoring in Engine must be stable first)
- Expected impact: Each renderer independent, testable, extendable
- Files affected: `CYB_Chestionar_Unified.html`

**6. Build CYB_Psych.js — Tone Resolver + Narrative Builder**
- Why now: Highest-leverage conversion improvement. Differentiator.
- Depends on: Task 4 (needs access to scoring outputs), Task 5 (needs split renderers to integrate)
- Expected impact: Flow messages become dynamic, contextual, anti-repetitive
- Files affected: New file `CYB_Psych.js`, `CYB_Chestionar_Unified.html` (script load + render calls)

**7. Build Personal Letter**
- Why now: The single biggest conversion moment — "she understood me"
- Depends on: Task 6 (Psych module provides composeLetter)
- Expected impact: COMPLET results → WhatsApp conversion increase
- Files affected: `CYB_Psych.js` (composeLetter function), `CYB_Chestionar_Unified.html` (complet_results renderer)

**8. Add questionnaire fields for recipes**
- Why now: Data needed before recipe planner can work
- Depends on: Task 5 (render split makes adding steps safe)
- Expected impact: Enables personalized meal planning
- Files affected: `CYB_Copy.js`, `CYB_Steps.js`, `CYB_Chestionar_Unified.html`

**9. Build CYB_Recipes.js**
- Why now: Tangible value demonstration — user sees real food, not just numbers
- Depends on: Task 8 (needs allergy/preference data), Daniela (60-80 recipes as content)
- Expected impact: "Ziua ta model" on results screen
- Files affected: New file `CYB_Recipes.js`, `CYB_Chestionar_Unified.html`

**10. Build CYB_Training.js**
- Why now: Completes the value trifecta (psych + nutrition + training)
- Depends on: Task 5 (render split), Daniela (80-100 exercises as content)
- Expected impact: "Antrenamentul tău — Ziua 1" preview on results screen
- Files affected: New file `CYB_Training.js`, `CYB_Chestionar_Unified.html`

**11. Integrate recipe + training on COMPLET results**
- Why now: Assembled value display — letter + meals + workout = complete offer
- Depends on: Tasks 7, 9, 10
- Expected impact: Results screen becomes a complete personalized preview
- Files affected: `CYB_Chestionar_Unified.html` (complet_results renderer)

**12. Stripe Checkout integration**
- Why now: First digital payment path — removes WhatsApp bottleneck
- Depends on: Tasks 7, 9, 10 (value must exist before asking for money)
- Expected impact: Revenue without manual WhatsApp interaction
- Files affected: New checkout page/component, Stripe account setup

**13. Backend persistence**
- Why now: Required for paid user tracking, PDF delivery, follow-up
- Depends on: Task 12 (payment needs user records)
- Expected impact: Every lead and payment tracked permanently
- Files affected: Database setup, API routes

**14. PDF report generation**
- Why now: Deliverable for paid users — letter + plan + training as document
- Depends on: Tasks 7, 9, 10, 13
- Expected impact: Tangible paid product delivery
- Files affected: New generation logic, backend route

**15. Email follow-up automation**
- Why now: Recovers users who didn't convert on first visit
- Depends on: Task 13 (needs user data stored)
- Expected impact: Second-chance conversion
- Files affected: MailerLite integration, email templates

---

## 4. STAGE-BY-STAGE WORK PLAN

### STAGE A — FOUNDATION / MUST DO FIRST

**A1. Verify /api/send-email endpoint**
- Objective: Confirm email notifications work with unified questionnaire payload
- Exact action: Test POST to /api/send-email with `{type:'mini', profile:{...}}` and `{type:'complet', profile:{...}, ans:{...}}`. Fix route.ts if it rejects new shapes.
- Why it matters: Silent failure = zero leads captured
- Files affected: `app/api/send-email/route.ts`
- Estimated effort: Small
- Risk if skipped: Every lead since deploy may be lost

**A2. Fix GDPR decline branch**
- Objective: Allow users who decline GDPR to continue without email features
- Exact action: If `STATE.profile.gdpr === false`, skip email step, proceed directly to results. No email sent, no email collected.
- Why it matters: Users are currently stuck — cannot proceed
- Files affected: `CYB_Chestionar_Unified.html` (navigation logic in goNext)
- Estimated effort: Small
- Risk if skipped: Blocked users, potential GDPR complaint

**A3. Update prices in COPY**
- Objective: Display correct prices: 3 săpt = 199€ (de la 399€), 6 săpt = 299€ (de la 599€), 12 săpt = 499€ (de la 799€)
- Exact action: Update `COPY.mini.ui.upgrade.plans` array with new prices and strikethrough values
- Why it matters: Wrong commercial information on live site
- Files affected: `CYB_Copy.js`
- Estimated effort: Small
- Risk if skipped: User confusion, trust damage

**A4. Move scoring functions to Engine**
- Objective: Single source of truth for calcStressScore, calcHormonalScore, getMetabolicProfile, getSafetyTags
- Exact action: Copy functions from inline script in CYB_Chestionar_Unified.html to CYB_Engine_STABLE.js. Delete inline duplicates. Test: COMPLET results screen must render identically.
- Why it matters: Duplicated logic = divergence risk. All new modules need these functions from one place.
- Files affected: `CYB_Engine_STABLE.js`, `CYB_Chestionar_Unified.html`
- Estimated effort: Small–Medium
- Risk if skipped: Psych Layer, Recipe, and Training generators cannot safely access scoring data

**A5. Split render() into per-type renderers**
- Objective: Replace monolithic render() with dispatch to 14 independent render functions
- Exact action: Create RENDERERS object mapping step types to functions. render() becomes: get active step → call RENDERERS[step.type](step). Each function handles its own HTML generation.
- Why it matters: Every new module must add content to results screens. Without split, each addition risks breaking 270+ lines of coupled code.
- Files affected: `CYB_Chestionar_Unified.html`
- Estimated effort: Medium
- Risk if skipped: Adding Psych Layer, Recipes, or Training becomes high-risk

---

### STAGE B — VALUE EXPANSION

**B1. Build CYB_Psych.js — Tone Resolver + Narrative Builder**
- Objective: Replace fixed 20-message system with dynamic, context-aware communication
- Exact action: Create CYB_Psych.js with: `toneResolve(signals)` → tone profile (3 axes: vulnerability, capacity, motivation style). `buildFlowMessage(context, profile, signals, answers)` → constructed message from fragments. 50-80 fragments with conditions, tone filters, 2-3 variants each.
- Why it matters: Personalization depth is the core differentiator. Fixed messages erode with scale.
- Files affected: New `CYB_Psych.js`, `CYB_Chestionar_Unified.html` (script load, transition + results renderers)
- Estimated effort: Large (3-5 days)
- Risk if skipped: Users on same route get identical experience. "Personalization" promise is hollow.

**B2. Build Personal Letter (composeLetter)**
- Objective: Generate 250-400 word personalized narrative on COMPLET results screen
- Exact action: Add `composeLetter(profile, signals, route, scores, metabolicProfile, safetyTags, answers, completionData)` to CYB_Psych.js. 5 sections: Opening (validation), "Ce am descoperit" (interpretation), "Ce înseamnă" (real-life translation), "Ce facem" (personalized plan narrative), Closing (emotional promise). Render before numeric data on complet_results.
- Why it matters: This is the conversion moment. The letter makes the user feel understood.
- Files affected: `CYB_Psych.js`, complet_results renderer
- Estimated effort: Medium-Large (2-3 days)
- Risk if skipped: Results screen remains data dump without narrative. Conversion stays low.

**B3. Add questionnaire fields for recipe personalization**
- Objective: Collect allergy/intolerance, cooking time, refused foods data
- Exact action: Add 2-3 questions in COMPLET Alimentație block (after q19): allergies/intolerances (multi), cooking time available (single), foods refused (optional textarea). Add to CYB_Copy.js, CYB_Steps.js.
- Why it matters: Without this data, meal planner cannot exclude unsafe foods
- Files affected: `CYB_Copy.js`, `CYB_Steps.js`, `CYB_Chestionar_Unified.html`
- Estimated effort: Small
- Risk if skipped: Recipe generator cannot handle allergies/restrictions

**B4. Build CYB_Recipes.js — Database + Meal Planner**
- Objective: Serve personalized daily meal plan with concrete recipes
- Exact action: Create CYB_Recipes.js with: recipe database (60-80 recipes as JSON — name, ingredients, instructions, macros, tags, time, budget, style), `mealPlan(tdee, macros, preferences, restrictions)` → selects 3-5 daily recipes matching targets, `shoppingList(plan)` → ingredient list.
- Why it matters: Tangible proof of competence. User sees real food, not just numbers.
- Files affected: New `CYB_Recipes.js`, complet_results renderer
- Estimated effort: Large (5-7 days, depends on Daniela providing recipes)
- Risk if skipped: Funnel offers analysis without actionable output

**B5. Build CYB_Training.js — Database + Workout Builder**
- Objective: Serve personalized weekly training plan with exercises
- Exact action: Create CYB_Training.js with: exercise database (80-100 exercises — name_ro, name_en, equipment, level, exclude_if, modify_if, instructions, video_id), `buildWorkout(profile, answers, equipment, limitations)` → 3-5 days/week, 4-6 exercises/day with sets/reps/rest per level. Exclusion system from q12 limitations.
- Why it matters: Completes the value package (psych + nutrition + training)
- Files affected: New `CYB_Training.js`, complet_results renderer
- Estimated effort: Large (5-7 days, depends on Daniela providing exercises)
- Risk if skipped: Users get food plan without training plan — incomplete offer

**B6. Integrate recipe + training preview on results**
- Objective: Display "Ziua ta model" (1 day meals) + "Antrenamentul tău — Ziua 1" on COMPLET results
- Exact action: Add sections to complet_results renderer after Personal Letter and before Upgrade CTA. Full preview of Day 1. Remaining days blurred as teaser.
- Why it matters: Shows what the paid program delivers
- Files affected: complet_results renderer in `CYB_Chestionar_Unified.html`
- Estimated effort: Medium
- Risk if skipped: Recipe and training modules exist but user never sees them

---

### STAGE C — MONETIZATION / INFRASTRUCTURE

**C1. Stripe Checkout integration**
- Objective: Enable direct purchase from results screen (3 packages: 199€/299€/499€)
- Exact action: Add Stripe Checkout Session. "Cumpără" button on COMPLET results upgrade box. WhatsApp remains as alternative ("Preferi să vorbești cu noi mai întâi?"). Success page with next steps.
- Why it matters: Removes WhatsApp bottleneck. Users can buy at any hour.
- Files affected: New checkout page/component, Stripe account, API route
- Estimated effort: Medium-Large
- Risk if skipped: Revenue depends 100% on manual WhatsApp conversion

**C2. Backend persistence (DB)**
- Objective: Store all user profiles, answers, results, payment status permanently
- Exact action: Set up Supabase or Firebase. Generate user ID at first completion (stored in localStorage). Save profile + answers + results + scores on COMPLET completion. Link user ID to payment on Stripe webhook.
- Why it matters: Without DB, users are ephemeral. Cannot deliver paid content, cannot track, cannot follow up.
- Files affected: Database setup, new API routes, `CYB_Chestionar_Unified.html` (save calls)
- Estimated effort: Large
- Risk if skipped: No paid user management, no data retention beyond email

**C3. PDF report generation**
- Objective: Downloadable personalized report for paid users
- Exact action: Generate PDF containing: Personal Letter + metabolic data + daily meal plan + Day 1 training. Free tier: first 2 pages only. Paid tier: full document.
- Why it matters: Physical deliverable increases perceived value of purchase
- Files affected: New generation logic (jsPDF/html2pdf or server-side), backend route
- Estimated effort: Medium-Large
- Risk if skipped: Paid users receive nothing downloadable

**C4. Email follow-up automation**
- Objective: Recover non-converting users via automated email sequences
- Exact action: 2 triggers: (1) User completes COMPLET but doesn't buy → 24h email with Personal Letter excerpt + reminder. (2) User completes MINI but doesn't continue COMPLET → 24h email with teaser. Via MailerLite.
- Why it matters: Most users won't convert on first visit. Follow-up is standard conversion practice.
- Files affected: MailerLite integration, 2 email templates, trigger logic
- Estimated effort: Medium
- Risk if skipped: One-shot funnel — no second chance at conversion

---

## 5. QUICK WINS

| # | Task | Effort | Impact |
|---|------|--------|--------|
| QW1 | Update prices in CYB_Copy.js (199€/299€/499€) | 30 min | Correct commercial info on live site |
| QW2 | Fix GDPR decline branch (allow skip email step) | 30-45 min | Unblock stuck users |
| QW3 | Fix bmiCat() dependency — pass categories as parameter or inline in Calc | 15 min | Clean module boundary |
| QW4 | Add WhatsApp group rules checkbox before CTA links | 30-45 min | UX completeness |
| QW5 | Verify /api/send-email works with new payloads | 30 min | Confirm data collection is active |

---

## 6. DO NOT TOUCH

| Module/File | Reason |
|-------------|--------|
| `CYB_Engine_STABLE.js` — interpretSignals, resolveRoute, selectMessage logic | Validated, working. Only ADD to this file (scoring functions), do not modify existing functions. |
| `CYB_Calc.js` — calcBMI, calcBMR, calcTDEE, idealWeight, projWeeks | Pure functions, correct, no reason to change. |
| `CYB_Copy.js` — structure and namespace | Only UPDATE values (prices, new questions). Do not restructure the COPY object. |
| `CYB_Steps.js` — STEPS_MINI array structure | Working, validated. Only ADD new steps to STEPS_COMPLET. Do not reorder MINI steps. |
| `index.html` — landing page | Stable, deployed, working. Do not modify layout or content unless explicitly requested. |
| iframe postMessage height sync | Working. Do not modify the communication protocol. |
| localStorage persistence (saveState/restoreState/resetState) | Working. Only extend if new state fields are added. |
| Legacy files (CYB_Chestionar_MINI.html, CYB_Chestionar_COMPLET.html, CYB_Copy_MINI.js, CYB_Copy_COMPLET.js, CYB_Steps_MINI.js) | Retired. Kept for rollback only. Never modify. |
| Git tag `v1-live-stable` | Rollback point. Never delete. |

---

## 7. DEPENDENCY MAP

```
A1 (verify email) → standalone, no dependencies
A2 (GDPR fix) → standalone, no dependencies
A3 (prices) → standalone, no dependencies
A4 (scoring → Engine) → standalone, no dependencies
A5 (render split) → depends on A4

B1 (Psych module) → depends on A4 + A5
B2 (Personal Letter) → depends on B1
B3 (new questions) → depends on A5
B4 (Recipes) → depends on B3 + Daniela content
B5 (Training) → depends on A5 + Daniela content
B6 (integrate on results) → depends on B2 + B4 + B5

C1 (Stripe) → depends on B6 (value must exist before asking for money)
C2 (Backend DB) → depends on C1 (payment needs user records)
C3 (PDF report) → depends on B2 + B4 + B5 + C2
C4 (Email follow-up) → depends on C2
```

**Critical path:** A4 → A5 → B1 → B2 → B6 → C1

**Parallel tracks possible:**
- A1, A2, A3 can run in parallel with everything (zero dependencies)
- B3 can run in parallel with B1 (both depend on A5 but not on each other)
- B4 and B5 can run in parallel (both need Daniela content, independent of each other)
- Daniela content production should start NOW, runs parallel with all Stage A work

---

## 8. RECOMMENDED NEXT BUILD SEQUENCE

### Phase 1 → STABILIZE + REFACTOR
- Main goal: Fix live bugs, establish modular foundation
- Exact deliverables: Email API verified, GDPR decline working, prices correct, scoring in Engine, render() split into 14 functions
- Success condition: Entire MINI + COMPLET flow works identically to current, but codebase is modular and ready for extensions

### Phase 2 → PERSONALIZE + DEMONSTRATE VALUE
- Main goal: Build psychological depth and tangible output (meals + training)
- Exact deliverables: CYB_Psych.js live (tone resolver, narrative builder, personal letter), CYB_Recipes.js live (60+ recipes, meal planner), CYB_Training.js live (80+ exercises, workout builder), new questions in COMPLET, integrated preview on results screen
- Success condition: COMPLET results screen shows: personalized letter + "Ziua ta model" (meals) + "Antrenamentul tău" (Day 1) + blurred remaining days as teaser

### Phase 3 → MONETIZE + RETAIN
- Main goal: Enable digital payment and user retention
- Exact deliverables: Stripe checkout (3 packages), backend DB (user profiles + payments), PDF report for paid users, email follow-up (2 automated sequences)
- Success condition: A user can complete questionnaire → read personal letter → see meal + training preview → click "Cumpără" → pay → receive full PDF → be tracked in DB. Non-buyers receive follow-up email at 24h.

---

## 9. FINAL EXECUTION VERDICT

**Build first:** Stage A (stabilize + refactor). Estimated 1-2 days. Zero creative dependency. Zero risk. Unblocks everything else. Start with verifying the email endpoint — if it's broken, fix it before anything else.

**Build second:** Psych Layer + Personal Letter (B1 + B2). This is the highest-leverage work in the entire project. The letter is what converts. Everything else is supporting infrastructure.

**Build in parallel:** Start Daniela on recipe and exercise content NOW. She needs 2-3 weeks minimum. Development of B4/B5 cannot start without her output. Don't wait until B2 is done to ask her.

**Can wait:** Stripe, backend DB, PDF, email follow-up (Stage C). These are important but only valuable AFTER the results screen delivers real personalized value. Premature monetization of a weak results screen won't convert.

**Do not touch:** Landing page, Engine core logic (interpretSignals, resolveRoute, selectMessage), Calc functions, MINI step order, iframe sync, localStorage system, legacy files.

**Biggest business impact:** Personal Letter + Recipe Preview + Training Preview on COMPLET results screen. This combination transforms the funnel from "diagnostic tool with WhatsApp CTA" into "personalized program preview with purchase option." That is the difference between lead gen and revenue.
