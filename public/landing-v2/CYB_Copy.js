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
      seeResults: 'Vezi rezultatele mele →',
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
      gdpr:     { label:'Consimțământ', title:'Înainte de rezultate', sub:'Pentru a-ți calcula profilul și a-ți trimite rezultatele, avem nevoie de acordul tău.', consent:'Sunt de acord ca datele mele să fie procesate de CYB pentru a primi profilul personalizat și comunicări relevante. Pot revoca oricând.' },
      email:    { label:'Contact', title:'Unde îți trimitem rezultatele?', sub:'Email-ul tău — aici primești profilul tău gratuit', ph:'email@exemplu.ro' },
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
      emailPreResults: 'Asta e tot! În câteva secunde vei vedea rezultatele tale personalizate.',
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
      q1:   { title:'Care este greutatea ta dorită?', sub:'Greutatea la care te-ai simți bine — nu „perfectă", ci confortabilă.' },
      q2:   { title:'Cum ai descrie forma corpului tău?', sub:'Nu există răspuns greșit — e doar pentru personalizare.' },
      q3:   { title:'Cum ți s-a schimbat greutatea în ultimul an?', sub:null },
      q4:   { title:'Ai copii?', sub:null },
      q4b:  { title:'Alăptezi în prezent?', sub:'Important pentru planul alimentar.' },
      q5:   { title:'Cum dormi?', sub:'Somnul afectează direct hormonii și greutatea.' },
      q6:   { title:'Nivelul tău de stres zilnic?', sub:null },
      q7:   { title:'Cum arată o zi obișnuită?', sub:null },
      q8:   { title:'Cât timp ai pe zi pentru antrenament?', sub:null },
      q9:   { title:'Ce ai disponibil pentru antrenament?', sub:'Bifează tot ce ai — inclusiv obiecte din casă!' },
      q9b:  { title:'Câtă cafea bei pe zi?', sub:'Cofeina afectează cortizolul și somnul.' },
      q10:  { title:'Ai condiții medicale sau iei medicamente?', sub:'Confidențial — necesare pentru siguranța ta.', note:'Este absolut normal. Multe femei 35+ au una sau mai multe din aceste condiții.' },
      q11:  { title:'Medicamente / detalii suplimentare', sub:'Ce medicamente iei? Dacă nu iei nimic, scrie „Nu iau medicamente."' },
      q12:  { title:'Ai limitări fizice sau dureri?', sub:'Foarte important! Adaptăm fiecare exercițiu.', note:'Nu ești singură — peste 40% dintre femeile 35+ au cel puțin o limitare fizică.' },
      q13:  { title:'Nivelul tău de experiență cu sportul?', sub:null },
      q13b: { title:'Ce simptome hormonale ai observat?', sub:'Bifează tot ce se aplică. Ne ajută să adaptăm planul.' },
      q14:  { title:'Câte mese mănânci pe zi?', sub:null },
      q15:  { title:'Mănânci emoțional?', sub:'Stres, tristețe, plictiseală — nu e slăbiciune, e răspuns hormonal.', note:'Mâncatul emoțional NU este o slăbiciune de voință. Este un răspuns al cortizolului la stres.' },
      q16:  { title:'Câtă apă bei pe zi?', sub:null },
      q17:  { title:'Ai mai ținut diete înainte?', sub:null },
      q18:  { title:'Ce preferi să mănânci?', sub:'Bifează stilurile care ți se potrivesc.' },
      q19:  { title:'Buget lunar pentru mâncare?', sub:null },
      q20:  { title:'Care este cel mai mare obstacol?', sub:'Poți bifa mai multe.' },
      q21:  { title:'Cât de motivată ești ACUM?', sub:null },
    },

    // ── COMPLET TRANSITIONS ─────────────────────────────────────────
    transitions: {
      trans_1: { title:'Hai să te cunoaștem <em>mai bine</em>', body:'Datele de bază le avem din chestionarul MINI. Acum aprofundăm — ca să construim ceva cu adevărat PE TINE.' },
      trans_2: { title:'Viața ta e <em>unică</em>', body:'Programul tău va fi la fel de unic. Spune-ne cum arată o zi din viața ta.' },
      trans_3: { title:'Mulțumim pentru <em>sinceritate</em>', body:'Aceste informații ne ajută să te protejăm, nu să te judecăm. Fiecare răspuns face programul tău mai sigur.' },
      trans_4: { title:'<em>Înțelegem</em> relația ta cu mâncarea', body:'Fără judecată, doar înțelegere. Răspunsurile tale ne ajută să construim un plan care funcționează cu viața ta, nu împotriva ei.' },
      trans_5: { title:'Ești aici. Asta <em>contează</em>.', body:'Ultimele întrebări. Ești aproape de planul tău personalizat. Noi suntem alături de tine.' },
    },

    // ── COMPLET UI ──────────────────────────────────────────────────
    ui: {
      textareaPlaceholder: 'Scrie aici...',
      miniResultLabel: 'IMC-ul tău (din MINI)',
      results: {
        headerTag: 'Rezultatele tale complete',
        headerTitle: function(name) { return (name||'') + ', iată profilul tău <em style="color:var(--teal-glow)">complet</em>'; },
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
        paramLabels: { time:'Timp/antrenament:', experience:'Experiență:', meals:'Mese/zi:', budget:'Buget alimentar:', motivation:'Motivație:', equipment:'Echipament:' },
        timeOptions: ['<15 min','15-20 min','20-30 min','30-45 min','45+ min'],
        expOptions: ['Începător','Începător+','Intermediar','Avansat'],
        mealOptions: ['1-2','3','3+gustări','Fără ritm'],
        budgetOptions: ['<150 RON','150-250','250-400','400+'],
        finalHeading: 'Planul tău e gata să fie construit.',
        finalBody: function(profileName, profileColor) { return 'Toate aceste date alimentează motorul AI CYB care va genera:<br><strong style="color:white">raport personalizat + plan alimentar + program antrenament</strong><br>— totul adaptat pe profilul tău <strong style="color:' + profileColor + '">' + profileName + '</strong>.'; },
        finalQuote: '„Te aștept pe cealaltă parte." — Daniela',
        ctaHeading: 'Profilul tău e complet. Hai să-l transformăm în plan.',
        ctaBody: 'Scrie-i direct Danielei pe WhatsApp și în 24h primești planul tău personalizat.',
        ctaDirectButton: 'Programează-ți planul cu Daniela →',
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
