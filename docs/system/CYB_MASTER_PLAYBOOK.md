# CYB — Master Operating System

## Change Your Body by Dana Cioclov

**Full Business & Operating Manual v2.0 | March 2026**

---

# Table of Contents

1. [System Overview](#1-system-overview)
2. [Funnel Logic](#2-funnel-logic)
3. [WhatsApp Conversion System](#3-whatsapp-conversion-system)
4. [Chat Scripts](#4-chat-scripts)
5. [Payment & Delivery Flow](#5-payment--delivery-flow)
6. [Community + Private Group System](#6-community--private-group-system)
7. [Daily Operations](#7-daily-operations)
8. [CRM & Lead Flow](#8-crm--lead-flow)
9. [Ads + Scaling System](#9-ads--scaling-system)
10. [KPI System](#10-kpi-system)
11. [Profit Control](#11-profit-control)
12. [Execution Rules](#12-execution-rules)
13. [Failure Diagnosis](#13-failure-diagnosis)

---

# 1. System Overview

## What This Business Is

A personalized fitness coaching business for women. Dana Cioclov acquires clients through an automated digital questionnaire funnel, converts them through 1:1 WhatsApp conversations, and delivers a 12-month personalized program via WhatsApp + a private Facebook group.

## End-to-End Flow

```
META ADS
   |
   v
LANDING PAGE (CYB_Chestionar_Unified.html)
   |
   v
MINI QUESTIONNAIRE (9 steps, ~2 min)
   |  - welcome, name, age, measures, activity, goal, moment, gdpr_email, mini_results
   |
   v
MINI RESULTS PAGE
   |  - personalized scores, psychological copy, CTA to continue
   |
   v
COMPLET QUESTIONNAIRE (extended deep-dive)
   |  - additional lifestyle, nutrition, emotional, behavioral questions
   |
   v
FULL RESULTS PAGE
   |  - complete scores + personal letter (35 fragments, 7 sections)
   |  - metabolic profile + stress/hormonal scores
   |  - personalized CTA
   |
   v
WHATSAPP CTA BUTTON
   |  - pre-filled message, opens 1:1 chat with Dana
   |
   v
1:1 WHATSAPP CONVERSATION
   |  - qualification (3-5 questions)
   |  - intent classification (HIGH / MEDIUM / LOW)
   |  - offer presentation (conversational, not sales pitch)
   |
   +-- HIGH/MED INTENT --> OFFER --> PAYMENT (Stripe) --> ONBOARDING (24h)
   |                                                         |
   |                                                         v
   |                                              PRIVATE PROGRAM GROUP
   |                                              (Facebook, 12 months)
   |
   +-- LOW INTENT --> COMMUNITY GROUP (Facebook, free)
   |
   +-- NO REPLY (after 4 follow-ups) --> ARCHIVED
```

## Three Channels

| Channel | Purpose | Who |
|---------|---------|-----|
| **WhatsApp** | 1:1 sales + client support | All leads + paying clients |
| **Facebook Community Group** | Free content, trust building, lead nurture | Non-buyers, general audience |
| **Facebook Private Group** | Program delivery, accountability | Paying clients ONLY |

## Absolute Boundaries

- WhatsApp is 1:1 only. Never groups.
- Paying and non-paying users never mix.
- CTA from funnel always goes to WhatsApp.
- Nobody enters the private group without confirmed payment.
- Community group is never used for program delivery.

---

# 2. Funnel Logic

## How the Application Converts Users

The funnel is a static HTML questionnaire (`CYB_Chestionar_Unified.html`) with vanilla JavaScript. No server-side logic. No AI APIs. All personalization is deterministic and client-side.

### Architecture

```
HTML (Unified Questionnaire)
   |
   +-- CYB_Engine_STABLE.js    (scoring, signals, routes)
   +-- CYB_Psych.js            (psychological layer, personal letter)
   +-- CYB_Render.js           (results page assembly)
   +-- CYB_Copy.js             (copy/messaging library)
   +-- CYB_Calc.js             (calculations)
   +-- CYB_Steps.js            (step navigation)
```

### MINI Questionnaire (9 Steps)

| Step | Name | What It Collects |
|------|------|-----------------|
| 1 | welcome | Entry point, start tracking |
| 2 | name | First name (personalization token) |
| 3 | age | Age bracket |
| 4 | measures | Weight, height, body measurements |
| 5 | activity | Current physical activity level |
| 6 | goal | Primary fitness/health goal |
| 7 | moment | Life moment (postpartum, divorce, hormonal, burnout, loss, general) |
| 8 | gdpr_email | Email capture with GDPR consent |
| 9 | mini_results | Personalized MINI results page |

### State Management

- `STATE` object: `{profile:{}, ans:{}, phase:'MINI'|'COMPLET', step:0}`
- Persisted to `localStorage` on every step transition
- `restoreState()` validates structure before restoring (guards corrupt data)
- If corrupt or missing, starts fresh from step 0
- `goNext()` has a 450ms debounce lock (`_goNextLock`) to prevent double-advance

### Engine Pipeline

```
User Answers
   |
   v
interpretSignals() --> 7 signals
   |  overwhelmed, selfBlame, actionCapacity, shameRisk,
   |  structureNeed, pressureTolerance, motivationStyle
   |
   v
resolveRoute() --> 1 of 6 routes
   |  POSTPARTUM, DIVORCE, HORMONAL, BURNOUT, LOSS, GENERAL
   |  (based on P.moment field via MOMENT_TO_ROUTE mapping)
   |
   v
calcStressScore() + calcHormonalScore() --> numeric scores
   |
   v
getMetabolicProfile() --> BMR/TDEE from age/weight/height/activity
   |
   v
getSafetyTags() --> flags for high-risk conditions
   |
   v
selectMessage() --> route-based copy selection
   |
   v
personalize() --> token replacement ({name}, {goal}, etc.)
```

### Personal Letter System

Built in `CYB_Psych.js`. Generates a deterministic personalized letter on the results page.

- **35 fragments** across 7 sections: opening(6), reflection(6), pattern(5), reframe(5), direction(5), soft_action(4), closing(4)
- **5-axis calibration** with P1-P5 priority conflict resolution
- **6-axis profile summary** from scores and tags
- **6-axis language tuning** for wording precision
- Feature flag: `PERSONAL_LETTER_ENABLED`
- Policy guard: `getPersonalLetterPolicy()` checks minimum data before building
- Word range: 80-600 words
- Version: `PL-1.0.0-3L`
- Full audit harness, snapshot system, edge-case matrix, 9-check release gate

### Tracking Events

| Action | GA4 Event | FB Pixel Event |
|--------|-----------|----------------|
| Page load | `page_view` | `PageView` |
| Start questionnaire | `mini_start` | — |
| Complete MINI | `mini_complete` | `Lead` |
| Start COMPLET | `complet_start` | — |
| Complete COMPLET | `complet_complete` | `CompleteRegistration` |
| Click WhatsApp CTA | `cta_click` | `ViewContent` |

- Event deduplication via persisted flags: `_miniResultsTracked`, `_completResultsTracked`
- Email deduplication: `_miniEmailSent`, `_completEmailSent`
- CTA timing locks: 2s (MINI), 3.5s (COMPLET)

### MINI to COMPLET Transition

- `startComplet()` resets `STATE.phase = 'COMPLET'`, `STATE.step = 0`
- COMPLET questions build on MINI profile — no data loss
- Email sent in background (not awaited — delivery may silently fail on slow connections)

---

# 3. WhatsApp Conversion System

## Flow

```
LEAD MESSAGE (from CTA, pre-filled)
   |
   v
FIRST REPLY (within 30 minutes)
   |
   v
QUALIFICATION (3-5 questions, one at a time, wait for each reply)
   |
   +-- HIGH INTENT --> Present offer directly
   +-- MEDIUM INTENT --> Present offer softly with more detail
   +-- LOW INTENT --> Redirect to community group, no offer
   |
   v
OFFER (conversational, not a pitch)
   |
   +-- YES --> Send payment link
   +-- HESITATES --> Give space, no pressure, no discount
   +-- NO --> Respect, invite to community
```

## First Reply

```
Buna [Prenume]!

Ma bucur ca ai facut chestionarul — ai facut deja primul pas,
si asta conteaza mai mult decat crezi.

Da-mi voie sa te intreb cateva lucruri scurte ca sa inteleg
mai bine situatia ta, si apoi iti spun exact cum te pot ajuta.

E ok?
```

## Qualification Questions

Sent one at a time. Wait for each answer before sending the next.

| # | Question | What It Reveals |
|---|----------|----------------|
| Q1 | "Care e cel mai important lucru pe care ti-l doresti acum pentru corpul si sanatatea ta?" | Goal |
| Q2 | "De cat timp simti ca te lupti cu asta?" | Urgency |
| Q3 | "Ai mai incercat alte programe sau diete pana acum? Ce s-a intamplat?" | Context + frustrations |
| Q4 | "Daca ai avea un program care chiar functioneaza pentru tine, ai fi pregatita sa incepi acum?" | Readiness |
| Q5 | *(optional, only if Q4 unclear)* "Ce te-ar ajuta cel mai mult sa iei o decizie?" | Blocker identification |

After each answer, validate briefly: "Inteleg perfect." / "Multumesc ca imi spui asta."

## Intent Classification

### HIGH INTENT

**Signals:** Responds quickly, says "da" to Q4, decisive tone, mentions "vreau sa incep"

```
Am inteles exact ce ai nevoie. Si vreau sa fii sincera cu tine —
faptul ca esti aici si ca ai raspuns la toate astea arata ca esti pregatita.

Am un program de 12 luni care e construit exact pentru situatia ta.
Hai sa-ti spun pe scurt cum functioneaza, si daca simti ca e ce ai nevoie, incepem.
```

### MEDIUM INTENT

**Signals:** Interested but asks questions, mentions price, says "ma gandesc", responds slower

```
E total ok sa te gandesti — asta arata ca iei lucrurile in serios, nu impulsiv.

Hai sa fac un lucru: iti explic pe scurt ce include programul,
fara nicio presiune. Si daca simti ca se potriveste, discutam mai departe.
Daca nu, e perfect ok. Suna bine?
```

### LOW INTENT

**Signals:** Very short answers, evasive, "doar ma interesam", doesn't answer Q4

```
Inteleg! Ma bucur ca ai facut chestionarul oricum —
deja ai o imagine mai clara despre ce ai nevoie.

Daca vrei, te invit intr-un grup unde postez continut gratuit
si sfaturi care te pot ajuta sa faci primii pasi. Fara nicio obligatie.

[LINK COMUNITATE]

Si daca la un moment dat simti ca vrei ceva structurat, sunt aici.
```

Do NOT send offer to LOW intent. Redirect to community only.

## Offer Presentation

```
Programul meu dureaza 12 luni si e complet personalizat pe profilul tau.

Pe scurt, primesti:

- Plan alimentar adaptat pe corpul si stilul tau de viata
- Antrenamente pe care le poti face acasa sau la sala
- Suport direct de la mine pe tot parcursul
- Acces intr-un grup privat unde lucram impreuna
- Ajustari lunare — nu e un plan static, evolueaza cu tine

Ideea e simpla: tu nu ai nevoie de inca o dieta.
Ai nevoie de un sistem care merge cu viata ta.
```

Then PAUSE. Wait for reaction. Send price only when asked or when it flows naturally.

**If they ask about price:**

```
Investitia pentru cele 12 luni este de [PRET].
Include tot ce ti-am mentionat, fara costuri ascunse.

Si ca sa fie clar: daca la orice moment simti ca nu e ce ai nevoie,
poti sa-mi scrii direct.
```

## Closing

### YES

```
Super! Ma bucur enorm.

Uite linkul de plata:
[STRIPE LINK]

E simplu — intri, completezi datele cardului, si gata.
Plata e securizata 100%.

Dupa ce confirm plata, iti trimit tot ce ai nevoie sa incepi.
Te astept pe cealalta parte!
```

### HESITATES

```
Inteleg perfect. E o decizie importanta si e bine sa o iei cand esti sigura.

Gandeste-te linistita, si daca ai orice intrebare, oricat de mica, scrie-mi.
Sunt aici.

Nu e nicio presiune si niciun termen limita artificial.
```

Never insist. Never offer discount.

### NO

```
Nicio problema. Apreciez ca ai fost sincera.

Daca vrei, te invit in grupul de comunitate unde postez sfaturi gratuite.
Poate la un moment dat o sa simti ca vrei ceva mai structurat.

[LINK COMUNITATE]

Iti doresc mult bine!
```

## Follow-Up Rules

| Timing | Message |
|--------|---------|
| +6h no reply | "Hei [Prenume]! Doar voiam sa ma asigur ca ai primit mesajul meu. Daca ai intrebari, sunt aici!" |
| +24h no reply | "[Prenume], inteleg ca viata e aglomerata. Nu vreau sa te presez. Daca te mai gandesti, scrie-mi oricand. Intre timp, continut gratuit aici: [LINK COMUNITATE]. Mult bine!" |
| +72h no reply | "Sper ca esti bine! Locul tau e disponibil oricand esti gata. Fara graba." |
| +7 days | Share community content (only if they joined group) |

**ABSOLUTE RULE: Maximum 4 follow-up messages per lead. After the 4th — STOP. Never contact again unless they initiate.**

---

# 4. Chat Scripts

Copy-paste ready responses for common WhatsApp questions.

## "Cum functioneaza?"

```
Functioneaza simplu: ai facut deja chestionarul si stiu ce ai nevoie.
Pe baza raspunsurilor tale, iti creez un program complet personalizat —
alimentatie, antrenament, suport. Lucram impreuna 12 luni, pas cu pas.
Tu primesti planul, eu te ghidez. Fara complicatii.
```

## "Ce primesc exact?"

```
Primesti:
- Plan alimentar personalizat pe corpul si viata ta
- Antrenamente adaptate (acasa sau la sala)
- Suport direct de la mine pe WhatsApp
- Acces in grupul privat cu alte femei din program
- Ajustari lunare — planul evolueaza cu tine

Nu e o dieta. E un sistem complet care merge pe termen lung.
```

## "Pentru cine e programul?"

```
E pentru femei care:
— au incercat diete si nu a functionat pe termen lung
— vor o schimbare reala, nu o solutie rapida
— au nevoie de structura si ghidare, nu de inca o aplicatie
— sunt pregatite sa investeasca in ele pe bune

Nu e pentru cine cauta rezultate in 2 saptamani.
E pentru cine vrea rezultate care raman.
```

## "De ce 12 luni?"

```
Pentru ca in 30 de zile poti slabi. Dar in 12 luni iti schimbi
complet relatia cu corpul tau.

Primele 3 luni construim fundatia. Lunile 4-6 optimizam.
Lunile 7-9 devii autonoma. Lunile 10-12 totul devine natural.

Nu mai ai nevoie de mine la final — asta e scopul.
```

## "Nu sunt sigura" / "Ma mai gandesc"

```
E complet ok. O decizie importanta merita gandita.

Ce te-ar ajuta sa te decizi? Daca ai o intrebare specifica sau
ceva ce te ingrijoreaza, spune-mi — prefer sa fii sigura pe
decizia ta, indiferent care e.

Sunt aici oricand. Fara presiune.
```

## "E scump" / "Nu-mi permit"

```
Inteleg. E o investitie reala.

Ce pot sa-ti spun e ca programul asta inlocuieste lunar
abonamente la sala, suplimente, diete, aplicatii —
lucruri pe care probabil le-ai incercat deja.

Dar nu vreau sa te conving. Daca momentul nu e acum, e ok.
Intre timp, te invit in grupul gratuit unde postez sfaturi
care te pot ajuta: [LINK]
```

## "Ce se intampla dupa ce platesc?"

```
Imediat dupa plata:
1. Iti confirm pe WhatsApp
2. Te adaug in grupul privat
3. Primesti planul tau personalizat de start (in cateva ore)
4. Alegem impreuna ziua de start

De la plata pana la primul pas concret — maxim 24 de ore.
Nu te las sa astepti.
```

## "Pot face si acasa?" / "Nu merg la sala"

```
Da, 100%. Antrenamentele sunt adaptate pe situatia ta.
Daca faci acasa, primesti exercitii care nu necesita echipament.
Daca mergi la sala, adaptam pe ce ai disponibil.
Tu alegi, eu adaptez.
```

## "Am incercat tot si nimic nu a mers"

```
Inteleg frustarea asta. Si probabil de asta esti aici.

Diferenta e ca aici nu primesti un plan generic care functioneaza
"pentru toata lumea". Primesti un sistem construit pe corpul tau,
pe viata ta, pe ritmul tau. Si ai pe cineva care te ghideaza
— nu esti singura in asta.

Vreau sa-ti arat ca se poate. Dar decizia e a ta.
```

## "Pot vorbi cu cineva care a facut programul?"

```
Inteleg de ce intrebi. In grupul de comunitate poti vedea
continutul pe care il postez si cum interactionez.

Testimonialele clientelor sunt confidentiale — respect intimitatea lor.
Dar pot sa-ti spun ca fiecare programa a inceput exact de unde esti tu acum.
```

---

# 5. Payment & Delivery Flow

## Payment Methods

| Method | Details | When Used |
|--------|---------|-----------|
| **Stripe Payment Link** | One-time card payment, auto-receipt | Primary — default for all clients |
| **Bank Transfer** | IBAN, manual confirmation via screenshot | Secondary — only if client can't use card |

## Payment Link Message

```
Uite linkul de plata:
[STRIPE LINK]

E simplu — intri, completezi datele cardului, si gata.
Plata e securizata 100%.

Dupa ce confirm plata, iti trimit tot ce ai nevoie sa incepi.
```

## Bank Transfer Message

```
Poti plati si prin transfer bancar:

Nume: [TITULAR]
IBAN: [IBAN]
Banca: [BANCA]
Suma: [PRET] RON
Descriere plata: "CYB Program — [PRENUME]"

Cand faci transferul, trimite-mi o captura de ecran ca sa confirm mai repede.
```

## Payment Confirmation

```
[Prenume], plata a fost confirmata!

Esti oficial in program. Bine ai venit!

Acum pregatesc totul pentru tine. In urmatoarele ore primesti:
1. Acces in grupul privat
2. Planul tau personalizat de start
3. Instructiuni clare despre cum incepem

Daca ai orice intrebare intre timp, scrie-mi direct aici.
```

## Payment Failure Follow-Up

| Timing | Message | Purpose |
|--------|---------|---------|
| +2h | "Hei [Prenume]! Daca ai nevoie de ajutor cu plata sau ai intampinat o problema cu linkul, spune-mi si te ajut imediat." | Technical support |
| +12h | "Voiam doar sa verific — totul ok cu linkul? Daca preferi plata prin transfer bancar, iti trimit datele." | Alternative |
| +24h | "Am vrut sa fiu sigura ca nu s-a blocat ceva tehnic. Daca te-ai mai gandit si ai intrebari, sunt aici. Daca momentul nu e acum — e ok." | Empathy |
| +72h | "Sper ca esti bine! Locul tau e disponibil oricand esti gata. Intre timp: [LINK COMUNITATE]" | Final redirect |
| After 72h | **STOP. No more payment messages.** | — |

## First 24 Hours Onboarding

| Time | Action | Channel |
|------|--------|---------|
| **T+0** | Confirm payment, send welcome message | WhatsApp |
| **T+1h** | Add to private Facebook group, send link | WhatsApp |
| **T+3h** | Verify group entry (send reminder if not joined) | WhatsApp |
| **T+6-12h** | Send personalized Start Plan (PDF) | WhatsApp |
| **T+12h** | Confirm receipt if no reply to plan | WhatsApp |
| **T+24h** | Full check-in: "Ai totul? Cand incepem?" | WhatsApp |

### Onboarding Messages

**T+1h — Group Invite:**
```
Te-am adaugat in grupul nostru privat!
Intra aici: [LINK GRUP]

Primul lucru: citeste postul fixat de sus (regulile + cum functioneaza).
Apoi prezinta-te in comentarii — spune-ne cine esti si ce te-a adus aici.

Fetele din grup te asteapta!
```

**T+6-12h — Plan Delivery:**
```
[Prenume], uite planul tau de start!
[ATASAMENT PDF]

Cateva lucruri importante:
1. Citeste-l complet azi — sunt doar 5 pagini
2. Nu trebuie sa incepi de maine daca nu esti pregatita.
   Alegem impreuna ziua de start.
3. Daca ceva nu e clar sau nu ti se potriveste,
   scrie-mi INAINTE sa schimbi pe cont propriu.

Care zi ar fi buna pentru tine sa incepem?
```

**T+24h — Check-in:**
```
Buna [Prenume]!
Rapid check-in: ai totul? Acces grup, plan?

Daca da — super! Ne vedem [ZIUA] la start.
Daca ceva lipseste sau e neclar, spune-mi acum si rezolvam.

Sunt entuziasmata sa incepem!
```

## Start Plan Structure (PDF, 5 pages)

| Page | Content |
|------|---------|
| 1 | Cover: name, date, "Programul Tau Personalizat" |
| 2 | Profile summary from questionnaire answers |
| 3 | Week 1 plan: meals (breakfast, lunch, dinner, snacks, hydration) + movement (3 sessions/week, 20-30 min) |
| 4 | Program rules: (1) follow only the plan, (2) don't compensate missed days, (3) send Friday check-in, (4) ask before changing anything, (5) weigh once/week only |
| 5 | Next steps checklist: read plan, enter group, introduce yourself, choose start day, first Friday check-in |

## Onboarding Checklist (Must Complete in 48h)

```
[ ] Payment confirmed in Stripe
[ ] WhatsApp confirmation sent
[ ] Added to private Facebook group
[ ] Client entered the group
[ ] Client introduced themselves in group
[ ] Start Plan PDF sent via WhatsApp
[ ] Client confirmed reading the plan
[ ] Start day agreed
[ ] 24h check-in sent
```

---

# 6. Community + Private Group System

## Community Group

| Field | Value |
|-------|-------|
| **Name** | "Change Your Body by Dana — Comunitate" |
| **Platform** | Facebook Group — Private (accepts anyone) |
| **Who Joins** | Non-buyers, low-intent leads, organic audience |
| **Purpose** | Trust building, free content, passive lead nurture |
| **Goal** | Keep contact → build trust → re-enter funnel via WhatsApp |

### Pinned Posts (5)

| # | Title | Content |
|---|-------|---------|
| 1 | Bun venit | Who is Dana, what this group is, rules (respect, no spam, no promo). "Prezinta-te in comentarii." |
| 2 | Chestionarul Gratuit | Link to funnel: "Daca nu ai facut inca chestionarul, incepe aici. Gratuit, 2 minute." |
| 3 | Intrebari Frecvente | What is the 12-month program, how much, how it works, for whom, for whom NOT. |
| 4 | Ce Postam Aici | Posting schedule: Monday = mindset, Wednesday = nutrition, Friday = movement, Sunday = reflection |
| 5 | Cum Lucrezi Cu Mine | "Daca vrei un program structurat si personalizat, scrie-mi pe WhatsApp: [LINK]" |

### Posting Schedule

| Day | Type | Format |
|-----|------|--------|
| Monday | Mindset / motivation | Short text (3-5 lines) + image |
| Wednesday | Nutrition / education | Tips, carousel, or practical advice |
| Friday | Movement / exercise | Short video (30-60s) or photo with instructions |
| Sunday | Reflection / community | Open question for engagement |

**Rules:**
- 4 posts/week (no more)
- Dana posts personally (not a business page)
- Respond to ALL comments within 24h
- Max 1 offer mention per month (subtle)

## Private Program Group

| Field | Value |
|-------|-------|
| **Name** | "Change Your Body — Program Privat" |
| **Platform** | Facebook Group — Private + Hidden (not in search) |
| **Who Joins** | Paying clients ONLY, added manually by Dana after payment |
| **Confidentiality** | What is posted here stays here. No screenshots. |

### Pinned Posts (4)

| # | Title | Content |
|---|-------|---------|
| 1 | Bun venit in program | What the group is, how it works, rules, confidentiality |
| 2 | Cum Functioneaza Programul | 12-month structure: months 1-3 (foundation), 4-6 (optimization), 7-9 (autonomy), 10-12 (maintenance) |
| 3 | Program Saptamanal | What's posted and when |
| 4 | Cum Contactezi Pe Dana | Quick questions: group comment. Personal: WhatsApp. Response time: max 12h weekdays. |

### Posting Schedule

| Day | Type | Purpose |
|-----|------|---------|
| Monday | Weekly objective (one single goal) | Focus and direction |
| Wednesday | Educational content (video 2-5 min or carousel) | Practical knowledge |
| Friday | Check-in question | Accountability |
| Sunday | Reflection + next week preview | Continuity |

**Monthly additions:**
- 1x plan adjustment (via WhatsApp 1:1, never in group)
- 1x optional live Q&A (30 min in group)
- 1x per quarter: individual progress review (WhatsApp)

### Retention System

| Inactivity Signal | Timing | Action | Channel |
|-------------------|--------|--------|---------|
| Misses Friday check-in | +48h | Personal message | WhatsApp |
| No interaction 7 days | +7 days | "Sunt aici daca ai nevoie" | WhatsApp |
| No interaction 14 days | +14 days | Voice note (personal, 30s) | WhatsApp |
| No interaction 30 days | +30 days | Call attempt + final text message | WhatsApp |
| After 30 days inactive | — | Stop proactive contact. Client stays in group. | — |

### Contact Frequency by Program Month

| Period | Dana's Contact Level |
|--------|---------------------|
| Month 1 | 3-4 messages/week (maximum touch) |
| Months 2-3 | 2/week |
| Months 4-6 | 1/week + group check-ins |
| Months 7-12 | Group-driven, Dana intervenes as needed |

### Reactivation Messages

**7 days inactive:**
```
Hei [Prenume]! Am observat ca n-ai mai postat vineri.
Totul ok? Sunt aici daca ai nevoie de ceva.
```

**14 days inactive:**
```
[Prenume], vreau doar sa stii ca sunt aici.
Daca a fost o saptamana grea, e ok.
Nu trebuie sa fii perfecta ca sa continui.
```

**Client says "Nu stiu de unde sa incep" (after onboarding):**
```
Cel mai simplu lucru pe care il poti face ACUM: deschide planul,
du-te la pagina 3, si uita-te DOAR la micul dejun de maine.
Atat. Restul vine treptat.
```

---

# 7. Daily Operations

## Morning Block (09:00-10:00) — 60 min

| # | Action | Time | Tool |
|---|--------|------|------|
| 1 | Reply to WhatsApp messages (new leads + clients) | 15 min | WhatsApp |
| 2 | Update CRM Sheet (new leads, status changes) | 10 min | Google Sheets |
| 3 | Check Meta Ads (spend, CTR, CPL, frequency) | 5 min | Ads Manager |
| 4 | Check GA4 Realtime (confirm events firing) | 3 min | GA4 |
| 5 | Check Stripe (new payments → confirm on WhatsApp) | 5 min | Stripe |
| 6 | Send onboarding materials if needed | 10 min | WhatsApp |
| 7 | Check private group (reply to comments/questions) | 10 min | Facebook |
| 8 | Check community group | 2 min | Facebook |

## Midday Block (13:00-13:30) — 30 min

| # | Action | Time |
|---|--------|------|
| 1 | Follow-up leads per timing rules | 10 min |
| 2 | Client check-ins if scheduled | 10 min |
| 3 | Post in groups (if posting day: Mon/Wed/Fri/Sun) | 10 min |

## Evening Block (20:00-20:20) — 20 min

| # | Action | Time |
|---|--------|------|
| 1 | Reply to accumulated WhatsApp messages | 10 min |
| 2 | Final ads check (daily spend on track) | 5 min |
| 3 | CRM final update | 5 min |

**Total daily: ~80 minutes**

## Emergency Priority (If Only 20 Minutes Available)

1. Reply to WhatsApp (new leads + active clients)
2. Confirm Stripe payments
3. Send onboarding if someone paid

## Weekly Rhythm

| Day | Actions Beyond Daily Routine |
|-----|------------------------------|
| **Monday** | Post mindset (community) + weekly objective (private group). Review weekend leads. |
| **Wednesday** | Post education (both groups). Mid-week ads performance check. |
| **Friday** | Post movement + check-in (both groups). Review who missed check-in → WhatsApp. Review PAYMENT_PENDING leads. |
| **Sunday** | Post reflection. Complete Weekly Report. Review ads KPIs → decide SCALE/HOLD/REDUCE. Plan next week's content. Review inactive clients. |
| **Tue/Thu/Sat** | Daily routine only (~110 min) |

**Total weekly: ~16 hours**

---

# 8. CRM & Lead Flow

## System: Google Sheets — 2 Tabs

### Tab 1: LEADS

| Column | Content |
|--------|---------|
| A | Date entered |
| B | First name |
| C | Phone / WhatsApp |
| D | Source (ad / organic / referral) |
| E | **STATUS** (dropdown) |
| F | Last action date |
| G | Next action |
| H | Next action date |
| I | Notes |

### Tab 2: CLIENTS

| Column | Content |
|--------|---------|
| A | Payment date |
| B | First name |
| C | Phone / WhatsApp |
| D | Amount paid |
| E | Stripe ID |
| F | **STATUS** (dropdown) |
| G | Current week (1-52) |
| H | Last interaction |
| I | Next action |
| J | Next action date |
| K | Notes |

## Lead Stages

| Status | Trigger | Next Action | Deadline |
|--------|---------|-------------|----------|
| **NEW_LEAD** | WhatsApp message received from funnel | Send first reply | < 30 min (business hours) |
| **QUALIFYING** | First reply sent, awaiting answers | Continue Q1-Q4 | 24h per question |
| **QUALIFIED_HIGH** | Q4 = yes, decisive tone | Present offer | Immediately |
| **QUALIFIED_MED** | Interested but hesitant | Present offer softly | Within 24h |
| **QUALIFIED_LOW** | Evasive, "just browsing" | Redirect to community | Immediately |
| **OFFER_SENT** | Received offer + price | Wait for decision | 24h |
| **PAYMENT_PENDING** | Received payment link, hasn't paid | Follow-up per timing rules | +2h / +12h / +24h / +72h |
| **PAID** | Stripe payment confirmed | Start onboarding | Immediately |
| **LOST_NO_REPLY** | 4 follow-ups sent, no response | Archive | — |
| **LOST_DECLINED** | Explicitly said no | Redirect to community | — |
| **COMMUNITY** | Redirected to Facebook community group | Passive monitoring | — |

## Client Stages

| Status | Trigger | Next Action |
|--------|---------|-------------|
| **ONBOARDING** | Payment confirmed | Execute 9-point checklist within 48h |
| **ACTIVE** | Onboarding complete, Week 1 started | Weekly check-ins |
| **ACTIVE_ENGAGED** | Posts in group, replies to check-ins regularly | Continue normal rhythm |
| **SLOWING** | Missed Friday check-in | WhatsApp within 48h |
| **INACTIVE** | No interaction for 14+ days | Voice note + simplified restart offer |
| **REACTIVATED** | Returned after inactive period | Simplified plan + increased touch |
| **COMPLETED** | 12 months finished | Final message + continuation option |

## Stage Flow

```
LEADS:
NEW_LEAD --> QUALIFYING --> QUALIFIED_HIGH --> OFFER_SENT --> PAYMENT_PENDING --> PAID
                         --> QUALIFIED_MED  --> OFFER_SENT --> PAYMENT_PENDING --> PAID
                         --> QUALIFIED_LOW  --> COMMUNITY
                                               OFFER_SENT --> LOST_NO_REPLY
                                               OFFER_SENT --> LOST_DECLINED --> COMMUNITY

CLIENTS:
PAID --> ONBOARDING --> ACTIVE --> ACTIVE_ENGAGED --> ... --> COMPLETED
                              --> SLOWING --> INACTIVE --> REACTIVATED --> ACTIVE
```

## Color Coding (Google Sheets Conditional Formatting)

| Color | Statuses |
|-------|----------|
| Green | PAID, ACTIVE, ACTIVE_ENGAGED, COMPLETED |
| Yellow | QUALIFYING, QUALIFIED_MED, OFFER_SENT, SLOWING, ONBOARDING |
| Orange | PAYMENT_PENDING, INACTIVE, REACTIVATED |
| Red | LOST_NO_REPLY, LOST_DECLINED |
| Blue | QUALIFIED_HIGH, COMMUNITY |

---

# 9. Ads + Scaling System

## Campaign Structure (Meta Ads)

| Campaign | Objective | Budget Share |
|----------|-----------|-------------|
| **CYB_COLD** | Conversions (optimized on `Lead` / mini_complete) | 65-70% of daily budget |
| **CYB_WARM** | Conversions (retargeting) | 30-35% of daily budget |

### Naming Convention

```
CYB_[COLD/WARM]_[AUDIENCE]_[YYYY-MM]_[V#]
Example: CYB_COLD_INTEREST_2026-03_V1
```

## Ad Sets

### COLD Campaign

| Ad Set | Audience | Budget |
|--------|----------|--------|
| **COLD_INTEREST** | Women 25-50, Romania, interests: fitness, nutrition, wellness, health, moms, yoga | 10 EUR/day |
| **COLD_LOOKALIKE** | 1% lookalike from mini_complete conversions *(activate after 50+ conversions)* | 4 EUR/day |

### WARM Campaign

| Ad Set | Audience | Budget |
|--------|----------|--------|
| **WARM_VISITORS** | Website visitors 7 days, exclude mini_complete | 3 EUR/day |
| **WARM_STARTED** | mini_start without mini_complete, 14 days | 2 EUR/day |
| **WARM_COMPLETERS** | mini_complete or complet_complete without whatsapp_click, 30 days *(activate after 30 days)* | 2 EUR/day |

### Budget Phases (Starting at 15 EUR/day)

| Phase | COLD | WARM | Total |
|-------|------|------|-------|
| Days 0-7 | 10 EUR (COLD_INTEREST only) | 5 EUR (VISITORS 3 + STARTED 2) | 15 EUR |
| Days 8-14 | 10 EUR (COLD_INTEREST) | 5 EUR (WARM) | 15 EUR |
| After Day 14 (if performing) | 8 INTEREST + 4 LOOKALIKE | 5 (3 ad sets) | 17 EUR |

## Creatives

- 3 per ad set (minimum 2, maximum 4)
- 2 short vertical videos (15-30 seconds, 9:16 format) + 1 static image with text overlay
- CTA button: "Afla mai multe" / "Learn More"
- Landing page: direct to questionnaire

## Ad Decision Rules

| Action | Condition | Minimum Data |
|--------|-----------|-------------|
| **Kill creative** | CTR < 0.5% | 1,000 impressions AND 48 hours |
| **Kill ad set** | All 3 creatives killed, OR CPL > 5 EUR after 15+ conversions | — |
| **Scale creative** | CTR > 2% AND CPL < 2 EUR, stable 5+ days | 20+ conversions |
| **Hold** | Learning phase active, OR < 7 days since last scale | — |
| **Reduce** | CPL rising 3 consecutive weeks, OR frequency > 3.5 | — |

## Scale Decision Matrix

```
                    ROAS > 5x         ROAS 3-5x         ROAS < 3x
                +----------------+----------------+----------------+
CAC < 20% P     |  SCALE +30%    |  SCALE +20%    |  HOLD          |
CAC 20-30% P    |  SCALE +20%    |  HOLD          |  REDUCE -20%   |
CAC > 30% P     |  HOLD          |  REDUCE -20%   |  STOP          |
                +----------------+----------------+----------------+
```

## Scale Increment Rules

| Current Budget | Max Increment |
|---------------|--------------|
| < 20 EUR/day | +20% (max +4 EUR) |
| 20-40 EUR/day | +20% (max +8 EUR) |
| 40-80 EUR/day | +15% (max +12 EUR) |
| > 80 EUR/day | +10% (max +10 EUR) |

**Never increase more than +30% in a single change. Wait 7 days between increases.**

## Budget Ceilings

| Business Level | Max Daily Budget | Condition |
|---------------|-----------------|-----------|
| Start (0-5 total clients) | 15 EUR | Default starting point |
| Validated (5-15 total clients) | 25 EUR | 3+ paid clients, CAC < 25% P, 2+ months data |
| Stable (15-30 total clients) | 40 EUR | ROAS > 3x stable for 30 days |
| Scale (30+ total clients) | 60 EUR | ROAS > 4x stable for 60 days |

**Absolute ceiling: Never spend more in a month than last month's revenue.**

## After STOP Decision

1. Do not reactivate for minimum 7 days
2. Analyze root cause (see Section 13)
3. Fix the cause BEFORE restarting
4. Restart at 50% of previous budget
5. If STOP happens twice in 60 days → fundamental review needed (product, price, audience)

## First 14 Days Execution Plan

### Day 0 — Launch

- 09:00: Verify Pixel (Meta Events Manager → Test Events)
- 09:30: Verify GA4 (Realtime → confirm events)
- 10:00: Publish COLD campaign (3 creatives, 10 EUR/day) + WARM (5 EUR/day)
- 10:30: Verify ads approved and in delivery
- 14:00: First check — impressions > 0?
- 22:00: Evening check — observe only, NO decisions

### Days 1-3 — Learning Phase

**Do NOT touch anything.** Only check:
- Ads are in delivery
- Spend is on track (~15 EUR/day)
- GA4 events are firing
- No technical errors

**Only exception:** If tracking is broken → fix immediately.

### Day 4 — First Real Analysis

- Sort creatives by CTR
- Check CPL per creative
- Check funnel ratios in GA4
- Kill worst creative ONLY if > 1,000 impressions AND CTR < 0.5%

### Days 5-7

- Monitor CTR per creative (kill underperformers)
- Watch CPL trend
- Check frequency (< 2.5 is fine)

### Day 7 — First Decision Point

| Result | Action |
|--------|--------|
| CTR > 1.5%, CPL < 3 EUR | Continue unchanged |
| CTR > 1%, CPL 3-5 EUR | Continue, prepare new creative |
| CTR < 0.8%, CPL > 5 EUR | Kill worst creatives, replace. Don't change audience yet. |
| 0 mini_complete events | Check: landing page? tracking? correct URL? |

### Days 8-13

- Replace killed creatives
- Monitor WARM ad set performance
- Track WhatsApp messages manually

### Day 14 — Full Review

Fill out the Weekly Report (Section 11) with all 30 metrics. Make SCALE / HOLD / REDUCE / STOP decision.

---

# 10. KPI System

## Funnel KPIs

| KPI | Formula | Good | Warning | Failure |
|-----|---------|------|---------|---------|
| **CTR** | Link clicks / Impressions x 100 | > 1.5% | 0.8-1.5% | < 0.8% |
| **CPC** | Spend / Link clicks | < 0.30 EUR | 0.30-0.60 EUR | > 0.60 EUR |
| **CPL** | Spend / mini_completes | < 2 EUR | 2-4 EUR | > 4 EUR |
| **Cost per WA click** | Spend / cta_clicks | < 8 EUR | 8-15 EUR | > 15 EUR |
| **Landing → Mini start** | mini_start / page_view x 100 | > 60% | 40-60% | < 40% |
| **Mini completion** | mini_complete / mini_start x 100 | > 70% | 50-70% | < 50% |
| **Mini → Complet transition** | complet_start / mini_complete x 100 | > 35% | 20-35% | < 20% |
| **Complet completion** | complet_complete / complet_start x 100 | > 60% | 40-60% | < 40% |
| **Results → WA click** | cta_click / complet_complete x 100 | > 25% | 15-25% | < 15% |
| **Full funnel rate** | cta_click / page_view x 100 | > 4% | 2-4% | < 2% |

## Business KPIs

| KPI | Formula | Target |
|-----|---------|--------|
| **CAC** | Ad spend / Paid clients | < 20% of program price |
| **ROAS** | Revenue / Ad spend | > 3x minimum, > 5x healthy |
| **Gross margin** | (Revenue - Spend - Costs) / Revenue x 100 | > 50% |
| **WA → Client rate** | Paid clients / WA clicks x 100 | > 15% |
| **Lead → Client rate** | Paid clients / mini_completes x 100 | > 5% |
| **Email capture rate** | Emails / mini_completes x 100 | > 80% |

## Conversion Path with Events

```
AD CLICK
   |
   v
PAGE VIEW (GA4: page_view, FB: PageView)
   = traffic arrived, we are paying for this
   |
   v
QUESTIONNAIRE START (GA4: mini_start)
   = entered funnel, real interest
   = QUALIFIED LEAD LEVEL 1
   |
   v
MINI COMPLETE (GA4: mini_complete, FB: Lead)
   = commitment demonstrated, gave email
   = QUALIFIED LEAD LEVEL 2
   = PRIMARY CONVERSION EVENT FOR META ADS
   |
   v
COMPLET START (GA4: complet_start)
   = wants complete results, investing extra time
   = QUALIFIED LEAD LEVEL 3
   |
   v
COMPLET COMPLETE (GA4: complet_complete, FB: CompleteRegistration)
   = finished everything, most qualified lead possible
   = QUALIFIED LEAD LEVEL 4
   |
   v
WHATSAPP CLICK (GA4: cta_click, FB: ViewContent)
   = PURCHASE INTENT
   = FINAL FUNNEL CONVERSION
   |
   v
[POST-FUNNEL: WhatsApp conversation -> payment -> client]
   = tracked manually by Dana
```

## Red Flags (Immediate Action Required)

| Flag | Meaning | Action |
|------|---------|--------|
| CTR < 0.5% after 1,000+ impressions | Creative is invisible | Kill creative, test new one |
| CPC > 0.80 EUR | Audience too competitive or irrelevant | Check targeting |
| Landing → Mini start < 30% | Page doesn't convince or loads slowly | Check page speed on mobile (NOT a redesign) |
| 0 WA clicks after 50+ complet_completes | Results page not converting | Check if WhatsApp button works |
| CPL rising 3 consecutive days | Ad fatigue or audience saturation | Rotate creatives or widen audience |
| Frequency > 3.0 | Same people seeing ad too often | Widen audience or pause ad set |
| All GA4 events stop firing | Tracking broken | FIX IMMEDIATELY |

---

# 11. Profit Control

## Core Formulas

| KPI | Formula |
|-----|---------|
| **CAC** (Cost per Acquisition) | Total ad spend / Number of paid clients |
| **CPL** (Cost per Lead) | Total ad spend / Number of leads (mini_complete) |
| **ROAS** (Return on Ad Spend) | Total revenue / Total ad spend |
| **Gross Profit** | Revenue - Ad spend - Operating costs |
| **Gross Margin** | Gross profit / Revenue x 100 |
| **Break-even** | (Ad spend + Operating costs) / Price per program |
| **Maximum CAC** | Program price x 0.30 (absolute ceiling) |
| **Target CAC** | Program price x 0.20 (healthy) |
| **Excellent CAC** | Program price x 0.10 (aggressive scaling possible) |

## Cashflow Protection Rules

| Rule | Implementation |
|------|---------------|
| **70/30 Rule** | Never spend more than 70% of LAST month's revenue on ads this month |
| **Buffer Rule** | Always maintain 2 weeks of ad spend as cash buffer |
| **Cash-First Rule** | Scale only from confirmed profit, not from expected revenue |
| **Reinvestment Split** | 50% reinvested in ads, 30% profit for Dana, 20% buffer/reserve |
| **Absolute Ceiling** | Never spend more in one month than total revenue of the previous month |

## Weekly Profit Dashboard

Completed every Sunday. ~15 minutes.

```
WEEK: [START_DATE] — [END_DATE]

TRAFFIC:
- Ad spend:           ___ EUR
- Impressions:        ___
- Link clicks:        ___
- CTR:                ____%
- CPC:                ___ EUR

FUNNEL:
- Page views:         ___
- Mini starts:        ___
- Mini completes:     ___
- Complet completes:  ___
- WhatsApp clicks:    ___
- CPL:                ___ EUR

CONVERSION:
- WhatsApp conversations: ___
- Qualified leads:        ___
- Offers sent:            ___
- Payments received:      ___
- Revenue:                ___ EUR
- WA → Client rate:       ____%

PROFIT:
- CAC:                ___ EUR ( ___% of price)
- ROAS:               ___x
- Gross profit:       ___ EUR
- Gross margin:       ____%

HEALTH CHECK:
- CAC status:         [ GREEN / YELLOW / RED ]
- ROAS status:        [ GREEN / YELLOW / RED ]
- Margin status:      [ GREEN / YELLOW / RED ]
- Funnel rate status: [ GREEN / YELLOW / RED ]
- WA conversion:      [ GREEN / YELLOW / RED ]

ACTIVE CLIENTS:       ___
IN ONBOARDING:        ___
INACTIVE:             ___

NEXT WEEK ACTIONS:
1. ___
2. ___
3. ___
```

## 30-Day Decision Framework

| Decision | Criteria (ALL must be true) |
|----------|----------------------------|
| **SCALE** | 4+ paid clients, CAC < 25% of price, ROAS > 3x, margin > 50%, operational capacity available (< 15 active clients) |
| **OPTIMIZE** | 2-3 paid clients, CAC 20-30% of price, ROAS 2-3x, funnel works but WhatsApp conversion is weak |
| **HOLD** | Only 1 client OR fewer than 30 total leads OR inconsistent data. Continue unchanged for 15 more days. |
| **STOP** | 0 clients in 30 days OR CAC > 35% of price OR ROAS < 1x. Pause → diagnose → fix → restart at 50% budget. |

### 30-Day Decision Card

```
+------------------------------------------+
|        DAY 30 PROFIT DECISION            |
+------------------------------------------+
|                                          |
|  Ad Spend:      ___ EUR                  |
|  Revenue:       ___ EUR                  |
|  Paid Clients:  ___                      |
|  CAC:           ___ EUR  ( __% of P)     |
|  ROAS:          ___x                     |
|  Margin:        ___%                     |
|                                          |
|  DECISION: [ SCALE / OPTIMIZE /          |
|              HOLD / STOP ]               |
|                                          |
|  Next review: Day ___                    |
|  Actions:                                |
|  1. ___                                  |
|  2. ___                                  |
|  3. ___                                  |
+------------------------------------------+
```

## Operational Capacity Limits

| Active Clients | Action |
|---------------|--------|
| 0-10 | Scale freely (within financial rules) |
| 11-15 | HOLD budget. Do not increase ads. |
| 16-19 | REDUCE budget -20%. Focus on delivery quality. |
| 20 | PAUSE ads completely. Resume only when a slot opens. |

| Limit | Value |
|-------|-------|
| Max simultaneous onboardings per week | 3 |
| Max operational time per day | 4 hours (if exceeded → PAUSE scaling) |

---

# 12. Execution Rules

## What NEVER Changes

| Element | Status |
|---------|--------|
| Funnel logic (questionnaire flow, steps, transitions) | LOCKED |
| Scoring engine (stress, hormonal, metabolic formulas) | LOCKED |
| Signal interpretation (7 signals, thresholds) | LOCKED |
| Route mapping (MOMENT_TO_ROUTE) | LOCKED |
| Psychological system (personal letter, fragments, calibration) | LOCKED |
| Question order (MINI + COMPLET) | LOCKED |
| Question text (wording of all questions) | LOCKED |
| CTA destination = WhatsApp | LOCKED |
| WhatsApp = 1:1 only, never groups | LOCKED |
| Paying users separated from non-paying | LOCKED |
| Maximum 4 follow-ups per lead then stop | LOCKED |
| Never offer discount to rescue a hesitant lead | LOCKED |
| Never spend more than last month's revenue | LOCKED |
| Analytics event names | LOCKED |
| CTA timing locks (2s MINI, 3.5s COMPLET) | LOCKED |

## What Stays Manual (Permanently)

| Process | Why It Cannot Be Automated |
|---------|---------------------------|
| WhatsApp qualification conversations | Personalization IS the value proposition |
| Offer timing decision | Depends on real-time conversation signals |
| Personalized Start Plan (PDF) | Core product differentiator |
| Client check-in responses | Clients detect generic/automated instantly |
| Ad kill/scale decisions | Requires business judgment on combined data |

## What Can Be Automated Later (When Volume Justifies)

| Process | Trigger Volume | Tool |
|---------|---------------|------|
| Stripe payment → notification to Dana | > 10 payments/month | Zapier |
| Lead auto-entry in CRM sheet | > 30 leads/week | Zapier |
| Inactive client reminder to Dana (not to client) | > 20 active clients | Zapier + Google Sheets |
| GA4 data auto-populate in weekly report | > 50 EUR/day ad spend | GA4 API connection |
| Facebook post scheduling | When manual posting takes > 30 min/week | Meta Business Suite |

## What Must NEVER Be Automated

| Process | Reason |
|---------|--------|
| WhatsApp conversations (any part) | Personalization destroyed |
| Offer presentation timing | Requires human judgment |
| Client check-in responses | Generic = churn |
| Plan personalization | Core value of the product |
| Ad decisions | Requires business context |

## Sunday Review Checklist

```
[ ] 1. Fill in Ads Manager numbers (spend, clicks, CTR)
[ ] 2. Fill in GA4 numbers (events, funnel rates)
[ ] 3. Fill in conversion numbers (leads, offers, clients) from CRM
[ ] 4. Check 5 health indicators:
       - CAC green?
       - ROAS green?
       - Margin green?
       - Funnel rate green?
       - WA conversion green?
[ ] 5. Decision: SCALE / HOLD / REDUCE / STOP?
[ ] 6. Write 1-3 actions for next week
```

---

# 13. Failure Diagnosis

## Problem: No Leads Coming In

```
CHECK IN ORDER:

1. Are ads active? (Ads Manager → delivery status)
   NO → Reactivate or check rejection reason
   YES → Continue

2. Is budget being spent? (~target EUR/day?)
   NO → Ad set not in delivery. Check audience size.
   YES → Continue

3. CTR > 0.8%?
   NO → Creatives don't attract attention. Replace creatives.
   YES → Continue

4. Landing page loads correctly? (open on mobile)
   NO → Technical bug. Fix urgently.
   YES → Continue

5. GA4 events firing? (check Realtime)
   NO → Tracking is broken. Fix urgently.
   YES → Continue

6. mini_start > 0 but mini_complete = 0?
   YES → Funnel loses users mid-flow. Check browser console for JS errors.
   NO → Audience is not relevant. Adjust targeting.
```

## Problem: Leads Come In But No Sales

```
CHECK IN ORDER:

1. WhatsApp clicks > 0?
   NO → Funnel doesn't convert at CTA.
        Check: does the button work? Is the number correct?
   YES → Continue

2. WhatsApp messages actually received?
   NO → Pre-filled message correct? Link destination correct?
   YES → Continue

3. Responding within 30 minutes?
   NO → Leads go cold fast. Prioritize response speed.
   YES → Continue

4. Full qualification done (Q1-Q4)?
   NO → Sending offer too early. Qualify first.
   YES → Continue

5. What intent segment dominates?
   Mostly LOW → Traffic is unqualified. Adjust audience targeting.
   Mostly MED → Offer doesn't convince. Review presentation.
   Mostly HIGH but not paying → Price barrier or trust issue.

6. Leads say "ma gandesc" and disappear?
   Check: Were follow-ups sent at 6h / 24h / 72h?
   Check: Is the tone too sales-oriented? Review conversation.
```

## Problem: Sales Happen But No Profit

```
CHECK IN ORDER:

1. CAC > 30% of program price?
   YES → Acquisition too expensive. Reduce budget. Optimize ads.
   NO → Continue

2. ROAS < 2x?
   YES → Ad spend too high vs revenue.
         Reduce spend by 20%. Keep what works.
   NO → Continue

3. Revenue exists but not collected?
   Check Stripe: pending payments? Failed charges?
   Check bank transfers: confirmations received?

4. Spending more than earning?
   Apply the 70/30 rule immediately.
   Max budget = 70% of last month's revenue.

5. Hidden costs?
   Stripe fees: ~2.9% + 0.30 EUR per transaction
   Tools/subscriptions active?
   Recalculate real gross profit.

6. Many clients, margin OK, but no cash in pocket?
   Apply reinvestment rule: 50% ads, 30% Dana, 20% buffer
   If Dana's 30% is too little → increase price (NOT decrease costs)
```

## Problem: Clients Sign Up But Go Inactive

```
CHECK IN ORDER:

1. Was onboarding completed fully? (all 9 checklist items)
   NO → Incomplete onboarding = confused client. Redo missed steps.
   YES → Continue

2. Did client receive the plan within 12 hours?
   NO → Too slow. Client momentum lost. Send immediately + apologize.
   YES → Continue

3. Did client set a start date?
   NO → No commitment made. Ask now: "Care zi e buna sa incepem?"
   YES → Continue

4. Is client in the private group?
   NO → Some clients don't use Facebook. Offer WhatsApp-only support.
   YES → Continue

5. Did client respond to first Friday check-in?
   NO → Send personal WhatsApp within 48h (not generic).
   YES → Client was active, something changed. Check what.

6. Has client been inactive 14+ days?
   Send voice note (NOT text). Personal, warm, 30 seconds.
   Offer simplified restart: "Un singur lucru mic saptamana asta."
```

## Problem: Ads Worked Before But Stopped Working

```
CHECK IN ORDER:

1. Frequency > 3.0?
   YES → Same people seeing ad too often. Widen audience or pause ad set.
   NO → Continue

2. Same creatives running for > 30 days?
   YES → Ad fatigue. Replace with fresh creatives.
   NO → Continue

3. Audience size shrinking?
   YES → Retargeting pool depleted. Expand cold audience.
   NO → Continue

4. Seasonal factor? (holidays, summer, January)
   YES → Hold. Don't panic. Wait 7-14 days.
   NO → Continue

5. Competitor entered the space?
   Check: new similar ads in Ad Library?
   If yes → Differentiate creative angle. Don't copy. Don't panic.

6. Nothing obvious?
   Kill all ad sets. Create fresh campaign.
   New creatives, same audiences. Restart at 50% budget.
```

---

# Appendix: Key System Constants

## Funnel Technical Constants

| Constant | Value |
|----------|-------|
| MINI steps | 9 |
| Signals | 7 (overwhelmed, selfBlame, actionCapacity, shameRisk, structureNeed, pressureTolerance, motivationStyle) |
| Routes | 6 (POSTPARTUM, DIVORCE, HORMONAL, BURNOUT, LOSS, GENERAL) |
| Letter fragments | 35 (across 7 sections) |
| Letter word range | 80-600 |
| Letter version | PL-1.0.0-3L |
| CTA lock MINI | 2 seconds |
| CTA lock COMPLET | 3.5 seconds |
| goNext debounce | 450ms |
| Letter states | 5 (disabled, blocked, invalid, built, exception) |
| Diagnostic codes | 11 (LETTER_DIAG) |
| Release gate checks | 9 |
| API contract members | 13 |

## Business Constants

| Constant | Value |
|----------|-------|
| Follow-up messages max per lead | 4 |
| Follow-up window | 7 days |
| Payment follow-up max | 4 messages / 72 hours |
| Onboarding completion target | 48 hours |
| Plan delivery target | 6-12 hours after payment |
| Max active clients | 20 |
| Max onboardings per week | 3 |
| Max operational hours per day | 4 |
| Budget increment max | +30% per change |
| Wait between budget changes | 7 days |
| Min data before ad decision | 48 hours + relevant impressions |
| Weekly posts community | 4 (Mon/Wed/Fri/Sun) |
| Weekly posts private group | 4 (Mon/Wed/Fri/Sun) |

---

*CYB Master Operating System v2.0*
*This document governs all business and application execution.*
*Do not modify without a complete system review.*
