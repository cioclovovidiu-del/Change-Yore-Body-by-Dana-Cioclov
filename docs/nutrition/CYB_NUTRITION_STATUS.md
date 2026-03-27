# CYB NUTRITION STATUS

> Last updated: 2026-03-27
> Source of truth: codebase audit (code wins over docs)

---

## 1. Current Reality

**What the nutrition engine actually does today:**
The engine contains a database of 90 recipes (20 breakfast, 25 lunch, 25 dinner, 20 snack) with full nutritional data (kcal, protein, carbs, fat). Given a user profile and questionnaire answers, it calculates daily caloric targets (TDEE minus route-aware deficit), distributes calories across 3-5 meal slots, filters recipes by dietary preferences, allergies, budget, prep time, and refused foods, then selects the best-matching recipe for each slot. It can generate single-day and multi-day plans with cross-day variety enforcement and aggregated shopping lists.

**Where users see it:**
- **COMPLET results screen** (`CompletResultsStep.tsx`): a 1-day meal plan preview showing recipes per slot with kcal/macros, slot targets, and a shopping list. This is a client-side computation shown inline — preview only.
- **Metabolic report** (`/report?sid=`): a multi-day nutrition plan (7 days default, or N days for custom packages) embedded in the server-rendered HTML report. Includes daily menus, per-meal nutritional info, and an aggregated shopping list.
- **Confirmation email**: the metabolic report is sent as an HTML email by the webhook, containing the same multi-day nutrition plan.

**What is automatic:**
- Caloric target calculation (TDEE, deficit, macros)
- Recipe filtering and selection
- Single-day and multi-day plan generation
- Shopping list aggregation
- Report rendering (both email and browser)

---

## 2. Core Nutrition Engine

### Main files
- `lib/cyb-recipes.ts` — recipe database, filtering, calorie targeting, day plan builder, multi-day builder, shopping list
- `lib/cyb-calc.ts` — BMR (Mifflin-St Jeor), TDEE, BMI calculations
- `lib/cyb-engine.ts` — route resolution and signal interpretation (used for deficit matrix)
- `lib/metabolic-report.ts` — HTML report builder that renders multi-day nutrition plans

### Key functions

| Function | File | Purpose |
|----------|------|---------|
| `calcSlotTargets(profile, ans)` | `cyb-recipes.ts` | Calculates daily kcal target (TDEE - route-aware deficit), macro targets (protein/fat/carbs), distributes across 3-5 meal slots |
| `filterRecipes(mealType, profile, ans)` | `cyb-recipes.ts` | Filters recipes by meal type, dietary preferences, budget, allergies, prep time, refused foods. Returns sorted array |
| `buildDayPlan(profile, ans)` | `cyb-recipes.ts` | Builds a deterministic 1-day meal plan. Returns `{ dailyKcal, slots, totalKcal, totalProtein, totalCarbs, totalFat }` |
| `buildMultiDayPlan(profile, ans, days)` | `cyb-recipes.ts` | Generates N-day plan with cross-day variety (soft-excludes previous day's recipes). Returns `{ days: [...], shoppingList }` |
| `shoppingList(plan)` | `cyb-recipes.ts` | Aggregates ingredients from a day plan into a deduplicated list with counts and source recipe references |
| `calcBMR(w, h, a)` | `cyb-calc.ts` | Mifflin-St Jeor female formula: 10w + 6.25h - 5a - 161 |
| `calcTDEE(bmr, act)` | `cyb-calc.ts` | TDEE = BMR x activity factor (1.2/1.375/1.55/1.725) |

### Recipe counts by type (verified)

| Meal Type | Count |
|-----------|-------|
| Breakfast | 20 |
| Lunch | 25 |
| Dinner | 25 |
| Snack | 20 |
| **Total** | **90** |

### Multi-day generation
`buildMultiDayPlan()` generates N days (default 7, configurable for custom packages up to 90 days). Each day uses `_buildDayPlanInternal()` with a `softExclude` set containing the previous day's recipe IDs. This ensures no recipe repeats on consecutive days. With 90 recipes across 4 meal types, the engine can sustain variety for 7-14 days before cycling. Longer plans (30-90 days) will eventually repeat recipes but not on consecutive days.

### Shopping list generation
`shoppingList()` and `_aggregateShoppingLists()` collect all ingredients from plan days, deduplicate by lowercase name, count occurrences, and track which recipes use each ingredient. The aggregated list is included in both the COMPLET results preview and the metabolic report.

### Targeting / macros logic
Caloric targeting uses a route-aware deficit matrix:

| Route | Lose deficit | Tone deficit | Energy/Health deficit |
|-------|-------------|-------------|----------------------|
| GENERAL | 400 | 200 | 0 |
| HORMONAL | 350 | 200 | 0 |
| BURNOUT | 250 | 150 | 0 |
| LOSS | 250 | 150 | 0 |
| DIVORCE | 400 | 200 | 0 |
| POSTPARTUM | 300 | 150 | 0 |

Caloric floors per route: GENERAL 1200, HORMONAL 1300, BURNOUT 1350, LOSS 1350, DIVORCE 1200, POSTPARTUM 1400.

Breastfeeding override: deficit = 0, +300 kcal added.

Macro distribution:
- Protein: 1.4-1.6 g/kg body weight (lower for BURNOUT/LOSS and maintenance goals)
- Fat: 25-30% of target kcal (higher for POSTPARTUM/HORMONAL/breastfeeding)
- Carbs: remainder after protein and fat

Slot distribution: 3 main meals + 0-2 snacks. Each slot gets a target kcal allocation. Recipe selection picks the closest match by caloric proximity.

### Exclusions / filtering
Recipes are filtered through multiple layers:

| Filter | Source | Mechanism |
|--------|--------|-----------|
| Dietary preference | `ans.q18` → `PREF_TAG_MAP` | traditional, mediterranean, simple, asian, vegetarian, quick. Preference matching against recipe `tags` |
| Vegetarian-only | Derived from q18 | If all preferences are vegetarian, excludes non-vegetarian recipes |
| Budget | `ans.q19` → `BUDGET_MAP` | low, medium, high. Recipe `budget` field checked against max budget tier |
| Allergies | `ans.q19b` → `ALLERGY_KEYWORDS` | 6 allergy groups (lactose, gluten, nuts, eggs, fish, soy) mapped to ingredient keywords. Recipes containing allergen ingredients excluded |
| Prep time | `ans.q19c` → `PREP_TIME_MAP` | Maps to 10/15/30/45/999 min. Recipes exceeding limit excluded |
| Refused foods | `ans.q19d` (free text) | User-entered food names split and matched against recipe titles and ingredients |
| Breastfeeding | `profile.moment === 0` + `ans.q4b` | Skips very low calorie meals (<300 kcal) for lunch/dinner |
| Medical exclusions | Recipe `exclusions` field | Recipes tagged with conditions (diabetes, hypothyroid, pcos, hypertension, breastfeeding) can be excluded |

---

## 3. Current Delivery State

### Preview in results
`CompletResultsStep.tsx` calls `buildDayPlan(profile, ans)` and renders a 1-day meal plan inline. Shows recipe names, kcal per slot, slot targets, macro totals, and a shopping list. This is computed client-side at render time — it is a preview, not a saved document.

### Inclusion in report
`lib/metabolic-report.ts` calls `buildMultiDayPlan(profile, ans, days)` and renders a multi-day nutrition plan in the HTML report. Default is 7 days. Custom packages pass `days` from `cyb_custom_days` metadata (14-90 days). The report includes daily menus with recipe details and an aggregated shopping list. This is server-rendered from Stripe session metadata.

### Post-purchase behavior
1. **Webhook fires** → generates metabolic report HTML containing multi-day nutrition plan → sends as email to customer
2. **Report page** (`/report?sid=`) → same report available as browser page (requires `cyb_fulfilled=true`)
3. **Manual delivery** → Daniela creates and sends a formal meal plan document (separate from the automated report)

The automated multi-day plan in the report is a functional nutrition plan with real recipes, macros, and shopping list. However, the formal "meal plan document" that customers expect (especially for Premium/Coaching) is still created manually by Daniela.

### Whether nutrition is fully automated or not
**Partially automated.** The engine generates a complete multi-day nutrition plan automatically, and it is delivered via the metabolic report (email + browser). However:
- The report format is a static HTML page, not an interactive plan
- Users cannot modify, swap, or regenerate recipes
- The formal meal plan document for Premium/Coaching is still manual
- There is no way for users to access their plan outside the report URL

---

## 4. Current Gaps

### No standalone nutrition page
There is no `/nutrition` or `/meal-plan` route. Users can only see their nutrition plan within the metabolic report HTML page (`/report?sid=`). The report is a single long page mixing metabolic analysis with the nutrition plan — there is no focused nutrition experience.

### No plan editability
The generated plan is static HTML. Users cannot:
- Swap a recipe they don't like for an alternative
- Regenerate a single day's menu
- Adjust caloric targets after initial generation
- Mark meals as completed or skipped

### No plan persistence
The plan is generated on-the-fly from profile data in Stripe metadata each time the report is rendered. There is no database storing the generated plan. If the engine code changes (e.g., new recipes added, filtering logic updated), the report URL will render a different plan than what was originally sent by email. There is no snapshot mechanism.

### No ingredient quantities
Recipes list ingredients by name only (e.g., "ouă", "broccoli", "ulei de măsline") without specific quantities or weights. The shopping list counts ingredient occurrences across recipes but does not specify amounts. This limits the plan's usefulness as a practical cooking guide.

### No portion scaling
Recipes have a `servings` field (1, 2, or 4), but the plan does not scale ingredient quantities to match the user's caloric needs. A recipe with `kcal: 320` is selected as-is even if the slot target is 400 kcal. The gap between slot target and actual recipe kcal is not addressed.

---

## 5. Readiness Assessment

### Automation readiness
**HIGH**

- The engine already generates complete multi-day nutrition plans automatically
- All filtering dimensions are implemented (preferences, allergies, budget, prep time, refused foods)
- Route-aware caloric targeting with deficit matrix and macro distribution is working
- Multi-day variety enforcement prevents consecutive-day repeats
- The main gap is format and persistence, not computation

### Report readiness
**HIGH**

- Multi-day nutrition plans are already embedded in the metabolic report
- Shopping list aggregation is functional
- Custom duration packages already pass N days and get N-day plans
- Report is served both as email and as browser page
- No further work needed for report-level nutrition delivery

### Standalone page readiness
**MEDIUM**

- The data layer (`buildMultiDayPlan`, `shoppingList`) is complete
- Report page pattern (`/report?sid=`) provides the Stripe session gate model
- Missing: dedicated page component, recipe card UI, day navigation, mobile-optimized layout
- Missing: plan persistence (currently recomputed on every render)
- Estimated scope: moderate — rendering new UI for existing data, plus a storage decision

### Membership/app readiness
**LOW**

- No user authentication system exists (all access is via Stripe session ID)
- No database for storing plans, preferences, or user state
- No recipe swap or regeneration API
- No progress tracking or meal logging
- Building a full nutrition app would require a backend database, auth system, and significant new UI
- The recipe engine is solid but everything around it (persistence, interactivity, user accounts) is missing

---

## 6. Recommended Next Actions

1. **Add ingredient quantities to recipes** — Update the 90 recipes in `RECIPES` array to include specific amounts (e.g., "2 ouă", "100g broccoli"). This is a data task, not an engineering task, but dramatically increases plan value.

2. **Build standalone nutrition page** — Create `/nutrition?sid=<stripe_session_id>` showing the multi-day meal plan with day-by-day navigation, recipe cards, and shopping list. Reuse Stripe session gate from report page. Server-rendered, read-only initially.

3. **Snapshot plan at generation time** — When the webhook generates the report, save the plan output (JSON) to Stripe metadata or an external store. Serve the snapshot instead of recomputing. This ensures plan stability across code changes.

4. **Add recipe swap functionality** — On the standalone page, allow users to tap a recipe and see 2-3 alternatives from the same meal type and caloric range. This requires a small API endpoint but uses existing `filterRecipes()` logic.

5. **Automate formal meal plan document** — Generate a formatted PDF or styled HTML document from `buildMultiDayPlan()` output. This replaces Daniela's most time-consuming manual task for Premium/Coaching packages.
