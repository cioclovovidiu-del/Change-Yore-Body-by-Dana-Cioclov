// =============================================================================
// CYB PSYCH — Psychological Communication Layer
// Sits between Engine (interpretation) and Render (display).
// Requires: CYB_Engine_STABLE.js loaded before this.
// No DOM. No side effects. No randomness. Deterministic from same input.
// =============================================================================

// ── TONE PROFILE ────────────────────────────────────────────────────

function resolveToneProfile(profile, signals, routeData, scores) {
  profile = profile || {};
  signals = signals || {};
  routeData = routeData || {};
  scores = scores || {};

  var vulnerability = _resolveVulnerability(profile, signals, routeData, scores);
  var pace = _resolvePace(signals, scores);
  var motivation = _resolveMotivation(signals, vulnerability);

  return {
    vulnerability: vulnerability,
    pace: pace,
    motivation: motivation,
    label: vulnerability + '-' + pace + '-' + motivation
  };
}

function _resolveVulnerability(profile, signals, routeData, scores) {
  var route = routeData.route || 'GENERAL';
  if (route === 'LOSS') return 'protective';
  if (route === 'BURNOUT' && signals.overwhelmed) return 'protective';
  if (signals.shameRisk === 'high') return 'protective';
  if (signals.selfBlame === 'high' && signals.actionCapacity === 'low') return 'protective';
  if (route === 'POSTPARTUM') return signals.overwhelmed ? 'protective' : 'warm';
  if (route === 'DIVORCE') return 'warm';
  if (route === 'HORMONAL' && scores.hormonal > 50) return 'warm';
  if (scores.stress > 65) return 'warm';
  if (signals.selfBlame === 'high' || signals.selfBlame === 'medium') return 'warm';
  if (signals.actionCapacity === 'low' || signals.pressureTolerance === 'low') return 'warm';
  return 'direct';
}

function _resolvePace(signals, scores) {
  if (signals.actionCapacity === 'low') return 'gentle';
  if (signals.pressureTolerance === 'low') return 'gentle';
  if (signals.overwhelmed) return 'gentle';
  if (scores.stress > 65) return 'gentle';
  if (signals.structureNeed === 'high') return 'structured';
  if (signals.actionCapacity === 'medium') return 'structured';
  if (signals.pressureTolerance === 'medium') return 'structured';
  if (signals.actionCapacity === 'high' && signals.pressureTolerance === 'high') return 'ambitious';
  return 'structured';
}

function _resolveMotivation(signals, vulnerability) {
  if (vulnerability === 'protective') return 'nurturing';
  if (signals.motivationStyle === 'gentle') return 'nurturing';
  if (vulnerability === 'direct' && signals.motivationStyle === 'direct') return 'challenging';
  return 'coaching';
}

// ── PSYCH CONTEXT BUILDER ───────────────────────────────────────────
// Full context object used by fragment picker and renderers.

function buildPsychContext(profile, signals, routeData, scores, metabolicProfile, safetyTags, answers, completionData) {
  return {
    profile: profile || {},
    signals: signals || {},
    routeData: routeData || {},
    scores: scores || {},
    metabolicProfile: metabolicProfile || null,
    safetyTags: safetyTags || [],
    answers: answers || {},
    completion: completionData || {},
    tone: resolveToneProfile(profile, signals, routeData, scores)
  };
}

// ── COMPOSE PSYCH CONTEXT (convenience) ─────────────────────────────
// Runs engine + psych in one call. For renderers.

function composePsychContext(profile, ans) {
  profile = profile || {};
  ans = ans || {};

  var signals = interpretSignals(profile, ans);
  var routeData = resolveRoute(profile, signals);
  var stress = calcStressScore(ans);
  var hormonal = calcHormonalScore(profile, ans);
  var scores = { stress: stress, hormonal: hormonal };
  var tone = resolveToneProfile(profile, signals, routeData, scores);

  return {
    signals: signals,
    routeData: routeData,
    scores: scores,
    tone: tone
  };
}

// ── FRAGMENT LIBRARY ────────────────────────────────────────────────
// Each fragment: { id, category, location[], match(ctx), text }
// Categories: route, stress, shame, capacity, closing
// Locations: mini_results, transition, complet_results
// match(ctx) returns true if this fragment applies

var PSYCH_FRAGMENTS = [

  // ── ROUTE-SENSITIVE (8) ─────────────────────────────────────────

  {id:'rt_pp_mini', cat:'route', loc:['mini_results'],
    match: function(c){ return c.routeData.route==='POSTPARTUM'; },
    text: 'Corpul tău trece printr-o recalibrare completă după sarcină. Ce îți arătăm aici e adaptat exact pentru această etapă.'},

  {id:'rt_pp_trans', cat:'route', loc:['transition'],
    match: function(c){ return c.routeData.route==='POSTPARTUM'; },
    text: 'Următoarele întrebări ne ajută să înțelegem ce are nevoie corpul tău de mamă — nu un corp generic din manual.'},

  {id:'rt_div_mini', cat:'route', loc:['mini_results'],
    match: function(c){ return c.routeData.route==='DIVORCE'; },
    text: 'Stresul unei despărțiri afectează metabolismul direct. Datele tale reflectă asta — și planul tău va ține cont.'},

  {id:'rt_hor_mini', cat:'route', loc:['mini_results'],
    match: function(c){ return c.routeData.route==='HORMONAL'; },
    text: 'Schimbările hormonale schimbă regulile jocului. Cifrele de mai jos sunt citite prin prisma biologiei tale actuale.'},

  {id:'rt_burn_mini', cat:'route', loc:['mini_results'],
    match: function(c){ return c.routeData.route==='BURNOUT'; },
    text: 'Când corpul e în modul supraviețuire, cifrele spun doar o parte din poveste. Noi vedem și restul.'},

  {id:'rt_loss_mini', cat:'route', loc:['mini_results'],
    match: function(c){ return c.routeData.route==='LOSS'; },
    text: 'Nu interpretăm aceste date ca pe un verdict — ci ca pe un punct de plecare, fără presiune.'},

  {id:'rt_gen_mini', cat:'route', loc:['mini_results'],
    match: function(c){ return c.routeData.route==='GENERAL'; },
    text: 'Profilul tău arată că ai o bază solidă. Ce urmează e construit pe potențialul tău real.'},

  {id:'rt_gen_complet', cat:'route', loc:['complet_results'],
    match: function(c){ return c.routeData.route==='GENERAL'; },
    text: 'Ai parcurs fiecare secțiune cu seriozitate — asta ne permite să construim ceva cu adevărat adaptat.'},

  // ── STRESS-SENSITIVE (5) ────────────────────────────────────────

  {id:'st_high_mini', cat:'stress', loc:['mini_results','complet_results'],
    match: function(c){ return c.scores.stress > 65; },
    text: 'Nivelul tău de stres e ridicat — dar asta nu e o condamnare. E informația care ne arată de unde să începem: cu liniște, nu cu restricții.'},

  {id:'st_high_trans', cat:'stress', loc:['transition'],
    match: function(c){ return c.scores.stress > 65; },
    text: 'Știm că nivelul tău de stres e sus. Aceste întrebări ne ajută să construim un plan care scade presiunea, nu o crește.'},

  {id:'st_mod_mini', cat:'stress', loc:['mini_results','complet_results'],
    match: function(c){ return c.scores.stress > 40 && c.scores.stress <= 65; },
    text: 'Stresul tău e moderat — destul cât să influențeze greutatea și energia, dar gestionabil cu direcția corectă.'},

  {id:'st_mod_trans', cat:'stress', loc:['transition'],
    match: function(c){ return c.scores.stress > 40 && c.scores.stress <= 65; },
    text: 'Stresul tău e prezent dar controlabil. Răspunsurile tale ne ajută să menținem echilibrul, nu să adăugăm presiune.'},

  {id:'st_low', cat:'stress', loc:['mini_results','complet_results'],
    match: function(c){ return c.scores.stress <= 40; },
    text: 'Nivelul tău de stres e bun — corpul tău e pregătit să răspundă la schimbare fără să lupte împotriva lui.'},

  // ── SHAME / SELF-BLAME (4) ─────────────────────────────────────

  {id:'sh_high_mini', cat:'shame', loc:['mini_results'],
    match: function(c){ return c.signals.shameRisk==='high' || c.signals.selfBlame==='high'; },
    text: 'Ce vezi aici nu e un verdict. E o hartă. Și harta nu judecă — doar arată unde ești și încotro poți merge.'},

  {id:'sh_high_complet', cat:'shame', loc:['complet_results'],
    match: function(c){ return c.signals.shameRisk==='high' || c.signals.selfBlame==='high'; },
    text: 'Fiecare număr de aici e o informație, nu o etichetă. Programul tău e construit să te susțină, nu să te evalueze.'},

  {id:'sh_med', cat:'shame', loc:['mini_results','complet_results'],
    match: function(c){ return c.signals.selfBlame==='medium' && c.signals.shameRisk!=='high'; },
    text: 'Nu trebuie să fii perfectă ca să merite să începi. Trebuie doar să fii aici — și ești.'},

  {id:'sh_low', cat:'shame', loc:['mini_results','complet_results'],
    match: function(c){ return c.signals.selfBlame==='low' && c.signals.shameRisk==='low'; },
    text: 'Ai o relație sănătoasă cu propriile așteptări — asta e un avantaj real pe care îl vom folosi.'},

  // ── CAPACITY / STRUCTURE (4) ───────────────────────────────────

  {id:'cap_low', cat:'capacity', loc:['transition','complet_results'],
    match: function(c){ return c.signals.actionCapacity==='low'; },
    text: 'Nu îți cerem mult acum. Fiecare pas mic contează — și programul tău va reflecta asta.'},

  {id:'cap_med', cat:'capacity', loc:['transition','complet_results'],
    match: function(c){ return c.signals.actionCapacity==='medium' && c.signals.structureNeed==='high'; },
    text: 'Ai energie, dar ai nevoie de direcție clară. Exact asta construim: structură care funcționează cu viața ta.'},

  {id:'cap_high', cat:'capacity', loc:['transition','complet_results'],
    match: function(c){ return c.signals.actionCapacity==='high'; },
    text: 'Ai capacitatea și motivația — ceea ce lipsește e doar un plan care le folosește inteligent.'},

  {id:'struct_high_trans', cat:'capacity', loc:['transition'],
    match: function(c){ return c.signals.structureNeed==='high' && c.signals.actionCapacity!=='low'; },
    text: 'Aceste întrebări ne ajută să creăm un cadru clar — pași concreti, nu sfaturi vagi.'},

  // ── ENCOURAGEMENT / CLOSING (5) ────────────────────────────────

  {id:'enc_protective', cat:'closing', loc:['mini_results','complet_results'],
    match: function(c){ return c.tone.vulnerability==='protective'; },
    text: 'Nu trebuie să faci nimic perfect. Trebuie doar să continui — în ritmul tău, când poți.'},

  {id:'enc_warm', cat:'closing', loc:['mini_results','complet_results'],
    match: function(c){ return c.tone.vulnerability==='warm'; },
    text: 'Ai luat deja cea mai grea decizie: să fii sinceră cu tine. Tot ce urmează e mai ușor.'},

  {id:'enc_direct', cat:'closing', loc:['mini_results','complet_results'],
    match: function(c){ return c.tone.vulnerability==='direct'; },
    text: 'Ai datele. Ai direcția. Acum e momentul să transformi claritatea în acțiune.'},

  {id:'enc_trans_gentle', cat:'closing', loc:['transition'],
    match: function(c){ return c.tone.pace==='gentle'; },
    text: 'Ia-ți timpul cu fiecare răspuns. Nu e nicio grabă — fiecare detaliu ne ajută să te protejăm mai bine.'},

  {id:'enc_trans_ambitious', cat:'closing', loc:['transition'],
    match: function(c){ return c.tone.pace==='ambitious'; },
    text: 'Cu cât ești mai precisă în răspunsuri, cu atât planul tău va fi mai puternic. Hai să continuăm.'}
];

// ── FRAGMENT PICKER ─────────────────────────────────────────────────
// Picks the best matching fragments for a given location.
// Returns array of fragment objects, ordered: route → stress → shame → capacity → closing
// At most one per category.

function pickPsychFragments(psychContext, location, fragmentLibrary) {
  fragmentLibrary = fragmentLibrary || PSYCH_FRAGMENTS;
  var picked = {};

  for (var i = 0; i < fragmentLibrary.length; i++) {
    var f = fragmentLibrary[i];
    if (f.loc.indexOf(location) === -1) continue;
    if (picked[f.cat]) continue;
    try {
      if (f.match(psychContext)) {
        picked[f.cat] = f;
      }
    } catch(e) {}
  }

  // Return in fixed order
  var order = ['route', 'stress', 'shame', 'capacity', 'closing'];
  var result = [];
  for (var j = 0; j < order.length; j++) {
    if (picked[order[j]]) result.push(picked[order[j]]);
  }
  return result;
}

// ── FRAGMENT COMPOSER ───────────────────────────────────────────────
// Joins selected fragments into a single flow message string.
// Personalizes [Prenume] placeholders.

function composeFlowMessage(selectedFragments, psychContext, location) {
  if (!selectedFragments || selectedFragments.length === 0) return null;

  var name = (psychContext.profile && psychContext.profile.name) || '';
  var parts = [];

  for (var i = 0; i < selectedFragments.length; i++) {
    var text = selectedFragments[i].text;
    if (text) {
      text = text.replace(/\[Prenume\]/g, name);
      parts.push(text);
    }
  }

  return parts.length > 0 ? parts.join(' ') : null;
}

// ── BUILD FLOW MESSAGE (top-level API) ──────────────────────────────
// Single call: picks fragments for a location, composes them.
// Returns string or null (for fallback).

function buildFlowMessage(psychContext, location) {
  if (!psychContext || !location) return null;

  var fragments = pickPsychFragments(psychContext, location);
  return composeFlowMessage(fragments, psychContext, location);
}

// ── BUILD PSYCH FRAGMENTS (introspection) ───────────────────────────
// Returns the full fragment library. For debugging/testing.

function buildPsychFragments() {
  return PSYCH_FRAGMENTS;
}

// =============================================================================
// PERSONAL LETTER SYSTEM
// Long-form personalized letter for complet_results.
// Deterministic. No AI. No randomness. No HTML output.
// =============================================================================

// ── LETTER CONFIG ───────────────────────────────────────────────────
// Single source of truth for all letter constants, thresholds, rules.

var LETTER_CONFIG = {
  // Section order contract — used by picker, validator, composer
  SECTIONS: ['opening', 'reflection', 'pattern', 'reframe', 'direction', 'soft_action', 'closing'],

  // Sections that MUST exist for a valid letter
  REQUIRED: ['opening', 'direction', 'closing'],

  // Minimum number of valid sections (text.length > MIN_SECTION_LEN)
  MIN_VALID_SECTIONS: 5,

  // Minimum characters for a section to count as "valid"
  MIN_SECTION_LEN: 20,

  // Minimum parts from composer to produce a letter
  MIN_COMPOSE_PARTS: 3,

  // Final text word range
  WORD_MIN: 180,
  WORD_MAX: 420,

  // Final text character minimum
  CHAR_MIN: 500,

  // Repetition: opener fingerprint word count
  OPENER_WORDS: 4,

  // Repetition: maximum significant word overlap between adjacent sections
  MAX_OVERLAP: 0.4,

  // Romanian stop words for overlap calculation
  STOP_WORDS: ['și','e','nu','de','în','ce','că','cu','pe','la','o','a','ai','un','din','dar','sau','pentru','este','sunt','te','se','asta','mai','tot','fi','ca','el','ea'],

  // Tone consistency rules: [condition(tone) → reject_id → fallback_id]
  TONE_RULES: [
    { check: function(t){ return t.pace === 'gentle' || t.vulnerability === 'protective'; },
      reject: 'act_challenging', fallback: 'act_general', field: 'soft_action' },
    { check: function(t){ return t.pace === 'ambitious' && t.motivation === 'challenging'; },
      reject: 'act_protective', fallback: 'act_general', field: 'soft_action' }
  ],

  // Calibration rules: [condition(calibration) → reject_id → fallback_id → field]
  // Applied AFTER tone rules, based on calibration levels
  CALIBRATION_RULES: [
    // High softness → reject aggressive direction
    { check: function(cal){ return cal.softnessLevel >= 3; },
      reject: 'dir_ambitious', fallback: 'dir_gentle', field: 'direction' },
    // High push + low softness → reject overly protective soft_action
    { check: function(cal){ return cal.pushLevel >= 3 && cal.softnessLevel <= 1; },
      reject: 'act_protective', fallback: 'act_coaching', field: 'soft_action' },
    // High reassurance → reject direct reframe in favor of protective
    { check: function(cal){ return cal.reassuranceLevel >= 3; },
      reject: 'rfr_direct', fallback: 'rfr_protective', field: 'reframe' },
    // Low push → reject challenging action
    { check: function(cal){ return cal.pushLevel <= 1; },
      reject: 'act_challenging', fallback: 'act_general', field: 'soft_action' }
  ],

  // Priority conflict resolution order (higher index = higher priority)
  // When signals conflict, higher-priority signal wins
  PRIORITY_ORDER: {
    route_tone: 6,       // absolute frame — never overridden
    overwhelm: 5,        // highest signal — always respected
    shame: 4,            // second highest — reduces push
    protective_route: 3, // route-level protection
    calibration: 2.5,    // calibration-level adjustments
    structure_need: 2,   // structural preference
    score_profile: 1.5,  // score/profile nuance — lowest layer
    readiness: 1         // lowest — only applies if no conflicts above
  },

  // Profile/score-aware rules: applied AFTER calibration, lowest priority
  // These add nuance but cannot override route tone or calibration
  PROFILE_RULES: [
    // High stress load → prefer gentle direction over structured
    { check: function(ps){ return ps.stressLevel === 'high'; },
      reject: 'dir_ambitious', fallback: 'dir_gentle', field: 'direction' },
    // High hormonal pressure → prefer hormonal-aware pattern over general
    { check: function(ps){ return ps.hormonalLevel === 'high'; },
      reject: 'pat_general', fallback: 'pat_hormonal_weight', field: 'pattern' },
    // High caution → prefer protective reframe
    { check: function(ps){ return ps.cautionLevel === 'high'; },
      reject: 'rfr_direct', fallback: 'rfr_protective', field: 'reframe' },
    // High energy pressure → reject challenging action
    { check: function(ps){ return ps.energyPressureLevel === 'high'; },
      reject: 'act_challenging', fallback: 'act_general', field: 'soft_action' },
    // High metabolic pressure → prefer cortisol/yoyo pattern awareness
    { check: function(ps){ return ps.metabolicPressureLevel === 'high'; },
      reject: 'pat_general', fallback: 'pat_cortisol', field: 'pattern' }
  ]
};

// ── LETTER CONTEXT BUILDER ──────────────────────────────────────────

function buildPersonalLetterContext(profile, signals, routeData, scores, metabolicProfile, safetyTags, answers, completionData, tone) {
  profile = profile || {};
  signals = signals || {};
  routeData = routeData || {};
  scores = scores || {};
  answers = answers || {};
  tone = tone || resolveToneProfile(profile, signals, routeData, scores);

  var hasLimitations = (safetyTags || []).filter(function(t){ return t.type === 'exclude'; }).length > 0;
  var hasMedical = answers.q10 && answers.q10.length > 0 && !(answers.q10.length === 1 && answers.q10[0] === 0);
  var isEmotionalEater = answers.q15 === 0;
  var manyDiets = (answers.q17 || 0) >= 3;
  var lowWater = (answers.q16 || 0) <= 1;
  var poorSleep = (answers.q5 || 0) >= 2;
  var highStress = scores.stress > 65;
  var modStress = scores.stress > 40 && scores.stress <= 65;
  var highHormonal = scores.hormonal > 60;
  var beginner = (answers.q13 || 0) <= 1;
  var lowTime = (answers.q8 || 0) <= 1;
  var highMotiv = (answers.q21 || 5) >= 8;
  var lowMotiv = (answers.q21 || 5) <= 4;

  return {
    profile: profile,
    signals: signals,
    routeData: routeData,
    scores: scores,
    metabolicProfile: metabolicProfile || null,
    safetyTags: safetyTags || [],
    answers: answers,
    completion: completionData || {},
    tone: tone,
    derived: {
      hasLimitations: hasLimitations,
      hasMedical: hasMedical,
      isEmotionalEater: isEmotionalEater,
      manyDiets: manyDiets,
      lowWater: lowWater,
      poorSleep: poorSleep,
      highStress: highStress,
      modStress: modStress,
      highHormonal: highHormonal,
      beginner: beginner,
      lowTime: lowTime,
      highMotiv: highMotiv,
      lowMotiv: lowMotiv
    }
  };
}

// ── PROFILE CALIBRATION LAYER ───────────────────────────────────────
// Deterministic calibration derived from letter context.
// Returns { softnessLevel, directionLevel, pushLevel, reassuranceLevel, structureLevel, label }
// Each level: 1 (low), 2 (medium), 3 (high)

function calibrateLetterProfile(letterContext) {
  if (!letterContext) return _defaultCalibration();

  var sig = letterContext.signals || {};
  var tone = letterContext.tone || {};
  var der = letterContext.derived || {};
  var scores = letterContext.scores || {};
  var route = (letterContext.routeData && letterContext.routeData.route) || 'GENERAL';
  var prio = LETTER_CONFIG.PRIORITY_ORDER;

  // ── Base levels from tone ──────────────────────────────────────
  var softness = tone.vulnerability === 'protective' ? 3 : tone.vulnerability === 'warm' ? 2 : 1;
  var direction = tone.pace === 'gentle' ? 1 : tone.pace === 'structured' ? 2 : 3;
  var push = tone.motivation === 'nurturing' ? 1 : tone.motivation === 'coaching' ? 2 : 3;
  var reassurance = tone.vulnerability === 'protective' ? 3 : tone.vulnerability === 'warm' ? 2 : 1;
  var structure = sig.structureNeed === 'high' ? 3 : sig.structureNeed === 'medium' ? 2 : 1;

  // ── Priority-based conflict resolution ─────────────────────────
  // P5: Overwhelm — highest priority, caps push and direction
  if (sig.overwhelmed) {
    push = 1;
    if (softness < 2) softness = 2;
    if (reassurance < 2) reassurance = 2;
    if (direction > 1) direction = 1;
  }

  // P4: Shame/self-blame — reduces push, raises reassurance
  if (sig.shameRisk === 'high' || sig.selfBlame === 'high') {
    if (push > 1) push = 1;
    reassurance = 3;
    if (softness < 2) softness = 2;
  } else if (sig.selfBlame === 'medium') {
    if (push > 2) push = 2;
    if (reassurance < 2) reassurance = 2;
  }

  // P3: Protective route — floor on softness
  if (route === 'LOSS' || route === 'BURNOUT') {
    if (softness < 2) softness = 2;
    if (push > 2) push = 2;
  }
  if (route === 'POSTPARTUM' || route === 'DIVORCE') {
    if (softness < 2) softness = 2;
  }

  // P2: Structure need — raise structure level
  if (sig.structureNeed === 'high' && sig.actionCapacity !== 'low') {
    if (structure < 3) structure = 3;
    if (direction < 2) direction = 2;
  }

  // P1: Readiness — only raises push if no higher-priority conflicts
  if (der.highMotiv && sig.actionCapacity === 'high' && !sig.overwhelmed &&
      sig.shameRisk !== 'high' && sig.selfBlame !== 'high') {
    if (push < 2) push = 2;
    if (direction < 2) direction = 2;
  }

  // ── Stress modifiers ──────────────────────────────────────────
  if (der.highStress) {
    if (softness < 2) softness = 2;
    if (push > 2) push = 2;
  }

  // ── Clamp all to 1-3 ─────────────────────────────────────────
  softness = Math.max(1, Math.min(3, softness));
  direction = Math.max(1, Math.min(3, direction));
  push = Math.max(1, Math.min(3, push));
  reassurance = Math.max(1, Math.min(3, reassurance));
  structure = Math.max(1, Math.min(3, structure));

  return {
    softnessLevel: softness,
    directionLevel: direction,
    pushLevel: push,
    reassuranceLevel: reassurance,
    structureLevel: structure,
    label: 's' + softness + 'd' + direction + 'p' + push + 'r' + reassurance + 'st' + structure
  };
}

function _defaultCalibration() {
  return { softnessLevel: 2, directionLevel: 2, pushLevel: 2, reassuranceLevel: 2, structureLevel: 2, label: 's2d2p2r2st2' };
}

// ── PROFILE SUMMARY LAYER ───────────────────────────────────────────
// Normalizes existing computed scores/tags/profile into a stable summary.
// Uses ONLY data already available in the letter context — no new calculations.
// Each level: 'low', 'moderate', 'high'

function buildProfileSummary(letterContext) {
  if (!letterContext) return _defaultProfileSummary();

  var scores = letterContext.scores || {};
  var der = letterContext.derived || {};
  var sig = letterContext.signals || {};
  var tags = letterContext.safetyTags || [];
  var route = (letterContext.routeData && letterContext.routeData.route) || 'GENERAL';
  var profile = letterContext.profile || {};
  var metaProf = letterContext.metabolicProfile;

  // ── Stress load level ─────────────────────────────────────────
  var stressLevel = scores.stress > 65 ? 'high' : scores.stress > 40 ? 'moderate' : 'low';

  // ── Hormonal pressure level ───────────────────────────────────
  var hormonalLevel = scores.hormonal > 60 ? 'high' : scores.hormonal > 35 ? 'moderate' : 'low';

  // ── Metabolic pressure: inferred from diet history + stress + hormonal
  var metaPressure = 0;
  if (der.manyDiets) metaPressure += 2;
  if (der.isEmotionalEater) metaPressure += 1;
  if (stressLevel === 'high') metaPressure += 1;
  if (hormonalLevel === 'high') metaPressure += 1;
  if (der.lowWater) metaPressure += 1;
  var metabolicPressureLevel = metaPressure >= 4 ? 'high' : metaPressure >= 2 ? 'moderate' : 'low';

  // ── Caution level: from safety tags
  var excludeCount = 0;
  var includeCount = 0;
  for (var t = 0; t < tags.length; t++) {
    if (tags[t].type === 'exclude') excludeCount++;
    else includeCount++;
  }
  var cautionLevel = excludeCount >= 2 ? 'high' : (excludeCount >= 1 || der.hasMedical) ? 'moderate' : 'low';

  // ── Energy pressure: from sleep + stress + activity + time
  var energyPressure = 0;
  if (der.poorSleep) energyPressure += 2;
  if (der.highStress) energyPressure += 1;
  if (der.lowTime) energyPressure += 1;
  if (sig.overwhelmed) energyPressure += 2;
  if (sig.actionCapacity === 'low') energyPressure += 1;
  var energyPressureLevel = energyPressure >= 4 ? 'high' : energyPressure >= 2 ? 'moderate' : 'low';

  // ── Dominant challenge: route-aligned primary focus
  var dominantChallenge = _resolveDominantChallenge(route, stressLevel, hormonalLevel, metabolicPressureLevel, sig, der);

  // ── Profile label
  var label = 'st:' + stressLevel.charAt(0) + ' hr:' + hormonalLevel.charAt(0) +
    ' mt:' + metabolicPressureLevel.charAt(0) + ' ct:' + cautionLevel.charAt(0) +
    ' en:' + energyPressureLevel.charAt(0);

  return {
    stressLevel: stressLevel,
    hormonalLevel: hormonalLevel,
    metabolicPressureLevel: metabolicPressureLevel,
    cautionLevel: cautionLevel,
    energyPressureLevel: energyPressureLevel,
    dominantChallenge: dominantChallenge,
    profileLabel: label
  };
}

function _resolveDominantChallenge(route, stressLevel, hormonalLevel, metabolicPressureLevel, sig, der) {
  // Route-aligned dominant challenge — deterministic priority
  if (route === 'POSTPARTUM') return 'recovery';
  if (route === 'LOSS') return 'emotional_stability';
  if (route === 'BURNOUT') return stressLevel === 'high' ? 'stress_regulation' : 'energy_rebuild';
  if (route === 'DIVORCE') return 'emotional_rebuild';
  if (route === 'HORMONAL') return hormonalLevel === 'high' ? 'hormonal_adaptation' : 'metabolic_rebalance';
  // GENERAL: pick from signals
  if (stressLevel === 'high') return 'stress_regulation';
  if (metabolicPressureLevel === 'high') return 'metabolic_rebuild';
  if (hormonalLevel === 'high') return 'hormonal_adaptation';
  if (sig.overwhelmed) return 'energy_rebuild';
  if (der.manyDiets) return 'sustainable_habits';
  return 'balanced_progress';
}

function _defaultProfileSummary() {
  return {
    stressLevel: 'moderate', hormonalLevel: 'moderate', metabolicPressureLevel: 'moderate',
    cautionLevel: 'low', energyPressureLevel: 'moderate',
    dominantChallenge: 'balanced_progress', profileLabel: 'st:m hr:m mt:m ct:l en:m'
  };
}

// ── LETTER FRAGMENT LIBRARY ─────────────────────────────────────────
// Sections: opening, reflection, pattern, reframe, direction, soft_action, closing
// Each: { id, sec, match(ctx), text }
// match returns true if fragment applies. First match per section wins.

var LETTER_FRAGMENTS = [

  // ── OPENING (6) ───────────────────────────────────────────────────

  {id:'op_pp', sec:'opening',
    match: function(c){ return c.routeData.route==='POSTPARTUM'; },
    text: '[Prenume], ai trecut prin ceva ce schimbă totul — și nu vorbesc doar despre corp. Ai creat viață. Iar acum, undeva între nopți nedormite și responsabilități noi, ai ales să faci ceva pentru tine. Asta nu e puțin lucru.'},

  {id:'op_div', sec:'opening',
    match: function(c){ return c.routeData.route==='DIVORCE'; },
    text: '[Prenume], știu că nu e ușor să te ocupi de tine când viața s-a schimbat atât de brusc. Separarea nu afectează doar sufletul — afectează corpul, somnul, metabolismul, totul. Și totuși, ești aici. Ai ales să nu te pierzi.'},

  {id:'op_hor', sec:'opening',
    match: function(c){ return c.routeData.route==='HORMONAL'; },
    text: '[Prenume], dacă simți că faci totul corect dar corpul nu mai răspunde — nu ești nebună și nu ți se pare. Hormonii tăi s-au schimbat, iar regulile vechi nu mai funcționează. Am văzut asta de sute de ori. Și am învățat cum să lucrăm cu noile reguli, nu împotriva lor.'},

  {id:'op_burn', sec:'opening',
    match: function(c){ return c.routeData.route==='BURNOUT'; },
    text: '[Prenume], pot să-ți spun ceva sincer? Faptul că funcționezi zilnic cu nivelul ăsta de epuizare nu e o dovadă de putere — e un semnal de alarmă pe care corpul tău îl tot trage. Și tocmai l-ai auzit, pentru că ești aici.'},

  {id:'op_loss', sec:'opening',
    match: function(c){ return c.routeData.route==='LOSS'; },
    text: '[Prenume], nu voi pretinde că înțeleg ce simți — fiindcă fiecare pierdere e unică și fiecare durere are propria ei formă. Dar știu un lucru: a avea grijă de corpul tău în această perioadă nu e egoism. E un act de supraviețuire blândă.'},

  {id:'op_gen', sec:'opening',
    match: function(c){ return c.routeData.route==='GENERAL'; },
    text: '[Prenume], în cele 27 de răspunsuri pe care le-ai dat, am văzut ceva ce majoritatea femeilor nu realizează despre ele: ai fost complet sinceră. Asta e fundația pe care construim — nu pe cifre perfecte, ci pe adevăr.'},

  // ── REFLECTION (6) ────────────────────────────────────────────────

  {id:'ref_overwhelmed', sec:'reflection',
    match: function(c){ return c.signals.overwhelmed; },
    text: 'Văd în răspunsurile tale un tipar pe care îl recunosc: faci mult, dormi puțin, dai tot pentru alții și pentru tine nu mai rămâne nimic. Corpul tău nu e leneș — e epuizat. Și un corp epuizat nu slăbește, stochează. Nu din răutate, ci din instinct de supraviețuire.'},

  {id:'ref_emotional_eat', sec:'reflection',
    match: function(c){ return c.derived.isEmotionalEater && c.derived.manyDiets; },
    text: 'Am observat ceva important: mâncatul emoțional combinat cu un istoric lung de diete nu e o problemă de voință — e un cerc vicios hormonal. Cortizolul crește, cauți mâncare de confort, te simți vinovată, restricționezi, cortizolul crește iar. Cercul ăsta se poate sparge — dar nu cu altă dietă.'},

  {id:'ref_poor_sleep_stress', sec:'reflection',
    match: function(c){ return c.derived.poorSleep && c.derived.highStress; },
    text: 'Somnul și stresul tău formează un cerc care se auto-alimentează: stresul îți afectează somnul, somnul prost crește cortizolul, cortizolul crește stresul. Cifrele tale reflectă asta — și planul tău va aborda exact acest lanț, de la veriga cea mai slabă.'},

  {id:'ref_hormonal_shift', sec:'reflection',
    match: function(c){ return c.derived.highHormonal; },
    text: 'Profilul tău hormonal arată schimbări semnificative — și asta explică de ce metodele care funcționau acum câțiva ani nu mai dau rezultate. Nu e vina ta. Biologia ta s-a schimbat, și abordarea trebuie să se schimbe odată cu ea.'},

  {id:'ref_beginner_kind', sec:'reflection',
    match: function(c){ return c.derived.beginner && c.tone.vulnerability !== 'direct'; },
    text: 'Faptul că ești la început cu mișcarea nu e o slăbiciune — e un avantaj pe care nu îl vezi încă. Corpul tău nu are obiceiuri greșite de corectat. Putem construi de la zero, corect de la prima zi, fără să descompunem nimic.'},

  {id:'ref_general', sec:'reflection',
    match: function(c){ return true; },
    text: 'Am analizat fiecare răspuns al tău — de la cum dormi, la ce mănânci, la ce simți dimineața. Nu sunt doar cifre. Sunt indicii despre un corp care încearcă să-ți spună ceva. Iar acum, pentru prima dată, cineva ascultă.'},

  // ── PATTERN (5) ───────────────────────────────────────────────────

  {id:'pat_cortisol', sec:'pattern',
    match: function(c){ return c.derived.highStress && (c.derived.isEmotionalEater || c.derived.poorSleep); },
    text: 'Tiparul pe care îl văd la tine e clasic cortizolic: stres cronic → somn perturbat → poftă de dulce/carbohidrați → grăsime abdominală → și mai mult stres. Nu e lipsă de disciplină. E biochimie. Și biochimia se poate corecta — dar nu cu forța.'},

  {id:'pat_yoyo', sec:'pattern',
    match: function(c){ return c.derived.manyDiets && !c.derived.highStress; },
    text: 'Ai trecut prin multe diete — și fiecare a funcționat... până când n-a mai funcționat. Asta pentru că fiecare restricție severă scade metabolismul bazal. Corpul tău a învățat să supraviețuiască cu mai puțin. Noi nu vom repeta această greșeală.'},

  {id:'pat_hormonal_weight', sec:'pattern',
    match: function(c){ return c.derived.highHormonal && c.routeData.route !== 'POSTPARTUM'; },
    text: 'Greutatea abdominală, oboseala, schimbările de dispoziție — toate au o cauză comună: hormonii în tranziție. Nu e vorba de ce mănânci sau cât te miști. E vorba de CUM procesează corpul tău totul acum, în această etapă nouă.'},

  {id:'pat_low_capacity', sec:'pattern',
    match: function(c){ return c.signals.actionCapacity === 'low' && c.signals.structureNeed === 'high'; },
    text: 'Ai nevoie de structură dar nu ai energie de implementat ceva complex — și asta nu e o contradicție, e informație prețioasă. Înseamnă că planul tău trebuie să fie simplu, clar, cu pași mici care nu te copleșesc.'},

  {id:'pat_general', sec:'pattern',
    match: function(c){ return true; },
    text: 'Ce văd în profilul tău e un corp care are nevoie de consistență, nu de intensitate. Nu de revoluție, ci de direcție. Cele mai bune transformări pe care le-am ghidat nu au început cu schimbări dramatice — au început cu o singură decizie mică, repetată.'},

  // ── REFRAME (5) ──────────────────────────────────────────────────

  {id:'rfr_shame_high', sec:'reframe',
    match: function(c){ return c.signals.shameRisk === 'high' || c.signals.selfBlame === 'high'; },
    text: 'Vreau să auzi asta: NIMIC din ce e în profilul tău nu e rău. Nici greutatea, nici stresul, nici obiceiurile. Sunt doar coordonate pe o hartă — și harta nu judecă. Îți arată unde ești și de acolo începem. Nu de unde „ar trebui" să fii.'},

  {id:'rfr_protective', sec:'reframe',
    match: function(c){ return c.tone.vulnerability === 'protective'; },
    text: 'Știu că poate ai impresia că ai „ratat" sau „pierdut timp". Dar adevărul e altul: tot ce ai trăit te-a adus exact aici. Nu ai ratat nimic — ai acumulat experiență care face planul tău mai precis decât ar fi fost acum un an.'},

  {id:'rfr_warm', sec:'reframe',
    match: function(c){ return c.tone.vulnerability === 'warm'; },
    text: 'Ceea ce tu numești „problemă" — somnul, stresul, greutatea — eu numesc „informație". Fiecare detaliu din profilul tău ne spune exact ce are nevoie corpul tău. Nu tratăm simptome. Construim soluții pe cauze reale.'},

  {id:'rfr_direct', sec:'reframe',
    match: function(c){ return c.tone.vulnerability === 'direct'; },
    text: 'Profilul tău arată clar: ai potențial, ai voință, ai energie. Ce lipsea până acum era un cadru care să le folosească inteligent. Diferența între a te antrena și a te transforma e direcția — și acum ai una.'},

  {id:'rfr_general', sec:'reframe',
    match: function(c){ return true; },
    text: 'Fiecare femeie care ajunge la acest ecran a trecut prin exact aceleași dubii: „Oare va funcționa de data asta?" Diferența e că de data asta, planul nu e generic. E construit pe 27 de răspunsuri care sunt doar ale tale.'},

  // ── DIRECTION (5) ────────────────────────────────────────────────

  {id:'dir_gentle', sec:'direction',
    match: function(c){ return c.tone.pace === 'gentle'; },
    text: 'Planul tău va începe încet — poate mai încet decât te aștepți. Primele săptămâni sunt despre a restabili baza: somn, hidratare, mișcare blândă, mâncare care susține. Zero restricții extreme. Zero antrenamente care te distrug. Doar fundație solidă.'},

  {id:'dir_structured', sec:'direction',
    match: function(c){ return c.tone.pace === 'structured' && c.derived.hasLimitations; },
    text: 'Planul tău e construit cu protecție: fiecare exercițiu va respecta limitările tale fizice, fiecare rețetă va ține cont de condițiile tale. Structură clară, adaptată — nu un plan de pe internet cu disclaimer „consultă un medic".'},

  {id:'dir_structured_default', sec:'direction',
    match: function(c){ return c.tone.pace === 'structured'; },
    text: 'Vei primi o structură clară: ce mănânci, când te antrenezi, cât bei, cum dormi. Fiecare element are un motiv, fiecare pas are o logică. Nu e vorba de rigiditate — e vorba de cadru care te eliberează de ghicitul zilnic.'},

  {id:'dir_ambitious', sec:'direction',
    match: function(c){ return c.tone.pace === 'ambitious'; },
    text: 'Ai capacitatea pentru un plan real, intens și structurat. Vei primi antrenamente progresive, nutriție calculată pe obiectiv, și un ritm care te provoacă fără să te epuizeze. Consistența ta va face diferența.'},

  {id:'dir_general', sec:'direction',
    match: function(c){ return true; },
    text: 'Ce urmează e un plan construit pe datele tale reale: metabolismul tău, stresul tău, limitările tale, obiectivul tău. Nu o formulă generică. Fiecare decizie din program are în spate cele 27 de răspunsuri pe care le-ai dat.'},

  // ── SOFT ACTION (4) ──────────────────────────────────────────────

  {id:'act_protective', sec:'soft_action',
    match: function(c){ return c.tone.motivation === 'nurturing'; },
    text: 'Nu trebuie să faci nimic acum. Dacă singurul lucru pe care îl faci azi e să citești această scrisoare și să te gândești „poate ar merge" — e suficient. Restul vine când ești pregătită. Noi suntem aici.'},

  {id:'act_coaching', sec:'soft_action',
    match: function(c){ return c.tone.motivation === 'coaching'; },
    text: 'Următorul pas e simplu: scrie-i Danielei pe WhatsApp. Spune-i ce te-a rezonat din profilul tău. În 24 de ore vei avea un plan construit pe tot ce am învățat despre tine din aceste 27 de răspunsuri.'},

  {id:'act_challenging', sec:'soft_action',
    match: function(c){ return c.tone.motivation === 'challenging'; },
    text: 'Ai datele. Ai direcția. Ai motivația. Singurul lucru care te mai separă de plan e o decizie. Scrie-i Danielei și în 24 de ore transformăm cifrele astea într-un program de acțiune concret.'},

  {id:'act_general', sec:'soft_action',
    match: function(c){ return true; },
    text: 'Dacă ceva din ce ai citit aici te-a făcut să simți „da, asta sunt eu" — atunci merită să faci următorul pas. Scrie-i Danielei pe WhatsApp. Spune-i ce ai simțit. Restul se construiește de acolo.'},

  // ── CLOSING (4) ──────────────────────────────────────────────────

  {id:'cls_protective', sec:'closing',
    match: function(c){ return c.tone.vulnerability === 'protective'; },
    text: 'Cu grijă și fără grabă,\nDaniela'},

  {id:'cls_warm', sec:'closing',
    match: function(c){ return c.tone.vulnerability === 'warm'; },
    text: 'Cu drag și cu un plan,\nDaniela'},

  {id:'cls_direct', sec:'closing',
    match: function(c){ return c.tone.vulnerability === 'direct'; },
    text: 'Te aștept pe cealaltă parte,\nDaniela'},

  {id:'cls_general', sec:'closing',
    match: function(c){ return true; },
    text: 'Sunt aici când ești pregătită,\nDaniela'}
];

// ── LETTER FRAGMENT LIBRARY (introspection) ─────────────────────────

function buildLetterFragments() {
  return LETTER_FRAGMENTS;
}

// ── LETTER FRAGMENT PICKER ──────────────────────────────────────────
// Picks first matching fragment for each section.
// Returns object: { opening: fragment, reflection: fragment, ... }

function pickLetterFragments(letterContext, fragmentLibrary) {
  fragmentLibrary = fragmentLibrary || LETTER_FRAGMENTS;
  var sections = LETTER_CONFIG.SECTIONS;
  var picked = {};

  for (var i = 0; i < fragmentLibrary.length; i++) {
    var f = fragmentLibrary[i];
    if (picked[f.sec]) continue;
    try {
      if (f.match(letterContext)) {
        picked[f.sec] = f;
      }
    } catch(e) {}
  }

  return picked;
}

// ── LETTER COMPOSER ─────────────────────────────────────────────────
// Assembles selected fragments into a personal letter string.
// Returns string or null.

function composePersonalLetter(selectedFragments, letterContext) {
  if (!selectedFragments) return null;

  var sections = LETTER_CONFIG.SECTIONS;
  var name = (letterContext.profile && letterContext.profile.name) || '';
  var parts = [];

  for (var i = 0; i < sections.length; i++) {
    var frag = selectedFragments[sections[i]];
    if (frag && frag.text) {
      var text = frag.text.replace(/\[Prenume\]/g, name);
      parts.push(text);
    }
  }

  if (parts.length < LETTER_CONFIG.MIN_COMPOSE_PARTS) return null;
  return parts.join('\n\n');
}

// ── CONTENT QUALITY GATE ────────────────────────────────────────────
// Deterministic validation pass on picked fragments before final compose.
// Returns cleaned picked object or null if letter is unsalvageable.

function _validateLetterContent(picked, letterContext) {
  if (!picked) return null;

  var sections = LETTER_CONFIG.SECTIONS;
  var required = LETTER_CONFIG.REQUIRED;
  var minLen = LETTER_CONFIG.MIN_SECTION_LEN;
  var minValid = LETTER_CONFIG.MIN_VALID_SECTIONS;

  // Check required sections exist
  for (var r = 0; r < required.length; r++) {
    if (!picked[required[r]] || !picked[required[r]].text) return null;
  }

  // Count valid sections
  var validCount = 0;
  for (var v = 0; v < sections.length; v++) {
    if (picked[sections[v]] && picked[sections[v]].text && picked[sections[v]].text.length > minLen) {
      validCount++;
    }
  }
  if (validCount < minValid) return null;

  // Route consistency: apply tone rules from config
  var tone = letterContext.tone || {};
  var rules = LETTER_CONFIG.TONE_RULES;
  for (var tr = 0; tr < rules.length; tr++) {
    var rule = rules[tr];
    try {
      if (rule.check(tone) && picked[rule.field] && picked[rule.field].id === rule.reject) {
        picked[rule.field] = _findFallback(rule.field, rule.fallback);
      }
    } catch(e) {}
  }

  // Calibration consistency: apply calibration rules from config
  var cal = letterContext._calibration || _defaultCalibration();
  var calRules = LETTER_CONFIG.CALIBRATION_RULES;
  for (var cr = 0; cr < calRules.length; cr++) {
    var cRule = calRules[cr];
    try {
      if (cRule.check(cal) && picked[cRule.field] && picked[cRule.field].id === cRule.reject) {
        var fb = _findFallback(cRule.field, cRule.fallback);
        if (fb) picked[cRule.field] = fb;
      }
    } catch(e) {}
  }

  // Profile/score consistency: apply profile rules (lowest priority — cannot override above)
  var profSum = letterContext._profileSummary || _defaultProfileSummary();
  var profRules = LETTER_CONFIG.PROFILE_RULES;
  for (var pr = 0; pr < profRules.length; pr++) {
    var pRule = profRules[pr];
    try {
      if (pRule.check(profSum) && picked[pRule.field] && picked[pRule.field].id === pRule.reject) {
        var pfb = _findFallback(pRule.field, pRule.fallback);
        if (pfb) picked[pRule.field] = pfb;
      }
    } catch(e) {}
  }

  // Repetition control: check adjacent sections for duplicated opener phrases
  var prevText = '';
  for (var s = 0; s < sections.length; s++) {
    var sec = sections[s];
    if (!picked[sec] || !picked[sec].text) continue;
    var curText = picked[sec].text;

    var curOpener = _extractOpener(curText);
    var prevOpener = _extractOpener(prevText);
    if (curOpener && prevOpener && curOpener === prevOpener) {
      picked[sec] = null;
    }

    if (prevText && curText && _wordOverlap(prevText, curText) > LETTER_CONFIG.MAX_OVERLAP) {
      picked[sec] = null;
    }

    if (picked[sec]) prevText = curText;
  }

  // Re-check required sections still exist after repetition removal
  for (var r2 = 0; r2 < required.length; r2++) {
    if (!picked[required[r2]] || !picked[required[r2]].text) return null;
  }

  // Re-count valid
  var finalCount = 0;
  for (var f = 0; f < sections.length; f++) {
    if (picked[sections[f]] && picked[sections[f]].text && picked[sections[f]].text.length > minLen) {
      finalCount++;
    }
  }
  if (finalCount < minValid) return null;

  return picked;
}

// Helper: extract first 4 words as opener fingerprint
function _extractOpener(text) {
  if (!text) return '';
  var n = LETTER_CONFIG.OPENER_WORDS;
  var words = text.replace(/[.,!?—:;]/g, '').split(/\s+/).slice(0, n);
  if (words.length < n) return '';
  return words.join(' ').toLowerCase();
}

// Helper: compute word overlap ratio between two texts (significant words only)
function _wordOverlap(a, b) {
  var wordsA = _significantWords(a, LETTER_CONFIG.STOP_WORDS);
  var wordsB = _significantWords(b, LETTER_CONFIG.STOP_WORDS);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  var setB = {};
  for (var i = 0; i < wordsB.length; i++) setB[wordsB[i]] = true;
  var shared = 0;
  for (var j = 0; j < wordsA.length; j++) {
    if (setB[wordsA[j]]) shared++;
  }
  return shared / Math.min(wordsA.length, wordsB.length);
}

function _significantWords(text, stopWords) {
  var words = text.toLowerCase().replace(/[.,!?—:;„""()\[\]]/g, '').split(/\s+/);
  var result = [];
  var stopSet = {};
  for (var s = 0; s < stopWords.length; s++) stopSet[stopWords[s]] = true;
  for (var i = 0; i < words.length; i++) {
    if (words[i].length > 2 && !stopSet[words[i]]) result.push(words[i]);
  }
  return result;
}

// Helper: find a specific fallback fragment by id
function _findFallback(section, fallbackId) {
  for (var i = 0; i < LETTER_FRAGMENTS.length; i++) {
    if (LETTER_FRAGMENTS[i].id === fallbackId) return LETTER_FRAGMENTS[i];
  }
  return null;
}

// ── FINAL LETTER VALIDATION ─────────────────────────────────────────
// Validates composed text meets production quality requirements.
// Returns text or null.

function _validateLetterText(text) {
  if (typeof text !== 'string') return null;

  // Strip placeholder leftovers
  text = text.replace(/\[Prenume\]/g, '');

  // Word count check
  var words = text.split(/\s+/).filter(function(w){ return w.length > 0; });
  if (words.length < LETTER_CONFIG.WORD_MIN || words.length > LETTER_CONFIG.WORD_MAX) return null;

  // Character length minimum
  if (text.length < LETTER_CONFIG.CHAR_MIN) return null;

  return text;
}

// ── BUILD PERSONAL LETTER (top-level API) ───────────────────────────
// Returns { text: string, sections: object } or null on failure.

function buildPersonalLetter(letterContext) {
  if (!letterContext) return null;

  try {
    // Compute calibration and profile summary, attach to context for validation layer
    var calibration = calibrateLetterProfile(letterContext);
    letterContext._calibration = calibration;
    var profileSummary = buildProfileSummary(letterContext);
    letterContext._profileSummary = profileSummary;

    var picked = pickLetterFragments(letterContext);

    // Content quality gate (uses tone + calibration rules)
    picked = _validateLetterContent(picked, letterContext);
    if (!picked) return null;

    var text = composePersonalLetter(picked, letterContext);

    // Final text validation
    text = _validateLetterText(text);
    if (!text) return null;

    // Count active sections for meta
    var activeSections = [];
    var secs = LETTER_CONFIG.SECTIONS;
    for (var m = 0; m < secs.length; m++) {
      if (picked[secs[m]] && picked[secs[m]].text) activeSections.push(secs[m]);
    }

    var words = text.split(/\s+/).filter(function(w){ return w.length > 0; });

    return {
      text: text,
      sections: picked,
      meta: {
        sectionCount: activeSections.length,
        activeSections: activeSections,
        wordCount: words.length,
        route: (letterContext.routeData && letterContext.routeData.route) || 'GENERAL',
        toneLabel: (letterContext.tone && letterContext.tone.label) || 'unknown',
        calibration: calibration,
        profileSummary: profileSummary
      }
    };
  } catch(e) {
    return null;
  }
}
