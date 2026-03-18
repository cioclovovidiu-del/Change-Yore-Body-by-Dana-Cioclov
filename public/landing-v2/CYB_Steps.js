// =============================================================================
// CYB STEPS — UNIFIED (MINI + COMPLET)
// Requires: CYB_Copy.js (COPY), CYB_Calc.js (calcBMI) loaded before this.
// Exports: UI, R_UI, U_UI, emoMessages, STEPS_MINI, STEPS_COMPLET,
//          buildVisible, totalQ, curQ, _transBlockMap
// =============================================================================

// ── ALIASES for backward compatibility ──────────────────────────────
var UI = {
  bmiCategories: COPY.shared.bmiCategories,
  goalNames: COPY.shared.goalNames,
  gaugeLabels: COPY.shared.gaugeLabels,
  buttons: COPY.ui.buttons,
  welcome: COPY.mini.ui.welcome,
  emailPreResults: COPY.mini.ui.emailPreResults,
  measures: COPY.mini.ui.measures,
  results: COPY.mini.ui.results,
  upgrade: COPY.mini.ui.upgrade,
};
var R_UI = COPY.mini.ui.results;
var U_UI = COPY.mini.ui.upgrade;

// ── MINI emotional messages ─────────────────────────────────────────
var emoMessages = {
  name: function(d) { return COPY.mini.emotional.get('name', d); },
  age: function(d) { return COPY.mini.emotional.get('age', d); },
  measures: function(d) { return COPY.mini.emotional.get('measures', d, calcBMI(d.weight, d.height)); },
  activity: function(d) { return COPY.mini.emotional.get('activity', d); },
  goal: function(d) { return COPY.mini.emotional.get('goal', d); },
  moment: function(d) { return COPY.mini.emotional.get('moment', d); },
};

// ── STEPS MINI ──────────────────────────────────────────────────────
var STEPS_MINI = [
  {id:'welcome', type:'welcome'},
  {id:'name', type:'text', ...COPY.mini.questions.name},
  {id:'age', type:'number', ...COPY.mini.questions.age, min:18, max:75},
  {id:'measures', type:'measures', ...COPY.mini.questions.measures},
  {id:'activity', type:'activity', ...COPY.mini.questions.activity},
  {id:'goal', type:'cards', ...COPY.mini.questions.goal,
    opts:[
      {icon:'⚖️',title:'Vreau să slăbesc',desc:'Pierdere în greutate sănătoasă, fără diete extreme'},
      {icon:'💪',title:'Vreau să mă tonifiez',desc:'Mai multă forță, corp mai definit'},
      {icon:'⚡',title:'Vreau mai multă energie',desc:'Să nu mai fiu epuizată la sfârșitul zilei'},
      {icon:'🫀',title:'Vreau sănătate generală',desc:'Mă simt bine în corp, dorm bine, stres mai puțin'},
    ]},
  {id:'moment', type:'cards', ...COPY.mini.questions.moment,
    opts:[
      {icon:'🤱',title:'Postpartum',desc:'Am născut recent (ultimele 0-24 luni)'},
      {icon:'💔',title:'Divorț / Separare',desc:'Trec printr-o despărțire sau am trecut recent'},
      {icon:'🌡️',title:'Schimbări hormonale',desc:'Pre-menopauză, menopauză, sau simt schimbări'},
      {icon:'🔥',title:'Burnout / Epuizare',desc:'Sunt epuizată dar încă funcționez pe pilot automat'},
      {icon:'🕊️',title:'Am pierdut pe cineva drag',desc:'Pierderea cuiva drag îmi afectează corpul și viața'},
      {icon:'✨',title:'Niciuna în special',desc:'Vreau doar să mă simt mai bine'},
    ]},
  {id:'gdpr', type:'gdpr', ...COPY.mini.questions.gdpr},
  {id:'email', type:'email', ...COPY.mini.questions.email},
  {id:'mini_results', type:'mini_results'},
];

// ── STEPS COMPLET ───────────────────────────────────────────────────
var STEPS_COMPLET = [
  // === BLOCK TRANSITION: DESPRE TINE ===
  {id:'trans_1', type:'transition', block:'Despre Tine', blockColor:'teal',
    ...COPY.t('trans_1'), miniResult: true},

  // BLOC 1: DESPRE TINE
  {id:'q1', block:'Despre Tine', blockColor:'teal', type:'single',
    ...COPY.q('q1'),
    opts:['Sub 55 kg','55–60 kg','60–65 kg','65–70 kg','70–75 kg','Peste 75 kg','Nu am un număr — vreau doar să mă simt bine']},

  {id:'q2', block:'Despre Tine', blockColor:'teal', type:'single',
    ...COPY.q('q2'),
    opts:['Măr (grăsime pe abdomen)','Pară (grăsime pe șolduri/coapse)','Clepsidră (distribuție egală)','Dreptunghi (fără curbe pronunțate)','Nu știu sigur']},

  {id:'q3', block:'Despre Tine', blockColor:'teal', type:'single',
    ...COPY.q('q3'),
    opts:['Am luat în greutate (3+ kg)','Am oscilat sus-jos','A rămas la fel','Am slăbit fără să vreau','Am slăbit cu efort dar am revenit']},

  {id:'q4', block:'Despre Tine', blockColor:'teal', type:'single',
    ...COPY.q('q4'),
    opts:['Nu','Da, 1 copil','Da, 2-3 copii','Da, 4+ copii']},

  {id:'q4b', block:'Despre Tine', blockColor:'teal', type:'single',
    ...COPY.q('q4b'),
    opts:['Da, exclusiv','Da, parțial','Nu, dar am alăptat recent (sub 6 luni)','Nu'],
    showIf:{field:'profile.moment',values:[0]}},

  // === BLOCK TRANSITION: STIL DE VIAȚĂ ===
  {id:'trans_2', type:'transition', block:'Stilul Tău de Viață', blockColor:'gold',
    ...COPY.t('trans_2'), miniResult: false},

  // BLOC 2: STIL DE VIAȚĂ
  {id:'q5', block:'Stilul Tău de Viață', blockColor:'gold', type:'single',
    ...COPY.q('q5'),
    opts:['Bine (7-8h, odihnitor)','Ok, dar m-aș odihni mai bine','Prost (sub 6h sau treziri frecvente)','Foarte prost (insomnie / anxietate nocturnă)']},

  {id:'q6', block:'Stilul Tău de Viață', blockColor:'gold', type:'single',
    ...COPY.q('q6'),
    opts:['Scăzut — viața e ok','Moderat — stres normal','Ridicat — mă simt copleșită frecvent','Foarte ridicat — mă afectează fizic']},

  {id:'q7', block:'Stilul Tău de Viață', blockColor:'gold', type:'single',
    ...COPY.q('q7'),
    opts:['Remote / freelancer','Birou 8+ ore','În picioare / mișcare (vânzătoare, asistentă)','Mamă cu program complet acasă','Lucrez ture','Program mixt']},

  {id:'q8', block:'Stilul Tău de Viață', blockColor:'gold', type:'single',
    ...COPY.q('q8'),
    opts:['Sub 15 minute','15-20 minute','20-30 minute','30-45 minute','Peste 45 minute']},

  {id:'q9', block:'Stilul Tău de Viață', blockColor:'gold', type:'multi',
    ...COPY.q('q9'),
    opts:['Doar corpul meu','Scaun stabil + canapea','Saltea / covorășel','Sticle de apă (ca greutăți)','Benzi elastice','Gantere mici (1-3 kg)','Gantere medii (4-6 kg)','Gantere mari (7+ kg)','Kettlebell','Bicicletă staționară / bandă']},

  {id:'q9b', block:'Stilul Tău de Viață', blockColor:'gold', type:'scale',
    ...COPY.q('q9b'),
    min:0, max:5, minL:'0 căni', maxL:'5+ căni',
    showIf:{field:'profile.moment',values:[3]}},

  // === BLOCK TRANSITION: SĂNĂTATE ===
  {id:'trans_3', type:'transition', block:'Sănătate & Limitări', blockColor:'rose',
    ...COPY.t('trans_3')},

  // BLOC 3: SĂNĂTATE
  {id:'q10', block:'Sănătate & Limitări', blockColor:'rose', type:'multi',
    ...COPY.q('q10'),
    opts:['Nu am nicio condiție','Diabet tip 2 / Rezistență la insulină','Hipotiroidism (Hashimoto)','PCOS','Hipertensiune','Probleme cardiace','Depresie / Anxietate (diagnosticată)']},

  {id:'q11', block:'Sănătate & Limitări', blockColor:'rose', type:'textarea',
    ...COPY.q('q11')},

  {id:'q12', block:'Sănătate & Limitări', blockColor:'rose', type:'multi',
    ...COPY.q('q12'),
    opts:['Nu am nicio limitare','Dureri de genunchi','Dureri de spate (lombară)','Dureri cervicală / gât','Probleme la umăr','Probleme la șold','Hernie de disc','Incontinență urinară','Diastază abdominală','Varice','Vertij la schimbări de poziție']},

  {id:'q13', block:'Sănătate & Limitări', blockColor:'rose', type:'single',
    ...COPY.q('q13'),
    opts:['Începător total','Începător — am făcut puțin','Intermediar — sport ocazional','Avansat — sport regulat']},

  {id:'q13b', block:'Sănătate & Limitări', blockColor:'rose', type:'multi',
    ...COPY.q('q13b'),
    opts:['Bufeuri / valuri de căldură','Insomnie / treziri nocturne','Iritabilitate crescută','Greutate abdominală nouă','Libido scăzut','Transpirații nocturne','Uscăciune piele/păr','Niciuna din acestea'],
    showIf:{field:'profile.moment',values:[2]}},

  // === BLOCK TRANSITION: ALIMENTAȚIE ===
  {id:'trans_4', type:'transition', block:'Alimentația Ta', blockColor:'purple',
    ...COPY.t('trans_4')},

  // BLOC 4: ALIMENTAȚIE
  {id:'q14', block:'Alimentația Ta', blockColor:'purple', type:'single',
    ...COPY.q('q14'),
    opts:['1-2 mese (sar peste mese)','3 mese principale','3 mese + 1-2 gustări','Mănânc când apuc, fără ritm']},

  {id:'q15', block:'Alimentația Ta', blockColor:'purple', type:'single',
    ...COPY.q('q15'),
    opts:['Da, des — e o problemă reală','Uneori, când sunt stresată','Rar / Nu']},

  {id:'q16', block:'Alimentația Ta', blockColor:'purple', type:'single',
    ...COPY.q('q16'),
    opts:['Sub 0.5 litri','0.5-1 litru','1-1.5 litri','1.5-2 litri','Peste 2 litri']},

  {id:'q17', block:'Alimentația Ta', blockColor:'purple', type:'single',
    ...COPY.q('q17'),
    opts:['Nu, niciodată','Da, 1-2 diete','Da, câteva (2-3)','Da, multe (am tot încercat)','Sunt mereu la o dietă']},

  {id:'q18', block:'Alimentația Ta', blockColor:'purple', type:'multi',
    ...COPY.q('q18'),
    opts:['Tradițional românesc','Mediteranean','Simplu / bland','Asiatic','Vegetarian / plant-based','Mănânc orice']},

  {id:'q19', block:'Alimentația Ta', blockColor:'purple', type:'single',
    ...COPY.q('q19'),
    opts:['Sub 150 RON','150-250 RON','250-400 RON','Peste 400 RON']},

  // === BLOCK TRANSITION: MOTIVAȚIE ===
  {id:'trans_5', type:'transition', block:'Motivație', blockColor:'coral',
    ...COPY.t('trans_5')},

  // BLOC 5: MOTIVAȚIE
  {id:'q20', block:'Motivație', blockColor:'coral', type:'multi',
    ...COPY.q('q20'),
    opts:['Lipsa de timp','Lipsa de motivație','Nu știu ce să mănânc','Poftele / mâncatul emoțional','Lipsa de suport','Stresul','Nu văd rezultate destul de repede','Costurile mâncării sănătoase']},

  {id:'q21', block:'Motivație', blockColor:'coral', type:'scale',
    ...COPY.q('q21'),
    min:1, max:10, minL:'Curioasă', maxL:'Extrem de motivată'},

  // === COMPLET RESULTS ===
  {id:'complet_results', type:'complet_results'},
];

// ── TRANSITION BLOCK MAP ────────────────────────────────────────────
var _transBlockMap = {
  trans_1: 'despre_tine',
  trans_2: 'stil_viata',
  trans_3: 'sanatate',
  trans_4: 'alimentatie',
  trans_5: 'motivatie',
};

// ── COMPLET VISIBILITY FILTER ───────────────────────────────────────
function buildVisible(profile, ans) {
  profile = profile || {};
  ans = ans || {};
  return STEPS_COMPLET.filter(function(q) {
    if (!q.showIf) return true;
    var field = q.showIf.field;
    if (field === 'profile.moment') return q.showIf.values.includes(profile.moment);
    var v = ans[field];
    return v !== undefined && q.showIf.values.includes(v);
  });
}

// ── QUESTION COUNTERS ───────────────────────────────────────────────
function totalQ(list) {
  return list.filter(function(q) { return q.id.startsWith('q'); }).length;
}

function curQ(list, index) {
  var c = 0;
  for (var i = 0; i <= index; i++) {
    if (list[i].id.startsWith('q')) c++;
  }
  return c;
}
