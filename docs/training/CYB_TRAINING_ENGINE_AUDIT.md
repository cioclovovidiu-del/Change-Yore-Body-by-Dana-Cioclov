# CYB TRAINING ENGINE AUDIT

**Date:** 27 March 2026  
**Source:** Live GitHub repo (cloned, verified up to date)  
**Scope:** Training automation + illustration feasibility for membership area

---

## 1. STATUS

**PARTIAL** — Aceeași situație ca nutriția. Generatorul de 1 săptămână funcționează complet (26 sesiuni, 165 exerciții, filtrare pe echipament/nivel/limitări/siguranță). Preview-ul apare pe COMPLET results. Livrarea post-plată e manuală (`"pending_manual"`). Lipsește wrapper-ul multi-week + wire în webhook.

---

## 2. CE EXISTĂ (VERIFICAT)

### Baza de date — 26 sesiuni de antrenament

| Tip sesiune | Număr | Descriere |
|-------------|-------|-----------|
| full_body_light | 4 | Începătoare / recovery-friendly |
| full_body_medium | 3 | Intermediar |
| lower_body | 4 | Picioare + fesieri |
| upper_body | 3 | Brațe + spate + piept |
| low_impact_home | 4 | Acasă, fără impact |
| walking | 3 | Plimbări structurate |
| postpartum_safe | 2 | Sigure postpartum |
| mobility | 2 | Mobilitate + stretching |
| recovery | 1 | Recuperare |

### Baza de date — 165 exerciții unice (EXERCISE_DB)

| Categorie | Număr |
|-----------|-------|
| Lower body (squat, lunge, glute, hip, bridge) | 47 |
| Upper body (press, row, curl, push-up) | 38 |
| Mobility / Stretch | 40 |
| Cardio / Walking | 22 |
| Core (plank, crunch, dead bug) | 18 |
| Recovery / Breathing | 9 |

Fiecare exercițiu are:
- `name` — numele în română
- `en` — numele în engleză
- `instr` — instrucțiune text scurtă ("Cum faci")
- `video_id` — **câmp definit dar GOL pentru toate cele 165** (zero video-uri linkate)
- `modify_if` — **câmp definit dar GOL** (zero modificări condiționate)

~150 mișcări de bază unice + ~15 variante (același exercițiu cu echipament diferit, ex: "Bent over row" / "Bent over row cu bandă" / "Bent over row cu gantere" / "Bent over row cu sticle").

### Fiecare sesiune conține structura completă

```
Session {
  id, title, type,
  goalTags[],           // lose | tone | energy | health
  intensity (1-5),
  durationMin,
  suitableFor[],        // beginner | intermediate | advanced | postpartum | low_stress
  avoidFor[],           // NO_KNEE, NO_BACK_L, NO_DISC, etc. (safety tags)
  equipment[],          // bodyweight | mat | chair | bands | dumbbells_light | etc.
  structure: [{
    block: "Încălzire" | "Circuit principal" | "Răcire",
    duration: "3 min",
    exercises: [{ name, sets, reps, rest }]
  }]
}
```

### Generatorul — `buildTrainingPlan()` — FUNCȚIONAL

1. **`resolveFrequency(profile, ans)`** — frecvență săptămânală (2-5 sesiuni):
   - activity 0 → 2/săpt, activity 1 → 3, activity 2 → 4, activity 3 → 5
   - Reduce pentru stres ridicat (-1), somn prost (-1)
   - Cap: postpartum → max 3, burnout/loss → max 3, minim absolut → 2

2. **`filterSessions(profile, ans)`** — filtrare pe:
   - Durata sesiunii vs. timp disponibil (q8)
   - Echipament necesar vs. disponibil (q9)
   - Nivel experiență (q13)
   - Safety tags din `getSafetyTags()` → exclude sesiuni incompatibile
   - Postpartum → permite doar sesiuni postpartum-safe
   - Low capacity (stres ≥ 2 + somn ≥ 2) → exclude intensitate > 2

3. **`buildTrainingPlan(profile, ans)`** — selecție deterministă:
   - Alege sesiuni pe baza priorității de tip (goal-aware, postpartum-aware, low-capacity-aware)
   - Varietate: maxim 1 sesiune per tip per trecere
   - Garantează recovery/mobility dacă frecvență ≥ 3
   - Sortare finală: intensitate crescătoare (ușor → greu prin săptămână)
   - Output: `{ weeklyGoal, frequency, sessions[], totalMinutes }`

4. **Fallback dublu:**
   - Dacă zero sesiuni trec filtrul → fallback la sesiuni intensitate ≤ 2 fără avoidFor
   - Dacă încă zero → fallback final la walking + mobility + recovery

### Preview pe COMPLET results — FUNCȚIONAL
- `CYB_Render.js` liniile 601-638
- Afișează "Antrenament personalizat — Săptămâna 1" cu sesiunile reale
- Sub: blur teaser "Săptămânile 2-12 — Progresie completă" (text static, decorativ)

### Webhook — `"pending_manual"`
- Essential: `training_4w` → `"pending_manual"`
- Premium + Coaching: `training_12w` → `"pending_manual"`

---

## 3. CE LIPSEȘTE

### Pentru automatizare training (similar cu nutriția):

| Gap | Detalii |
|-----|---------|
| `buildWeeklyProgression()` | Nu există wrapper multi-săptămânal. `buildTrainingPlan` generează 1 săptămână. Nu există logică de progresie (crește intensitatea/volume în timp). |
| Wire în webhook | Training delivery e manual. Trebuie generat + trimis automat la plată. |
| `video_id` gol | Toate cele 165 exerciții au câmpul definit dar nicio valoare. Zero video-uri linkate. |
| `modify_if` gol | Zero modificări condiționate definite. Câmpul există dar nu e populat. |

### Pentru membership area cu ilustrații:

| Gap | Detalii |
|-----|---------|
| Ilustrații exerciții | Zero ilustrații. Trebuie generate ~165 (sau ~100 dacă grupăm variantele). |
| Membership page | Nu există. Trebuie: pagină protejată, acces token-based din Stripe, afișare plan + exerciții cu ilustrații. |
| Auth/access control | Zero auth system. Raportul metabolic folosește Stripe session ID ca "token" (unguessable) — aceeași abordare poate funcționa. |
| Grup muscular per exercițiu | Nu există. EXERCISE_DB nu are câmp `muscleGroups`. Trebuie adăugat + populat. |

---

## 4. CE TREBUIE ADĂUGAT LA EXERCISE_DB PENTRU ILUSTRAȚII

Structura actuală:
```typescript
interface ExerciseDBEntry {
  en: string;
  instr: string;
  video_id?: string;
  modify_if?: string;
}
```

Structura necesară pentru membership + ilustrații:
```typescript
interface ExerciseDBEntry {
  en: string;
  instr: string;
  video_id?: string;
  modify_if?: string;
  // NOU:
  muscleGroups: string[];     // primary muscles: 'quads','glutes','hamstrings','chest','back','shoulders','biceps','triceps','core','calves','hip_flexors','full_body'
  illustrationId?: string;    // referință la ilustrația anatomică (filename/asset key)
  difficulty: 1 | 2 | 3;     // 1=începător, 2=intermediar, 3=avansat
  category: string;           // 'lower_body','upper_body','core','mobility','cardio','recovery'
}
```

---

## 5. PLAN ILUSTRAȚII ANATOMICE AI

### Ce trebuie generat

- **~100-110 ilustrații unice** (165 exerciții minus ~55-65 variante care pot folosi aceeași ilustrație de bază)
- Stil: siluetă feminină anatomică + grupe musculare colorate (highlight)
- Fundal: transparent sau dark (#0F1923) pentru consistență cu brandul
- Format: SVG preferat (scalabil, ușor de integrat) sau PNG 800×800 ca fallback
- Consistență: **toate ilustrațiile trebuie să aibă același stil vizual** — aceasta e principala provocare

### Abordare recomandată

**Opțiunea 1: Batch generation cu AI (fastest)**
- Generăm un prompt master cu stil consistent
- Batch de ~100 ilustrații
- Revizuire + corecție manuală acolo unde postura e incorectă
- Estimare: 2-3 zile de lucru

**Opțiunea 2: SVG programmatic (most consistent)**
- Definim o siluetă feminină de bază ca SVG
- Per exercițiu: modificăm postura + colorăm grupele musculare
- Rezultat perfect consistent, scalabil, ușor de editat
- Estimare: 5-7 zile de lucru, dar calitate maximă

**Opțiunea 3: Hybrid**
- Siluetă bază SVG (1 template)
- Postura per exercițiu: AI-assisted positioning
- Grupe musculare: overlay SVG colorat programmatic din `muscleGroups[]`
- Estimare: 3-5 zile

### Mapping grupe musculare → culori (propunere)

| Grup muscular | Culoare | Hex |
|--------------|---------|-----|
| Quads | Teal (brand) | #1A9E9E |
| Glutes | Gold (brand) | #C9A84C |
| Hamstrings | Coral | #FF6B6B |
| Chest | Blue | #4A90D9 |
| Back (lats/traps) | Purple | #9B59B6 |
| Shoulders (delts) | Orange | #F39C12 |
| Biceps | Green | #27AE60 |
| Triceps | Pink | #E74C8E |
| Core (abs/obliques) | White/Light | #E0E0E0 |
| Calves | Teal dark | #157575 |
| Hip flexors | Rose | #FF9FF3 |
| Full body | Gradient teal→gold | — |

---

## 6. MEMBERSHIP AREA — STRUCTURĂ MINIMĂ

### Acces
- URL: `/program?sid={stripe_session_id}` (similar cu `/report?sid=...`)
- Guard: verifică Stripe session → fulfilled → packageId
- Nu necesită cont/login — token-based (session ID = 64+ chars, unguessable)

### Conținut per pachet

| Secțiune | Essential | Premium | Coaching |
|----------|-----------|---------|----------|
| Raport metabolic | ✅ | ✅ | ✅ |
| Plan alimentar | 7 zile | 30 zile | 84 zile |
| Program antrenament | 4 săpt | 12 săpt | 12 săpt + progresie |
| Bibliotecă exerciții cu ilustrații | ✅ | ✅ | ✅ |
| Shopping list | 1 | 4 (săptămânal) | 12 (săptămânal) |
| Suport WhatsApp | ❌ | 30 zile | nelimitat |
| Coaching 1:1 | ❌ | ❌ | ✅ |

### Pagina de antrenament — layout per sesiune

```
[Ilustrație exercițiu] [Grupe musculare highlight]
Squat la scaun (Chair Squat)
2 seturi × 10 repetări | Pauză: 30 sec
"Coboară controlat, împinge din călcâie la ridicare."
[Butoane: ✓ Done | ▶ Video (dacă există)]
```

---

## 7. ORDINEA DE IMPLEMENTARE

### Pas 1: Adaugă `muscleGroups` și `category` la EXERCISE_DB
- Populează toate cele 165 exerciții
- Nu necesită ilustrații — doar date

### Pas 2: Generează ilustrațiile (~100-110)
- Alege abordarea (AI batch / SVG programmatic / hybrid)
- Stochează în `public/exercises/` sau CDN
- Adaugă `illustrationId` la fiecare exercițiu

### Pas 3: Construiește membership page
- `/program?sid=...` — verifică Stripe, afișează conținut per pachet
- Antrenament: sesiunile cu exerciții + ilustrații + instrucțiuni
- Nutriție: planul alimentar + shopping list
- Raport: metabolic report (deja există)

### Pas 4: Wire automatizare
- `buildWeeklyProgression()` pentru training
- `buildWeekPlan()` pentru nutriție (din frozen rules)
- Webhook: schimbă `"pending_manual"` → `"delivered"` + link la membership page

---

## 8. VERDICT

Training engine-ul e la același nivel ca recipe engine-ul: **baza de date e solidă, generatorul de 1 săptămână funcționează, lipsește multi-week + delivery + ilustrații**. 

Diferența principală: training are nevoie de **content vizual** (ilustrațiile anatomice) pe care nutriția nu are. Asta face membership area + ilustrații dependente de un efort de generare grafică care nu e trivial — dar e perfect fezabil cu AI, mai ales dacă alegem o abordare SVG programmatică care garantează consistența stilului.

26 sesiuni × 165 exerciții e suficient pentru pachetele Essential și Premium. Pentru Coaching (12 săptămâni cu progresie), va trebui fie mai multe sesiuni, fie o logică de progresie care crește seturi/greutăți pe sesiunile existente.
