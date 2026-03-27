# CYB TRAINING — LOGICĂ 12 SĂPTĂMÂNI + DENUMIRI ROMÂNEȘTI

**Date:** 27 March 2026  
**Source:** Live GitHub repo  
**Status:** CHAT ONLY — fără implementare

---

## PARTEA 1: DENUMIRI EXERCIȚII — PROBLEMA ȘI SOLUȚIA

### Problema

47% din cele 165 exerciții au denumiri în engleză pe care o româncă de 42 de ani nu le înțelege. "Dead bug", "Bird dog", "Clamshell", "Pallof press", "Fire hydrant" — sunt termeni de fitness care nu comunică nimic fără context vizual.

### Soluția: Sistem de denumire cu 3 straturi

```
Câmp actual:   name (key) → "Glute bridge cu pauză"
Câmp actual:   en         → "Glute Bridge with Pause"

Câmpuri NOI:
  displayName  → "Puntea cu pauză sus (3 sec)"      ← CE VEDE CLIENTA
  shortDesc    → "Ridici șoldurile de pe spate și ții 3 secunde sus"  ← DESCRIERE SCURTĂ
```

- `name` (key-ul actual) rămâne neschimbat — e referință internă, nu se afișează
- `en` rămâne — util ca referință pentru Daniela și pentru ilustrații
- `displayName` — denumirea afișată clientei, 100% în română, descriptivă
- `shortDesc` — 1 propoziție care explică mișcarea fără jargon

### Principii de denumire

1. **Descrie ce faci, nu cum se cheamă.** "Ridicare șolduri pe spate" nu "Glute bridge"
2. **Adaugă indiciu vizual.** "pe 4 labe", "pe spate", "la perete", "pe scaun"
3. **Păstrează termenul englezesc doar dacă e deja intrat în limbajul comun.** "Squat", "Plank" sunt ok — le știe oricine a fost vreodată la sală sau pe Instagram
4. **Folosește metafore amuzante/memorabile unde merge.** "Gândăcelul" (Dead bug), "Scoica" (Clamshell), "Viermișorul" (Inchworm) — memorabile și zâmbesc când le fac
5. **Nu mai lung de 6-7 cuvinte.** Dacă trebuie mai mult, pune restul în `shortDesc`

### Tabel complet de redenumire (51 exerciții problematice)

| name (key intern) | displayName (ce vede clienta) |
|---|---|
| Band pull apart | Deschidere brațe cu bandă elastică |
| Band pull apart sau towel pull | Deschidere brațe cu bandă sau prosop |
| Bent over row | Tragere la piept — aplecată |
| Bent over row cu bandă | Tragere la piept cu bandă elastică |
| Bent over row cu gantere | Tragere la piept cu gantere |
| Bent over row cu sticle | Tragere la piept cu sticle de apă |
| Bicep curl | Flexie brațe cu greutăți |
| Bicep curl cu bandă | Flexie brațe cu bandă elastică |
| Bicep curl izometric (perete) | Flexie brațe la perete (ținere) |
| Bicycle crunch (lent) | Abdomen bicicletă — cot la genunchiul opus |
| Bird dog | Echilibru pe 4 labe — mâna și piciorul opus |
| Bird dog pe genunchi | Echilibru pe genunchi — mâna și piciorul opus |
| Bulgarian split squat (fără greutate) | Genuflexiune cu piciorul pe scaun |
| Burpee modificat (fără săritură) | Squat-planșă fără săritură |
| Cat-cow | Pisica-văcuța — arcuire și rotunjire spate |
| Cat-cow lent | Pisica-văcuța lent |
| Chest fly pe mat | Deschidere piept pe saltea cu greutăți |
| Child pose | Poziția copilului — odihnă pe genunchi |
| Clamshell | Scoica — deschidere genunchi pe o parte |
| Clamshell pe mat | Scoica pe saltea |
| Cobra stretch | Cobra — întindere abdomen și piept |
| Curtsy lunge | Genuflexiune reverență (încrucișată) |
| Dead bug | Gândăcelul — mâna și piciorul opus, pe spate |
| Dead bug (alternativ) | Gândăcelul alternativ |
| Donkey kicks | Lovitura de măgar — extensie picior, pe 4 labe |
| Downward dog pedal | V inversat cu pedalare |
| Fire hydrant | Hidrantul — ridicare genunchi lateral, pe 4 labe |
| Foam roll / stretching liber | Rulare și stretching liber |
| Glute bridge | Puntea — ridicare șolduri pe spate |
| Glute bridge activare | Puntea de activare |
| Glute bridge cu bandă | Puntea cu bandă elastică |
| Glute bridge cu pauză | Puntea cu pauză sus (3 sec) |
| Glute bridge ușor | Puntea ușoară |
| Goblet squat | Genuflexiune cu gantera la piept |
| Goblet squat (ganteră) | Genuflexiune cu gantera la piept |
| Happy baby | Bebelușul fericit — pe spate, prinde tălpile |
| Hip thrust pe mat | Ridicare șolduri pe saltea |
| Hip thrust pe scaun | Ridicare șolduri cu spatele pe scaun |
| Inchworm | Viermișorul — mers pe mâini din picioare |
| Inchworm cu push-up | Viermișorul cu flotare |
| Lateral lunge | Fandare laterală |
| Lateral shuffle (2 pași) | Deplasare laterală rapidă |
| Lateral step out | Pas lateral controlat |
| Mountain climbers (lent) | Alpinistul lent — genunchi la piept alternativ |
| Mountain climbers lenți | Alpinistul lent |
| Pallof press (cu bandă sau fără) | Presă anti-rotație — rezistă la rotire |
| Pigeon stretch | Porumbelul — stretching șold profund |
| Sumo squat | Genuflexiune largă |
| Sumo squat cu ganteră | Genuflexiune largă cu ganteră |
| Superman | Supermanul — ridicare brațe și picioare pe burtă |
| Superman hold | Supermanul cu ținere |

### Exerciții care rămân (deja clare sau semi-clare)

Aceste 114 exerciții au denumiri suficient de clare sau sunt deja în română. Le trebuie doar `shortDesc` adăugat, nu redenumire.

---

## PARTEA 2: LOGICA DE 12 SĂPTĂMÂNI

### Problema

26 sesiuni disponibile. La 3 antrenamente/săptămână × 12 săptămâni = 36 necesare. Sesiunile trebuie repetate, dar cu **progresie** — altfel clienta face fix același lucru 12 săptămâni.

### Soluția: Progresie prin parametri, nu prin sesiuni noi

Nu avem nevoie de 60 de sesiuni unice. Avem nevoie de **același set de exerciții cu parametri care cresc** pe parcursul a 12 săptămâni. Așa funcționează orice program real de fitness.

### Modelul de progresie pe 4 faze

```
FAZA 1 — ADAPTARE (Săptămânile 1-3)
  Seturi: base
  Repetări: base
  Pauze: +15 sec vs. standard (mai mult timp de odihnă)
  Intensitate: 60-70% din capacitate
  Scop: învață mișcările, creează obișnuință, zero presiune

FAZA 2 — CONSTRUCȚIE (Săptămânile 4-6)
  Seturi: base
  Repetări: base + 2 (ex: 10 → 12)
  Pauze: standard
  Intensitate: 70-80%
  Scop: crește volumul, consolidează tehnica

FAZA 3 — PROGRES (Săptămânile 7-9)
  Seturi: base + 1 (ex: 2 → 3)
  Repetări: base + 2
  Pauze: standard - 5 sec (mai puțin)
  Intensitate: 80-90%
  Scop: forță reală, provocare controlată

FAZA 4 — CONSOLIDARE (Săptămânile 10-12)
  Seturi: base + 1
  Repetări: base + 4 (ex: 10 → 14)
  Pauze: standard - 10 sec
  Intensitate: 85-95%
  Scop: maximizare, evaluare finală, tranziție spre mentenanță
```

### Cum funcționează concret

Sesiunea `fb_light_01` — "Full Body Ușor — Debutul Tău":

```
Exercițiu original: Squat la scaun — 2 seturi × 10 rep, pauză 30 sec

Săptămâna 1-3 (Adaptare):   2 × 10, pauză 45 sec  (mai ușor)
Săptămâna 4-6 (Construcție): 2 × 12, pauză 30 sec  (standard)
Săptămâna 7-9 (Progres):     3 × 12, pauză 25 sec  (mai greu)
Săptămâna 10-12 (Consolidare): 3 × 14, pauză 20 sec (provocare)
```

Exercițiul e ACELAȘI. Clienta îl cunoaște deja. Progresia vine din seturi, repetări și pauze.

### Reguli de progresie

```
progressionRules = {
  // Factor per fază (multiplier pe parametrii base)
  phases: {
    1: { sets: 1.0, reps: 1.0, restAdd: +15 },   // Adaptare: mai ușor
    2: { sets: 1.0, reps: 1.2, restAdd: 0 },      // Construcție: +20% reps
    3: { sets: 1.5, reps: 1.2, restAdd: -5 },      // Progres: +50% sets, +20% reps, -5s pauză
    4: { sets: 1.5, reps: 1.4, restAdd: -10 },     // Consolidare: +50% sets, +40% reps, -10s pauză
  },

  // Mapare săptămână → fază
  weekToPhase: {
    1: 1, 2: 1, 3: 1,     // Adaptare
    4: 2, 5: 2, 6: 2,     // Construcție
    7: 3, 8: 3, 9: 3,     // Progres
    10: 4, 11: 4, 12: 4,  // Consolidare
  },

  // Rounding
  roundSets: 'ceil',      // 2 × 1.5 = 3 (rotunjire sus)
  roundReps: 'round',     // 10 × 1.2 = 12 (rotunjire normală)
  minRest: 15,            // pauza nu scade sub 15 sec
  maxRest: 60,            // pauza nu crește peste 60 sec

  // Excepții
  noProgressionFor: ['stretching', 'respirație', 'warmup', 'cooldown'],
  // Aceste tipuri de exerciții NU progresează — rămân identice
}
```

### Rotație săptămânală

Cu 26 sesiuni și 3-5 sesiuni/săptămână, iată cum se distribuie:

```
Exemplu: General Fat Loss, 3 sesiuni/săptămână, nivel intermediar

Sesiunile selectate de buildTrainingPlan:
  1. full_body_medium (fb_med_01) — I:3, 30 min
  2. lower_body (lower_02) — I:3, 30 min  
  3. mobility (mob_01) — I:1, 12 min

Săptămâna 1: fb_med_01 (Adaptare) + lower_02 (Adaptare) + mob_01
Săptămâna 2: fb_med_02 (Adaptare) + lower_04 (Adaptare) + mob_02
Săptămâna 3: fb_med_01 (Adaptare) + lower_02 (Adaptare) + rec_01
Săptămâna 4: fb_med_02 (Construcție) + lower_04 (Construcție) + mob_01
...și tot așa cu rotație pe sesiunile disponibile per tip
```

**Regula:** în cadrul aceluiași tip (ex: full_body_medium), rotim între sesiunile disponibile (fb_med_01, fb_med_02, fb_med_03). Nu repetăm aceeași sesiune 2 săptămâni la rând.

### Limitare postpartum / burnout / loss

```
Postpartum:
  - Doar Faza 1 (Adaptare) în primele 4 săptămâni, indiferent de program
  - Faza 2 începe la săptămâna 5
  - Faza 3 la săptămâna 9
  - Faza 4 opțională (doar dacă progresul e bun)

Burnout / Loss:
  - Faza 1 extinsă la 4 săptămâni (nu 3)
  - Faza 2 la săptămâna 5
  - Faza 3 la săptămâna 8
  - Faza 4 opțională

General / Hormonal / Divorț:
  - Progresie standard (3-3-3-3)
```

---

## PARTEA 3: STRUCTURA COMPLETĂ A EXERCISE_DB ACTUALIZATĂ

```typescript
interface ExerciseDBEntry {
  // EXISTENTE (nu se schimbă key-urile)
  en: string;               // Nume englezesc (referință)
  instr: string;            // Instrucțiune text existentă
  video_id?: string;        // Video YouTube (încă gol)
  modify_if?: string;       // Modificare condiționată (încă gol)
  
  // NOI
  displayName: string;      // Nume afișat clientei (100% română)
  shortDesc: string;        // 1 propoziție — ce faci, fără jargon
  muscleGroups: string[];   // Grupe musculare: 'quads','glutes','hamstrings','chest','back','shoulders','biceps','triceps','core','calves','hip_flexors'
  category: string;         // 'lower_body','upper_body','core','mobility','cardio','recovery'
  difficulty: 1 | 2 | 3;   // 1=începător, 2=intermediar, 3=avansat
  illustrationId?: string;  // Referință la ilustrația anatomică
  canProgress: boolean;     // true = seturi/rep cresc în faze; false = rămâne identic (stretching, etc.)
}
```

---

## PARTEA 4: FUNCȚIA `buildWeeklyProgression`

### Input
```typescript
function buildWeeklyProgression(
  profile: any,
  ans: any,
  weekNumber: number,        // 1-12
  totalWeeks: number         // 4 (essential), 12 (premium/coaching)
): WeekPlan
```

### Output
```typescript
interface WeekPlan {
  weekNumber: number;
  phase: 1 | 2 | 3 | 4;
  phaseLabel: string;        // "Adaptare" / "Construcție" / "Progres" / "Consolidare"
  weeklyGoal: string;
  frequency: number;
  sessions: ProgressedSession[];
  totalMinutes: number;
}

interface ProgressedSession {
  dayNumber: number;         // 1-7 (ziua din săptămână)
  dayLabel: string;          // "Luni", "Miercuri", "Vineri"
  session: Session;          // sesiunea originală
  adjustedStructure: ExerciseBlock[];  // cu seturi/rep/pauze ajustate per fază
}
```

### Logica

```
1. Determină faza din weekNumber (cu override-uri postpartum/burnout)
2. Apelează buildTrainingPlan() pentru sesiunile de bază
3. Dacă weekNumber > 1: rotim între sesiunile de același tip (varietate)
4. Aplicăm progresie pe fiecare exercițiu:
   - Dacă canProgress = true → aplică factori fază
   - Dacă canProgress = false → rămâne identic
5. Distribuie pe zile (Luni/Miercuri/Vineri sau Luni/Marți/Joi/Sâmbătă etc.)
6. Return WeekPlan
```

---

## REZUMAT DECIZII NECESARE

| # | Decizie | Propunere | Necesită confirmare? |
|---|---------|-----------|---------------------|
| 1 | Sistem denumire cu displayName + shortDesc | Da, exact așa | ✅ De revizuit de Daniela |
| 2 | 4 faze de progresie (Adaptare/Construcție/Progres/Consolidare) | Standard în fitness | ✅ De confirmat cu Daniela |
| 3 | Progresie prin parametri (seturi/rep/pauze), nu sesiuni noi | Eficient, nu necesită conținut nou | ✅ Da |
| 4 | Postpartum/Burnout: faze extinse | Sigur din punct de vedere medical | ✅ Da |
| 5 | muscleGroups[] adăugat la fiecare exercițiu | Necesar pentru ilustrații | ✅ Da |
| 6 | ~100-110 ilustrații anatomice AI | Necesar pentru membership | ✅ De ales abordare |
| 7 | displayName pentru 51 exerciții problematice | Tabelul de mai sus | ✅ De revizuit de Daniela |
