# CYB SYSTEM — CURRENT STATE SNAPSHOT

> Generated: 2026-03-23
> Updated: 2026-03-25 (post N4–N12: nutrition targeting upgrade + custom-duration feature)
> Covers: deployed production state — all changes live

---

## 1. DEPLOY STATUS

| Field | Value |
|-------|-------|
| **Latest deployed commit** | `38dec78` — D6+D7: psych flow + results impact layer |
| **Branch** | `main` (local = origin/main) |
| **Remote** | `https://github.com/cioclovovidiu-del/Change-Yore-Body-by-Dana-Cioclov.git` |
| **Hosting** | Vercel |
| **Production URL** | `https://changeyourbody.ro` |
| **Framework** | Next.js 16.1.6 (App Router) |
| **Runtime** | Node.js (dynamic routes), Edge not used |

### Uncommitted Local Changes
None. All changes deployed.

---

## 2. CHECKOUT & PAYMENT FLOW

### Stripe Integration

| Component | Status |
|-----------|--------|
| **API version** | `2026-02-25.clover` |
| **Checkout mode** | `payment` (one-time) |
| **Packages** | 3 tiers + custom duration |

**Package definitions:**

| ID | Name | Price | Stripe Price ID Source |
|----|------|-------|----------------------|
| `essential` | REBUILD Esențial | 199€ | `STRIPE_PRICE_ESSENTIAL` env var |
| `premium` | REBUILD Premium | 299€ (old: 399€) | `STRIPE_PRICE_PREMIUM` env var |
| `coaching` | CYB Coaching Complet | 499€ | `STRIPE_PRICE_COACHING` env var |
| `custom` | Plan personalizat CYB - N zile | days × 7€ (14–90 days) | Ad-hoc `price_data` (no pre-created Price ID) |

**Custom duration (N8–N12):** Users select 14–90 days in questionnaire results. Price = days × 7€. Stripe session uses `price_data` with `cyb_custom_days` in metadata. Webhook, report, success page, and admin all resolve days dynamically.

**Checkout flow:**
1. User clicks CTA button → `cybCheckout(packageId)` in iframe
2. POST to `/api/create-checkout` with packageId + profile metadata
3. API creates Stripe Checkout Session with `success_url` and `cancel_url`
4. Redirects `window.top.location.href` to Stripe (breaks out of iframe)
5. On success → `/checkout/success?session_id={CHECKOUT_SESSION_ID}`

**Profile metadata passed to Stripe session:**
`customerName`, `customerEmail`, `profileAge`, `profileHeight`, `profileWeight`, `profileActivity`, `profileGoal`, `profileMoment`

### Success Page (`/checkout/success`)

- Dynamic SSR (force-dynamic)
- Reads `session_id` from query param
- Retrieves package, customer name/email, fulfilled status from Stripe
- Package-specific "Ce urmează" steps
- Essential: shows link to `/report?sid=...` for metabolic report
- Premium/Coaching: shows manual delivery timeline
- Email verification section with customer email display
- Missing-email fallback with WhatsApp guidance

### Webhook (`/api/stripe-webhook`)

| Field | Value |
|-------|-------|
| **Event** | `checkout.session.completed` |
| **Signature verification** | Yes (STRIPE_WEBHOOK_SECRET) |
| **Idempotency** | Dual: in-memory Set + Stripe metadata (`cyb_fulfilled`) |
| **Fulfillment version** | `C7-1.0.0` |

**Webhook actions on checkout.session.completed:**
1. Verify signature
2. Check idempotency
3. Resolve package ID (metadata → line_items fallback)
4. Send customer confirmation email
5. Send Daniela notification email
6. Essential only: send metabolic report email
7. Mark fulfilled in Stripe metadata
8. Build delivery result (delivered vs pending_manual)

---

## 3. EMAIL SYSTEM

### Sender Identity

| Field | Value |
|-------|-------|
| **From** | `Dana Cioclov - Change Your Body <support@changeyourbody.ro>` |
| **Reply-To** | `cioclov.ovidiu@gmail.com` (or `EMAIL_REPLY_TO` env override) |
| **Provider** | Resend SDK |
| **Domain** | `changeyourbody.ro` (verified) |
| **Config file** | `lib/email-config.ts` |

### Email Flows

#### Flow 1: Customer Confirmation (post-payment)
| Field | Value |
|-------|-------|
| **Trigger** | Stripe webhook (`checkout.session.completed`) |
| **Recipient** | Customer email from Stripe session |
| **Content** | Package-specific confirmation + next steps |
| **Status** | Automated ✅ |

#### Flow 2: Daniela Notification (post-payment)
| Field | Value |
|-------|-------|
| **Trigger** | Stripe webhook (`checkout.session.completed`) |
| **Recipient** | `cioclov.ovidiu@gmail.com` (DANIELA_EMAIL) |
| **Content** | Payment details — customer name, email, package, amount |
| **Status** | Automated ✅ |

#### Flow 3: Metabolic Report (Essential only)
| Field | Value |
|-------|-------|
| **Trigger** | Stripe webhook (`checkout.session.completed`, essential package) |
| **Recipient** | Customer email |
| **Content** | Full metabolic report HTML (generated from profile stored in Stripe metadata) |
| **Status** | Automated ✅ |

#### Flow 4: Questionnaire Follow-Up (COMPLET completion)
| Field | Value |
|-------|-------|
| **Trigger** | POST `/api/send-email` with type `complet` (called from frontend on results render) |
| **Recipient** | Customer email (if provided + GDPR consented) |
| **Content** | Route-aware personalized follow-up with micro-diagnostics, emotional reframe, CTA |
| **Subject** | Route-aware: `"Rezultatul tău: {{route_label}} — vezi ce înseamnă pentru tine"` |
| **Status** | Automated ✅ (non-blocking — failure doesn't break results) |

#### Flow 5: Daniela Notification (questionnaire submission)
| Field | Value |
|-------|-------|
| **Trigger** | POST `/api/send-email` (all types: mini, complet, questionnaire) |
| **Recipient** | `cioclov.ovidiu@gmail.com` (DANIELA_EMAIL) |
| **Content** | Full questionnaire data in table format |
| **Status** | Automated ✅ |

**Total email send points:** 5 (3 in webhook, 2 in send-email)

---

## 4. QUESTIONNAIRE SYSTEM

### Architecture
- Static HTML questionnaire (`public/landing-v2/CYB_Chestionar_Unified.html`)
- Embedded in landing page (`public/landing-v2/index.html`) via `<iframe>`
- 8 plain JS modules loaded via `<script>` tags (no bundler)
- State persisted in `localStorage` (key: `CYB_STATE`)
- iframe ↔ parent communication via `postMessage` (height sync)

### Script Loading Order
1. `CYB_Copy.js` — all UI text, labels, copy
2. `CYB_Calc.js` — BMI, BMR, TDEE, ideal weight, projection
3. `CYB_Steps.js` — step definitions, buildVisible, totalQ, curQ
4. `CYB_Engine_STABLE.js` — signals, routes, messages, scoring, profiles, safety tags
5. `CYB_Psych.js` — psychological context, flow messages, personal letter system
6. `CYB_Recipes.js` — 90 recipes, day plan builder, shopping list
7. `CYB_Training.js` — 166 exercises, 26 sessions, training plan builder
8. `CYB_Render.js` — all renderers, dispatch map
9. Inline script — state management, render(), cybCheckout(), event handlers

### MINI Questionnaire

| # | ID | Type | Purpose |
|---|-----|------|---------|
| — | welcome | welcome | Landing screen |
| 1 | name | text | First name |
| 2 | age | number | Age |
| 3 | measures | measures | Height + weight |
| 4 | activity | activity | Activity level (4 options) |
| 5 | goal | cards | Primary goal (4 options: slăbire, tonifiere, energie, sănătate) |
| 6 | moment | cards | Life moment (6 options: postpartum, divorț, hormonal, burnout, pierdere, general) |
| 7 | gdpr_email | gdpr_email | Email (optional) + GDPR consent |
| — | mini_results | mini_results | Results screen with upgrade path |

**MINI total questions:** 7 (6 data + 1 email/GDPR)

### COMPLET Questionnaire

**5 blocks, 25 questions (+ 5 transitions + results):**

#### Block 1: Despre Tine (4 questions)
| ID | Type | showIf |
|----|------|--------|
| q1 | single | — |
| q3 | single | — |
| q4 | single | — |
| q4b | single | `profile.moment === 0` (postpartum only) |

#### Block 2: Stilul Tău de Viață (5 questions)
| ID | Type | showIf |
|----|------|--------|
| q5 | single | — |
| q6 | single | — |
| q8 | single | — |
| q9 | multi | — |
| q9b | scale (0-5) | — |

#### Block 3: Sănătate & Limitări (6 questions)
| ID | Type | showIf |
|----|------|--------|
| q10 | multi | — |
| q11 | textarea | — (optional) |
| q12 | multi | — |
| q13 | single | — |
| qCycle | single | — |
| q13b | multi | function: `moment===2 OR qCycle===1 OR qCycle===2` |

#### Block 4: Alimentația Ta (10 questions)
| ID | Type | showIf |
|----|------|--------|
| q14 | single | — |
| qBreakfast | single | — |
| q15 | single | — |
| qLateEating | single | — |
| q16 | single | — |
| q17 | single | — |
| q18 | multi | — |
| q19 | single | — |
| q19b | multi | — |
| q19c | single | — |
| q19d | textarea | — (optional) |

*Note: q19d is the 11th item in block 4 but is optional/textarea*

#### Block 5: Motivație (2 questions)
| ID | Type | showIf |
|----|------|--------|
| q20 | multi | — |
| q21 | single | — |

**Conditional logic:**
- `q4b` — shows only for postpartum route (moment === 0)
- `q13b` — shows for hormonal route (moment === 2) OR irregular cycle (qCycle === 1) OR menopause (qCycle === 2)
- `buildVisible()` supports both object-based (`{field, values}`) and function-based showIf

**Removed questions (D4):** q2 (body shape), q7 (daily routine)
**Added questions (D4):** qCycle, qBreakfast, qLateEating
**Optional questions:** q11, q19d

### Key Signals Extracted

From `interpretSignals(profile, ans)`:

| Signal | Type | Derived From |
|--------|------|-------------|
| `overwhelmed` | boolean | stress ≥ 2 AND sleep ≥ 2 |
| `selfBlame` | boolean | emotional eating ≥ 1 AND diets ≥ 2 |
| `actionCapacity` | string | low/medium/high from stress + sleep + motivation |
| `shameRisk` | boolean | emotional eating ≥ 1 OR diet history ≥ 3 |
| `structureNeed` | string | low/medium/high from motivation + meal pattern |
| `pressureTolerance` | string | low/medium/high from stress + overwhelmed |
| `motivationStyle` | string | curiosity/action/commitment from q21 value |

---

## 5. ENGINE (LOGIC)

### Scoring Functions

| Function | Formula | Output |
|----------|---------|--------|
| `calcBMI(w, h)` | w ÷ (h/100)² | BMI value |
| `calcBMR(w, h, a)` | (10×w) + (6.25×h) - (5×a) - 161 | kcal/day (Mifflin-St Jeor, female) |
| `calcTDEE(bmr, act)` | bmr × [1.2, 1.375, 1.55, 1.725][act] | kcal/day |
| `calcStressScore(ans)` | Weighted: sleep×2.5 + stress×2.5 + emoEat×1.5 + water×0.8 + diets×0.5 → normalized to 0-100 | Percentage |
| `calcHormonalScore(profile, ans)` | Points: age 40+ → +15, age 45+ → +15, hormonal moment → +20, symptoms, sleep, weight change → max 100 | Percentage |
| `idealWeight(h)` | BMI 18.5–24.9 × (h/100)² | kg range |
| `projWeeks(current, target)` | ceil(diff ÷ (500×7/7700)), capped 52 | weeks |

### Route System

| Route | Trigger (moment value) |
|-------|----------------------|
| POSTPARTUM | 0 |
| DIVORCE | 1 |
| HORMONAL | 2 |
| BURNOUT | 3 |
| LOSS | 4 |
| GENERAL | 5 |

`resolveRoute()` returns `{route, confidence, source, notes}`

### Message Engine

- **ENGINE_MESSAGES:** 27 entries (19 route-specific + 6 transition + 2 general)
- **Selection:** `selectMessage()` scores by route match (+100), purpose, context (+50), block (+40), conditions (+30)
- **Fallback:** `"Ești în locul potrivit. Hai să construim împreună."`
- **Personalization:** `[Prenume]` → user name

### Metabolic Profiles (6)

| Profile ID | Name | Trigger |
|-----------|------|---------|
| postpartum | Profil Postpartum Recovery | Postpartum route |
| pierdere | Profil Îngrijire Blândă | Loss route |
| antiCortizol | Profil Anti-Cortizol | High stress |
| hormonalReset | Profil Hormonal Reset | High hormonal score |
| metabolismLent | Profil Metabolism Lent | Low activity + age factors |
| echilibrat | Profil Echilibrat | Default/balanced |

### Safety Tags (14 possible)

NO_KNEE, NO_BACK_L, NO_BACK_C, NO_SHOULDER, NO_HIP, NO_DISC, PELVIC_SAFE, NO_DIASTASIS, NO_STANDING_LONG, NO_POSITION_CHANGE, BEGINNER, BODYWEIGHT_ONLY, POSTPARTUM, BREASTFEEDING

### Psychological Layer (CYB_Psych.js)

| Function | Purpose |
|----------|---------|
| `buildPsychContext()` | Assembles full psychological context from engine outputs |
| `resolveToneProfile()` | Determines communication tone from signals + route |
| `buildFlowMessage()` | Selects fragments for transitions/results messages |
| `buildPersonalLetter()` | Multi-section personal letter (opening → reflection → pattern → reframe → direction → soft_action → closing) |
| `getPersonalLetterPolicy()` | Policy gate: determines if letter can be built |

**Personal letter:** 250-400 words, 500+ chars, 7 section types (3 required: opening, direction, closing)

---

## 6. RESULTS OUTPUT

### MINI Results Screen
| Section | Personalized? | Content |
|---------|-------------|---------|
| Header | ✅ name | "Rezultatele tale, [name]" |
| Route detection | ✅ moment | Route label + color |
| BMI visualization | ✅ weight, height | Gauge + category |
| Recommendations | ✅ BMI, goal, age | Personalized recommendation paragraph |
| Free resources | ❌ static | 3 PDF/community items |
| Blurred teaser | ✅ calculated | BMR, TDEE, macros, projection, ideal weight (blurred overlay) |
| Upgrade plans | ❌ static | 7 plan options + WhatsApp CTA |

### COMPLET Results Screen (current deployed = D5, local = D7)

**Deployed order (D5):**

| # | Section | Personalized? |
|---|---------|-------------|
| 1 | Header (tag + title + route + Q count) | ✅ name, route, Q count |
| 2 | Validation message | ✅ route + signals → engine message |
| 3 | Personal letter | ✅ full psych context → 7-section letter |
| 4 | Metabolic profile card | ✅ profile name + description |
| 5 | Stress index (score bar) | ✅ calculated from answers |
| 6 | Hormonal index (score bar) | ✅ calculated from answers |
| 7 | Caloric needs (BMR + TDEE) | ✅ calculated from profile |
| 8 | Safety tags | ✅ from health answers |
| 9 | Program parameters (grid) | ✅ from answers |
| 10 | Meal preview — Day 1 | ✅ buildDayPlan from profile + answers |
| 11 | Shopping list | ✅ from day plan |
| 12 | Meal teaser (days 2-7, blurred) | ❌ static placeholder |
| 13 | Training preview — Week 1 | ✅ buildTrainingPlan from profile + answers |
| 14 | Training teaser (weeks 2-12, blurred) | ❌ static placeholder |
| 15 | Results text + Daniela quote | ✅ engine message |
| 16 | CTA zone (3 packages + WhatsApp) | ❌ static packages |

**D6+D7 additions (deployed `38dec78`):**
- D6: Pre-result anticipation animation (2.8s, first render only)
- D7: Key Takeaways block (after letter, before profile card) — 3-4 personalized observations from stress/hormonal/meal/diet/sleep data
- D7: Improved meal preview heading with TDEE context line
- D7: Improved training preview heading with experience level, session time, equipment count
- D7: Value bridge paragraph connecting insights → action before CTA
- D7: Deliverables checklist in CTA zone (4 items: plan alimentar, program antrenament, raport, ghidare)
- D7: Reassurance footer (data protection message)

### Recipe System
- **Database:** 90 recipes (20 breakfast, 25 lunch, 25 dinner, 20 snacks)
- **Day plan:** 5 slots (breakfast, lunch, snack1, dinner, snack2)
- **Per meal data:** title, kcal, protein, prep time, ingredients, instructions
- **Shopping list:** De-duplicated ingredients from day plan

### Training System
- **Exercise DB:** 166 unique exercises (with Romanian + English names, instructions, modification rules)
- **Session DB:** 26 sessions across 9 types (full body light/medium, lower body, upper body, mobility, recovery, walking, low impact home, postpartum)
- **Plan output:** Weekly goal, frequency, sessions with title/duration/intensity/exercises
- **Safety:** Sessions filtered by safety tags from health answers

---

## 7. KNOWN LIMITATIONS

### Manual Processes (Daniela delivers manually)

| Asset | Package | Status |
|-------|---------|--------|
| Plan alimentar 7 zile | Essential | `pending_manual` |
| Program antrenament 4 săptămâni | Essential | `pending_manual` |
| Plan alimentar 30 zile | Premium, Coaching | `pending_manual` |
| Program antrenament 12 săptămâni | Premium, Coaching | `pending_manual` |
| Raport complet analiză detaliată | Premium, Coaching | `pending_manual` |
| Suport WhatsApp 30 zile | Premium, Coaching | `pending_manual` |
| Coaching 1:1 | Coaching | `pending_manual` |
| Ajustări săptămânale | Coaching | `pending_manual` |
| Acces comunitate VIP | Coaching | `pending_manual` |

### Automated Deliveries

| Asset | Package | Status |
|-------|---------|--------|
| Email confirmare comandă | All (including custom) | `delivered` ✅ |
| Raport metabolic personalizat | All (including custom, with N-day nutrition plan) | `delivered` ✅ |

### Other Limitations
- **No database:** Stripe is the only persistence layer (session metadata stores profile)
- **No user accounts:** No login, no dashboard
- **Metabolic report + N-day nutrition plan:** Now auto-delivered for all packages (N4–N6). Essential defaults to 7 days; custom uses selected duration (14–90 days).
- **Training plan still manual:** Meal plan is auto-generated in report; training plan shown in questionnaire is preview only; paid training deliverables are manually created by Daniela
- **Report access:** Uses Stripe session ID as unguessable token (no expiry, no revocation)
- **Admin endpoint:** `/api/admin/orders` — read-only Stripe query, protected by `ADMIN_API_KEY`
- **No retry mechanism:** If webhook fails, no automatic retry (relies on Stripe's built-in retry)
- **Webhook idempotency:** In-memory Set is lost on restart (Stripe metadata flag is persistent backup)
- **Video placeholders:** Exercise DB has `video_id` field but no videos are linked

### Fallback Logic
- Stripe not configured → checkout shows "Serviciu indisponibil"
- Email send fails → non-fatal, logged, does not block user flow
- Personal letter policy rejects → falls back to engine validation message
- Recipe/training plan fails → section silently omitted from results
- Profile data missing from Stripe → report page shows "Date insuficiente"

---

## 8. COMPLETED STAGES

### Stage C (Monetization Pipeline)

| ID | Task | Status |
|----|------|--------|
| C1 | Stripe checkout integration (3 packages) | ✅ PASS |
| C2 | Stripe webhook fulfillment | ✅ PASS |
| C3 | Customer confirmation email | ✅ PASS |
| C4 | Daniela payment notification | ✅ PASS |
| C5 | Admin orders endpoint | ✅ PASS |
| C6 | Metabolic report generation (server-side) | ✅ PASS |
| C7 | Browser-viewable metabolic report | ✅ PASS |
| C8 | Package-aware success page | ✅ PASS |
| C9 | User follow-up email (COMPLET) | ✅ PASS |
| C10 | Centralized email sender config | ✅ PASS |
| C11 | Verified domain sender (support@changeyourbody.ro) | ✅ PASS |
| C12 | Success page email guidance + fallback | ✅ PASS |
| C13 | Final E2E production verification | ✅ PASS |

**Stage C: CLOSED** (all 13 items deployed and verified in production)

### Stage D (Optimization)

| ID | Task | Status |
|----|------|--------|
| D1 | High-conversion follow-up email | ✅ PASS (deployed) |
| D1A | Deliverability audit | ✅ PASS (verify-only) |
| D2 | Post-purchase operations audit | ✅ PASS (verify-only) |
| D4 | Questionnaire restructure | ✅ PASS (deployed) |
| D5 | UX flow optimization | ✅ PASS (deployed) |
| D6 | Psycho-flow conversion layer | ✅ PASS (deployed `38dec78`) |
| D7 | Results impact layer | ✅ PASS (deployed `38dec78`) |

---

## 9. OPEN AREAS (REAL ONLY)

### Not Implemented
- **Automated Premium/Coaching report delivery** — only Essential gets auto-report
- **Automated meal plan PDF generation** — preview exists in results, paid deliverable is manual
- **Automated training plan PDF generation** — preview exists in results, paid deliverable is manual
- **User accounts / login** — no auth system
- **Order dashboard for Daniela** — admin endpoint exists but no UI
- **Email unsubscribe** — no unsubscribe mechanism in follow-up emails
- **Report expiry/revocation** — session ID token has no TTL
- **Analytics dashboard** — GA4 + Meta Pixel track events but no custom dashboard
- **A/B testing infrastructure** — none
- **Exercise videos** — DB has video_id placeholders, no videos linked
- **Multi-language support** — Romanian only

### Env Vars Required (all confirmed set in Vercel)
| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API access |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_PRICE_ESSENTIAL` | Essential package price ID |
| `STRIPE_PRICE_PREMIUM` | Premium package price ID |
| `STRIPE_PRICE_COACHING` | Coaching package price ID |
| `RESEND_API_KEY` | Email sending |
| `ADMIN_API_KEY` | Admin endpoint auth |
| `NEXT_PUBLIC_SITE_URL` | Base URL for links |
| `EMAIL_REPLY_TO` | Optional reply-to override |

### Analytics
| Platform | ID |
|----------|-----|
| GA4 | `G-3YLYBMKY5N` |
| Meta Pixel | `1295926862451320` |

---

*This snapshot reflects the real deployed system state as of commit `38dec78`. All changes live on changeyourbody.ro.*
