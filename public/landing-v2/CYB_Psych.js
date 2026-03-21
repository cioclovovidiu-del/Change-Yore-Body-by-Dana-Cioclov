// =============================================================================
// CYB PSYCH — Psychological Communication Layer
// Sits between Engine (interpretation) and Render (display).
// Requires: CYB_Engine_STABLE.js loaded before this.
// No DOM. No side effects. No randomness. Deterministic from same input.
// =============================================================================

// ── FEATURE FLAGS & POLICY ──────────────────────────────────────────

var PERSONAL_LETTER_ENABLED = true;

// Deterministic policy decision — centralized eligibility checks.
// Returns structured decision object for diagnostics and gating.
function getPersonalLetterPolicy(letterContext) {
  var featureEnabled = !!PERSONAL_LETTER_ENABLED;
  var hasContext = !!letterContext && typeof letterContext === 'object';
  var hasRoute = hasContext && letterContext.routeData &&
    typeof letterContext.routeData.route === 'string' && letterContext.routeData.route.length > 0;
  var hasMinimumData = hasContext &&
    !!letterContext.tone && typeof letterContext.tone === 'object' &&
    !!letterContext.signals && typeof letterContext.signals === 'object' &&
    !!letterContext.answers && typeof letterContext.answers === 'object';

  var allowed = featureEnabled && hasContext && hasRoute && hasMinimumData;
  var reason = !featureEnabled ? 'feature_disabled' :
    !hasContext ? 'no_context' :
    !hasRoute ? 'no_route' :
    !hasMinimumData ? 'insufficient_data' : 'allowed';

  return {
    allowed: allowed,
    reason: reason,
    featureEnabled: featureEnabled,
    hasContext: hasContext,
    hasRoute: hasRoute,
    hasMinimumData: hasMinimumData
  };
}

// Thin wrapper — backward-compatible boolean check.
function canUsePersonalLetter(letterContext) {
  return getPersonalLetterPolicy(letterContext).allowed;
}

// ── DIAGNOSTIC REASON CODES ─────────────────────────────────────────
var LETTER_DIAG = {
  POLICY_BLOCKED: 'policy_blocked',
  BUILD_SUCCESS: 'build_success',
  VALIDATION_FAILED: 'validation_failed',
  MISSING_REQUIRED_SECTIONS: 'missing_required_sections',
  WORD_RANGE_FAILED: 'word_range_failed',
  CHAR_MIN_FAILED: 'char_min_failed',
  COMPOSE_FAILED: 'compose_failed',
  EXCEPTION: 'exception',
  FALLBACK_CALIBRATION: 'fallback_calibration_default',
  FALLBACK_PROFILE: 'fallback_profile_default',
  FALLBACK_LANGUAGE: 'fallback_language_default'
};

// ── STATE CONTRACT ──────────────────────────────────────────────────
var LETTER_STATE = {
  DISABLED: 'disabled',   // feature flag off
  BLOCKED: 'blocked',     // policy rejected (missing context/route/data)
  INVALID: 'invalid',     // build attempted but validation failed
  BUILT: 'built',         // letter produced successfully
  EXCEPTION: 'exception'  // unexpected error during build
};

// Resolves final state from policy + result + diagnostics.
function resolvePersonalLetterState(policy, result, diagnostics) {
  policy = policy || {};
  diagnostics = diagnostics || {};

  // Feature disabled — takes priority
  if (policy.featureEnabled === false) {
    return { state: LETTER_STATE.DISABLED, reason: 'feature_disabled', ok: false };
  }

  // Policy blocked (missing context/route/data)
  if (!policy.allowed) {
    return { state: LETTER_STATE.BLOCKED, reason: policy.reason || 'policy_rejected', ok: false };
  }

  // Exception during build
  if (diagnostics.outcome === LETTER_DIAG.EXCEPTION) {
    return { state: LETTER_STATE.EXCEPTION, reason: 'build_exception', ok: false };
  }

  // Build succeeded
  var succeeded = result !== null && typeof result === 'object' && typeof result.text === 'string';
  if (succeeded) {
    return { state: LETTER_STATE.BUILT, reason: 'success', ok: true };
  }

  // Build attempted but failed validation
  return { state: LETTER_STATE.INVALID, reason: diagnostics.outcome || 'validation_failed', ok: false };
}

// Diagnostic builder — works for both success and null paths.
function buildPersonalLetterDiagnostics(ctx, result, policy, buildDetail) {
  policy = policy || getPersonalLetterPolicy(ctx);
  buildDetail = buildDetail || {};
  var succeeded = result !== null && typeof result === 'object' && typeof result.text === 'string';

  var route = 'unknown';
  if (succeeded && result.meta) route = result.meta.route || 'GENERAL';
  else if (ctx && ctx.routeData) route = ctx.routeData.route || 'unknown';

  var fallbackReasons = [];
  if (buildDetail.usedDefaultCalibration) fallbackReasons.push(LETTER_DIAG.FALLBACK_CALIBRATION);
  if (buildDetail.usedDefaultProfile) fallbackReasons.push(LETTER_DIAG.FALLBACK_PROFILE);
  if (buildDetail.usedDefaultLanguage) fallbackReasons.push(LETTER_DIAG.FALLBACK_LANGUAGE);

  var outcome = !policy.allowed ? LETTER_DIAG.POLICY_BLOCKED :
    succeeded ? LETTER_DIAG.BUILD_SUCCESS :
    buildDetail.reason || LETTER_DIAG.VALIDATION_FAILED;

  return {
    policyAllowed: policy.allowed,
    policyReason: policy.reason,
    featureEnabled: policy.featureEnabled,
    route: route,
    buildAttempted: policy.allowed,
    buildSucceeded: succeeded,
    returnedNull: !succeeded,
    outcome: outcome,
    fallbackUsed: fallbackReasons.length > 0,
    fallbackReasons: fallbackReasons,
    auditOk: (succeeded && result.meta && result.meta.audit) ? result.meta.audit.ok : null,
    version: (typeof PERSONAL_LETTER_VERSION !== 'undefined') ? PERSONAL_LETTER_VERSION : 'unknown',
    calibrationLabel: (succeeded && result.meta && result.meta.calibration) ? result.meta.calibration.label : (buildDetail.calibrationLabel || null),
    profileLabel: (succeeded && result.meta && result.meta.profileSummary) ? result.meta.profileSummary.profileLabel : (buildDetail.profileLabel || null),
    languageLabel: (succeeded && result.meta && result.meta.languageProfile) ? result.meta.languageProfile.label : (buildDetail.languageLabel || null)
  };
}

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

  // ═══════════════════════════════════════════════════════════════════
  // ROUTE-SENSITIVE — mini_results (6 routes × 1)
  // ═══════════════════════════════════════════════════════════════════

  {id:'rt_pp_mini', cat:'route', loc:['mini_results'],
    match: function(c){ return c.routeData.route==='POSTPARTUM'; },
    text: 'Corpul tău trece printr-o recalibrare completă după sarcină. Ce îți arătăm aici e adaptat exact pentru această etapă.'},

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

  // ═══════════════════════════════════════════════════════════════════
  // ROUTE-SENSITIVE — transition (6 routes × 1)
  // ═══════════════════════════════════════════════════════════════════

  {id:'rt_pp_trans', cat:'route', loc:['transition'],
    match: function(c){ return c.routeData.route==='POSTPARTUM'; },
    text: 'Următoarele întrebări ne ajută să înțelegem ce are nevoie corpul tău de mamă — nu un corp generic din manual.'},

  {id:'rt_div_trans', cat:'route', loc:['transition'],
    match: function(c){ return c.routeData.route==='DIVORCE'; },
    text: 'Fiecare răspuns ne ajută să construim un plan care ține cont de presiunea emoțională prin care treci.'},

  {id:'rt_hor_trans', cat:'route', loc:['transition'],
    match: function(c){ return c.routeData.route==='HORMONAL'; },
    text: 'Întrebările următoare ne ajută să adaptăm totul la biologia ta actuală — nu la standarde generice.'},

  {id:'rt_burn_trans', cat:'route', loc:['transition'],
    match: function(c){ return c.routeData.route==='BURNOUT'; },
    text: 'Nu adăugăm presiune. Aceste întrebări ne arată cum să construim un plan care te susține, nu te epuizează.'},

  {id:'rt_loss_trans', cat:'route', loc:['transition'],
    match: function(c){ return c.routeData.route==='LOSS'; },
    text: 'Răspunde doar ce simți că poți. Fiecare detaliu ne ajută, dar ritmul e al tău.'},

  {id:'rt_gen_trans', cat:'route', loc:['transition'],
    match: function(c){ return c.routeData.route==='GENERAL'; },
    text: 'Cu fiecare răspuns, profilul tău devine mai precis. Continuăm să construim pe fundația ta.'},

  // ═══════════════════════════════════════════════════════════════════
  // ROUTE-SENSITIVE — complet_results (6 routes × 1)
  // ═══════════════════════════════════════════════════════════════════

  {id:'rt_pp_complet', cat:'route', loc:['complet_results'],
    match: function(c){ return c.routeData.route==='POSTPARTUM'; },
    text: 'Analiza ta completă reflectă nevoile reale ale unui corp postpartum — nu ale unui corp teoretic.'},

  {id:'rt_div_complet', cat:'route', loc:['complet_results'],
    match: function(c){ return c.routeData.route==='DIVORCE'; },
    text: 'Am integrat contextul emoțional în fiecare recomandare. Planul tău ține cont de ce treci.'},

  {id:'rt_hor_complet', cat:'route', loc:['complet_results'],
    match: function(c){ return c.routeData.route==='HORMONAL'; },
    text: 'Toate recomandările de mai jos sunt calibrate pe profilul tău hormonal real — nu pe formule generice.'},

  {id:'rt_burn_complet', cat:'route', loc:['complet_results'],
    match: function(c){ return c.routeData.route==='BURNOUT'; },
    text: 'Planul tău e construit să scadă presiunea, nu să o crească. Fiecare pas e dimensionat pentru capacitatea ta reală.'},

  {id:'rt_loss_complet', cat:'route', loc:['complet_results'],
    match: function(c){ return c.routeData.route==='LOSS'; },
    text: 'Rezultatele tale sunt prezentate fără presiune. Fiecare recomandare e o invitație, nu o obligație.'},

  {id:'rt_gen_complet', cat:'route', loc:['complet_results'],
    match: function(c){ return c.routeData.route==='GENERAL'; },
    text: 'Ai parcurs fiecare secțiune cu seriozitate — asta ne permite să construim ceva cu adevărat adaptat.'},

  // ═══════════════════════════════════════════════════════════════════
  // STRESS-SENSITIVE (7: high/mod/low × results + high/mod/low × transition)
  // ═══════════════════════════════════════════════════════════════════

  // ── STRESS VARIANTS (v2) — more specific, must precede general ──

  {id:'st_high_res_v2', cat:'stress', loc:['mini_results','complet_results'],
    match: function(c){ return c.scores.stress > 65 && c.scores.hormonal > 50; },
    text: 'Stresul ridicat combinat cu schimbări hormonale creează un context special. Planul tău va adresa ambele, nu doar unul.'},

  {id:'st_mod_res_v2', cat:'stress', loc:['mini_results','complet_results'],
    match: function(c){ return c.scores.stress > 40 && c.scores.stress <= 65 && c.signals.actionCapacity==='low'; },
    text: 'Stresul moderat cu capacitate redusă cere un plan blând. Nu viteză — ci direcție clară și pași mici.'},

  // ── STRESS GENERAL — fallback when no variant matches ──────────

  {id:'st_high_res', cat:'stress', loc:['mini_results','complet_results'],
    match: function(c){ return c.scores.stress > 65; },
    text: 'Nivelul tău de stres e ridicat — dar asta nu e o condamnare. E informația care ne arată de unde să începem: cu liniște, nu cu restricții.'},

  {id:'st_high_trans', cat:'stress', loc:['transition'],
    match: function(c){ return c.scores.stress > 65; },
    text: 'Știm că nivelul tău de stres e sus. Aceste întrebări ne ajută să construim un plan care scade presiunea, nu o crește.'},

  {id:'st_mod_res', cat:'stress', loc:['mini_results','complet_results'],
    match: function(c){ return c.scores.stress > 40 && c.scores.stress <= 65; },
    text: 'Stresul tău e moderat — destul cât să influențeze greutatea și energia, dar gestionabil cu direcția corectă.'},

  {id:'st_mod_trans', cat:'stress', loc:['transition'],
    match: function(c){ return c.scores.stress > 40 && c.scores.stress <= 65; },
    text: 'Stresul tău e prezent dar controlabil. Răspunsurile tale ne ajută să menținem echilibrul, nu să adăugăm presiune.'},

  {id:'st_low_res', cat:'stress', loc:['mini_results','complet_results'],
    match: function(c){ return c.scores.stress <= 40; },
    text: 'Nivelul tău de stres e bun — corpul tău e pregătit să răspundă la schimbare fără să lupte împotriva lui.'},

  {id:'st_low_trans', cat:'stress', loc:['transition'],
    match: function(c){ return c.scores.stress <= 40; },
    text: 'Corpul tău e într-o zonă bună de stres. Răspunsurile următoare ne ajută să menținem acest avantaj.'},

  // ═══════════════════════════════════════════════════════════════════
  // SHAME / SELF-BLAME (7: across locations + variants)
  // ═══════════════════════════════════════════════════════════════════

  // ── SHAME VARIANT — more specific, must precede general ─────────

  {id:'sh_high_overwhelm_mini', cat:'shame', loc:['mini_results'],
    match: function(c){ return c.signals.selfBlame==='high' && c.signals.overwhelmed; },
    text: 'Știm că te simți copleșită. Aceste cifre nu sunt despre ce ai greșit — sunt despre ce putem corecta împreună.'},

  // ── SHAME GENERAL ──────────────────────────────────────────────

  {id:'sh_high_mini', cat:'shame', loc:['mini_results'],
    match: function(c){ return c.signals.shameRisk==='high' || c.signals.selfBlame==='high'; },
    text: 'Ce vezi aici nu e un verdict. E o hartă. Și harta nu judecă — doar arată unde ești și încotro poți merge.'},

  {id:'sh_high_complet', cat:'shame', loc:['complet_results'],
    match: function(c){ return c.signals.shameRisk==='high' || c.signals.selfBlame==='high'; },
    text: 'Fiecare număr de aici e o informație, nu o etichetă. Programul tău e construit să te susțină, nu să te evalueze.'},

  {id:'sh_high_trans', cat:'shame', loc:['transition'],
    match: function(c){ return c.signals.shameRisk==='high' || c.signals.selfBlame==='high'; },
    text: 'Nu există răspunsuri greșite aici. Fiecare detaliu ne ajută să construim ceva care te protejează, nu te expune.'},

  {id:'sh_med_res', cat:'shame', loc:['mini_results','complet_results'],
    match: function(c){ return c.signals.selfBlame==='medium' && c.signals.shameRisk!=='high'; },
    text: 'Nu trebuie să fii perfectă ca să merite să începi. Trebuie doar să fii aici — și ești.'},

  {id:'sh_med_trans', cat:'shame', loc:['transition'],
    match: function(c){ return c.signals.selfBlame==='medium' && c.signals.shameRisk!=='high'; },
    text: 'Răspunsurile tale nu sunt judecate. Sunt informații care ne ghidează spre ce funcționează pentru tine.'},

  {id:'sh_low_res', cat:'shame', loc:['mini_results','complet_results'],
    match: function(c){ return c.signals.selfBlame==='low' && c.signals.shameRisk==='low'; },
    text: 'Ai o relație sănătoasă cu propriile așteptări — asta e un avantaj real pe care îl vom folosi.'},

  // ═══════════════════════════════════════════════════════════════════
  // CAPACITY / STRUCTURE (8: all locations covered)
  // ═══════════════════════════════════════════════════════════════════

  {id:'cap_low_mini', cat:'capacity', loc:['mini_results'],
    match: function(c){ return c.signals.actionCapacity==='low'; },
    text: 'Capacitatea ta de acțiune e limitată acum — și asta e ok. Planul tău va fi dimensionat pentru realitatea ta.'},

  {id:'cap_low_trans', cat:'capacity', loc:['transition'],
    match: function(c){ return c.signals.actionCapacity==='low'; },
    text: 'Nu îți cerem mult acum. Fiecare pas mic contează — și programul tău va reflecta asta.'},

  {id:'cap_low_complet', cat:'capacity', loc:['complet_results'],
    match: function(c){ return c.signals.actionCapacity==='low'; },
    text: 'Am calibrat fiecare recomandare pentru capacitatea ta reală. Pași mici, dar în direcția corectă.'},

  {id:'cap_med_res', cat:'capacity', loc:['mini_results','complet_results'],
    match: function(c){ return c.signals.actionCapacity==='medium' && c.signals.structureNeed==='high'; },
    text: 'Ai energie, dar ai nevoie de direcție clară. Exact asta construim: structură care funcționează cu viața ta.'},

  {id:'cap_med_trans', cat:'capacity', loc:['transition'],
    match: function(c){ return c.signals.actionCapacity==='medium'; },
    text: 'Ai resurse bune. Întrebările următoare ne ajută să le canalizăm eficient.'},

  {id:'cap_high_res', cat:'capacity', loc:['mini_results','complet_results'],
    match: function(c){ return c.signals.actionCapacity==='high'; },
    text: 'Ai capacitatea și motivația — ceea ce lipsește e doar un plan care le folosește inteligent.'},

  {id:'cap_high_trans', cat:'capacity', loc:['transition'],
    match: function(c){ return c.signals.actionCapacity==='high'; },
    text: 'Nivelul tău de energie e un avantaj clar. Aceste răspunsuri ne ajută să-l transformăm în rezultate.'},

  {id:'struct_high_trans', cat:'capacity', loc:['transition'],
    match: function(c){ return c.signals.structureNeed==='high' && c.signals.actionCapacity!=='low'; },
    text: 'Aceste întrebări ne ajută să creăm un cadru clar — pași concreti, nu sfaturi vagi.'},

  // ═══════════════════════════════════════════════════════════════════
  // ENCOURAGEMENT / CLOSING (9: all tone × location combos)
  // ═══════════════════════════════════════════════════════════════════

  // ── CLOSING VARIANTS — motivation-specific (more specific first) ─

  {id:'enc_challenging_complet', cat:'closing', loc:['complet_results'],
    match: function(c){ return c.tone.motivation==='challenging'; },
    text: 'Ai fost directă și sinceră. Planul tău va fi la fel — fără compromisuri, construit pe adevăr.'},

  {id:'enc_coaching_complet', cat:'closing', loc:['complet_results'],
    match: function(c){ return c.tone.motivation==='coaching'; },
    text: 'Ai oferit toate informațiile necesare. Acum noi facem partea noastră — construim planul care te duce acolo.'},

  {id:'enc_nurturing_res', cat:'closing', loc:['mini_results','complet_results'],
    match: function(c){ return c.tone.motivation==='nurturing' && c.tone.vulnerability!=='protective'; },
    text: 'Ești pe drumul bun. Nu contează cât de repede mergi — contează că mergi.'},

  // ── CLOSING GENERAL — vulnerability-based fallback ─────────────

  {id:'enc_protective_res', cat:'closing', loc:['mini_results','complet_results'],
    match: function(c){ return c.tone.vulnerability==='protective'; },
    text: 'Nu trebuie să faci nimic perfect. Trebuie doar să continui — în ritmul tău, când poți.'},

  {id:'enc_warm_res', cat:'closing', loc:['mini_results','complet_results'],
    match: function(c){ return c.tone.vulnerability==='warm'; },
    text: 'Ai luat deja cea mai grea decizie: să fii sinceră cu tine. Tot ce urmează e mai ușor.'},

  {id:'enc_direct_res', cat:'closing', loc:['mini_results','complet_results'],
    match: function(c){ return c.tone.vulnerability==='direct'; },
    text: 'Ai datele. Ai direcția. Acum e momentul să transformi claritatea în acțiune.'},

  {id:'enc_trans_gentle', cat:'closing', loc:['transition'],
    match: function(c){ return c.tone.pace==='gentle'; },
    text: 'Ia-ți timpul cu fiecare răspuns. Nu e nicio grabă — fiecare detaliu ne ajută să te protejăm mai bine.'},

  {id:'enc_trans_structured', cat:'closing', loc:['transition'],
    match: function(c){ return c.tone.pace==='structured'; },
    text: 'Răspunsurile tale construiesc un plan precis. Fiecare secțiune adaugă un strat de claritate.'},

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

  // Final text word range (B2 spec: 250-400)
  WORD_MIN: 250,
  WORD_MAX: 400,

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
  ],

  // Language tuning rules: applied LAST before repetition control
  // Fine-grained wording swaps based on composite language profile
  LANGUAGE_RULES: [
    // High warmth + soft reassurance → prefer warm closing over direct
    { check: function(lp){ return lp.warmthLevel >= 3 && lp.reassuranceStyle === 'soft'; },
      reject: 'cls_direct', fallback: 'cls_warm', field: 'closing' },
    // Low warmth + direct reassurance → prefer direct closing over protective
    { check: function(lp){ return lp.warmthLevel <= 1 && lp.reassuranceStyle === 'direct'; },
      reject: 'cls_protective', fallback: 'cls_direct', field: 'closing' },
    // Protective action style → prefer protective soft_action
    { check: function(lp){ return lp.actionStyle === 'protective'; },
      reject: 'act_challenging', fallback: 'act_protective', field: 'soft_action' },
    // Momentum action style + energizing vocab → prefer coaching over general
    { check: function(lp){ return lp.actionStyle === 'momentum' && lp.vocabularyStyle === 'energizing'; },
      reject: 'act_general', fallback: 'act_coaching', field: 'soft_action' },
    // Gentle pacing + calm vocab → prefer gentle direction over structured
    { check: function(lp){ return lp.pacingStyle === 'gentle' && lp.vocabularyStyle === 'calm'; },
      reject: 'dir_structured_default', fallback: 'dir_gentle', field: 'direction' },
    // Structured pacing + high firmness → prefer structured direction over general
    { check: function(lp){ return lp.pacingStyle === 'structured' && lp.firmnessLevel >= 2; },
      reject: 'dir_general', fallback: 'dir_structured_default', field: 'direction' },
    // High warmth → prefer warm reframe over general
    { check: function(lp){ return lp.warmthLevel >= 3; },
      reject: 'rfr_general', fallback: 'rfr_warm', field: 'reframe' }
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

// ── LANGUAGE TUNING LAYER ───────────────────────────────────────────
// Deterministic wording intensity profile derived from tone + calibration + profileSummary.
// Returns { warmthLevel, firmnessLevel, pacingStyle, reassuranceStyle, actionStyle, vocabularyStyle, label }

function buildLanguageTuning(tone, calibration, profileSummary) {
  tone = tone || {};
  calibration = calibration || _defaultCalibration();
  profileSummary = profileSummary || _defaultProfileSummary();

  // ── Warmth: composite of calibration softness + tone vulnerability
  var warmth = calibration.softnessLevel;
  if (tone.vulnerability === 'protective') warmth = Math.max(warmth, 3);
  else if (tone.vulnerability === 'warm') warmth = Math.max(warmth, 2);
  // Hormonal/metabolic pressure adds warmth
  if (profileSummary.hormonalLevel === 'high' || profileSummary.metabolicPressureLevel === 'high') {
    warmth = Math.max(warmth, 2);
  }
  warmth = Math.max(1, Math.min(3, warmth));

  // ── Firmness: inverse of softness, modulated by structure need
  var firmness = 4 - calibration.softnessLevel; // 3→1, 2→2, 1→3
  if (calibration.structureLevel >= 3) firmness = Math.max(firmness, 2);
  if (profileSummary.energyPressureLevel === 'high') firmness = Math.min(firmness, 2);
  firmness = Math.max(1, Math.min(3, firmness));

  // ── Pacing style
  var pacingStyle = 'steady';
  if (calibration.directionLevel <= 1 || profileSummary.energyPressureLevel === 'high') {
    pacingStyle = 'gentle';
  } else if (calibration.structureLevel >= 3 || calibration.directionLevel >= 3) {
    pacingStyle = 'structured';
  }

  // ── Reassurance style
  var reassuranceStyle = 'balanced';
  if (calibration.reassuranceLevel >= 3 || profileSummary.cautionLevel === 'high') {
    reassuranceStyle = 'soft';
  } else if (calibration.reassuranceLevel <= 1 && warmth <= 1) {
    reassuranceStyle = 'direct';
  }

  // ── Action style
  var actionStyle = 'coaching';
  if (calibration.pushLevel <= 1 || profileSummary.energyPressureLevel === 'high') {
    actionStyle = 'protective';
  } else if (calibration.pushLevel >= 3 && profileSummary.energyPressureLevel !== 'high') {
    actionStyle = 'momentum';
  }

  // ── Vocabulary style
  var vocabularyStyle = 'balanced';
  if (warmth >= 3 && pacingStyle === 'gentle') {
    vocabularyStyle = 'calm';
  } else if (firmness >= 3 && actionStyle === 'momentum') {
    vocabularyStyle = 'energizing';
  }

  var label = 'w' + warmth + 'f' + firmness + '-' + pacingStyle.charAt(0) +
    reassuranceStyle.charAt(0) + actionStyle.charAt(0) + vocabularyStyle.charAt(0);

  return {
    warmthLevel: warmth,
    firmnessLevel: firmness,
    pacingStyle: pacingStyle,
    reassuranceStyle: reassuranceStyle,
    actionStyle: actionStyle,
    vocabularyStyle: vocabularyStyle,
    label: label
  };
}

function _defaultLanguageTuning() {
  return {
    warmthLevel: 2, firmnessLevel: 2, pacingStyle: 'steady',
    reassuranceStyle: 'balanced', actionStyle: 'coaching', vocabularyStyle: 'balanced',
    label: 'w2f2-sbcb'
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
    text: 'Promisiunea mea e simplă: nu te voi forța, nu te voi judeca, nu te voi grăbi. Voi fi alături de tine exact în ritmul în care ai nevoie. Și dacă azi tot ce poți face e să citești această scrisoare — e suficient. Restul vine.\n\nCu grijă și fără grabă,\nDaniela'},

  {id:'cls_warm', sec:'closing',
    match: function(c){ return c.tone.vulnerability === 'warm'; },
    text: 'Îți promit un singur lucru: vei fi ascultată, văzută și ghidată fără să fii pusă pe un șablon. Planul tău e al tău — construit din povestea ta, nu din reguli generice. Și eu voi fi lângă tine la fiecare pas.\n\nCu drag și cu un plan,\nDaniela'},

  {id:'cls_direct', sec:'closing',
    match: function(c){ return c.tone.vulnerability === 'direct'; },
    text: 'Nu-ți promit că va fi ușor. Îți promit că va fi clar, logic și construit pe realitatea ta. Iar rezultatele vor veni nu pentru că ai noroc, ci pentru că ai direcție. Următorul pas e al tău.\n\nTe aștept pe cealaltă parte,\nDaniela'},

  {id:'cls_general', sec:'closing',
    match: function(c){ return true; },
    text: 'Ceea ce-ți promit e că acest plan nu e o altă încercare oarbă. E prima abordare construită complet pe cine ești tu azi — cu tot ce ai trecut și tot ce simți. Și asta face toată diferența.\n\nSunt aici când ești pregătită,\nDaniela'}
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

  // Language tuning: apply language rules (finest granularity, lowest priority)
  var langProf = letterContext._languageTuning || _defaultLanguageTuning();
  var langRules = LETTER_CONFIG.LANGUAGE_RULES;
  for (var lr = 0; lr < langRules.length; lr++) {
    var lRule = langRules[lr];
    try {
      if (lRule.check(langProf) && picked[lRule.field] && picked[lRule.field].id === lRule.reject) {
        var lfb = _findFallback(lRule.field, lRule.fallback);
        if (lfb) picked[lRule.field] = lfb;
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
  var policy = getPersonalLetterPolicy(letterContext);
  if (!policy.allowed) {
    // Store diagnostics + state on context for null-path inspection
    if (letterContext && typeof letterContext === 'object') {
      letterContext._lastDiagnostics = buildPersonalLetterDiagnostics(letterContext, null, policy, { reason: LETTER_DIAG.POLICY_BLOCKED });
      letterContext._lastState = resolvePersonalLetterState(policy, null, letterContext._lastDiagnostics);
    }
    return null;
  }

  var _bd = {}; // build detail tracker

  try {
    // Compute calibration, profile summary, and language tuning
    var calibration = calibrateLetterProfile(letterContext);
    letterContext._calibration = calibration;
    _bd.calibrationLabel = calibration.label;
    _bd.usedDefaultCalibration = (calibration.label === 's2d2p2r2st2');

    var profileSummary = buildProfileSummary(letterContext);
    letterContext._profileSummary = profileSummary;
    _bd.profileLabel = profileSummary.profileLabel;
    _bd.usedDefaultProfile = (profileSummary.profileLabel === 'st:m hr:m mt:m ct:l en:m');

    var languageTuning = buildLanguageTuning(letterContext.tone, calibration, profileSummary);
    letterContext._languageTuning = languageTuning;
    _bd.languageLabel = languageTuning.label;
    _bd.usedDefaultLanguage = (languageTuning.label === 'w2f2-sbcb');

    var picked = pickLetterFragments(letterContext);

    // Content quality gate (uses tone + calibration rules)
    picked = _validateLetterContent(picked, letterContext);
    if (!picked) {
      _bd.reason = LETTER_DIAG.MISSING_REQUIRED_SECTIONS;
      letterContext._lastDiagnostics = buildPersonalLetterDiagnostics(letterContext, null, policy, _bd);
      letterContext._lastState = resolvePersonalLetterState(policy, null, letterContext._lastDiagnostics);
      return null;
    }

    var text = composePersonalLetter(picked, letterContext);

    // Final text validation — track specific failure reason
    if (typeof text !== 'string') {
      _bd.reason = LETTER_DIAG.COMPOSE_FAILED;
      letterContext._lastDiagnostics = buildPersonalLetterDiagnostics(letterContext, null, policy, _bd);
      letterContext._lastState = resolvePersonalLetterState(policy, null, letterContext._lastDiagnostics);
      return null;
    }
    var rawText = text.replace(/\[Prenume\]/g, '');
    var rawWords = rawText.split(/\s+/).filter(function(w){ return w.length > 0; });
    if (rawWords.length < LETTER_CONFIG.WORD_MIN || rawWords.length > LETTER_CONFIG.WORD_MAX) {
      _bd.reason = LETTER_DIAG.WORD_RANGE_FAILED;
      letterContext._lastDiagnostics = buildPersonalLetterDiagnostics(letterContext, null, policy, _bd);
    }
    if (rawText.length < LETTER_CONFIG.CHAR_MIN) {
      _bd.reason = LETTER_DIAG.CHAR_MIN_FAILED;
      letterContext._lastDiagnostics = buildPersonalLetterDiagnostics(letterContext, null, policy, _bd);
    }

    text = _validateLetterText(text);
    if (!text) {
      if (!_bd.reason) _bd.reason = LETTER_DIAG.VALIDATION_FAILED;
      letterContext._lastDiagnostics = buildPersonalLetterDiagnostics(letterContext, null, policy, _bd);
      letterContext._lastState = resolvePersonalLetterState(policy, null, letterContext._lastDiagnostics);
      return null;
    }

    // Count active sections for meta
    var activeSections = [];
    var secs = LETTER_CONFIG.SECTIONS;
    for (var m = 0; m < secs.length; m++) {
      if (picked[secs[m]] && picked[secs[m]].text) activeSections.push(secs[m]);
    }

    var words = text.split(/\s+/).filter(function(w){ return w.length > 0; });

    // Run audit if all layers available
    var audit = _auditLetterInternal(picked, text, words.length, activeSections,
      letterContext, calibration, profileSummary, languageTuning);

    var result = {
      text: text,
      sections: picked,
      meta: {
        sectionCount: activeSections.length,
        activeSections: activeSections,
        wordCount: words.length,
        route: (letterContext.routeData && letterContext.routeData.route) || 'GENERAL',
        toneLabel: (letterContext.tone && letterContext.tone.label) || 'unknown',
        calibration: calibration,
        profileSummary: profileSummary,
        languageProfile: languageTuning,
        audit: audit,
        diagnostics: null,
        state: null
      }
    };
    // Finalize diagnostics + state with actual result
    result.meta.diagnostics = buildPersonalLetterDiagnostics(letterContext, result, policy, _bd);
    result.meta.state = resolvePersonalLetterState(policy, result, result.meta.diagnostics);
    letterContext._lastDiagnostics = result.meta.diagnostics;
    letterContext._lastState = result.meta.state;

    return result;
  } catch(e) {
    _bd.reason = LETTER_DIAG.EXCEPTION;
    if (letterContext && typeof letterContext === 'object') {
      letterContext._lastDiagnostics = buildPersonalLetterDiagnostics(letterContext, null, policy, _bd);
      letterContext._lastState = resolvePersonalLetterState(policy, null, letterContext._lastDiagnostics);
    }
    return null;
  }
}

// ── composeLetter (B2 API) ──────────────────────────────────────────
// Single entry point matching B2 spec signature.
// Returns { text: string, sections: object, meta: object } or null.
function composeLetter(profile, signals, route, scores, metabolicProfile, safetyTags, answers, completionData) {
  try {
    var routeData = typeof route === 'string' ? { route: route } : (route || {});
    var ctx = buildPersonalLetterContext(profile, signals, routeData, scores, metabolicProfile, safetyTags, answers, completionData);
    return buildPersonalLetter(ctx);
  } catch(e) { return null; }
}

// ── AUDIT / TEST HARNESS ────────────────────────────────────────────
// Deterministic internal validation layer.
// Does NOT affect production flow — read-only diagnostic.

function _auditLetterInternal(picked, text, wordCount, activeSections,
    letterContext, calibration, profileSummary, languageTuning) {
  var sections = LETTER_CONFIG.SECTIONS;
  var required = LETTER_CONFIG.REQUIRED;

  // ── 10 Boolean checks ──────────────────────────────────────────
  // 1. hasAllRequired: all required sections present
  var hasAllRequired = true;
  for (var r = 0; r < required.length; r++) {
    if (!picked[required[r]] || !picked[required[r]].text) { hasAllRequired = false; break; }
  }

  // 2. meetsMinSections: active sections >= MIN_VALID_SECTIONS
  var meetsMinSections = activeSections.length >= LETTER_CONFIG.MIN_VALID_SECTIONS;

  // 3. wordCountInRange
  var wordCountInRange = wordCount >= LETTER_CONFIG.WORD_MIN && wordCount <= LETTER_CONFIG.WORD_MAX;

  // 4. charCountOk
  var charCountOk = (text || '').length >= LETTER_CONFIG.CHAR_MIN;

  // 5. noPlaceholderLeaks: no [Prenume] left in text
  var noPlaceholderLeaks = (text || '').indexOf('[Prenume]') === -1;

  // 6. toneConsistent: tone label matches calibration direction
  var toneConsistent = _checkToneCalibrationConsistency(letterContext.tone, calibration);

  // 7. calibrationValid: all calibration levels in 1-3
  var calibrationValid = _checkCalibrationBounds(calibration);

  // 8. profileSummaryValid: all levels present and valid
  var profileSummaryValid = _checkProfileSummaryValid(profileSummary);

  // 9. languageTuningValid: all fields present
  var languageTuningValid = _checkLanguageTuningValid(languageTuning);

  // 10. noAdjacentDuplicates: no two adjacent sections share opener
  var noAdjacentDuplicates = _checkNoAdjacentDuplicates(picked, sections);

  var checks = {
    hasAllRequired: hasAllRequired,
    meetsMinSections: meetsMinSections,
    wordCountInRange: wordCountInRange,
    charCountOk: charCountOk,
    noPlaceholderLeaks: noPlaceholderLeaks,
    toneConsistent: toneConsistent,
    calibrationValid: calibrationValid,
    profileSummaryValid: profileSummaryValid,
    languageTuningValid: languageTuningValid,
    noAdjacentDuplicates: noAdjacentDuplicates
  };

  // ── 8 Diagnostic stats ─────────────────────────────────────────
  var fragmentIds = [];
  var nullSections = [];
  for (var s = 0; s < sections.length; s++) {
    if (picked[sections[s]] && picked[sections[s]].id) {
      fragmentIds.push(picked[sections[s]].id);
    } else {
      nullSections.push(sections[s]);
    }
  }

  // Max overlap between any adjacent pair
  var maxOverlap = 0;
  var prevText = '';
  for (var o = 0; o < sections.length; o++) {
    if (!picked[sections[o]] || !picked[sections[o]].text) continue;
    var curText = picked[sections[o]].text;
    if (prevText) {
      var ov = _wordOverlap(prevText, curText);
      if (ov > maxOverlap) maxOverlap = ov;
    }
    prevText = curText;
  }

  var stats = {
    totalFragments: fragmentIds.length,
    nullSections: nullSections,
    fragmentIds: fragmentIds,
    maxAdjacentOverlap: Math.round(maxOverlap * 100) / 100,
    calibrationLabel: calibration.label,
    profileLabel: profileSummary.profileLabel,
    languageLabel: languageTuning.label,
    route: (letterContext.routeData && letterContext.routeData.route) || 'GENERAL'
  };

  // ── ok = all checks pass ───────────────────────────────────────
  var ok = true;
  for (var k in checks) {
    if (checks.hasOwnProperty(k) && !checks[k]) { ok = false; break; }
  }

  return { ok: ok, checks: checks, stats: stats };
}

// ── Audit helper: tone ↔ calibration consistency ────────────────────
function _checkToneCalibrationConsistency(tone, cal) {
  if (!tone || !cal) return false;
  // Protective tone should never have high push
  if (tone.vulnerability === 'protective' && cal.pushLevel >= 3) return false;
  // Direct tone should never have high softness + low direction
  if (tone.vulnerability === 'direct' && cal.softnessLevel >= 3 && cal.directionLevel <= 1) return false;
  // Gentle pace should have direction ≤ 2
  if (tone.pace === 'gentle' && cal.directionLevel > 2) return false;
  return true;
}

// ── Audit helper: calibration bounds ────────────────────────────────
function _checkCalibrationBounds(cal) {
  if (!cal) return false;
  var fields = ['softnessLevel', 'directionLevel', 'pushLevel', 'reassuranceLevel', 'structureLevel'];
  for (var i = 0; i < fields.length; i++) {
    var v = cal[fields[i]];
    if (typeof v !== 'number' || v < 1 || v > 3) return false;
  }
  return typeof cal.label === 'string' && cal.label.length > 0;
}

// ── Audit helper: profile summary valid ─────────────────────────────
function _checkProfileSummaryValid(ps) {
  if (!ps) return false;
  var levels = ['stressLevel', 'hormonalLevel', 'metabolicPressureLevel', 'cautionLevel', 'energyPressureLevel'];
  var valid = ['low', 'moderate', 'high'];
  for (var i = 0; i < levels.length; i++) {
    var found = false;
    for (var j = 0; j < valid.length; j++) {
      if (ps[levels[i]] === valid[j]) { found = true; break; }
    }
    if (!found) return false;
  }
  return typeof ps.dominantChallenge === 'string' && ps.dominantChallenge.length > 0;
}

// ── Audit helper: language tuning valid ─────────────────────────────
function _checkLanguageTuningValid(lt) {
  if (!lt) return false;
  if (typeof lt.warmthLevel !== 'number' || lt.warmthLevel < 1 || lt.warmthLevel > 3) return false;
  if (typeof lt.firmnessLevel !== 'number' || lt.firmnessLevel < 1 || lt.firmnessLevel > 3) return false;
  var styles = ['pacingStyle', 'reassuranceStyle', 'actionStyle', 'vocabularyStyle'];
  for (var i = 0; i < styles.length; i++) {
    if (typeof lt[styles[i]] !== 'string' || lt[styles[i]].length === 0) return false;
  }
  return typeof lt.label === 'string' && lt.label.length > 0;
}

// ── Audit helper: no adjacent opener duplication ────────────────────
function _checkNoAdjacentDuplicates(picked, sections) {
  var prevOpener = '';
  for (var i = 0; i < sections.length; i++) {
    if (!picked[sections[i]] || !picked[sections[i]].text) continue;
    var opener = _extractOpener(picked[sections[i]].text);
    if (opener && prevOpener && opener === prevOpener) return false;
    if (opener) prevOpener = opener;
  }
  return true;
}

// ── PUBLIC AUDIT API ────────────────────────────────────────────────
// Standalone function for testing: runs the full letter pipeline + audit.
// Returns { ok, checks, stats } or { ok: false, error: string }

function auditPersonalLetter(letterContext) {
  if (!letterContext) return { ok: false, error: 'no_context', checks: {}, stats: {} };

  try {
    var result = buildPersonalLetter(letterContext);
    if (!result) return { ok: false, error: 'letter_build_failed', checks: {}, stats: {} };
    if (!result.meta || !result.meta.audit) return { ok: false, error: 'audit_missing', checks: {}, stats: {} };
    return result.meta.audit;
  } catch(e) {
    return { ok: false, error: 'exception: ' + (e.message || 'unknown'), checks: {}, stats: {} };
  }
}

// ── DEV HARNESS: Synthetic Profile Generator ────────────────────────
// Generates deterministic test profiles for all 6 routes.
// Returns array of { label, letterContext } for batch testing.

function _generateSyntheticProfiles() {
  var routes = ['POSTPARTUM', 'DIVORCE', 'HORMONAL', 'BURNOUT', 'LOSS', 'GENERAL'];
  var profiles = [];

  for (var r = 0; r < routes.length; r++) {
    var route = routes[r];

    // Base profile per route (moment: 0=PP,1=DIV,2=HOR,3=BURN,4=LOSS,5=GEN)
    var momentMap = { POSTPARTUM:0, DIVORCE:1, HORMONAL:2, BURNOUT:3, LOSS:4, GENERAL:5 };
    var P = { sex: 'F', age: 32, height: 165, weight: 72, targetWeight: 62, activity: 2, moment: momentMap[route] };
    if (route === 'POSTPARTUM') { P.postpartum = true; P.age = 29; }
    if (route === 'DIVORCE') { P.divorce = true; P.age = 37; }
    if (route === 'HORMONAL') { P.hormonal = true; P.age = 44; }
    if (route === 'BURNOUT') { P.age = 35; }
    if (route === 'LOSS') { P.loss = true; P.age = 40; }

    // Base answers — moderate stress, moderate activity
    var A = {
      q5: 1, q6: 1, q8: 2, q9: [0,1], q10: [0], q12: [0,1], q13: 2,
      q14: 2, q15: 1, q16: 2, q17: 1, q18: [0], q19: 2, q20: [0], q21: 7
    };

    // Route-specific answer adjustments
    if (route === 'BURNOUT') { A.q5 = 3; A.q6 = 3; A.q8 = 1; A.q21 = 5; }
    if (route === 'LOSS') { A.q5 = 2; A.q21 = 4; A.q15 = 0; }
    if (route === 'POSTPARTUM') { A.q5 = 3; A.q8 = 1; }
    if (route === 'HORMONAL') { A.q14 = 3; }

    var signals = (typeof interpretSignals === 'function') ? interpretSignals(P, A) : {};
    var routeData = (typeof resolveRoute === 'function') ? resolveRoute(P, signals) : { route: route };
    var stress = (typeof calcStressScore === 'function') ? calcStressScore(A) : 50;
    var hormonal = (typeof calcHormonalScore === 'function') ? calcHormonalScore(P, A) : 40;
    var scores = { stress: stress, hormonal: hormonal };
    var metaProf = (typeof getMetabolicProfile === 'function') ? getMetabolicProfile(P, A) : null;
    var tags = (typeof getSafetyTags === 'function') ? getSafetyTags(P, signals) : [];
    var tone = resolveToneProfile(P, signals, routeData, scores);
    var ctx = buildPersonalLetterContext(P, signals, routeData, scores, metaProf, tags, A, {}, tone);

    profiles.push({ label: route, letterContext: ctx });
  }

  return profiles;
}

// ── DEV HARNESS: Batch Audit ────────────────────────────────────────
// Runs audit on all 6 synthetic profiles. Returns summary.
// Usage: var results = runLetterAuditBatch();

function runLetterAuditBatch() {
  var profiles = _generateSyntheticProfiles();
  var results = [];
  var allOk = true;
  var policyAllowed = 0;
  var policyBlocked = 0;
  var policyReasons = [];
  var diagCounts = {};
  var stateCounts = {};

  for (var i = 0; i < profiles.length; i++) {
    var pol = getPersonalLetterPolicy(profiles[i].letterContext);
    if (pol.allowed) { policyAllowed++; } else {
      policyBlocked++;
      policyReasons.push({ route: profiles[i].label, reason: pol.reason });
    }
    var audit = auditPersonalLetter(profiles[i].letterContext);
    if (!audit.ok) allOk = false;

    // Collect diagnostics + state from context
    var diag = profiles[i].letterContext._lastDiagnostics || null;
    var stateObj = profiles[i].letterContext._lastState || null;
    var outcome = diag ? diag.outcome : (pol.allowed ? 'unknown' : LETTER_DIAG.POLICY_BLOCKED);
    var stateVal = stateObj ? stateObj.state : 'unknown';
    diagCounts[outcome] = (diagCounts[outcome] || 0) + 1;
    stateCounts[stateVal] = (stateCounts[stateVal] || 0) + 1;

    results.push({
      route: profiles[i].label,
      ok: audit.ok,
      error: audit.error || null,
      policyAllowed: pol.allowed,
      policyReason: pol.reason,
      diagnosticOutcome: outcome,
      state: stateVal,
      checks: audit.checks,
      stats: audit.stats
    });
  }

  return {
    allOk: allOk,
    results: results,
    policy: { allowed: policyAllowed, blocked: policyBlocked, blockedReasons: policyReasons },
    diagnostics: { outcomeCounts: diagCounts },
    states: { counts: stateCounts }
  };
}

// ── SNAPSHOT LAYER ──────────────────────────────────────────────────
// Deterministic baseline snapshot for regression comparison.
// No external libs. No UI impact. No render path cost.

// Deterministic text fingerprint: sum-based hash of char codes + length
function _textFingerprint(text) {
  if (typeof text !== 'string' || text.length === 0) return '0:0:0';
  var sum = 0;
  var xor = 0;
  for (var i = 0; i < text.length; i++) {
    var c = text.charCodeAt(i);
    sum = (sum + c * (i + 1)) & 0x7FFFFFFF;
    xor = (xor ^ (c << (i % 16))) & 0x7FFFFFFF;
  }
  return text.length + ':' + sum.toString(36) + ':' + xor.toString(36);
}

// Create a compact snapshot signature from a buildPersonalLetter result
function createLetterSnapshot(result) {
  if (!result || !result.text || !result.meta) {
    return null;
  }

  var meta = result.meta;
  var sections = LETTER_CONFIG.SECTIONS;
  var sectionKeys = [];
  var fragmentIds = [];

  for (var i = 0; i < sections.length; i++) {
    var sec = sections[i];
    if (result.sections && result.sections[sec] && result.sections[sec].text) {
      sectionKeys.push(sec);
      if (result.sections[sec].id) fragmentIds.push(result.sections[sec].id);
    }
  }

  return {
    route: meta.route || 'GENERAL',
    sectionKeys: sectionKeys,
    fragmentIds: fragmentIds,
    wordCount: meta.wordCount || 0,
    charCount: result.text.length,
    calibrationLabel: (meta.calibration && meta.calibration.label) || '',
    profileLabel: (meta.profileSummary && meta.profileSummary.profileLabel) || '',
    languageLabel: (meta.languageProfile && meta.languageProfile.label) || '',
    auditOk: (meta.audit && meta.audit.ok) || false,
    textFingerprint: _textFingerprint(result.text)
  };
}

// Compare two snapshots — returns { equal, diffs[] }
function compareLetterSnapshots(a, b) {
  if (!a && !b) return { equal: true, diffs: [] };
  if (!a || !b) return { equal: false, diffs: [{ field: '_null', a: !!a, b: !!b }] };

  var diffs = [];

  // Scalar fields
  var scalars = ['route', 'wordCount', 'charCount', 'calibrationLabel', 'profileLabel', 'languageLabel', 'auditOk', 'textFingerprint'];
  for (var i = 0; i < scalars.length; i++) {
    var f = scalars[i];
    if (a[f] !== b[f]) {
      diffs.push({ field: f, a: a[f], b: b[f] });
    }
  }

  // Array fields — order-sensitive comparison
  var arrays = ['sectionKeys', 'fragmentIds'];
  for (var j = 0; j < arrays.length; j++) {
    var af = arrays[j];
    var arrA = a[af] || [];
    var arrB = b[af] || [];
    if (arrA.length !== arrB.length) {
      diffs.push({ field: af, a: arrA.join(','), b: arrB.join(',') });
    } else {
      var arrDiff = false;
      for (var k = 0; k < arrA.length; k++) {
        if (arrA[k] !== arrB[k]) { arrDiff = true; break; }
      }
      if (arrDiff) {
        diffs.push({ field: af, a: arrA.join(','), b: arrB.join(',') });
      }
    }
  }

  return { equal: diffs.length === 0, diffs: diffs };
}

// Batch baseline: one snapshot per synthetic route
function runLetterSnapshotBaseline() {
  var profiles = _generateSyntheticProfiles();
  var snapshots = [];
  var allOk = true;

  for (var i = 0; i < profiles.length; i++) {
    var result = buildPersonalLetter(profiles[i].letterContext);
    var snap = result ? createLetterSnapshot(result) : null;
    if (!snap) allOk = false;
    snapshots.push({
      route: profiles[i].label,
      snapshot: snap
    });
  }

  return { ok: allOk, total: snapshots.length, snapshots: snapshots };
}

// ── EDGE-CASE MATRIX ────────────────────────────────────────────────
// Deterministic stress-test matrix for Personal Letter subsystem.
// No UI impact. No render path cost. Offline validation only.

function _buildEdgeCaseMatrix() {
  // Moment map for route resolution
  var MOM = { POSTPARTUM:0, DIVORCE:1, HORMONAL:2, BURNOUT:3, LOSS:4, GENERAL:5 };

  // Helper: build a full valid context for a route with answer overrides
  function _mkCtx(route, profileOverrides, answerOverrides, signalHints) {
    var P = { sex:'F', age:32, height:165, weight:72, targetWeight:62, activity:2, moment:MOM[route] || 5 };
    for (var pk in (profileOverrides || {})) { if (profileOverrides.hasOwnProperty(pk)) P[pk] = profileOverrides[pk]; }
    var A = { q5:1, q6:1, q8:2, q9:[0,1], q10:[0], q12:[0,1], q13:2, q14:2, q15:1, q16:2, q17:1, q18:[0], q19:2, q20:[0], q21:7 };
    for (var ak in (answerOverrides || {})) { if (answerOverrides.hasOwnProperty(ak)) A[ak] = answerOverrides[ak]; }
    var sig = (typeof interpretSignals === 'function') ? interpretSignals(P, A) : (signalHints || {});
    var rd = (typeof resolveRoute === 'function') ? resolveRoute(P, sig) : { route: route };
    var stress = (typeof calcStressScore === 'function') ? calcStressScore(A) : 50;
    var horm = (typeof calcHormonalScore === 'function') ? calcHormonalScore(P, A) : 40;
    var scores = { stress: stress, hormonal: horm };
    var metaProf = (typeof getMetabolicProfile === 'function') ? getMetabolicProfile(P, A) : null;
    var tags = (typeof getSafetyTags === 'function') ? getSafetyTags(P, sig) : [];
    var tone = resolveToneProfile(P, sig, rd, scores);
    return buildPersonalLetterContext(P, sig, rd, scores, metaProf, tags, A, {}, tone);
  }

  return [
    // EC1: null context
    { id: 'ec_null', ctx: null, expectsLetter: false, notes: ['null input — must return null safely'] },

    // EC2: empty object context
    { id: 'ec_empty_obj', ctx: {}, expectsLetter: false, notes: ['empty object — no route, no signals'] },

    // EC3: missing scores (scores set to empty)
    { id: 'ec_no_scores', ctx: (function(){
      var c = _mkCtx('GENERAL', {}, {});
      c.scores = {};
      return c;
    })(), expectsLetter: true, notes: ['missing scores — defaults should activate'] },

    // EC4: missing safety tags (null)
    { id: 'ec_no_tags', ctx: (function(){
      var c = _mkCtx('GENERAL', {}, {});
      c.safetyTags = null;
      return c;
    })(), expectsLetter: true, notes: ['null safety tags — should fallback safely'] },

    // EC5: minimal viable context — bare minimum fields
    { id: 'ec_minimal', ctx: (function(){
      return {
        profile: { sex:'F', age:30, moment:5 },
        signals: {},
        routeData: { route:'GENERAL' },
        scores: { stress:30, hormonal:20 },
        metabolicProfile: null,
        safetyTags: [],
        answers: { q5:1, q6:1, q8:2, q9:[0], q10:[0], q12:[0], q13:2, q14:1, q15:1, q16:2, q17:0, q18:[0], q19:2, q20:[0], q21:7 },
        completion: {},
        tone: { vulnerability:'direct', pace:'structured', motivation:'coaching', label:'direct-structured-coaching' },
        derived: { hasLimitations:false, hasMedical:false, isEmotionalEater:false, manyDiets:false, lowWater:false, poorSleep:false, highStress:false, modStress:false, highHormonal:false, beginner:false, lowTime:false, highMotiv:false, lowMotiv:false }
      };
    })(), expectsLetter: true, notes: ['minimal viable — all defaults, GENERAL route'] },

    // EC6: high stress + high readiness conflict
    { id: 'ec_stress_readiness', ctx: _mkCtx('GENERAL', {}, { q5:3, q6:3, q21:10, q13:3, q8:3 }),
      expectsLetter: true, notes: ['stress caps push despite high readiness'] },

    // EC7: high shame + high motivation conflict
    { id: 'ec_shame_motiv', ctx: _mkCtx('GENERAL', {}, { q15:0, q17:4, q21:10, q13:3 }),
      expectsLetter: true, notes: ['shame reduces push despite high motivation'] },

    // EC8: hormonal high + energy low
    { id: 'ec_hormonal_energy', ctx: _mkCtx('HORMONAL', {}, { q14:3, q5:3, q8:1, q6:3 }),
      expectsLetter: true, notes: ['hormonal route + exhaustion signals'] },

    // EC9: protective route (LOSS) + high momentum answers
    { id: 'ec_loss_momentum', ctx: _mkCtx('LOSS', { loss:true }, { q21:10, q13:3, q8:3 }),
      expectsLetter: true, notes: ['LOSS route overrides momentum — softness floor'] },

    // EC10: POSTPARTUM + overwhelmed + high shame
    { id: 'ec_pp_overwhelm_shame', ctx: _mkCtx('POSTPARTUM', { postpartum:true }, { q5:3, q6:3, q8:0, q15:0, q17:4, q21:3 }),
      expectsLetter: true, notes: ['triple protective signal stack'] },

    // EC11: all zeros answers (extreme low)
    { id: 'ec_all_zeros', ctx: _mkCtx('GENERAL', {}, { q5:0, q6:0, q8:0, q13:0, q14:0, q15:2, q16:0, q17:0, q19:0, q21:1 }),
      expectsLetter: true, notes: ['minimal engagement — low everything'] },

    // EC12: all max answers (extreme high)
    { id: 'ec_all_max', ctx: _mkCtx('GENERAL', {}, { q5:3, q6:3, q8:3, q13:3, q14:3, q15:0, q16:3, q17:4, q19:3, q21:10 }),
      expectsLetter: true, notes: ['max all signals — conflict resolution stress test'] },

    // EC13: missing derived (force recalc path)
    { id: 'ec_no_derived', ctx: (function(){
      var c = _mkCtx('GENERAL', {}, {});
      c.derived = null;
      return c;
    })(), expectsLetter: true, notes: ['null derived — calibration should use defaults'] },

    // EC14: missing tone (policy blocks — insufficient data)
    { id: 'ec_no_tone', ctx: (function(){
      var c = _mkCtx('DIVORCE', { divorce:true }, {});
      c.tone = null;
      return c;
    })(), expectsLetter: false, notes: ['null tone — policy blocks as insufficient_data'] },

    // EC15: BURNOUT + max stress + low motivation
    { id: 'ec_burnout_extreme', ctx: _mkCtx('BURNOUT', {}, { q5:3, q6:3, q8:0, q21:2, q13:0, q15:0, q17:4 }),
      expectsLetter: true, notes: ['extreme burnout — max protection expected'] }
  ];
}

// ── EDGE-CASE RUNNER ────────────────────────────────────────────────

function runLetterEdgeCaseMatrix() {
  var matrix = _buildEdgeCaseMatrix();
  var passed = 0;
  var failed = 0;
  var cases = [];

  for (var i = 0; i < matrix.length; i++) {
    var ec = matrix[i];
    var caseResult = _runSingleEdgeCase(ec);
    if (caseResult.ok) passed++; else failed++;
    cases.push(caseResult);
  }

  return {
    ok: failed === 0,
    total: matrix.length,
    passed: passed,
    failed: failed,
    cases: cases
  };
}

function _runSingleEdgeCase(ec) {
  var notes = (ec.notes || []).slice();
  var result = null;
  var crashed = false;

  // 1. No crash
  try {
    result = buildPersonalLetter(ec.ctx);
  } catch(e) {
    crashed = true;
    notes.push('CRASH: ' + (e.message || 'unknown'));
  }

  var hasLetter = result !== null && typeof result === 'object' && typeof result.text === 'string';
  var auditOk = null;
  var snapshot = null;
  var ok = true;

  // 2. Expectation: letter present/absent
  if (ec.expectsLetter && !hasLetter) {
    ok = false;
    notes.push('FAIL: expected letter but got null');
  }
  if (!ec.expectsLetter && hasLetter) {
    ok = false;
    notes.push('FAIL: expected null but got letter');
  }

  // 3. Crash = fail
  if (crashed) {
    ok = false;
  }

  // 4. When letter exists: validate shape + meta + no placeholder leaks
  if (hasLetter) {
    // Shape
    if (typeof result.sections !== 'object') { ok = false; notes.push('FAIL: sections not object'); }
    if (!result.meta || typeof result.meta !== 'object') { ok = false; notes.push('FAIL: meta missing'); }

    // No placeholder leaks
    if (result.text.indexOf('[Prenume]') !== -1) { ok = false; notes.push('FAIL: placeholder leak'); }

    // Meta integrity
    if (result.meta) {
      if (typeof result.meta.sectionCount !== 'number') { ok = false; notes.push('FAIL: sectionCount missing'); }
      if (!result.meta.calibration) { ok = false; notes.push('FAIL: calibration missing'); }
      if (!result.meta.profileSummary) { ok = false; notes.push('FAIL: profileSummary missing'); }
      if (!result.meta.languageProfile) { ok = false; notes.push('FAIL: languageProfile missing'); }
    }

    // Audit
    auditOk = (result.meta && result.meta.audit) ? result.meta.audit.ok : null;

    // Snapshot
    try { snapshot = createLetterSnapshot(result); } catch(e) { snapshot = null; }
  }

  // 5. Determinism: run again, compare
  if (!crashed && ec.ctx !== null) {
    try {
      var result2 = buildPersonalLetter(ec.ctx);
      var hasLetter2 = result2 !== null && typeof result2 === 'object' && typeof result2.text === 'string';
      if (hasLetter !== hasLetter2) { ok = false; notes.push('FAIL: non-deterministic presence'); }
      if (hasLetter && hasLetter2) {
        var snap2 = createLetterSnapshot(result2);
        if (snapshot && snap2) {
          var cmp = compareLetterSnapshots(snapshot, snap2);
          if (!cmp.equal) { ok = false; notes.push('FAIL: non-deterministic output'); }
        }
      }
    } catch(e) {
      // Second run crash is also a fail
      ok = false;
      notes.push('FAIL: second run crashed');
    }
  }

  return {
    id: ec.id,
    ok: ok,
    expectsLetter: ec.expectsLetter,
    hasLetter: hasLetter,
    auditOk: auditOk,
    snapshot: snapshot,
    notes: notes
  };
}

// ── RELEASE READINESS GATE ──────────────────────────────────────────
// Aggregates all Personal Letter validations into one deterministic verdict.
// No UI impact. No render path cost. Offline release validation only.

var PERSONAL_LETTER_VERSION = 'PL-1.0.0-3L';

function runPersonalLetterReleaseGate() {
  var checks = {
    auditBatch: false,
    snapshotBaseline: false,
    edgeCases: false,
    deterministic: false,
    shapeValid: false,
    placeholderClean: false,
    routesValid: false
  };
  var stats = {
    totalRoutes: 0,
    totalEdgeCases: 0,
    passedEdgeCases: 0,
    failedEdgeCases: 0,
    snapshotCount: 0
  };
  var details = {};

  // ── 1. Audit batch ──────────────────────────────────────────────
  try {
    var audit = runLetterAuditBatch();
    details.audit = audit;
    checks.auditBatch = audit.allOk === true;
    stats.totalRoutes = audit.results ? audit.results.length : 0;
  } catch(e) {
    details.audit = { error: e.message || 'crash' };
  }

  // ── 2. Snapshot baseline ────────────────────────────────────────
  try {
    var snaps = runLetterSnapshotBaseline();
    details.snapshots = snaps;
    checks.snapshotBaseline = snaps.ok === true;
    stats.snapshotCount = snaps.total || 0;
  } catch(e) {
    details.snapshots = { error: e.message || 'crash' };
  }

  // ── 3. Edge-case matrix ─────────────────────────────────────────
  try {
    var edge = runLetterEdgeCaseMatrix();
    details.edgeCases = edge;
    checks.edgeCases = edge.ok === true;
    stats.totalEdgeCases = edge.total || 0;
    stats.passedEdgeCases = edge.passed || 0;
    stats.failedEdgeCases = edge.failed || 0;
  } catch(e) {
    details.edgeCases = { error: e.message || 'crash' };
  }

  // ── 4. Determinism: run baseline twice, compare ─────────────────
  try {
    var snaps2 = runLetterSnapshotBaseline();
    var detOk = true;
    if (details.snapshots && details.snapshots.snapshots && snaps2.snapshots) {
      var s1 = details.snapshots.snapshots;
      var s2 = snaps2.snapshots;
      for (var d = 0; d < s1.length; d++) {
        if (!s1[d].snapshot && !s2[d].snapshot) continue;
        if (!s1[d].snapshot || !s2[d].snapshot) { detOk = false; break; }
        var cmp = compareLetterSnapshots(s1[d].snapshot, s2[d].snapshot);
        if (!cmp.equal) { detOk = false; break; }
      }
    } else {
      detOk = false;
    }
    checks.deterministic = detOk;
  } catch(e) {
    checks.deterministic = false;
  }

  // ── 5. Shape validation: all successful routes have valid shape ──
  try {
    var profiles = _generateSyntheticProfiles();
    var shapeOk = true;
    for (var sv = 0; sv < profiles.length; sv++) {
      var lr = buildPersonalLetter(profiles[sv].letterContext);
      if (!lr) { shapeOk = false; continue; }
      if (typeof lr.text !== 'string' ||
          typeof lr.sections !== 'object' ||
          !lr.meta ||
          typeof lr.meta.sectionCount !== 'number' ||
          !Array.isArray(lr.meta.activeSections) ||
          typeof lr.meta.wordCount !== 'number' ||
          !lr.meta.calibration ||
          !lr.meta.profileSummary ||
          !lr.meta.languageProfile ||
          !lr.meta.audit) {
        shapeOk = false;
      }
    }
    checks.shapeValid = shapeOk;
  } catch(e) {
    checks.shapeValid = false;
  }

  // ── 6. Placeholder clean: no [Prenume] in any route output ──────
  try {
    var profiles2 = _generateSyntheticProfiles();
    var plOk = true;
    for (var pc = 0; pc < profiles2.length; pc++) {
      var lr2 = buildPersonalLetter(profiles2[pc].letterContext);
      if (lr2 && lr2.text && lr2.text.indexOf('[Prenume]') !== -1) {
        plOk = false;
      }
    }
    checks.placeholderClean = plOk;
  } catch(e) {
    checks.placeholderClean = false;
  }

  // ── 7. All routes valid: every synthetic route produces a letter ─
  try {
    var profiles3 = _generateSyntheticProfiles();
    var rvOk = true;
    for (var rv = 0; rv < profiles3.length; rv++) {
      var lr3 = buildPersonalLetter(profiles3[rv].letterContext);
      if (!lr3 || !lr3.text) { rvOk = false; }
    }
    checks.routesValid = rvOk;
  } catch(e) {
    checks.routesValid = false;
  }

  // ── 8. Contract integrity ─────────────────────────────────────────
  try {
    var contract = checkPersonalLetterContract();
    details.contract = contract;
    checks.contractIntact = contract.ok === true;
  } catch(e) {
    details.contract = { error: e.message || 'crash' };
    checks.contractIntact = false;
  }

  // ── 9. Manifest validity ────────────────────────────────────────
  try {
    var manifest = checkPersonalLetterManifest();
    details.manifest = manifest;
    checks.manifestValid = manifest.ok === true;
  } catch(e) {
    details.manifest = { error: e.message || 'crash' };
    checks.manifestValid = false;
  }

  // ── Aggregate ───────────────────────────────────────────────────
  var allOk = true;
  for (var k in checks) {
    if (checks.hasOwnProperty(k) && !checks[k]) { allOk = false; break; }
  }

  return {
    ok: allOk,
    version: PERSONAL_LETTER_VERSION,
    featureEnabled: PERSONAL_LETTER_ENABLED,
    checks: checks,
    stats: stats,
    details: details
  };
}

// ── INTERNAL API CONTRACT ───────────────────────────────────────────
// Centralized set of approved entry points for Personal Letter subsystem.
// All external/render code should use these. Private helpers are internal.

var PERSONAL_LETTER_API = {
  version: PERSONAL_LETTER_VERSION,
  build: buildPersonalLetter,
  buildContext: buildPersonalLetterContext,
  audit: auditPersonalLetter,
  snapshot: createLetterSnapshot,
  compareSnapshots: compareLetterSnapshots,
  runBaseline: runLetterSnapshotBaseline,
  runEdgeCases: runLetterEdgeCaseMatrix,
  runReleaseGate: runPersonalLetterReleaseGate,
  getPolicy: getPersonalLetterPolicy,
  resolveState: resolvePersonalLetterState,
  getDiagnostics: buildPersonalLetterDiagnostics,
  canUse: canUsePersonalLetter
};

// Contract self-check: verifies all required API members exist and are callable.
function checkPersonalLetterContract() {
  var required = [
    { name: 'build', type: 'function' },
    { name: 'buildContext', type: 'function' },
    { name: 'audit', type: 'function' },
    { name: 'snapshot', type: 'function' },
    { name: 'compareSnapshots', type: 'function' },
    { name: 'runBaseline', type: 'function' },
    { name: 'runEdgeCases', type: 'function' },
    { name: 'runReleaseGate', type: 'function' },
    { name: 'getPolicy', type: 'function' },
    { name: 'resolveState', type: 'function' },
    { name: 'getDiagnostics', type: 'function' },
    { name: 'canUse', type: 'function' },
    { name: 'version', type: 'string' }
  ];

  var missing = [];
  var invalid = [];
  for (var i = 0; i < required.length; i++) {
    var r = required[i];
    if (PERSONAL_LETTER_API[r.name] === undefined) {
      missing.push(r.name);
    } else if (typeof PERSONAL_LETTER_API[r.name] !== r.type) {
      invalid.push({ name: r.name, expected: r.type, actual: typeof PERSONAL_LETTER_API[r.name] });
    }
  }

  var ok = missing.length === 0 && invalid.length === 0;
  return {
    ok: ok,
    version: PERSONAL_LETTER_API.version || 'unknown',
    totalMembers: required.length,
    presentMembers: required.length - missing.length,
    missing: missing,
    invalid: invalid
  };
}

// ── SUBSYSTEM MANIFEST ──────────────────────────────────────────────
// Single source of truth for Personal Letter subsystem boundary.

var PERSONAL_LETTER_MANIFEST = {
  name: 'PersonalLetter',
  version: PERSONAL_LETTER_VERSION,
  featureEnabled: PERSONAL_LETTER_ENABLED,
  renderTargets: ['complet_results'],
  states: [
    LETTER_STATE.DISABLED,
    LETTER_STATE.BLOCKED,
    LETTER_STATE.INVALID,
    LETTER_STATE.BUILT,
    LETTER_STATE.EXCEPTION
  ],
  api: [
    'build', 'buildContext', 'audit', 'snapshot', 'compareSnapshots',
    'runBaseline', 'runEdgeCases', 'runReleaseGate', 'getPolicy',
    'resolveState', 'getDiagnostics', 'canUse'
  ],
  validations: [
    'auditBatch', 'snapshotBaseline', 'edgeCases', 'determinism',
    'shapeValid', 'placeholderClean', 'routesValid', 'contractIntact'
  ],
  contracts: ['LETTER_CONFIG', 'LETTER_STATE', 'LETTER_DIAG', 'PERSONAL_LETTER_API'],
  releaseGate: true
};

// Manifest self-check: verifies manifest consistency with actual subsystem.
function checkPersonalLetterManifest() {
  var errors = [];

  // 1. Manifest exists and has required fields
  if (typeof PERSONAL_LETTER_MANIFEST !== 'object') {
    return { ok: false, errors: ['manifest_missing'] };
  }
  if (!PERSONAL_LETTER_MANIFEST.version) errors.push('no_version');
  if (!PERSONAL_LETTER_MANIFEST.name) errors.push('no_name');

  // 2. States align with LETTER_STATE
  var stateVals = PERSONAL_LETTER_MANIFEST.states || [];
  var actualStates = [LETTER_STATE.DISABLED, LETTER_STATE.BLOCKED, LETTER_STATE.INVALID, LETTER_STATE.BUILT, LETTER_STATE.EXCEPTION];
  for (var s = 0; s < actualStates.length; s++) {
    var found = false;
    for (var si = 0; si < stateVals.length; si++) {
      if (stateVals[si] === actualStates[s]) { found = true; break; }
    }
    if (!found) errors.push('missing_state:' + actualStates[s]);
  }

  // 3. API list aligns with PERSONAL_LETTER_API
  var apiList = PERSONAL_LETTER_MANIFEST.api || [];
  for (var a = 0; a < apiList.length; a++) {
    if (typeof PERSONAL_LETTER_API[apiList[a]] === 'undefined') {
      errors.push('api_not_found:' + apiList[a]);
    }
  }

  // 4. Release gate availability
  if (PERSONAL_LETTER_MANIFEST.releaseGate && typeof runPersonalLetterReleaseGate !== 'function') {
    errors.push('release_gate_missing');
  }

  // 5. Contracts exist
  var contractNames = PERSONAL_LETTER_MANIFEST.contracts || [];
  var contractRefs = { LETTER_CONFIG: typeof LETTER_CONFIG, LETTER_STATE: typeof LETTER_STATE, LETTER_DIAG: typeof LETTER_DIAG, PERSONAL_LETTER_API: typeof PERSONAL_LETTER_API };
  for (var c = 0; c < contractNames.length; c++) {
    if (contractRefs[contractNames[c]] !== 'object') {
      errors.push('contract_missing:' + contractNames[c]);
    }
  }

  return {
    ok: errors.length === 0,
    name: PERSONAL_LETTER_MANIFEST.name,
    version: PERSONAL_LETTER_MANIFEST.version,
    stateCount: stateVals.length,
    apiCount: apiList.length,
    validationCount: (PERSONAL_LETTER_MANIFEST.validations || []).length,
    contractCount: contractNames.length,
    errors: errors
  };
}

// ── MODULE CLOSURE ──────────────────────────────────────────────────
// Official closure report for Personal Letter subsystem.
// Relies on existing release gate, manifest, and contract checks.

function getPersonalLetterModuleClosure() {
  var checksResult = { releaseGate: false, manifest: false, contract: false };
  var gateOk = false;

  // 1. Release gate (runs all sub-validations)
  try {
    var gate = runPersonalLetterReleaseGate();
    gateOk = gate.ok === true;
    checksResult.releaseGate = gateOk;
  } catch(e) {
    checksResult.releaseGate = false;
  }

  // 2. Manifest
  try {
    var mf = checkPersonalLetterManifest();
    checksResult.manifest = mf.ok === true;
  } catch(e) {
    checksResult.manifest = false;
  }

  // 3. Contract
  try {
    var ct = checkPersonalLetterContract();
    checksResult.contract = ct.ok === true;
  } catch(e) {
    checksResult.contract = false;
  }

  var productionReady = checksResult.releaseGate && checksResult.manifest && checksResult.contract;

  return {
    ok: productionReady,
    name: PERSONAL_LETTER_MANIFEST.name,
    version: PERSONAL_LETTER_MANIFEST.version,
    featureEnabled: !!PERSONAL_LETTER_ENABLED,
    renderTargets: PERSONAL_LETTER_MANIFEST.renderTargets,
    productionReady: productionReady,
    checks: checksResult,
    summary: {
      states: PERSONAL_LETTER_MANIFEST.states,
      api: PERSONAL_LETTER_MANIFEST.api,
      validations: PERSONAL_LETTER_MANIFEST.validations,
      contracts: PERSONAL_LETTER_MANIFEST.contracts
    }
  };
}
