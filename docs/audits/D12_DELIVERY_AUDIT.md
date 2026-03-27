# D12 — Server-Side Utilization Audit

**Date:** 2026-03-23
**Scope:** What can be generated/enriched server-side using D11-persisted COMPLET answers
**Status:** AUDIT COMPLETE — READY FOR IMPLEMENTATION DECISION

---

## 1. REAL SERVER-SIDE DATA AVAILABLE POST-D11

### MINI Profile (6 fields — available since C6)
| Key | Type | Source |
|-----|------|--------|
| `cyb_age` | number (10-100) | Stripe session metadata |
| `cyb_height` | number (80-260 cm) | Stripe session metadata |
| `cyb_weight` | number (20-300 kg) | Stripe session metadata |
| `cyb_activity` | number (0-3) | Stripe session metadata |
| `cyb_goal` | number (0-3) | Stripe session metadata |
| `cyb_moment` | number (0-5) | Stripe session metadata |

### COMPLET Answers (up to 40 questions — available since D11)
| Key | Type | Source |
|-----|------|--------|
| `cyb_ans_0..N` | JSON chunks (500 chars each) | Stripe session metadata |
| `cyb_ans_chunks` | chunk count (1-20) | Stripe session metadata |

**Extraction:** `extractCompletAnswers(session.metadata)` → `Record<string, unknown>`
**Max payload:** 10,000 chars (20 × 500)

### COMPLET Answer Content (what we actually know about the customer)
| Question | ID | Data Type | Server Value |
|----------|-----|-----------|-------------|
| Name | q1 | text | string |
| Age | q2 | number | number |
| Height (cm) | q3 | number | number |
| Weight (kg) | q4 | number | number |
| Primary goal | q5 | single (0-4) | weight loss / toning / maintenance / postpartum / hormonal |
| Life stage | q6 | single (0-5) | under 35 / 35-45 / pre-menopause / menopause / postpartum / breastfeeding |
| Hormonal symptoms | q7 | multi | bufeuri, insomnie, mood, weight gain, fatigue, libido, joint pain |
| HRT treatment | q8 | single | yes/no/past/discussing |
| Months since birth | q9 | number | 0-36 |
| Birth type | q10 | single | natural / C-section |
| Breastfeeding | q11 | single | exclusive / partial / no |
| Postpartum conditions | q12 | multi | medical clearance, diastasis, incontinence |
| Sleep quality | q13 | single (0-3) | good / ok / poor / very poor |
| Stress level | q14 | single (0-3) | low / moderate / high / very high |
| Daily routine | q15 | single (0-5) | remote / office / standing / mom / shifts / mixed |
| Activity level | q16 | single (0-3) | sedentary / light / moderate / very active |
| Home workout history | q17 | single (0-3) | never / tried&quit / occasional / regular |
| Time for training | q18 | single (0-4) | <15m / 15-20m / 20-30m / 30-45m / >45m |
| Equipment available | q19 | multi | bodyweight, chair, mat, bands, dumbbells, kettlebell, bike |
| Medical conditions | q20 | multi | none, diabetes, hypothyroid, PCOS, hypertension, cardiac, depression |
| Medications | q21 | textarea | free text |
| Physical limitations | q22 | multi | none, knee, lower back, neck, shoulder, wrist, hip, disc, incontinence, diastasis, varicose, vertigo |
| Sport experience | q23 | single (0-3) | total beginner / beginner / intermediate / advanced |
| Meals per day | q24 | single (0-3) | 1-2 / 3 / 3+snacks / no rhythm |
| Breakfast | q25 | single (0-2) | daily / sometimes / almost never |
| Emotional eating | q26 | single (0-2) | yes often / sometimes / rarely |
| Water intake | q27 | single (0-4) | <0.5L / 0.5-1L / 1-1.5L / 1.5-2L / >2L |
| Diet history | q28 | single (0-4) | never / 1-2 / 2-3 / many / always |
| Diet types tried | q29 | multi | keto, deficit, IF, fasting, magazine, nutritionist |
| Eating pattern | q30 | single (0-5) | everything / vegetarian / vegan / pescatarian / GF / LF |
| Allergies | q31 | multi | none, lactose, gluten, nuts, eggs, fish |
| Foods avoided | q32 | textarea | free text |
| Recipe complexity | q33 | single (0-3) | very simple / medium / meal prep / mixed |
| Cooking methods | q34 | multi | pan, oven, boil, air fryer, slow cooker, no cooking |
| Weekly food budget | q35 | single (0-3) | <150 / 150-250 / 250-400 / >400 RON |
| Biggest obstacle | q36 | multi | time, motivation, knowledge, cravings, support, stress, slow results, cost |
| Motivation level | q37 | scale 1-10 | number |
| Email | q38 | email | string |
| WhatsApp (optional) | q39 | tel | string |
| GDPR consent | q40 | gdpr | 0=yes / 1=no |

---

## 2. CURRENT SERVER-SIDE CONSUMERS

| File | What It Does | Uses Profile | Uses COMPLET | Status |
|------|-------------|-------------|-------------|--------|
| `app/api/stripe-webhook/route.ts` | Payment fulfillment, 3 emails, asset manifest | YES | EXTRACTS but does NOT use | Live |
| `app/report/page.tsx` | Browser metabolic report | YES | EXTRACTS but does NOT use | Live |
| `lib/metabolic-report.ts` | BMI/BMR/TDEE calc + HTML report | YES (6 fields) | NO | Live |
| `app/api/send-email/route.ts` | Questionnaire emails + follow-up | YES (profile obj) | YES (for internal email to Daniela) | Live |
| `app/api/admin/orders/route.ts` | Order listing | Reads fulfillment flags | NO | Live |
| `app/api/create-checkout/route.ts` | Checkout session creation | Encodes to metadata | Encodes to metadata | Live |

---

## 3. READINESS TABLE — What Can Be Generated Now

| Output | Status | What's Needed | Files Involved |
|--------|--------|---------------|----------------|
| **Enriched metabolic report (COMPLET-aware)** | READY WITH SMALL ADAPTER | Add COMPLET interpretation to `buildMetabolicReportHtml()` — sleep, stress, activity, limitations, hormonal data all available as structured answers | `lib/metabolic-report.ts`, `app/report/page.tsx`, `app/api/stripe-webhook/route.ts` |
| **Nutrition summary (server-side)** | READY WITH SMALL ADAPTER | All diet data available: meals/day, eating pattern, allergies, avoided foods, cooking methods, budget, recipe complexity. Need new `buildNutritionSummaryHtml()` function | `lib/metabolic-report.ts` (add function), webhook + report page (call it) |
| **Training summary (server-side)** | READY WITH SMALL ADAPTER | All training data available: equipment, time, experience level, limitations, physical conditions. Need new `buildTrainingSummaryHtml()` function | `lib/metabolic-report.ts` (add function), webhook + report page (call it) |
| **Package-specific enriched confirmation email** | READY WITH SMALL ADAPTER | COMPLET answers available in webhook. Can personalize confirmation by echoing key profile traits. Modify `buildCustomerConfirmationHtml()` | `app/api/stripe-webhook/route.ts` |
| **Premium/Coaching enriched report** | READY WITH SMALL ADAPTER | Same as enriched metabolic report but with additional sections for premium tiers. Conditional logic in `buildMetabolicReportHtml()` already accepts `packageName` | `lib/metabolic-report.ts` |
| **Psych/motivation interpretation** | READY WITH SMALL ADAPTER | q13 (sleep), q14 (stress), q26 (emotional eating), q36 (obstacles), q37 (motivation) — all structured, can map to insights server-side | `lib/metabolic-report.ts` (add section) |
| **Daniela's fulfillment brief (enriched internal email)** | READY NOW | COMPLET answers already sent to Daniela via send-email route. Webhook can also include structured brief. Just format existing data | `app/api/stripe-webhook/route.ts` |
| **PDF generation** | NOT READY | No PDF library installed. Would need `puppeteer` or `@react-pdf/renderer`. HTML→PDF possible but adds infrastructure | N/A — new dependency required |
| **Attachment generation (email)** | NOT READY | Resend supports attachments but no content to attach yet (no PDF, no generated files) | N/A — depends on PDF |
| **Admin manifest enrichment** | READY WITH SMALL ADAPTER | Admin orders route can include COMPLET answer summary per order. Need to retrieve session with expanded metadata | `app/api/admin/orders/route.ts` |

---

## 4. REUSABLE VS NON-REUSABLE LOGIC MAP

### SAFE TO IMPORT SERVER-SIDE (zero changes needed)
| File | Functions | Classification |
|------|-----------|---------------|
| `lib/metabolic-report.ts` | `extractProfile()`, `extractCompletAnswers()`, `buildMetabolicReportHtml()`, `calcBMI()`, `calcBMR()`, `calcTDEE()`, `idealWeightRange()`, `bmiCategory()`, `escapeHtml()` | Pure functions, already used server-side |
| `lib/email-config.ts` | `emailFrom()`, `emailReplyTo`, `DANIELA_EMAIL` | Pure constants/functions |
| `app/questionnaire.data.ts` | `QUESTIONS` array | Pure data constant |
| `app/questionnaire.types.ts` | All types | Type-only, zero runtime |
| `app/questionnaire.logic.ts` | `buildVisibleQuestions()`, `isQuestionValid()`, `toSubmissionData()`, `getProgress()` | Pure functions, no DOM |

### ALREADY SERVER-SIDE (in API routes, could extract to lib/)
| File | Functions | Note |
|------|-----------|------|
| `app/api/stripe-webhook/route.ts` | `buildCustomerConfirmationHtml()`, `buildInternalNotificationHtml()`, `PACKAGE_ASSETS`, `DELIVERY_INTENTS`, `PRICE_TO_PACKAGE` | Inline in route, could move to `lib/` for reuse |
| `app/api/send-email/route.ts` | `buildCompletFollowUpHtml()`, `ROUTE_INSIGHTS`, `GOAL_INSIGHTS`, `ROUTE_LABELS` | Inline in route, could move to `lib/` |

### NOT REUSABLE SERVER-SIDE
| File | Reason |
|------|--------|
| `app/questionnaire.tsx` | React hooks (`useState`, `useCallback`, `useEffect`), DOM events, JSX |
| `app/questionnaire.ui.tsx` | React components, JSX rendering, DOM-coupled |
| `app/report/page.tsx` | Next.js page component, `dangerouslySetInnerHTML` (but calls pure `buildMetabolicReportHtml()`) |

---

## 5. CONSTRAINT CHECK

| Constraint | Still True? | Evidence |
|-----------|------------|---------|
| No database | YES | All data in Stripe metadata, no DB imports anywhere |
| No persistent asset storage | YES | No S3/blob/file storage. Emails sent via Resend, report rendered on-demand |
| No user account system | YES | Report access via unguessable session ID, no auth/login |
| Webhook only fires after paid completion | YES | `checkout.session.completed` event, checks `payment_status === "paid"` |
| Report route depends on fulfilled session state | YES | Guards: `cyb_fulfilled === "true"` required |
| Frontend preview logic is browser-bound | PARTIALLY TRUE | UI components are browser-bound, but all calculation/data logic is pure and server-safe |

---

## 6. RECOMMENDED IMPLEMENTATION — PHASED ORDER

### Phase 1: Enriched Metabolic Report (HIGHEST VALUE, LOWEST RISK)
**What:** Expand `buildMetabolicReportHtml()` to include COMPLET-derived sections
**Why:** Customer already receives this report. Enriching it with their actual answers creates immediate "wow" value — they see their sleep, stress, limitations, diet patterns reflected back with personalized interpretation.
**New sections to add:**
- Lifestyle snapshot (sleep q13, stress q14, activity q16, daily routine q15)
- Nutrition profile (meals/day q24, eating pattern q30, emotional eating q26, water q27)
- Training readiness (experience q23, time available q18, equipment q19, limitations q22)
- Hormonal/life-stage context (q6, q7, q8 if applicable)
- Motivation & obstacles (q36, q37)

**Files to modify:**
1. `lib/metabolic-report.ts` — add `interpretCompletAnswers(answers, questions)` function + expand `buildMetabolicReportHtml()` to accept optional `completAnswers` param
2. `app/api/stripe-webhook/route.ts` — pass `completAnswers` to report builder
3. `app/report/page.tsx` — pass `completAnswers` to report builder (already extracted, just unused)

**Risk:** LOW — additive only, existing report still works if answers are null
**Data dependency:** `extractCompletAnswers()` already works, `QUESTIONS` array provides labels

### Phase 2: Package-Differentiated Report Sections
**What:** Show different depth/sections based on package tier
**Why:** Premium (299€) and Coaching (499€) customers should see more value than Essential (199€)
**Implementation:**
- Essential: Current report + Phase 1 enrichment (lifestyle + nutrition + training snapshot)
- Premium: Above + detailed diet analysis, training recommendations, hormonal interpretation
- Coaching: Above + full psych/motivation profile, obstacle analysis, personalized first-session agenda

**Files to modify:**
1. `lib/metabolic-report.ts` — conditional sections based on `packageName`
2. No other files change — `packageName` already passed to builder

**Risk:** LOW — purely additive HTML sections

### Phase 3: Enriched Confirmation Email + Daniela's Fulfillment Brief
**What:**
- (a) Personalize customer confirmation email with 2-3 key profile insights
- (b) Add structured COMPLET summary to internal notification so Daniela has a ready brief

**Why:** Customer gets immediate personal touch post-purchase. Daniela gets structured data instead of raw answers.
**Files to modify:**
1. `app/api/stripe-webhook/route.ts` — modify `buildCustomerConfirmationHtml()` + `buildInternalNotificationHtml()`

**Risk:** LOW — email template changes only

---

## 7. BEST NEXT IMPLEMENTATION STEP

**Phase 1: Enriched Metabolic Report**

This is the single highest-value, lowest-risk step because:
1. The report is already sent to every paying customer
2. `extractCompletAnswers()` already works in both webhook and report page
3. `QUESTIONS` array with all labels is importable server-side
4. All answer data is structured (single/multi/scale/text) — no parsing needed
5. The HTML builder already handles `mode: "email" | "browser"` — sections render in both
6. Zero new infrastructure — same files, same flow, just richer output
7. If answers are missing/null, report degrades gracefully to current version

**Implementation surface:** ~200 lines of new interpretation logic in `lib/metabolic-report.ts`, ~10 lines changed in webhook + report page to pass the answers through.
