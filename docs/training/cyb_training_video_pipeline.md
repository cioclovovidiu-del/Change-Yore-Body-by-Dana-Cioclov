# CYB TRAINING VIDEO PIPELINE — MASTER IMPLEMENTATION

## STATUS
PLANNED — READY FOR IMPLEMENTATION

---

## OBJECTIVE

Generarea unui sistem scalabil și consistent de instrucțiuni video pentru toate exercițiile din CYB, folosind un model feminin 3D unic.

Scop:
- claritate maximă pentru clientă
- consistență vizuală
- scalare la 100+ exerciții
- integrare directă în platformă

---

## DECIZIE ARHITECTURALĂ

NU folosim generare video AI ca bază principală.

Folosim:
- MODEL 3D UNIC (avatar feminin)
- MIXAMO (rigging + animații bază)
- BLENDER (control total + render)

AI video (Sora / Runway / Luma):
→ doar pentru prototip / marketing
→ NU pentru producție principală

---

## STRUCTURĂ GENERALĂ

### 1. MASTER AVATAR

Un singur model feminin:
- corp atletic realist
- proporții constante
- outfit simplu (colanți + bustieră)
- fără detalii inutile
- fundal neutru

IMPORTANT:
Toate exercițiile folosesc același avatar.

---

### 2. RIGGING

Tool: Mixamo

Pași:
1. Upload model
2. Auto-rig
3. Export skeleton

---

### 3. ANIMAȚII

Clasificare exerciții:

A. DIRECT (Mixamo-ready)
- squat
- lunge
- row
- curl
- push-up
- plank

B. AJUSTARE MICĂ
- glute bridge
- band row
- goblet squat

C. CUSTOM (Blender)
- dead bug
- fire hydrant
- clamshell
- bird dog
- postpartum variants

---

### 4. CAMERE STANDARD

Fiecare exercițiu se exportă în 3 unghiuri:

- FRONT 3/4
- SIDE
- BACK 3/4

FIXED CAMERA SETUP:
- NU modificăm pozițiile între exerciții

---

### 5. FORMAT VIDEO

Per exercițiu:
- durată: 4–6 secunde
- loop: seamless
- fără voice
- fără editare complexă

---

## MODEL DE DATE (IMPORTANT)

### Extend ExerciseDBEntry

```ts
interface ExerciseMedia {
  canonicalVideoId?: string;
  angleFrontId?: string;
  angleSideId?: string;
  angleRearId?: string;
  posterImageId?: string;
  loopSeconds?: number;
}

interface ExerciseDBEntry {
  en: string;
  instr: string;

  displayName: string;
  shortDesc: string;

  muscleGroups: string[];
  category: string;
  difficulty: 1 | 2 | 3;
  canProgress: boolean;

  illustrationId?: string;
  media?: ExerciseMedia;
}
```

---

## PIPELINE PRODUCȚIE

### MASTER SETUP (o singură dată)

1. Avatar 3D creat
2. Rigged via Mixamo
3. Import în Blender
4. Setup scenă:
   - lumină
   - fundal
   - 3 camere
5. Preset export

---

### GENERARE EXERCIȚIU

Pentru fiecare exercițiu:

1. Alegi animația
2. Ajustezi dacă e nevoie
3. Atașezi avatarului
4. Render:
   - front
   - side
   - rear
5. Export fișiere
6. Mapare în DB

---

## STRUCTURĂ FIȘIERE

```
/assets/training/
  /exercises/
    /squat/
      front.mp4
      side.mp4
      rear.mp4
    /dead_bug/
      front.mp4
      side.mp4
      rear.mp4
```

---

## INTEGRARE FRONTEND

Pentru fiecare exercițiu:

UI:
- displayName
- shortDesc
- video principal
- switch unghiuri

Exemplu:

Gândăcelul
„Întinsă pe spate, cobori mâna și piciorul opus.”

[VIDEO]
[FRONT] [SIDE] [BACK]

---

## STRATEGIE PRODUCȚIE

### Faza 1 — MVP

- 30–40 exerciții
- cele mai frecvente
- validate de Daniela

---

### Faza 2 — CORE LIBRARY

- 100–110 animații unice
- grupare exerciții similare

---

### Faza 3 — FULL

- toate exercițiile acoperite
- optimizare UI
- highlight mușchi (optional)

---

## REGULI CRITICE

NU facem:
- 165 stiluri diferite
- modele diferite
- camere diferite
- lumină diferită

TOTUL trebuie să fie:
- identic
- coerent
- predictibil

---

## PASS CRITERIA

Sistemul este VALID când:

- toate exercițiile au video
- toate folosesc același avatar
- toate au 3 unghiuri
- toate sunt loop
- naming clar pentru clientă
- integrare în UI funcționează

---

## FAIL CRITERIA

- inconsistență vizuală
- mișcare incorectă biomecanic
- lipsă unghiuri
- diferențe de stil
- dependență de AI video

---

## NEXT STEPS

1. definire avatar feminin
2. creare model 3D
3. setup Blender master scene
4. producere 10 exerciții pilot
5. validare Daniela
6. batch production

---

## FINAL NOTE

Acest sistem este baza pentru:
- training program delivery
- membership
- aplicație mobilă
- conținut educațional

Trebuie construit corect de la început.
