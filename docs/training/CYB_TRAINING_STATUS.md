# CYB TRAINING STATUS

> Last updated: 2026-03-27
> Source of truth: codebase audit (code wins over docs)

---

## 1. Current Reality

**What the training engine actually does:**
The engine contains a database of 26 structured workout sessions and 166 exercises. Given a user profile and questionnaire answers, it filters sessions by safety constraints, equipment, experience level, time budget, and goal — then selects a weekly plan of N sessions (typically 2-5). Each session has full structure: warm-up, main circuit, cool-down with named exercises, sets, reps, and rest periods.

**What users currently see:**
- **COMPLET results screen**: a weekly training plan preview showing selected sessions with exercises, sets/reps/rest. This is rendered inline in `CompletResultsStep.tsx` — it is a preview, not a deliverable.
- **Metabolic report** (`/report?sid=`): training session overview embedded in the server-rendered HTML report. Shows session titles and structure summaries.

**What is preview-only:**
The training plan shown in COMPLET results and the metabolic report are generated in real-time from the engine. They are not saved, not versioned, and not accessible outside the report page. There is no standalone training program page.

**What is manually delivered:**
- Full 4-week training program (Essential package) — created by Daniela
- Full 12-week training program (Premium/Coaching packages) — created by Daniela
- All programs sent as documents via email by Daniela after purchase

---

## 2. Core Training Engine

### Main files
- `lib/cyb-training.ts` — session database, exercise database, filtering, plan building, exercise enrichment

### Key functions

| Function | Purpose |
|----------|---------|
| `filterSessions(profile, ans)` | Filters `SESSIONS` array by safety tags, equipment, experience, duration, stress/capacity. Returns sorted array. |
| `buildTrainingPlan(profile, ans)` | Builds a weekly plan: resolves frequency, selects sessions by type priority and goal matching. Returns `{ weeklyGoal, frequency, sessions, totalMinutes }`. |
| `enrichExercise(ex)` | Looks up exercise name in `EXERCISE_DB`, attaches English name, instructions, `video_id`, `modify_if`. |
| `getSafetyTags(profile, ans)` | (imported from `cyb-engine.ts`) Generates safety tag array from health conditions and limitations. |

### Counts (verified from code)
- **Sessions**: 26 structured sessions
- **Exercises in DB**: 166 unique entries in `EXERCISE_DB`
- **Session types**: `full_body_light` (4), `full_body_medium` (3), `lower_body` (4), `upper_body` (3), `mobility` (2), `recovery` (1), `walking` (3), `low_impact_home` (4), `postpartum_safe` (2)

### Filtering dimensions

| Dimension | Source | Mechanism |
|-----------|--------|-----------|
| Experience level | `ans.q13` → `EXP_MAP` | Maps to beginner/intermediate/advanced; checks `suitableFor` |
| Time budget | `ans.q8` → `TIME_MAP` | Maps to 15/20/30/45/60 min; filters by `durationMin` |
| Equipment | `ans.q9` → `EQUIP_MAP` | Maps to bodyweight/chair/mat/bands/dumbbells/kettlebell; all session equipment must be available |
| Safety tags | `getSafetyTags()` output | Tags with `type: "exclude"` checked against session `avoidFor` array |
| Stress/capacity | `ans.q5` (sleep) + `ans.q6` (stress) | `isLowCapacity` flag adjusts session intensity filtering |
| Postpartum | `profile.moment === 0` | Enables postpartum_safe type priority |

### Safety handling
`getSafetyTags()` in `cyb-engine.ts` generates tags from `ans.q12` (physical limitations):
- `NO_KNEE`, `NO_BACK_L`, `NO_BACK_C`, `NO_SHOULDER`, `NO_HIP`, `NO_DISC`, `PELVIC_SAFE`, `NO_DIASTASIS`, `NO_STANDING_LONG`, `NO_POSITION_CHANGE`
- Plus context tags: `BEGINNER`, `BODYWEIGHT_ONLY`, `POSTPARTUM`, `BREASTFEEDING`

Tags with `type: "exclude"` are checked against each session's `avoidFor` array. Sessions with matching avoidFor tags are filtered out. Exercises can also have `modify_if` notes in the DB for conditional modifications.

### Equipment handling
Equipment mapping from questionnaire answer indices to session tags:
- 0: bodyweight, 1: chair, 2: mat, 3: bodyweight (water bottles), 4: bands, 5: dumbbells_light, 6: dumbbells_medium, 7: dumbbells_heavy, 8: kettlebell, 9: bodyweight (stationary bike — mapped to bodyweight since no session uses it)
- `bodyweight` and `mat` are always assumed available

### Route / goal handling
- **Goal-based type priority**: `GOAL_TYPE_PRIORITY` maps goal index (lose/tone/energy/health) to ordered session type lists
- **Postpartum priority**: `PP_TYPE_PRIORITY` — prioritizes postpartum_safe, recovery, walking, mobility
- **Low capacity priority**: `LOW_CAP_PRIORITY` — prioritizes walking, mobility, recovery, low_impact_home
- **Frequency resolution**: `resolveFrequency()` determines weekly session count (2-5) based on experience, time budget, and stress level

---

## 3. Current Delivery State

### COMPLET results preview
`CompletResultsStep.tsx` calls `buildTrainingPlan(profile, ans)` and renders the weekly plan inline. Shows session titles, type, exercises with sets/reps, total minutes. This is a live computation — not persisted, not downloadable.

### Report inclusion
`lib/metabolic-report.ts` includes a training overview section in the HTML report. Uses the same `buildTrainingPlan()` function. The report is server-rendered from Stripe session metadata at `/report?sid=` and sent via email by the webhook.

### Webhook asset manifest behavior
In `app/api/stripe-webhook/route.ts`, the `PACKAGE_ASSETS` manifest defines:
- Essential: `training_4w` with `status: "pending_manual"`, `note: "Daniela generates manually from questionnaire data"`
- Premium: `training_12w` with `status: "pending_manual"`
- Coaching: `training_12w` with `status: "pending_manual"`
- Custom: no training asset listed

### What is automatic vs pending_manual

| Asset | Delivery | Status |
|-------|----------|--------|
| Weekly training plan preview (COMPLET results) | Automatic (client-side render) | Live computation, not persisted |
| Training overview in metabolic report | Automatic (server-side render) | Embedded in report HTML |
| 4-week structured program | Manual | Daniela creates |
| 12-week structured program | Manual | Daniela creates |

---

## 4. Current Gaps

### No 4-week progression logic
`buildTrainingPlan()` generates a single weekly plan. The same sessions repeat every week with no changes. There is no:
- Volume progression (increasing sets/reps across weeks)
- Intensity scaling (heavier weights, shorter rest periods)
- Exercise substitution for variety
- Deload week logic
- Week numbering or phase tracking

### No 12-week progression logic
No 12-week code exists anywhere in the codebase. The docs file `docs/training/CYB_TRAINING_12WEEK_AND_NAMING.md` describes a planned system, but no implementation was started. There is no periodization (base/build/peak/deload), no mesocycle structure, no progression algorithms.

### No /program page
There is no `/program` route. Users cannot:
- View their training program interactively after purchase
- Track workout completion
- See exercise instructions or videos inline
- Access their plan on mobile as a workout guide

### No exercise media
The `ExerciseDBEntry` interface has a `video_id?: string` field. `enrichExercise()` reads it and returns `video_id: (db).video_id || null`. However, all 166 exercises in `EXERCISE_DB` have no `video_id` value populated. There is no video player component, no YouTube/Vimeo integration, no image assets for exercises.

### No gym support
All 26 sessions use only home equipment: bodyweight, mat, chair, bands, dumbbells (light/medium/heavy), kettlebell. There are no:
- Gym-specific sessions (barbell, cable machine, smith machine, leg press, etc.)
- Equipment type for gym machines in `EQUIP_MAP`
- Questionnaire option for gym access (q19 only lists home items)

### Schema limitations relevant to future implementation
- `Session` interface has no `week` or `phase` field — would need extension for multi-week plans
- `Session` has no `progressionFrom` or `nextSession` field — no built-in session chaining
- `ExerciseDBEntry` has `video_id` but no `image_url`, `difficulty_level`, or `muscle_groups` fields
- No `TrainingProgram` type exists — only individual sessions and a flat weekly plan output

---

## 5. Readiness Assessment

### 4-week readiness
**HIGH**

- `buildTrainingPlan()` already produces a solid weekly plan with safety, equipment, and goal filtering
- The session database (26 sessions) provides enough variety for 4 weeks of non-repeating workouts at 3-4x/week
- `filterSessions()` already handles all constraint dimensions; a progression layer wraps on top, not replaces
- Main work: add `buildFourWeekPlan()` that calls `buildTrainingPlan()` for week 1, then applies volume/intensity deltas for weeks 2-4

### 12-week readiness
**LOW**

- Depends on 4-week being implemented first (builds on the same progression primitives)
- 26 sessions may not provide enough variety for 12 weeks without repeats; may need 10-15 additional sessions
- Requires periodization design decisions (linear vs undulating, mesocycle structure, deload frequency) that haven't been made
- No `TrainingProgram` interface exists — must be designed from scratch

### Program page readiness
**MEDIUM**

- Report page (`app/report/page.tsx`) provides a pattern for Stripe session-gated server rendering
- `buildTrainingPlan()` + `enrichExercise()` can generate the plan data; rendering is the main new work
- Missing: authentication model (currently uses Stripe session ID as access token), workout state tracking, mobile-optimized layout
- Could be built as a read-only viewer relatively quickly; interactivity (completion tracking) adds significant scope

### Video/media readiness
**MEDIUM**

- Data model is ready: `ExerciseDBEntry.video_id` exists, `enrichExercise()` propagates it
- 166 exercises need video IDs populated (manual data entry effort, not code)
- No player component exists — needs to be built, but straightforward (YouTube embed or similar)
- Blocked by: sourcing 166+ exercise videos (content creation, not engineering)

### Gym readiness
**LOW**

- No gym equipment types defined in `EQUIP_MAP`
- No gym sessions in `SESSIONS` database — would need 10-15 new sessions minimum
- Questionnaire q19 lists only home equipment — needs new options or a location question
- Filtering logic supports the pattern (equipment matching) but data doesn't exist
- Requires both new content (sessions + exercises) and questionnaire changes

---

## 6. Recommended Implementation Order

1. **Build 4-week training progression** — Extend `buildTrainingPlan()` with a `buildFourWeekPlan()` wrapper. Week 1 = current plan. Weeks 2-4 apply progression rules (add 1 set in week 2, increase reps in week 3, deload in week 4). Output a structured `TrainingProgram` type. This directly replaces Daniela's most frequent manual task (Essential package).

2. **Build `/program` page** — Create `/program?sid=<stripe_session_id>` as a server-rendered program viewer. Reuse the report page pattern (Stripe session gate, profile extraction). Render the 4-week training plan with day-by-day exercise details. Read-only initially.

3. **Populate exercise video IDs** — Source exercise demonstration videos. Add YouTube video IDs to `EXERCISE_DB` entries. Build a minimal video player component (YouTube iframe embed). Wire into the `/program` page exercise view.

4. **Design 12-week periodization** — Define mesocycle structure, progression curves, deload scheduling. Requires product decisions (linear vs undulating, how to handle plateaus). Build on top of 4-week primitives.

5. **Build 12-week training system** — Implement `buildTwelveWeekPlan()` using the designed periodization model. May require adding 10-15 new sessions for variety. Wire into Premium/Coaching delivery.

6. **Add gym support** — Create gym session variants, add equipment types, extend questionnaire. This is the lowest priority as the current target audience trains at home.

---

## 7. Risks

### Legacy risks
- `public/landing-v2/CYB_Training.js` is the original vanilla JS version of the training engine. It is superseded by `lib/cyb-training.ts` but still exists in `public/` and may be loaded by `index.html`. If the landing page references it directly (outside the React iframe), users could see stale training data.

### Doc/code mismatch risks
- `docs/training/CYB_TRAINING_12WEEK_AND_NAMING.md` describes a 12-week system that does not exist in code. Anyone reading this doc may assume the feature is partially implemented — it is not.
- `docs/training/cyb_training_video_pipeline.md` describes a video pipeline that is not implemented. The pipeline architecture may be outdated by the time videos are actually added.
- `docs/training/CYB_TRAINING_ENGINE_AUDIT.md` may reference counts or structures that have changed since the audit was written — always verify against `lib/cyb-training.ts`.

### Delivery risks
- The weekly plan shown in COMPLET results is computed client-side and not saved. If the user's profile or answers change (e.g., different browser, cleared localStorage), the plan changes. There is no plan versioning.
- The training overview in the metabolic report is computed server-side from Stripe metadata at render time. If the engine code changes, existing report URLs will show updated (potentially different) plans. There is no snapshot of the original plan.
- The webhook marks `training_4w` and `training_12w` as `pending_manual` — if automated delivery is built, the webhook asset manifest and delivery result logic must be updated to reflect the new automated status.
