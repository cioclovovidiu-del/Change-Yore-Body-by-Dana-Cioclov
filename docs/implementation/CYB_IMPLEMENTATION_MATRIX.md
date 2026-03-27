# CYB IMPLEMENTATION MATRIX

> Last updated: 2026-03-27
> Source of truth: codebase audit (code wins over docs)

---

| System | Status | Main Files | Production Wired | Delivery State | Notes | Next Action |
|--------|--------|-----------|-----------------|----------------|-------|-------------|
| MINI questionnaire | IMPLEMENTED | `lib/cyb-steps.ts`, `lib/cyb-questionnaire-state.ts`, `hooks/useQuestionnaireRuntime.ts`, `app/questionnaire-runtime/page.tsx`, `components/questionnaire/StepDispatcher.tsx` | YES | automatic | 8 steps with conditional branching (postpartum, hormonal). localStorage persistence. Iframe height sync with landing page. | None — stable |
| COMPLET questionnaire | IMPLEMENTED | Same as MINI (single runtime, two phases) + `components/questionnaire/*Step.tsx` (14 step components) | YES | automatic | ~21 steps covering lifestyle, health, nutrition, motivation. Branches from MINI results. | None — stable |
| MINI results | IMPLEMENTED | `components/questionnaire/MiniResultsStep.tsx`, `lib/cyb-calc.ts`, `lib/cyb-engine.ts`, `lib/cyb-psych.ts` | YES | automatic | BMI gauge, route label, psych validation message, blurred locked sections (BMR/TDEE/macros), upgrade CTA, WhatsApp links. | None — stable |
| COMPLET results | IMPLEMENTED | `components/questionnaire/CompletResultsStep.tsx`, `lib/cyb-recipes.ts`, `lib/cyb-training.ts`, `lib/cyb-engine.ts`, `lib/cyb-psych.ts` | YES | preview only | Full metabolic analysis, 1-day meal plan preview, weekly training preview, shopping list, personal letter, custom duration selector, checkout CTA. Results are previews shown in-app — not delivered as documents. | Consider making preview downloadable |
| Nutrition generator | IMPLEMENTED | `lib/cyb-recipes.ts` (80+ recipes, `buildDayPlan()`, `buildMultiDayPlan()`, `shoppingList()`, `calcSlotTargets()`) | YES | automatic (report) + manual (document) | Multi-day plan auto-generated in metabolic report (email + browser). Formal meal plan document still created manually by Daniela. | Automate formal document generation |
| Training weekly generator | IMPLEMENTED | `lib/cyb-training.ts` (30+ sessions, 166 exercises, `filterSessions()`, `buildTrainingPlan()`, `enrichExercise()`) | YES | preview only + manual (document) | Generates weekly plan with safety filtering, goal matching, equipment check. Shown as preview in COMPLET results and training overview in report. Full program delivered manually. | Build 4-week progression on top |
| Training 4-week | PARTIAL | `lib/cyb-training.ts` (`buildTrainingPlan()` generates 1 week only) | NO | manual | Weekly plan exists but no week-over-week progression (volume ramp, intensity scaling, deload). Webhook marks `training_4w` as `pending_manual`. | Build 4-week progression logic |
| Training 12-week | MISSING | None | NO | manual | No code exists. Docs describe planned system (`docs/training/CYB_TRAINING_12WEEK_AND_NAMING.md`) but nothing implemented. Webhook marks `training_12w` as `pending_manual`. | Design + implement after 4-week is done |
| Checkout | IMPLEMENTED | `app/api/create-checkout/route.ts` | YES | automatic | 3 fixed packages (199/299/499 EUR) + custom duration (7 EUR/day, 14-90 days). Profile + COMPLET answers serialized into Stripe metadata. | None — stable |
| Stripe webhook | IMPLEMENTED | `app/api/stripe-webhook/route.ts`, `lib/metabolic-report.ts`, `lib/email-config.ts` | YES | automatic | Handles `checkout.session.completed`. Idempotency guard. Sends confirmation email + metabolic report. Updates Stripe metadata with fulfillment markers. Asset manifest tracks delivered vs pending items. | None — stable |
| Email delivery | IMPLEMENTED | `app/api/send-email/route.ts`, `lib/email-config.ts` | YES | automatic | Resend integration. Three payload types (mini/complet/legacy). Internal notification to Daniela + user follow-up email (C9) with route-aware subject and micro-diagnostic. Sender: `support@changeyourbody.ro`. | None — stable |
| Browser report page | IMPLEMENTED | `app/report/page.tsx`, `lib/metabolic-report.ts`, `lib/cyb-calc.ts`, `lib/cyb-recipes.ts` | YES | automatic | Server-rendered from Stripe session metadata. Requires `cyb_fulfilled=true`. BMI/BMR/TDEE, macros, metabolic profile, multi-day nutrition plan, training overview. Available for all paid packages. | None — stable |
| Program page | MISSING | None | NO | not available | No `/program` route exists. No interactive program viewer. Users see plans only in static metabolic report or COMPLET results preview. | Build `/program?sid=` page |
| Analytics | IMPLEMENTED | `lib/cyb-analytics.ts` | YES | automatic | gtag + fbq wrappers. Full funnel: `questionnaire_start`, `mini_step`, `email_provided`, `complet_start`, `complet_complete`, `begin_checkout`, `custom_duration_interaction`, `custom_checkout_click`, `offer_selected`, `purchase_completed`, `whatsapp_click`. | None — stable |
| Exercise media/video | PARTIAL | `lib/cyb-training.ts` (`ExerciseDBEntry.video_id`, `enrichExercise()`) | NO | not available | Data model supports `video_id` field. `enrichExercise()` reads it. But all 166 exercises have empty/undefined `video_id`. No video player component. No YouTube/Vimeo integration. | Populate `video_id` values + build player |
| Gym support | MISSING | None | NO | not available | All 30+ sessions target home equipment only (bodyweight, mat, bands, dumbbells, kettlebell). No gym exercises, no barbell/cable/machine types. Question q19 only lists home equipment. | Add gym sessions + extend q19 options |
| Legacy /chestionar route | LEGACY | `app/chestionar/page.tsx`, `app/questionnaire.tsx`, `app/questionnaire.data.ts`, `app/questionnaire.logic.ts`, `app/questionnaire.ui.tsx`, `app/questionnaire.module.css`, `app/questionnaire.types.ts` | PARTIAL | legacy only | Old standalone questionnaire with 40 fixed questions. Different data model from production runtime. Still routable at `/chestionar`. Uses its own email format. Not used by landing page. | Delete entirely — zero production impact |
| Legacy landing-v2 runtime assets | LEGACY | `public/landing-v2/CYB_Engine_STABLE.js`, `CYB_Calc.js`, `CYB_Recipes.js`, `CYB_Training.js`, `CYB_Steps.js`, `CYB_Psych.js`, `CYB_Copy.js`, `CYB_Render.js` | PARTIAL | legacy only | Original vanilla JS modules, all ported to TypeScript in `lib/`. Still served statically. Landing page `index.html` may load some. Questionnaire runs via React rewrite, not these files. | Audit which are still loaded; remove unused |

---

### Status legend

| Status | Meaning |
|--------|---------|
| IMPLEMENTED | Fully built and functional in code |
| PARTIAL | Code exists but incomplete or not wired to production |
| MISSING | No implementation exists |
| LEGACY | Superseded code that still exists in the repo |

### Production Wired legend

| Value | Meaning |
|-------|---------|
| YES | Reachable in production, actively used |
| NO | Code exists but not accessible/used in production |
| PARTIAL | Accessible but not part of the main user flow |

### Delivery State legend

| Value | Meaning |
|-------|---------|
| automatic | System generates and delivers without human intervention |
| manual | Daniela creates and delivers the asset |
| preview only | Shown to user in-app but not delivered as a standalone document |
| not available | Feature does not exist |
| legacy only | Works but through a superseded/deprecated path |
