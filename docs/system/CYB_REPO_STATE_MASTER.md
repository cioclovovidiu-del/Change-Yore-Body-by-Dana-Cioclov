# CYB REPO STATE MASTER

> Last updated: 2026-03-27
> Source of truth: codebase audit (code wins over docs)

---

## 1. Current Product State

**What the product is:**
Change Your Body (CYB) is a personalized fitness and nutrition coaching platform by Dana Cioclov, targeting Romanian women. Users complete a two-phase questionnaire (MINI + COMPLET), receive a metabolic profile with personalized messaging, then purchase one of several coaching packages. The system generates a metabolic report with nutrition plans automatically; training plans and extended coaching are delivered manually by Daniela.

**What is live in production:**
- Static landing page at `/` (served from `public/landing-v2/index.html` via Next.js rewrite)
- React questionnaire runtime at `/questionnaire-runtime` (loaded inside landing page iframe, replaces legacy `CYB_Chestionar_Unified.html` via rewrite)
- Two-phase questionnaire flow: MINI (8 steps) -> MINI results -> COMPLET (~21 steps) -> COMPLET results
- Stripe Checkout with 3 fixed packages (Essential 199EUR, Premium 299EUR, Coaching 499EUR) + custom duration (7EUR/day, 14-90 days)
- Webhook fulfillment: confirmation email + metabolic report email (auto-generated)
- Browser-viewable metabolic report at `/report?sid=<stripe_session_id>`
- Checkout success page at `/checkout/success?session_id=<id>` with package-aware messaging
- Admin orders endpoint at `/api/admin/orders` (API key protected)
- Analytics: gtag + Facebook Pixel for full funnel tracking
- Email delivery via Resend: internal notification to Daniela + user follow-up email on COMPLET completion

**What is still manual (Daniela delivers):**
- Meal plan documents (7-day for Essential, 30-day for Premium/Coaching)
- Training program documents (4-week for Essential, 12-week for Premium/Coaching)
- Detailed analysis reports for Premium/Coaching
- WhatsApp support (Premium/Coaching)
- 1:1 coaching sessions (Coaching only)
- VIP community access (Coaching only)

**What is missing (not implemented at all):**
- `/program` page (no interactive program viewer exists)
- 12-week training progression system (no code)
- 4-week training progression (weekly plan exists but no multi-week ramp)
- Exercise video/media integration (data model has `video_id` field but all values are empty)
- Gym-specific training sessions (all sessions are home-based)

---

## 2. Runtime Architecture

### Landing page architecture
The root URL `/` serves `public/landing-v2/index.html` via a `beforeFiles` rewrite in `next.config.ts`. This is a static HTML page with its own CSS/JS that loads the questionnaire inside an iframe.

### Questionnaire runtime architecture
The iframe URL `/landing-v2/CYB_Chestionar_Unified.html` is rewritten to `/questionnaire-runtime`, which serves the React-based questionnaire runtime (`app/questionnaire-runtime/page.tsx`). This is the production questionnaire.

The runtime uses:
- `hooks/useQuestionnaireRuntime.ts` — client-side hook wrapping the state machine
- `lib/cyb-questionnaire-state.ts` — pure state machine (phase transitions, step navigation)
- `lib/cyb-steps.ts` — step definitions for both MINI and COMPLET phases
- `components/questionnaire/StepDispatcher.tsx` — routes step types to UI components
- `components/questionnaire/*Step.tsx` — individual step renderers (14 components)

The questionnaire persists state to `localStorage` under key `CYB_STATE` and communicates height changes to the parent iframe via `postMessage({ type: "CYB_HEIGHT" })`.

### React runtime vs legacy static assets
The `public/landing-v2/` directory contains the original vanilla JS modules:
- `CYB_Engine_STABLE.js`, `CYB_Calc.js`, `CYB_Recipes.js`, `CYB_Training.js`, `CYB_Steps.js`, `CYB_Psych.js`, `CYB_Copy.js`, `CYB_Render.js`

These have been ported to TypeScript in `lib/`:
- `cyb-engine.ts`, `cyb-calc.ts`, `cyb-recipes.ts`, `cyb-training.ts`, `cyb-steps.ts`, `cyb-psych.ts`, `cyb-copy.ts`

The vanilla JS files are still served statically (the landing page `index.html` may reference them) but the questionnaire itself runs entirely through the React runtime. The legacy `CYB_Chestionar_Unified.html` file in `public/landing-v2/` is bypassed by the rewrite.

### Rewrite behavior (`next.config.ts`)

| Rule | Source | Destination | Priority |
|------|--------|-------------|----------|
| beforeFiles | `/` | `/landing-v2/index.html` | Highest |
| beforeFiles | `/landing-v2/CYB_Chestionar_Unified.html` | `/questionnaire-runtime` | Highest |
| afterFiles | `/landing-v2` | `/landing-v2/index.html` | After file check |
| afterFiles | `/landing-v2/` | `/landing-v2/index.html` | After file check |

### Important production routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Rewrite | Landing page (static HTML) |
| `/questionnaire-runtime` | Page | React questionnaire (served in iframe) |
| `/chestionar` | Page | Legacy standalone questionnaire (old system, still routable) |
| `/checkout/success` | Page | Post-payment success with package-aware steps |
| `/report` | Page | Browser-viewable metabolic report (requires `?sid=`) |
| `/api/create-checkout` | API | Creates Stripe Checkout session |
| `/api/stripe-webhook` | API | Handles `checkout.session.completed` events |
| `/api/send-email` | API | Sends questionnaire data emails (mini/complet/legacy) |
| `/api/admin/orders` | API | Lists recent paid orders (protected) |
| `/dev/questionnaire-runtime` | Page | Dev-only questionnaire page |

---

## 3. Core Engines

### cyb-calc (`lib/cyb-calc.ts`)
BMI, BMR (Mifflin-St Jeor female), TDEE calculation, BMI classification, ideal weight range, projected weight loss weeks. Pure math, no dependencies.

### cyb-engine (`lib/cyb-engine.ts`)
Central intelligence layer. Contains:
- **SignalInterpreter**: derives psychological signals (overwhelmed, selfBlame, actionCapacity, shameRisk, structureNeed, pressureTolerance, motivationStyle) from MINI profile + COMPLET answers
- **RouteResolver**: maps life moment to route (POSTPARTUM, DIVORCE, HORMONAL, BURNOUT, LOSS, GENERAL) with signal-based overrides
- **MessageEngine**: 25+ route-specific messages (validation, results, transitions) with condition matching and scoring
- **StressScore / HormonalScore**: numeric scores derived from sleep, stress, emotional eating, water, diet history, age, symptoms
- **MetabolicProfile**: classifies into profiles (postpartum, pierdere, antiCortizol, hormonalReset, metabolismLent, echilibrat)
- **SafetyTags**: 12 safety tags for exercise filtering (NO_KNEE, NO_BACK_L, POSTPARTUM, BREASTFEEDING, etc.)

### cyb-psych (`lib/cyb-psych.ts`)
Psychological communication layer between engine interpretation and UI rendering. Builds psych contexts, flow messages, and personal letters. Deterministic from same input.

### cyb-steps (`lib/cyb-steps.ts`)
Unified step definitions for MINI and COMPLET questionnaire phases. Exports `STEPS_MINI`, `STEPS_COMPLET`, `buildVisible()` (conditional step filtering), `totalQ()`, `curQ()`. Consumes `cyb-copy.ts` for all user-facing text.

### cyb-recipes (`lib/cyb-recipes.ts`)
Recipe database (80+ recipes: 20 breakfast, 20 lunch, 25 dinner, 20 snack) with full nutritional data. Exports:
- `buildDayPlan()` — single-day meal plan matching caloric targets, dietary exclusions, budget, cooking methods
- `buildMultiDayPlan()` — N-day plan with variety enforcement and aggregated shopping list
- `shoppingList()` — ingredient aggregation across plan days
- `calcSlotTargets()` — per-meal caloric distribution from TDEE

### cyb-training (`lib/cyb-training.ts`)
Training session database (30+ sessions) and exercise database (166 exercises). Exports:
- `SESSIONS` — structured workout sessions with blocks, exercises, sets/reps/rest
- `EXERCISE_DB` — exercise lookup with instructions, English names, `video_id` (placeholder), `modify_if`
- `filterSessions()` — filters by safety tags, equipment, experience level, goal
- `buildTrainingPlan()` — builds weekly training plan (frequency, session selection, goal matching)
- `enrichExercise()` — attaches DB metadata to exercise names

### cyb-questionnaire-state (`lib/cyb-questionnaire-state.ts`)
Pure state machine for questionnaire navigation. Manages phase (MINI/COMPLET), step index, profile data, answers. Exports state factory, step resolution, navigation (next/back), phase transition, validation, persistence helpers. Version 2.

### Supporting modules
- `lib/cyb-copy.ts` — all user-facing Romanian text strings, organized by section
- `lib/cyb-analytics.ts` — gtag + fbq wrappers for funnel events
- `lib/email-config.ts` — sender config (`support@changeyourbody.ro`), Daniela's email, reply-to
- `lib/metabolic-report.ts` — HTML report builder used by webhook (email mode) and `/report` (browser mode)

---

## 4. Checkout and Fulfillment Flow

### Create Checkout (`app/api/create-checkout/route.ts`)
- Accepts `packageId` (essential/premium/coaching/custom) + optional `customDays` + profile fields + COMPLET answers
- Standard packages use pre-configured Stripe Price IDs from env vars
- Custom packages compute price as `customDays * 7 EUR`
- Profile data (age, height, weight, activity, goal, moment) stored in Stripe session metadata
- COMPLET answers serialized as chunked JSON in metadata (`cyb_ans_0`, `cyb_ans_1`, ... up to 20 chunks of 500 chars)
- Returns Stripe Checkout URL; success redirect to `/checkout/success?session_id={CHECKOUT_SESSION_ID}`

### Stripe metadata structure
| Key | Content |
|-----|---------|
| `packageId` | essential / premium / coaching / custom |
| `customerName` | User's name |
| `cyb_age`, `cyb_height`, `cyb_weight` | Physical profile |
| `cyb_activity`, `cyb_goal`, `cyb_moment` | Behavioral profile |
| `cyb_ans_0` ... `cyb_ans_N` | Chunked COMPLET answers JSON |
| `cyb_ans_chunks` | Number of answer chunks |
| `cyb_custom_days` | Custom package duration (custom only) |
| `cyb_fulfilled` | "true" after webhook processes |
| `cyb_fulfilled_at` | ISO timestamp |
| `cyb_fulfillment_version` | "C7-1.0.0" |
| `cyb_delivery_type`, `cyb_delivery_status` | Delivery tracking |
| `cyb_assets_delivered`, `cyb_assets_pending` | Comma-separated asset IDs |

### Webhook (`app/api/stripe-webhook/route.ts`)
Handles `checkout.session.completed`:
1. Verifies Stripe signature
2. Idempotency check (in-memory set, max 1000)
3. Resolves package and delivery intent
4. Extracts profile from metadata
5. If profile exists: generates metabolic report HTML, sends as email attachment
6. Sends confirmation email with package-specific "what's included" and "next steps"
7. Updates Stripe session metadata with fulfillment markers
8. Logs delivery result (assets delivered vs pending)

### Email delivery (`app/api/send-email/route.ts`)
Uses Resend SDK. Three payload types:
- `mini` — sends MINI profile summary to Daniela
- `complet` — sends COMPLET profile + answers to Daniela + sends user follow-up email (C9) with route-aware subject line and micro-diagnostic content
- Legacy questionnaire format (answers + questions array)

All emails sent from `support@changeyourbody.ro` with reply-to pointing to Daniela.

### Report rendering (`app/report/page.tsx` + `lib/metabolic-report.ts`)
Server-rendered page that:
1. Retrieves Stripe session by `sid` query param
2. Guards: must have valid sid, Stripe configured, `cyb_fulfilled=true`, valid profile data
3. Extracts profile and COMPLET answers from session metadata
4. Generates full HTML report with: BMI/BMR/TDEE analysis, metabolic profile classification, multi-day nutrition plan, training session preview, stress/hormonal scores
5. Custom packages get N-day nutrition plans based on `cyb_custom_days`

### What is actually delivered automatically vs manually

| Asset | Automatic | Manual |
|-------|-----------|--------|
| Confirmation email | YES (webhook) | - |
| Metabolic report (email) | YES (webhook, if profile exists) | - |
| Metabolic report (browser) | YES (`/report?sid=`) | - |
| User follow-up email | YES (on COMPLET completion) | - |
| Meal plan document (7d/30d) | NO | Daniela creates and sends |
| Training program (4w/12w) | NO | Daniela creates and sends |
| Detailed analysis report | NO | Daniela creates (Premium/Coaching) |
| WhatsApp support | NO | Daniela initiates contact |
| 1:1 coaching | NO | Daniela schedules |
| VIP community access | NO | Daniela grants access |

---

## 5. Current Delivery Model

### MINI flow
1. User starts questionnaire in iframe on landing page
2. 8 MINI steps: name, age, height, weight, goal, life stage + conditional branching (postpartum/hormonal)
3. MINI results screen: BMI with gauge, route label, psych validation message, blurred locked sections (BMR/TDEE/macros), upgrade CTA to start COMPLET
4. Mini profile emailed to Daniela (on COMPLET start, if GDPR consent given)
5. Analytics: `questionnaire_start`, `mini_step`, `mini_complete`

### COMPLET flow
1. Continues from MINI results via "Deblocheza analiza ta completa" CTA
2. ~21 additional steps covering: lifestyle, sleep, stress, activity, equipment, health conditions, medications, physical limitations, diet history, food preferences, allergies, cooking methods, budget, motivation
3. COMPLET results screen: full metabolic analysis, stress/hormonal scores, 1-day meal plan preview, weekly training plan preview, shopping list, personal letter, custom duration selector, checkout CTA for all packages
4. Profile + answers emailed to Daniela; user follow-up email sent
5. Analytics: `complet_start`, `complet_complete`, `email_provided`

### Report
- Auto-generated metabolic report with BMI/BMR/TDEE, macros, metabolic profile, caloric recommendations
- Includes multi-day nutrition plan (7 days default, custom days for custom packages) with real recipes from database
- Includes training session overview
- Available as email (sent by webhook) and browser page (`/report?sid=`)
- Available for all paid packages (Essential, Premium, Coaching, Custom)

### Nutrition (preview vs delivery)
- **Preview**: COMPLET results shows a 1-day sample meal plan with real recipes, slot targets, shopping list
- **Automatic delivery**: Multi-day nutrition plan embedded in metabolic report (email + browser)
- **Manual delivery**: Daniela creates and sends the formal meal plan document

### Training (preview vs delivery)
- **Preview**: COMPLET results shows a weekly training plan with real sessions, exercises, sets/reps
- **Automatic delivery**: Training session overview in metabolic report
- **Manual delivery**: Daniela creates the full 4-week or 12-week structured program

### Pending manual items per package

| Item | Essential | Premium | Coaching | Custom |
|------|-----------|---------|----------|--------|
| Meal plan document | 7 days | 30 days | 30 days | N days |
| Training program | 4 weeks | 12 weeks | 12 weeks | - |
| Detailed report | - | YES | YES | - |
| WhatsApp support | - | 30 days | Ongoing | - |
| 1:1 coaching | - | - | YES | - |
| VIP community | - | - | YES | - |

---

## 6. Current Blockers

### 4-week training automation gap
`buildTrainingPlan()` generates a single weekly plan (N sessions). There is no week-over-week progression logic (volume ramp, intensity increase, deload). The same sessions repeat every week. The webhook asset manifest marks `training_4w` as `pending_manual`.

### 12-week training automation gap
No 12-week code exists anywhere. The docs (`CYB_TRAINING_12WEEK_AND_NAMING.md`) describe a planned system but nothing was implemented. Marked `pending_manual` in webhook.

### Missing /program page
No `/program` route exists. Users cannot view their training or nutrition plan interactively after purchase. The only automated delivery is the static HTML metabolic report. This limits the product experience for paying customers.

### Missing video/media layer
The `ExerciseDBEntry` interface has a `video_id` field and `enrichExercise()` reads it, but no exercise in `EXERCISE_DB` has a populated `video_id`. There is no video player component, no YouTube/Vimeo integration, no media hosting. The training plan shows text-only exercise descriptions.

### Missing gym mode
All 30+ training sessions use home equipment only (bodyweight, mat, chair, bands, dumbbells, kettlebell). No gym-specific sessions exist. No barbell, cable machine, or gym equipment types are defined. Users with gym access cannot get gym-optimized programs.

### Dual questionnaire system (legacy risk)
Two independent questionnaire systems exist:
- **Production**: `/questionnaire-runtime` using `lib/cyb-steps.ts` + `useQuestionnaireRuntime` (MINI+COMPLET, step-based, iframe)
- **Legacy**: `/chestionar` using `app/questionnaire.tsx` + `app/questionnaire.data.ts` (40 fixed questions, standalone page)

The legacy system is still routable and uses different question IDs, different data structures, and its own email format. This creates confusion risk and maintenance burden.

### Legacy landing-v2 JS assets
The 8 vanilla JS files in `public/landing-v2/` are superseded by the TypeScript ports in `lib/`. If the landing page `index.html` still loads any of these, there is a risk of running outdated logic. However, the questionnaire itself is fully React-based via the rewrite.

---

## 7. Recommended Next Milestones

1. **Remove legacy `/chestionar` route** — Delete `app/questionnaire.tsx`, `app/questionnaire.data.ts`, `app/questionnaire.logic.ts`, `app/questionnaire.ui.tsx`, `app/questionnaire.module.css`, `app/questionnaire.types.ts`, `app/chestionar/page.tsx`. Eliminates dual-system risk with zero production impact.

2. **Build 4-week training progression** — Extend `buildTrainingPlan()` with week-over-week progression: volume ramp (sets/reps increase), intensity scaling, deload week. Output a 4-week structured plan that can replace manual delivery for Essential package.

3. **Build `/program` page** — Create an authenticated program viewer at `/program?sid=<stripe_session_id>` that renders the full nutrition plan + training program interactively. This replaces the static report format and enables future features (progress tracking, exercise videos).

4. **Populate exercise `video_id` values** — Add YouTube/Vimeo video IDs to `EXERCISE_DB` entries. Build a simple video player component. This dramatically increases training plan value.

5. **Build 12-week training system** — Extend the 4-week progression logic to 12 weeks with periodization (base, build, peak, deload cycles). Required for Premium/Coaching automation.

6. **Add gym session variants** — Create gym-specific sessions using barbell, cable, and machine equipment. Add equipment detection in questionnaire (already asks equipment in q19 but only lists home items).

7. **Audit and remove unused landing-v2 JS files** — Verify which JS files `index.html` actually loads. Remove or stop serving any that are fully superseded by the React runtime.
