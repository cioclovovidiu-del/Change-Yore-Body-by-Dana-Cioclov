// =============================================================================
// CYB COPY — UNIFIED (MINI + COMPLET)
// Centralized copy architecture. Merged from CYB_Copy_MINI.js + CYB_Copy_COMPLET.js
// Layers:
//   COPY.route              — route labels (shared)
//   COPY.shared             — bmiCategories, goalNames, gaugeLabels
//   COPY.mini.questions     — MINI question titles, subtitles, labels, placeholders
//   COPY.mini.emotional     — MINI phase1 emotional messages
//   COPY.mini.ui            — MINI welcome, results, upgrade, measures, emailPreResults
//   COPY.complet.questions  — COMPLET question titles, subtitles, notes
//   COPY.complet.transitions — COMPLET block transition titles + bodies
//   COPY.complet.ui         — COMPLET results, buttons, textarea, miniResultLabel
//   COPY.ui                 — shared buttons
//   COPY.metabolicProfiles  — profile names + descriptions
//   COPY.fallback           — safe defaults
//   COPY.q() / COPY.t()    — fallback accessors for COMPLET
// =============================================================================

const COPY = {

  // ── ROUTE (shared) ──────────────────────────────────────────────────
  route: {
    labels: ['Postpartum','Divorț/Separare','Schimbări hormonale','Burnout','Când pierzi pe cineva drag','General'],
    get(i) { return this.labels[i] || this.fallbackLabel; },
    fallbackLabel: 'General',
  },

  // ── SHARED ──────────────────────────────────────────────────────────
  shared: {
    bmiCategories: [
      { max: 18.5, label: 'Subponderală', cls: 'cat-under' },
      { max: 25,   label: 'Normală',      cls: 'cat-normal' },
      { max: 30,   label: 'Supraponderală', cls: 'cat-over' },
      { max: 999,  label: 'Obezitate',     cls: 'cat-obese' },
    ],
    goalNames: ['slăbire','tonifiere','energie','sănătate'],
    gaugeLabels: ['Sub','Normal','Supra','Obez'],
  },

  // ── UI (shared buttons) ─────────────────────────────────────────────
  ui: {
    buttons: {
      start: 'Descoperă-ți profilul gratuit →',
      next: 'Continuă →',
      seeResults: 'Vreau să văd rezultatele →',
    },
    resetButton: 'Începe din nou',
  },

  // ── METABOLIC PROFILES ──────────────────────────────────────────────
  metabolicProfiles: {
    postpartum:     { name:'Profil Postpartum Recovery', color:'var(--rose)', desc:'Corpul tău e în recuperare. Prioritate: hrănire adecvată (nu restricție), mișcare blândă progresivă, somn, și răbdare cu tine însăți.' },
    pierdere:       { name:'Profil Îngrijire Blândă', color:'var(--text)', desc:'Prioritatea acum nu e slăbirea — e grija de tine. Somn, hrănire reconfortantă, mișcare blândă. Pas cu pas.' },
    antiCortizol:   { name:'Profil Anti-Cortizol', color:'var(--coral)', desc:'Stresul cronic îți sabotează eforturile. Cortizolul ridicat stochează grăsime abdominală. Plan: reducere stres ÎNAINTE de restricție calorică.' },
    hormonalReset:  { name:'Profil Hormonal Reset', color:'var(--purple)', desc:'Hormonii sunt în schimbare — și abordarea trebuie să se schimbe. Antrenament de forță prioritar, nutriție adaptată la nevoile noi ale corpului.' },
    metabolismLent: { name:'Profil Metabolism Lent', color:'var(--gold)', desc:'Metabolismul are nevoie de activare graduală. Mișcare progresivă + masă musculară = metabolismul crește natural.' },
    echilibrat:     { name:'Profil Echilibrat', color:'var(--teal-glow)', desc:'Ai o bază bună. Planul se concentrează pe optimizare: nutriție precisă, antrenament structurat, consistență.' },
  },

  // ── FALLBACK ────────────────────────────────────────────────────────
  fallback: {
    metabolicProfile: { name:'Profil Echilibrat', color:'var(--teal-glow)', desc:'Ai o bază bună. Planul se concentrează pe optimizare: nutriție precisă, antrenament structurat, consistență.' },
  },

  // ── MINI ────────────────────────────────────────────────────────────
  mini: {
    // ── MINI QUESTIONS ──────────────────────────────────────────────
    questions: {
      name:     { label:'Despre tine', title:'Cum te numești?', sub:'Prenumele tău — așa cum vrei să ți ne adresăm', ph:'Scrie prenumele tău...' },
      age:      { label:'Despre tine', title:'Câți ani ai?', sub:'Vârsta ta în ani', ph:'ex: 38' },
      measures: { label:'Corpul tău', title:'Înălțime și greutate', sub:'Aceste date ne ajută să calculăm profilul tău metabolic' },
      activity: { label:'Stilul tău', title:'Cât de activă ești în prezent?', sub:'Alege varianta cea mai apropiată de realitate' },
      goal:     { label:'Obiectivul tău', title:'Care e obiectivul tău principal?', sub:'Alege ce contează cel mai mult pentru tine acum' },
      moment:   { label:'Momentul tău', title:'Ce moment traversezi acum?', sub:'Această întrebare ne ajută să personalizăm totul pe viața ta reală. Fără judecată.' },
      gdpr_email: { label:'Aproape gata', title:'Rezultatele tale sunt gata', sub:'Emailul este opțional. Dacă îl lași, îți trimitem profilul și pe email. Dacă nu, poți vedea rezultatele imediat.', ph:'email@exemplu.ro (opțional)', consent:'Sunt de acord ca datele mele să fie procesate de CYB pentru a primi profilul personalizat și comunicări relevante. Pot revoca oricând.' },
    },

    // ── MINI EMOTIONAL ──────────────────────────────────────────────
    emotional: {
      fallbackMessage: 'Ești în locul potrivit. Hai să construim împreună ceva care funcționează pentru tine.',
      phase1: {
        name: function(d) { return 'Bun venit, ' + (d.name || '') + '! Hai să vedem ce poate face CYB pentru tine.'; },
        age: function(d) { return 'Perfect. La ' + (d.age || '') + ' de ani, corpul tău are nevoi specifice — și noi le înțelegem.'; },
        measures: function(d, bmi) { return 'Am calculat. IMC-ul tău este ' + (bmi ? bmi.toFixed(1) : '—') + ' — asta ne spune multe. Hai să continuăm.'; },
        activity: function(d) { return 'Înțeleg. Fiecare nivel de activitate are abordarea lui — programul tău va ține cont de asta.'; },
        goal: function(d) {
          var goals = ['Slăbirea','Tonifierea','Energia','Sănătatea'];
          return (goals[d.goal] || 'Obiectivul tău') + ' este un drum pe care l-am mai parcurs cu sute de femei. Nu ești singură.';
        },
        moment: function(d) {
          var msgs = [
            'Știu că viața s-a schimbat complet. Corpul tău a făcut ceva extraordinar — și merită îngrijire, nu pedeapsă.',
            'Înțeleg prin ce treci. Stresul pe care îl simți nu e doar emoțional — îți afectează corpul în moduri pe care poate nu le știi încă.',
            'Știu exact cum e: faci totul „corect" dar corpul nu mai răspunde. NU e vina ta. Hormonii s-au schimbat.',
            'Ești epuizată, dar încă funcționezi — și tocmai asta e problema. Corpul ține scorul.',
            'Nu există cuvinte potrivite. Dar a avea grijă de corpul tău în această perioadă e un act de auto-compasiune.',
            'Perfect. Hai să construim ceva frumos împreună.',
          ];
          var msg = msgs[d.moment] || msgs[5];
          return msg + ' Am pregătit ceva special pentru tine.';
        },
      },
      get: function(key, d, extra) {
        var fn = this.phase1[key];
        if (typeof fn === 'function') { try { return fn(d, extra); } catch(e) { return this.fallbackMessage; } }
        return this.fallbackMessage;
      },
    },

    // ── MINI UI ─────────────────────────────────────────────────────
    ui: {
      welcome: {
        heading: 'Descoperă-ți <em>profilul gratuit</em>',
        subtitle: '60 de secunde. 6 întrebări simple. Și vei înțelege ce are nevoie corpul tău.',
        freeHeading: 'Ce vei primi gratuit:',
        freeItems: ['IMC-ul tău calculat cu vizualizare','Recomandări personalizate pe obiectiv','Program antrenament 1 săptămână','Acces grup WhatsApp CYB'],
        blurHeading: 'Ce vei vedea blurat (teaser):',
        blurItems: ['Metabolismul tău bazal (BMR)','Necesarul caloric zilnic (TDEE)','Proiecție progres 12 săptămâni','Macro-uri zilnice (proteine/carbs/grăsimi)','Greutate ideală estimată','Profil metabolic pe traseul tău'],
      },
      emailPreResults: 'Apasă butonul și vezi rezultatele tale personalizate — cu sau fără email.',
      measures: { heightLabel: 'Înălțime (cm)', weightLabel: 'Greutate (kg)' },
      results: {
        headerTitle: function(name) { return 'Rezultatele tale, ' + (name || ''); },
        heading: 'Profilul tău <em style="color:var(--teal-glow)">metabolic</em>',
        routePrefix: 'Traseu detectat',
        imcHeading: 'IMC — Indicele de Masă Corporală',
        recoHeading: 'Recomandări pe obiectivul tău',
        recoBody: function(bmi, goal, age) { return 'Pe baza IMC-ului tău de ' + bmi + ' și a obiectivului de <strong style="color:white">' + goal + '</strong>, recomandăm o abordare graduală, bazată pe nutriție adaptată și mișcare progresivă. La ' + age + ' de ani, corpul tău răspunde cel mai bine la consistență, nu la intensitate.'; },
        freeItems: ['Program antrenament generic 1 săptămână (PDF)','Ghid Cumpărături Sănătoase (PDF)','Acces grup WhatsApp CYB'],
        blurOverlay: 'Aceste rezultate sunt calculate.<br><em style="color:var(--gold)">Deblochează-le cu un plan CYB.</em>',
        bmrHeading: 'Metabolismul tău bazal (BMR)',
        bmrDesc: 'kcal/zi — atâtea calorii arde corpul tău în repaus complet',
        tdeeHeading: 'Necesarul caloric zilnic (TDEE)',
        tdeeDesc: 'kcal/zi — cu activitatea ta actuală inclusă',
        macroHeading: 'Macro-uri zilnice recomandate',
        macroLabels: ['Proteine','Carbohidrați','Grăsimi'],
        projHeading: 'Proiecție progres',
        projBody: function(deficit, weeks, target) { return 'Dacă menții un deficit de 500 kcal/zi (' + deficit + ' kcal/zi), în <strong style="color:white">' + weeks + ' săptămâni</strong> poți ajunge la <strong style="color:var(--teal-glow)">' + target + ' kg</strong>.'; },
        idealHeading: 'Greutate ideală estimată',
        idealDesc: function(h) { return 'interval sănătos pentru înălțimea ta de ' + h + ' cm'; },
      },
      upgrade: {
        heading: 'Înțeleg prin ce treci.<br><em style="color:var(--teal-glow)">Uite ce m-am gândit.</em>',
        body: 'Rezultatele de sus sunt calculate pe baza datelor tale. Dar pentru un plan real — nutriție, antrenament, suport — avem nevoie să te cunoaștem mai bine.<br><strong style="color:white">Alege planul potrivit → completezi chestionarul detaliat → primești totul personalizat.</strong>',
        plans: [
          { name:'E-book Nutriție 35+', price:'15€' },
          { name:'Antrenament 1 săptămână', price:'29€' },
          { name:'Dietă AI personalizată', price:'49€' },
          { name:'REBUILD Esențial', price:'59€', old:'79€' },
          { name:'REBUILD Premium', price:'99€', old:'149€' },
          { name:'REBUILD VIP (cel mai popular)', price:'199€', old:'299€', hl:true },
          { name:'CYB Coaching Complet 12 săpt.', price:'399€', gold:true },
        ],
        footer: function(route) { return 'Planurile de la 49€ includ chestionarul complet de 27 întrebări<br>pentru personalizare reală pe traseul tău <strong style="color:var(--gold)">' + route + '</strong>'; },
        ctaDirectButton: 'Vorbește cu Daniela pe WhatsApp →',
        ctaDirectWhatsApp: 'https://wa.me/40721333040?text=Bun%C4%83%20Daniela,%20am%20completat%20chestionarul%20%C8%99i%20vreau%20mai%20multe%20detalii.',
        ctaGroupBody: 'Sau intră gratuit în grupul nostru de WhatsApp — sfaturi zilnice, suport și comunitate.',
        ctaGroupButton: 'Intră în grupul CYB (opțional)',
        ctaGroupWhatsApp: 'https://chat.whatsapp.com/Gyi1jBE4lI5JQZKTJ9jxsC',
      },
    },
  },

  // ── COMPLET ─────────────────────────────────────────────────────────
  complet: {
    // ── COMPLET QUESTIONS ────────────────────────────────────────────
    questions: {
      q1:   { title:'La ce greutate te-ai simți cel mai bine?', sub:'Nu greutatea „perfectă" — ci cea la care te simți tu bine în corpul tău.' },
      // q2 removed (D4)
      q3:   { title:'Cum s-a schimbat greutatea ta recent?', sub:'Ne ajută să înțelegem ritmul corpului tău.' },
      q4:   { title:'Ai copii?', sub:'Maternitatea schimbă corpul — și planul trebuie să reflecte asta.' },
      q4b:  { title:'Alăptezi în prezent?', sub:'Adaptăm nutriția ca să fie sigură pentru tine și bebe.' },
      q5:   { title:'Cum dormi de obicei?', sub:'Somnul e mai important decât crezi — afectează direct hormonii și greutatea.' },
      q6:   { title:'Cât de stresat simți că ești zilnic?', sub:'Stresul nu e doar „în cap" — cortizolul îți afectează corpul real.' },
      // q7 removed (D4)
      q8:   { title:'Cât timp poți dedica antrenamentului?', sub:'Orice răspuns e valid — și 15 minute contează.' },
      q9:   { title:'Ce ai la dispoziție pentru antrenament?', sub:'Bifează tot ce ai — inclusiv obiecte din casă! Adaptăm totul.' },
      q9b:  { title:'Câtă cafea bei pe zi?', sub:'Cofeina în exces crește cortizolul — dar nu e neapărat rea.' },
      q10:  { title:'Ai condiții medicale relevante?', sub:'Totul rămâne confidențial. Avem nevoie de aceste informații doar pentru siguranța ta.', note:'Este perfect normal. Multe femei 35+ au una sau mai multe din aceste condiții — inclusiv Daniela.' },
      q11:  { title:'Medicamente sau detalii suplimentare', sub:'Ce medicamente iei? Dacă nu iei nimic, scrie „Nu iau." — orice detaliu contează.' },
      q12:  { title:'Ai limitări fizice sau dureri?', sub:'Foarte important — adaptăm fiecare exercițiu ca să fie sigur pentru tine.', note:'Nu ești singură — peste 40% dintre femeile 35+ au cel puțin o limitare fizică. De aceea personalizăm.' },
      q13:  { title:'Care e experiența ta cu sportul?', sub:'Nu există răspuns greșit — programul se adaptează la tine.' },
      qCycle: { title:'Cum este ciclul tău menstrual?', sub:'Hormonii influențează totul — de la energie la pofta de mâncare. Adaptăm planul pe nevoile tale reale.', note:'Această întrebare ne ajută enorm. Corpul femeii e ciclic — și planul trebuie să respecte asta.' },
      q13b: { title:'Ce simptome hormonale ai observat?', sub:'Bifează tot ce se aplică — fiecare detaliu face planul mai precis.' },
      q14:  { title:'Câte mese ai de obicei pe zi?', sub:'Nu există un număr „corect" — vrem doar să înțelegem ritmul tău.' },
      qBreakfast: { title:'Ce mănânci de obicei dimineața?', sub:'Micul dejun influențează energia și poftele din tot restul zilei.' },
      q15:  { title:'Ți se întâmplă să mănânci emoțional?', sub:'Din stres, tristețe sau plictiseală — nu e slăbiciune, e biologie.', note:'Mâncatul emoțional NU e lipsă de voință. E un răspuns al cortizolului la stres — și poate fi gestionat.' },
      qLateEating: { title:'Mănânci des după ora 21:00?', sub:'Nu te judecăm — vrem doar să înțelegem tiparul tău alimentar.' },
      q16:  { title:'Câtă apă bei pe zi?', sub:'Hidratarea afectează metabolismul mai mult decât crezi.' },
      q17:  { title:'Ai mai ținut diete înainte?', sub:'Fiecare experiență contează — ne ajută să evităm ce n-a funcționat.' },
      q18:  { title:'Ce stiluri alimentare ți se potrivesc?', sub:'Bifează ce-ți place — planul se construiește pe preferințele tale.' },
      q19:  { title:'Cam cât investești lunar în mâncare?', sub:'Adaptăm rețetele la bugetul tău real.' },
      q19b: { title:'Ai alergii sau intoleranțe alimentare?', sub:'Bifează tot ce se aplică — adaptăm rețetele automat ca să fie sigure.' },
      q19c: { title:'Cât timp ai de obicei pentru gătit?', sub:'Rețetele se adaptează la ritmul tău — inclusiv opțiuni rapide.' },
      q19d: { title:'Sunt alimente pe care le refuzi complet?', sub:'Opțional — scrie ce nu mănânci sub nicio formă. Le excludem din plan.' },
      q20:  { title:'Care e cel mai mare obstacol pentru tine?', sub:'Poți bifa mai multe. Fiecare femeie are provocările ei — le abordăm pe ale tale.' },
      q21:  { title:'Cât de pregătită ești să începi?', sub:'Fii sinceră cu tine — orice răspuns e valid și ne ajută să te ghidăm mai bine.' },
    },

    // ── COMPLET TRANSITIONS ─────────────────────────────────────────
    transitions: {
      trans_1: { title:'Hai să te cunoaștem <em>cu adevărat</em>', body:'Am înțeles cine ești. Acum vrem să înțelegem ce simte corpul tău — ca să construim ceva care funcționează specific pentru tine.' },
      trans_2: { title:'Viața ta e <em>unică</em> — și planul va fi la fel', body:'Fiecare femeie are un ritm diferit. Următoarele întrebări ne ajută să adaptăm totul la viața ta reală, nu la un ideal.' },
      trans_3: { title:'Mulțumim că ai <em>încredere</em> în noi', body:'Știm că unele întrebări sunt personale. Fiecare răspuns face planul tău mai sigur și mai precis. Nu judecăm — construim.' },
      trans_4: { title:'Relația ta cu mâncarea <em>contează</em>', body:'Nu există răspunsuri greșite aici. Vrem să înțelegem cum mănânci tu — ca să facem un plan care se potrivește vieții tale, nu invers.' },
      trans_5: { title:'Ai ajuns <em>până aici</em> — asta spune totul', body:'Mai ai doar câteva întrebări. Planul tău personalizat se conturează deja. Noi suntem alături de tine la fiecare pas.' },
    },

    // ── COMPLET UI ──────────────────────────────────────────────────
    ui: {
      textareaPlaceholder: 'Scrie aici...',
      miniResultLabel: 'IMC-ul tău (din MINI)',
      results: {
        headerTag: 'Profilul tău e gata',
        headerTitle: function(name) { return (name||'') + ', am terminat analiza — iată ce am descoperit <em style="color:var(--teal-glow)">despre tine</em>'; },
        routePrefix: 'Traseu',
        analyzedSuffix: 'întrebări analizate',
        profileLabel: 'Profilul tău metabolic',
        stressHeading: 'Indicele de stres estimat',
        stressLevels: { high:'Ridicat — prioritate reducere stres', moderate:'Moderat — planul va include management stres', low:'Scăzut — poți merge pe plan standard' },
        stressSource: 'Calculat din: somn, stres raportat, alimentație emoțională, hidratare, istoric diete',
        hormonalHeading: 'Indicele hormonal estimat',
        hormonalLevels: { high:'Impact hormonal semnificativ — plan adaptat', moderate:'Schimbări moderate — monitorizare', low:'Impact hormonal scăzut' },
        hormonalSource: 'Calculat din: vârstă, traseu, simptome raportate, somn, schimbări greutate',
        hormonalDisclaimer: '⚕️ Aceasta NU este o măsurătoare medicală — este o estimare pe baza simptomelor tale.',
        caloricHeading: 'Necesarul tău caloric (deblocat)',
        bmrLabel: 'BMR (repaus)',
        tdeeLabel: 'TDEE (cu activitate)',
        tagsHeading: 'Tag-uri siguranță (programul tău va respecta)',
        tagsEmpty: 'Nu au fost detectate limitări — acces complet la toate exercițiile.',
        tagsFooter: 'Exercițiile incompatibile sunt excluse automat din programul tău.',
        paramsHeading: 'Parametrii programului tău',
        paramLabels: { time:'Timp/antrenament:', experience:'Experiență:', meals:'Mese/zi:', budget:'Buget alimentar:', motivation:'Motivație:', equipment:'Echipament:', allergies:'Alergii:', cookTime:'Timp gătit:' },
        timeOptions: ['<15 min','15-20 min','20-30 min','30-45 min','45+ min'],
        expOptions: ['Începător','Începător+','Intermediar','Avansat'],
        mealOptions: ['1–2','3','3+gustări','4–5 mici','Fără ritm'],
        budgetOptions: ['<150 RON','150-250','250-400','400+'],
        allergyOptions: ['Lactoză','Gluten','Nuci','Ouă','Pește','Soia','Fără'],
        cookTimeOptions: ['<15 min','15-30 min','30-45 min','45+ min','Fără gătit'],
        finalHeading: 'Planul tău e gata să fie construit',
        finalBody: function(profileName, profileColor) { return 'Toate răspunsurile tale alimentează motorul nostru de personalizare care va genera:<br><strong style="color:white">raportul tău + plan alimentar + program antrenament</strong><br>— totul construit pe profilul tău <strong style="color:' + profileColor + '">' + profileName + '</strong>.'; },
        finalQuote: '„Am trecut și eu prin asta. Te aștept pe cealaltă parte." — Daniela',
        ctaHeading: 'Ești pregătită? Hai să transformăm datele în plan.',
        ctaBody: 'Alege planul care ți se potrivește și primești totul personalizat — nutriție, antrenament, raport complet. Fără rețete generice, fără programe copiate.',
        // C1: Stripe packages (3 tiers)
        packages: [
          { id:'essential', name:'REBUILD Esențial', price:'199€', desc:'Plan alimentar 7 zile + antrenament 4 săptămâni + raport personalizat', badge:null },
          { id:'premium', name:'REBUILD Premium', price:'299€', old:'399€', desc:'Plan alimentar 30 zile + antrenament 12 săptămâni + raport complet + suport WhatsApp 30 zile', badge:'Cel mai popular' },
          { id:'coaching', name:'CYB Coaching Complet', price:'499€', desc:'Tot ce include Premium + coaching 1:1 cu Daniela + ajustări săptămânale + acces comunitate VIP', badge:null },
        ],
        ctaBuyLabel: 'Vreau planul meu personalizat →',
        ctaWhatsAppAlt: 'Preferi să vorbești cu Daniela mai întâi?',
        ctaDirectButton: 'Scrie-i Danielei pe WhatsApp →',
        ctaDirectWhatsApp: 'https://wa.me/40721333040?text=Bun%C4%83%20Daniela,%20am%20completat%20chestionarul%20complet%20%C8%99i%20vreau%20s%C4%83%20discut%C4%83m%20despre%20planul%20meu.',
        ctaGroupButton: 'Intră în grupul CYB (opțional)',
        ctaGroupWhatsApp: 'https://chat.whatsapp.com/Gyi1jBE4lI5JQZKTJ9jxsC',
      },
    },
  },

  // ── ACCESSORS (fallback) ────────────────────────────────────────────
  q: function(id) { return this.complet.questions[id] || { title: id, sub: null, note: null }; },
  t: function(id) { return this.complet.transitions[id] || { title: '', body: '' }; },
};
