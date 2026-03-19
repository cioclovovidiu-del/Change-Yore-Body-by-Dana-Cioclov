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
