// =============================================================================
// CYB RENDER — Step-type renderers (split from monolithic render())
// Requires: COPY, UI, R_UI, U_UI, emoMessages, CYB_Calc, CYB_Engine_STABLE,
//           CYB_Steps (STEPS_MINI, STEPS_COMPLET, buildVisible, totalQ, curQ,
//           _transBlockMap), and STATE + helpers from the runtime.
// =============================================================================

// ── HTML safety for user-generated / fragment text ──────────────────
function _escLetterHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Safe name: returns escaped name or empty string (never raw placeholder) ─
function _safeName(name) {
  var n = (typeof name === 'string') ? name.trim() : '';
  if (!n || n === '[Prenume]') return '';
  return _escLetterHtml(n);
}

function renderWelcome(s, P, btn, resetHtml) {
  btn.textContent = UI.buttons.start;
  var w = UI.welcome;
  return '<div class="slide active"><div class="welcome">' +
    '<h1>' + w.heading + '</h1>' +
    '<p>' + w.subtitle + '</p>' +
    '<div class="preview-box">' +
      '<h3>' + w.freeHeading + '</h3>' +
      w.freeItems.map(function(i) { return '<div class="preview-item"><span class="dot dot-green"></span> ' + i + '</div>' }).join('') +
      '<div style="height:1px;background:rgba(255,255,255,0.06);margin:10px 0"></div>' +
      '<h3 style="color:var(--gold)">' + w.blurHeading + '</h3>' +
      w.blurItems.map(function(i) { return '<div class="preview-item"><span class="dot dot-blur"></span> ' + i + '</div>' }).join('') +
    '</div>' +
    resetHtml +
  '</div></div>';
}

function renderTextInput(s, P, btn) {
  btn.textContent = UI.buttons.next;
  btn.disabled = !P[s.id];
  return '<div class="slide active">' +
    '<div class="q-label">' + (s.label || '') + '</div>' +
    '<div class="q-title">' + (s.title || '') + '</div>' +
    '<div class="q-sub">' + (s.sub || '') + '</div>' +
    '<input class="text-input" type="text" placeholder="' + (s.ph || '') + '" value="' + (P[s.id] || '') + '" aria-label="' + (s.title || s.id) + '" oninput="STATE.profile[\'' + s.id + '\']=this.value;document.getElementById(\'btnNext\').disabled=!this.value.trim();showEmo(\'' + s.id + '\')">' +
    '<div class="emo-msg ' + (P[s.id] ? 'show' : '') + '" id="emo">' + (P[s.id] && emoMessages[s.id] ? emoMessages[s.id](P) : '') + '</div>' +
  '</div>';
}

function renderNumberInput(s, P, btn) {
  btn.textContent = UI.buttons.next;
  var nVal = P[s.id];
  var isValid = typeof nVal === 'number' && !isNaN(nVal) && (s.min === undefined || nVal >= s.min) && (s.max === undefined || nVal <= s.max);
  btn.disabled = !isValid;
  return '<div class="slide active">' +
    '<div class="q-label">' + (s.label || '') + '</div>' +
    '<div class="q-title">' + (s.title || '') + '</div>' +
    '<div class="q-sub">' + (s.sub || '') + '</div>' +
    '<input class="number-input" type="number" placeholder="' + (s.ph || '') + '" min="' + (s.min || '') + '" max="' + (s.max || '') + '" value="' + (P[s.id] || '') + '" aria-label="' + (s.title || s.id) + '" oninput="var v=parseInt(this.value);STATE.profile[\'' + s.id + '\']=isNaN(v)?undefined:v;var ok=!isNaN(v)' + (s.min !== undefined ? '&&v>=' + s.min : '') + (s.max !== undefined ? '&&v<=' + s.max : '') + ';document.getElementById(\'btnNext\').disabled=!ok;if(ok)showEmo(\'' + s.id + '\')">' +
    '<div class="emo-msg" id="emo"></div>' +
  '</div>';
}

function renderMeasures(s, P, btn) {
  btn.textContent = UI.buttons.next;
  btn.disabled = !(P.height && P.weight);
  return '<div class="slide active">' +
    '<div class="q-label">' + s.label + '</div>' +
    '<div class="q-title">' + s.title + '</div>' +
    '<div class="q-sub">' + s.sub + '</div>' +
    '<div class="number-row">' +
      '<div class="number-group"><label>' + UI.measures.heightLabel + '</label><input class="number-input" type="number" placeholder="165" value="' + (P.height || '') + '" oninput="STATE.profile.height=parseFloat(this.value);checkMeasures()"></div>' +
      '<div class="number-group"><label>' + UI.measures.weightLabel + '</label><input class="number-input" type="number" placeholder="72" value="' + (P.weight || '') + '" oninput="STATE.profile.weight=parseFloat(this.value);checkMeasures()"></div>' +
    '</div>' +
    '<div class="emo-msg" id="emo"></div>' +
  '</div>';
}

function renderActivity(s, P, btn) {
  btn.textContent = UI.buttons.next;
  btn.disabled = P.activity === undefined;
  var acts = ['Sedentară — birou, mașină, canapea', 'Ușor activă — mers pe jos ocazional', 'Moderat activă — mișcare 2-3x/săpt.', 'Foarte activă — sport zilnic'];
  return '<div class="slide active">' +
    '<div class="q-label">' + s.label + '</div>' +
    '<div class="q-title">' + s.title + '</div>' +
    '<div class="q-sub">' + s.sub + '</div>' +
    '<div class="activity-opts">' + acts.map(function(a, i) { return '<div class="activity-opt ' + (P.activity === i ? 'selected' : '') + '" role="button" tabindex="0" onclick="STATE.profile.activity=' + i + ';render()">' + a + '</div>' }).join('') + '</div>' +
    '<div class="emo-msg ' + (P.activity !== undefined ? 'show' : '') + '" id="emo">' + (P.activity !== undefined && emoMessages.activity ? emoMessages.activity(P) : '') + '</div>' +
  '</div>';
}

function renderCards(s, P, btn) {
  btn.textContent = UI.buttons.next;
  btn.disabled = P[s.id] === undefined;
  return '<div class="slide active">' +
    '<div class="q-label">' + s.label + '</div>' +
    '<div class="q-title">' + s.title + '</div>' +
    '<div class="q-sub">' + s.sub + '</div>' +
    '<div class="cards">' + s.opts.map(function(o, i) { return '<div class="card ' + (P[s.id] === i ? 'selected' : '') + '" role="button" tabindex="0" onclick="STATE.profile[\'' + s.id + '\']=' + i + ';render();setTimeout(goNext,400)"><div class="card-icon">' + o.icon + '</div><div class="card-text"><h4>' + o.title + '</h4><p>' + o.desc + '</p></div></div>' }).join('') + '</div>' +
    '<div class="emo-msg ' + (P[s.id] !== undefined ? 'show' : '') + '" id="emo">' + (P[s.id] !== undefined && emoMessages[s.id] ? emoMessages[s.id](P) : '') + '</div>' +
  '</div>';
}

function renderGdprEmail(s, P, btn) {
  btn.textContent = UI.buttons.seeResults;
  btn.className = 'btn btn-gold';
  btn.disabled = !P.gdpr;
  return '<div class="slide active">' +
    '<div class="q-label">' + s.label + '</div>' +
    '<div class="q-title">' + s.title + '</div>' +
    '<div class="q-sub">' + s.sub + '</div>' +
    '<input class="email-input" type="email" placeholder="' + s.ph + '" value="' + (P.email || '') + '" aria-label="Email" oninput="STATE.profile.email=this.value" style="margin-bottom:16px">' +
    '<div class="chk ' + (P.gdpr ? 'sel' : '') + '" role="checkbox" aria-checked="' + (!!P.gdpr) + '" tabindex="0" onclick="STATE.profile.gdpr=!STATE.profile.gdpr;render()" style="margin-top:4px">' +
      '<div class="chk-box"></div>' +
      '<span style="font-size:0.82rem;line-height:1.5">' + s.consent + '</span>' +
    '</div>' +
    '<div class="emo-msg show" style="margin-top:20px">' + UI.emailPreResults + '</div>' +
  '</div>';
}

function _unlockCta(containerId, hintId, delay) {
  setTimeout(function() {
    var c = document.getElementById(containerId);
    if (c) { c.style.opacity = '1'; c.style.pointerEvents = 'auto'; }
    var h = document.getElementById(hintId);
    if (h) { h.style.opacity = '0'; }
  }, delay);
}

function renderMiniResults(s, P, A, btn, resetHtml) {
  document.getElementById('btnBack').style.visibility = 'hidden';
  btn.style.display = 'none';

  if (!STATE._miniResultsTracked) { STATE._miniResultsTracked = true; try { gtag('event', 'mini_complete', {event_category: 'funnel', route: COPY.route.get(P.moment), bmi: calcBMI(P.weight, P.height).toFixed(1)}); fbq('track', 'Lead'); } catch(e) {} }

  // Lock CTA area for 2 seconds to ensure message is read
  setTimeout(function() { _unlockCta('miniCtaZone', 'miniReadHint', 0); }, 2000);

  var _signals = interpretSignals(P, {});
  var _resolved = resolveRoute(P, _signals);
  var _msgVal = selectMessage({route: _resolved.route, signals: _signals, purpose: 'VALIDATION', screenContext: 'ONBOARDING'});
  var _msgRes = selectMessage({route: _resolved.route, signals: _signals, purpose: 'RESULTS', screenContext: 'RESULTS'});

  // Psych layer: try flow message, fallback to engine message
  var _psychCtx = buildPsychContext(P, _signals, _resolved, {stress: calcStressScore({}), hormonal: calcHormonalScore(P, {})}, null, [], {}, {});
  var _psychMsg = buildFlowMessage(_psychCtx, 'mini_results');
  var _valText = _psychMsg || personalize(_msgVal.text, P.name);
  var _resText = personalize(_msgRes.text, P.name);

  var bmi = calcBMI(P.weight, P.height);
  var bmr = calcBMR(P.weight, P.height, P.age);
  var tdee = calcTDEE(bmr, P.activity || 0);
  var cat = bmiCat(bmi);
  var ideal = idealWeight(P.height);
  var gn = UI.goalNames;
  var protein = Math.round(P.weight * 1.6);
  var fat = Math.round(tdee * 0.25 / 9);
  var carbs = Math.round((tdee - protein * 4 - fat * 9) / 4);
  var deficit = tdee - 500;
  var targetW = P.weight * 0.88;
  var weeks = projWeeks(P.weight, targetW);
  var R = R_UI;
  var U = U_UI;
  var gl = UI.gaugeLabels;
  var ml = R.macroLabels;

  var plansHtml = U.plans.map(function(p) {
    var cls = p.hl ? 'plan-row highlight' : (p.gold ? 'plan-row' : 'plan-row');
    var st = p.gold ? 'border-color:var(--gold);background:rgba(201,168,76,0.06)' : '';
    var nc = p.hl ? 'color:white' : (p.gold ? 'color:var(--gold)' : '');
    var pc = p.hl ? 'color:var(--gold)' : (p.gold ? 'color:var(--gold)' : '');
    var old = p.old ? ' <span style="font-size:0.7rem;color:var(--text);text-decoration:line-through">' + p.old + '</span>' : '';
    return '<div class="' + cls + '" style="' + st + '"><span class="plan-name" style="' + nc + '">' + p.name + '</span><span class="plan-price" style="' + pc + '">' + p.price + old + '</span></div>';
  }).join('');

  return '<div class="slide active"><div class="results" style="padding-top:4vh">' +
    '<div style="text-align:center;margin-bottom:28px">' +
      '<div style="font-size:0.75rem;color:var(--teal-glow);font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px">' + R.headerTitle(P.name) + '</div>' +
      '<h2 style="font-family:var(--serif);font-size:1.8rem;color:white;font-weight:600;line-height:1.2">' + R.heading + '</h2>' +
      '<p style="font-size:0.82rem;color:var(--text);margin-top:8px">' + R.routePrefix + ': <strong style="color:var(--gold)">' + COPY.route.get(P.moment) + '</strong></p>' +
    '</div>' +
    '<div class="emo-msg show" style="margin-bottom:20px">' + _valText + '</div>' +
    '<div class="result-section">' +
      '<h3 style="display:flex;align-items:center;gap:8px"><span style="color:var(--green)">✓</span> ' + R.imcHeading + '</h3>' +
      '<div class="result-card">' +
        '<div style="display:flex;align-items:flex-end;gap:12px"><div class="result-big">' + bmi.toFixed(1) + '</div><div><span class="result-cat ' + cat.cls + '">' + cat.label + '</span></div></div>' +
        '<div class="gauge"><div class="gauge-marker" style="left:' + bmiPercent(bmi) + '%"></div></div>' +
        '<div class="gauge-labels"><span>' + (gl[0] || '') + '</span><span>' + (gl[1] || '') + '</span><span>' + (gl[2] || '') + '</span><span>' + (gl[3] || '') + '</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="result-section">' +
      '<h3 style="display:flex;align-items:center;gap:8px"><span style="color:var(--green)">✓</span> ' + R.recoHeading + '</h3>' +
      '<div class="result-card" style="font-size:0.88rem;color:rgba(255,255,255,0.6);line-height:1.8">' + _resText + '</div>' +
    '</div>' +
    '<div class="free-items">' + R.freeItems.map(function(i) { return '<div class="free-item"><span class="check">✓</span><p>' + i + '</p></div>' }).join('') + '</div>' +
    '<div id="miniReadHint" style="text-align:center;font-size:0.78rem;color:var(--teal-glow);font-style:italic;margin-bottom:10px;transition:opacity 0.4s">Citește mesajul înainte să continui...</div>' +
    '<div id="miniCtaZone" style="opacity:0.5;pointer-events:none;transition:opacity 0.5s;margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,rgba(42,165,160,0.08),rgba(201,168,76,0.06));border:1px solid rgba(201,168,76,0.15);text-align:center">' +
      '<h3 style="font-family:var(--serif);font-size:1.3rem;color:white;margin-bottom:8px">' + U.heading + '</h3>' +
      '<p style="font-size:0.85rem;color:var(--text);margin-bottom:16px;line-height:1.7">' + U.body + '</p>' +
      '<button class="btn btn-next" style="margin-top:14px;width:100%;padding:14px 28px;font-size:0.95rem" onclick="startComplet()">Deblochează analiza ta completă →</button>' +
      '<p style="margin-top:8px;font-size:0.75rem;color:var(--text);line-height:1.5">Îți deblocăm profilul metabolic, obstacolele principale și direcția ta personalizată.</p>' +
      '<p style="margin-top:10px;font-size:0.72rem;color:var(--teal-glow);font-style:italic;opacity:0.7;line-height:1.5">Dacă simți că ți se potrivește, nu amâna — direcția corectă contează chiar de la început.</p>' +
      '<div style="height:1px;background:rgba(255,255,255,0.06);margin:18px 0"></div>' +
      '<a href="' + U.ctaDirectWhatsApp + '" target="_blank" rel="noopener" class="btn btn-gold" style="display:inline-block;text-decoration:none;margin-top:0;padding:12px 28px;font-size:0.88rem" onclick="try{gtag(\'event\',\'whatsapp_click\',{source:\'mini_results_direct\'});fbq(\'track\',\'Contact\');}catch(e){}">' + U.ctaDirectButton + '</a>' +
      '<p style="margin-top:10px;font-size:0.75rem;color:var(--text)">' + U.ctaGroupBody + '</p>' +
      '<a href="' + U.ctaGroupWhatsApp + '" target="_blank" rel="noopener" style="display:inline-block;margin-top:4px;font-size:0.75rem;color:rgba(37,211,102,0.7);text-decoration:underline;transition:color 0.2s" onclick="try{gtag(\'event\',\'whatsapp_click\',{source:\'mini_results_group\'});fbq(\'track\',\'Contact\');}catch(e){}">' + U.ctaGroupButton + '</a>' +
    '</div>' +
    '<div class="result-section blurred-section">' +
      '<div class="blur-overlay"><div class="blur-lock">🔒</div><p>' + R.blurOverlay + '</p></div>' +
      '<div class="blurred-content">' +
        '<h3>' + R.bmrHeading + '</h3>' +
        '<div class="result-card"><div class="result-big">' + Math.round(bmr) + '</div><div class="result-label">' + R.bmrDesc + '</div></div>' +
        '<h3>' + R.tdeeHeading + '</h3>' +
        '<div class="result-card"><div class="result-big">' + Math.round(tdee) + '</div><div class="result-label">' + R.tdeeDesc + '</div></div>' +
        '<h3>' + R.macroHeading + '</h3>' +
        '<div class="result-card" style="display:flex;gap:20px">' +
          '<div style="flex:1;text-align:center"><div style="font-size:1.4rem;font-weight:700;color:var(--teal-glow)">' + protein + 'g</div><div class="result-label">' + (ml[0] || '') + '</div></div>' +
          '<div style="flex:1;text-align:center"><div style="font-size:1.4rem;font-weight:700;color:var(--gold)">' + carbs + 'g</div><div class="result-label">' + (ml[1] || '') + '</div></div>' +
          '<div style="flex:1;text-align:center"><div style="font-size:1.4rem;font-weight:700;color:var(--rose)">' + fat + 'g</div><div class="result-label">' + (ml[2] || '') + '</div></div>' +
        '</div>' +
        '<h3>' + R.projHeading + '</h3>' +
        '<div class="result-card"><div style="font-size:0.88rem;color:rgba(255,255,255,0.6)">' + R.projBody(Math.round(deficit), weeks, targetW.toFixed(1)) + '</div></div>' +
        '<h3>' + R.idealHeading + '</h3>' +
        '<div class="result-card"><div style="font-size:1.2rem;font-weight:600;color:var(--teal-glow)">' + ideal + '</div><div class="result-label">' + R.idealDesc(P.height) + '</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="upgrade-box" style="margin:20px 0;padding:20px">' +
      '<div class="upgrade-plans">' + plansHtml + '</div>' +
      '<p style="margin-top:12px;font-size:0.75rem;color:var(--text)">' + U.footer(COPY.route.get(P.moment)) + '</p>' +
    '</div>' +
    resetHtml +
  '</div></div>';
}

function renderTransition(s, P, A, btn) {
  btn.textContent = COPY.ui.buttons.next;
  btn.disabled = true;
  // Unlock NEXT after 3 seconds reading time
  setTimeout(function() {
    var b = document.getElementById('btnNext');
    if (b) { b.disabled = false; }
    var h = document.getElementById('transReadHint');
    if (h) { h.style.opacity = '0'; }
  }, 3000);
  var bmiT = calcBMI(P.weight, P.height);
  var miniHTML = '';
  if (s.miniResult) {
    miniHTML = '<div class="mini-result"><div class="mini-val">' + bmiT.toFixed(1) + '</div><div class="mini-lbl">' + COPY.complet.ui.miniResultLabel + '</div></div>';
  }
  var _tBlock = _transBlockMap[s.id] || null;
  var _tSig = interpretSignals(P, A);
  var _tRoute = resolveRoute(P, _tSig);
  var _tMsg = selectMessage({route: _tRoute.route, signals: _tSig, purpose: 'TRANSITION', screenContext: 'ONBOARDING', block: _tBlock});
  var _tEngineBody = _tMsg.fallback ? s.body : personalize(_tMsg.text, P.name);

  // Psych layer: try flow message, fallback to engine message
  var _tPsychCtx = buildPsychContext(P, _tSig, _tRoute, {stress: calcStressScore(A), hormonal: calcHormonalScore(P, A)}, null, [], A, {});
  var _tPsychMsg = buildFlowMessage(_tPsychCtx, 'transition');
  var _tBody = _tPsychMsg || _tEngineBody;

  return '<div class="slide active"><div class="block-trans">' +
    '<div class="block-tag ' + s.blockColor + '">' + s.block + '</div>' +
    '<h2>' + s.title + '</h2>' +
    '<p>' + _tBody + '</p>' + miniHTML +
    '<div id="transReadHint" style="text-align:center;font-size:0.78rem;color:var(--teal-glow);font-style:italic;margin-top:14px;transition:opacity 0.4s">Citește mesajul înainte să continui...</div>' +
  '</div></div>';
}

function renderSingle(s, A, btn) {
  btn.textContent = COPY.ui.buttons.next;
  btn.disabled = A[s.id] === undefined;
  var letters = 'ABCDEFGHIJKLM';
  return '<div class="slide active">' +
    '<div class="block-tag ' + s.blockColor + '">' + s.block + '</div>' +
    '<div class="q-title">' + s.title + '</div>' +
    (s.sub ? '<div class="q-sub">' + s.sub + '</div>' : '') +
    (s.note ? '<div class="q-note">' + s.note + '</div>' : '') +
    '<div class="opts">' + s.opts.map(function(o, i) { return '<div class="opt ' + (A[s.id] === i ? 'sel' : '') + '" role="button" tabindex="0" onclick="STATE.ans[\'' + s.id + '\']=' + i + ';render();setTimeout(goNext,350)"><div class="opt-letter">' + letters[i] + '</div><span>' + o + '</span></div>' }).join('') + '</div>' +
  '</div>';
}

function renderMulti(s, A, btn) {
  btn.textContent = COPY.ui.buttons.next;
  btn.disabled = !A[s.id] || A[s.id].length === 0;
  return '<div class="slide active">' +
    '<div class="block-tag ' + s.blockColor + '">' + s.block + '</div>' +
    '<div class="q-title">' + s.title + '</div>' +
    (s.sub ? '<div class="q-sub">' + s.sub + '</div>' : '') +
    (s.note ? '<div class="q-note">' + s.note + '</div>' : '') +
    '<div>' + s.opts.map(function(o, i) { return '<div class="chk ' + ((A[s.id] || []).includes(i) ? 'sel' : '') + '" role="checkbox" aria-checked="' + ((A[s.id] || []).includes(i)) + '" tabindex="0" onclick="toggleChk(\'' + s.id + '\',' + i + ')"><div class="chk-box"></div><span>' + o + '</span></div>' }).join('') + '</div>' +
  '</div>';
}

function renderScale(s, A, btn) {
  btn.textContent = COPY.ui.buttons.next;
  btn.disabled = A[s.id] === undefined;
  var scaleButtons = [];
  for (var v = s.min; v <= s.max; v++) {
    scaleButtons.push('<button class="scale-btn ' + (A[s.id] === v ? 'sel' : '') + '" onclick="STATE.ans[\'' + s.id + '\']=' + v + ';render();setTimeout(goNext,300)">' + v + '</button>');
  }
  return '<div class="slide active">' +
    '<div class="block-tag ' + s.blockColor + '">' + s.block + '</div>' +
    '<div class="q-title">' + s.title + '</div>' +
    (s.sub ? '<div class="q-sub">' + s.sub + '</div>' : '') +
    '<div class="scale-row">' + scaleButtons.join('') + '</div>' +
    '<div class="scale-labels"><span>' + s.minL + '</span><span>' + s.maxL + '</span></div>' +
  '</div>';
}

function renderTextarea(s, A, btn) {
  btn.textContent = COPY.ui.buttons.next;
  btn.disabled = !(A[s.id] || '').trim();
  return '<div class="slide active">' +
    '<div class="block-tag ' + s.blockColor + '">' + s.block + '</div>' +
    '<div class="q-title">' + s.title + '</div>' +
    (s.sub ? '<div class="q-sub">' + s.sub + '</div>' : '') +
    '<textarea class="ta" aria-label="' + (s.title || 'Răspuns') + '" placeholder="' + COPY.complet.ui.textareaPlaceholder + '" oninput="STATE.ans[\'' + s.id + '\']=this.value;document.getElementById(\'btnNext\').disabled=!this.value.trim()">' + (A[s.id] || '') + '</textarea>' +
  '</div>';
}

function renderCompletResults(s, P, A, btn, resetHtml) {
  document.getElementById('btnBack').style.visibility = 'hidden';
  btn.style.display = 'none';

  if (!STATE._completResultsTracked) { STATE._completResultsTracked = true; try { gtag('event', 'complet_complete', {event_category: 'funnel', route: COPY.route.get(P.moment)}); fbq('track', 'CompleteRegistration'); } catch(e) {} }

  if (STATE.profile.gdpr && !STATE._completEmailSent) {
    STATE._completEmailSent = true;
    try { fetch('/api/send-email', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: 'complet', profile: STATE.profile, ans: STATE.ans})}).catch(function() {}); } catch(e) {}
  }

  // Lock CTA area for 3.5 seconds to ensure message is read
  setTimeout(function() { _unlockCta('completCtaZone', 'completReadHint', 0); }, 3500);

  var _cSig = interpretSignals(P, A);
  var _cRoute = resolveRoute(P, _cSig);
  var _cMsgVal = selectMessage({route: _cRoute.route, signals: _cSig, purpose: 'VALIDATION', screenContext: 'ONBOARDING'});
  var _cMsgRes = selectMessage({route: _cRoute.route, signals: _cSig, purpose: 'RESULTS', screenContext: 'RESULTS'});
  var _cResText = personalize(_cMsgRes.text, P.name);

  var cStress = calcStressScore(A);
  var cHormonal = calcHormonalScore(P, A);

  // Psych layer: try flow message, fallback to engine message
  var _cMetaProfile = getMetabolicProfile(P, A, COPY.metabolicProfiles, COPY.fallback.metabolicProfile);
  var _cTags = getSafetyTags(P, A);
  var _cPsychCtx = buildPsychContext(P, _cSig, _cRoute, {stress: cStress, hormonal: cHormonal}, _cMetaProfile, _cTags, A, {});
  var _cPsychMsg = buildFlowMessage(_cPsychCtx, 'complet_results');
  var _cValText = _cPsychMsg || personalize(_cMsgVal.text, P.name);

  // Personal letter (hardened + policy-gated)
  var _cLetter = null;
  var _cLetterCtx = null;
  var _cLetterPolicy = null;
  if (typeof getPersonalLetterPolicy === 'function') {
    _cLetterCtx = buildPersonalLetterContext(P, _cSig, _cRoute, {stress: cStress, hormonal: cHormonal}, _cMetaProfile, _cTags, A, {}, _cPsychCtx.tone);
    _cLetterPolicy = getPersonalLetterPolicy(_cLetterCtx);
    if (_cLetterPolicy.allowed) {
      try { _cLetter = buildPersonalLetter(_cLetterCtx); } catch(e) { _cLetter = null; }
    }
  }
  var _cLetterHtml = '';
  if (_cLetter && typeof _cLetter.text === 'string' && _cLetter.text.length >= 100) {
    // Strip any leftover [Prenume] placeholders (name safety)
    var _cLetterSafe = _cLetter.text.replace(/\[Prenume\]/g, _safeName(P.name));
    var _cLetterParagraphs = _cLetterSafe.split('\n\n');
    var _cLetterBody = '';
    for (var _li = 0; _li < _cLetterParagraphs.length; _li++) {
      var _lp = _cLetterParagraphs[_li].replace(/^\s+|\s+$/g, '');
      if (!_lp) continue;
      var _isSignature = _li === _cLetterParagraphs.length - 1 && _lp.indexOf('\n') !== -1;
      if (_isSignature) {
        _cLetterBody += '<p class="cyb-letter-signature" style="font-size:0.88rem;color:var(--teal-glow);line-height:1.8;margin-top:16px;font-style:italic;white-space:pre-line">' + _escLetterHtml(_lp) + '</p>';
      } else {
        _cLetterBody += '<p class="cyb-letter-paragraph" style="font-size:0.88rem;color:rgba(255,255,255,0.65);line-height:1.8;margin-bottom:14px">' + _escLetterHtml(_lp) + '</p>';
      }
    }
    if (_cLetterBody) {
      _cLetterHtml = '<div class="cyb-letter-block" style="margin:24px 0;padding:24px 20px;border-radius:16px;background:linear-gradient(135deg,rgba(42,165,160,0.04),rgba(201,168,76,0.03));border:1px solid rgba(42,165,160,0.1)">' +
        '<div class="cyb-letter-label" style="font-size:0.7rem;color:var(--teal-glow);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;font-weight:600">Scrisoarea ta personală</div>' +
        '<div class="cyb-letter-body">' + _cLetterBody + '</div>' +
      '</div>';
    }
  }

  var cProfile = _cMetaProfile;
  var cTags = _cTags;
  var cBmr = calcBMR(P.weight, P.height, P.age);
  var cTdee = calcTDEE(cBmr, P.activity || 0);
  var CR = COPY.complet.ui.results;
  var cSteps = getActiveSteps();
  var cTotalQ = totalQ(cSteps);
  var SL = CR.stressLevels;
  var HL = CR.hormonalLevels;
  var PL = CR.paramLabels;
  var stressLabel = cStress > 65 ? SL.high : (cStress > 40 ? SL.moderate : SL.low);
  var hormonalLabel = cHormonal > 60 ? HL.high : (cHormonal > 35 ? HL.moderate : HL.low);

  return '<div class="slide active" style="padding-top:24px">' +
    '<div style="text-align:center;margin-bottom:28px">' +
      '<div class="block-tag teal">' + CR.headerTag + '</div>' +
      '<h2 style="font-family:var(--serif);font-size:1.6rem;color:white;margin:12px 0 4px">' + CR.headerTitle(P.name) + '</h2>' +
      '<p style="font-size:0.82rem">' + CR.routePrefix + ': <strong style="color:var(--gold)">' + COPY.route.get(P.moment) + '</strong> · ' + cTotalQ + ' ' + CR.analyzedSuffix + '</p>' +
    '</div>' +
    '<div class="emo-msg show" style="margin-bottom:20px">' + _cValText + '</div>' +
    _cLetterHtml +
    '<div class="profile-card">' +
      '<div style="font-size:0.7rem;color:var(--text);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">' + CR.profileLabel + '</div>' +
      '<div class="profile-name" style="color:' + cProfile.color + '">' + cProfile.name + '</div>' +
      '<div class="profile-desc">' + cProfile.desc + '</div>' +
    '</div>' +
    '<div class="res-section">' +
      '<h3>' + CR.stressHeading + '</h3>' +
      '<div class="res-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-end">' +
          '<div style="font-family:var(--serif);font-size:2rem;font-weight:700;color:' + (cStress > 65 ? 'var(--red)' : cStress > 40 ? 'var(--gold)' : 'var(--green)') + '">' + cStress + '%</div>' +
          '<div style="font-size:0.78rem;color:var(--text)">' + stressLabel + '</div>' +
        '</div>' +
        '<div class="score-bar"><div class="score-fill" style="width:' + cStress + '%;background:' + (cStress > 65 ? 'var(--red)' : cStress > 40 ? 'var(--gold)' : 'var(--green)') + '"></div></div>' +
        '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);margin-top:4px">' + CR.stressSource + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="res-section">' +
      '<h3>' + CR.hormonalHeading + '</h3>' +
      '<div class="res-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-end">' +
          '<div style="font-family:var(--serif);font-size:2rem;font-weight:700;color:' + (cHormonal > 60 ? 'var(--purple)' : cHormonal > 35 ? 'var(--gold)' : 'var(--green)') + '">' + cHormonal + '%</div>' +
          '<div style="font-size:0.78rem;color:var(--text)">' + hormonalLabel + '</div>' +
        '</div>' +
        '<div class="score-bar"><div class="score-fill" style="width:' + cHormonal + '%;background:' + (cHormonal > 60 ? 'var(--purple)' : cHormonal > 35 ? 'var(--gold)' : 'var(--green)') + '"></div></div>' +
        '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);margin-top:4px">' + CR.hormonalSource + '</div>' +
        '<div style="font-size:0.72rem;color:var(--teal-glow);margin-top:6px;font-style:italic">' + CR.hormonalDisclaimer + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="res-section">' +
      '<h3><span style="color:var(--green)">✓</span> ' + CR.caloricHeading + '</h3>' +
      '<div class="res-card" style="display:flex;gap:16px">' +
        '<div style="flex:1;text-align:center"><div style="font-family:var(--serif);font-size:1.6rem;font-weight:700;color:var(--teal-glow)">' + Math.round(cBmr) + '</div><div style="font-size:0.72rem;color:var(--text)">' + CR.bmrLabel + '</div></div>' +
        '<div style="width:1px;background:rgba(255,255,255,0.06)"></div>' +
        '<div style="flex:1;text-align:center"><div style="font-family:var(--serif);font-size:1.6rem;font-weight:700;color:var(--gold)">' + Math.round(cTdee) + '</div><div style="font-size:0.72rem;color:var(--text)">' + CR.tdeeLabel + '</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="res-section">' +
      '<h3>' + CR.tagsHeading + '</h3>' +
      '<div class="res-card">' +
        (cTags.length === 0 ? '<p style="font-size:0.85rem;color:var(--text)">' + CR.tagsEmpty + '</p>' :
        '<div class="tag-list">' + cTags.map(function(t) { return '<span class="safety-tag tag-' + t.type + '">' + (t.type === 'exclude' ? '✕' : '✓') + ' ' + t.label + '</span>' }).join('') + '</div>') +
        '<div style="font-size:0.72rem;color:rgba(255,255,255,0.25);margin-top:10px">' + CR.tagsFooter + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="res-section">' +
      '<h3>' + CR.paramsHeading + '</h3>' +
      '<div class="res-card">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.82rem">' +
          '<div><span style="color:var(--text)">' + PL.time + '</span> <strong style="color:white">' + (CR.timeOptions[A.q8 || 2] || '') + '</strong></div>' +
          '<div><span style="color:var(--text)">' + PL.experience + '</span> <strong style="color:white">' + (CR.expOptions[A.q13 || 0] || '') + '</strong></div>' +
          '<div><span style="color:var(--text)">' + PL.meals + '</span> <strong style="color:white">' + (CR.mealOptions[A.q14 || 1] || '') + '</strong></div>' +
          '<div><span style="color:var(--text)">' + PL.budget + '</span> <strong style="color:white">' + (CR.budgetOptions[A.q19 || 1] || '') + ' RON</strong></div>' +
          '<div><span style="color:var(--text)">' + PL.motivation + '</span> <strong style="color:white">' + (A.q21 || 7) + '/10</strong></div>' +
          '<div><span style="color:var(--text)">' + PL.equipment + '</span> <strong style="color:white">' + ((A.q9 || []).length) + ' tipuri</strong></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    // B6: Recipe preview (guarded)
    (function() {
      try {
        if (typeof buildDayPlan === 'function' && typeof formatDayPlanHtml === 'function') {
          var _rPlan = buildDayPlan(P, A);
          if (_rPlan && _rPlan.slots) {
            var _rHtml = formatDayPlanHtml(_rPlan);
            if (_rHtml) return '<div class="res-section"><h3>🍽️ Planul tău alimentar — Ziua model</h3><div class="res-card">' + _rHtml + '</div></div>';
          }
        }
      } catch(e) {}
      return '';
    })() +
    // B6: Training preview (guarded)
    (function() {
      try {
        if (typeof buildTrainingPlan === 'function' && typeof formatTrainingPlanHtml === 'function') {
          var _tPlan = buildTrainingPlan(P, A);
          if (_tPlan && _tPlan.sessions && _tPlan.sessions.length > 0) {
            var _tHtml = formatTrainingPlanHtml(_tPlan);
            if (_tHtml) return '<div class="res-section"><h3>💪 Planul tău de antrenament — Săptămâna 1</h3><div class="res-card">' + _tHtml + '</div></div>';
          }
        }
      } catch(e) {}
      return '';
    })() +
    '<div style="text-align:center;padding:24px 0;border-top:1px solid rgba(255,255,255,0.06);margin-top:12px">' +
      '<p style="font-size:0.88rem;color:var(--text);line-height:1.8;margin-bottom:12px">' + _cResText + '</p>' +
      '<p style="margin-top:16px;font-size:0.88rem;font-style:italic;color:var(--teal-glow)">' + CR.finalQuote + '</p>' +
    '</div>' +
    '<div id="completReadHint" style="text-align:center;font-size:0.78rem;color:var(--teal-glow);font-style:italic;margin-bottom:10px;transition:opacity 0.4s">Citește mesajul înainte să continui...</div>' +
    '<div id="completCtaZone" style="opacity:0.5;pointer-events:none;transition:opacity 0.5s;text-align:center;padding:28px 20px;margin-top:20px;border-radius:16px;background:linear-gradient(135deg,rgba(42,165,160,0.08),rgba(201,168,76,0.06));border:1px solid rgba(201,168,76,0.15)">' +
      '<h3 style="font-family:var(--serif);font-size:1.3rem;color:white;margin-bottom:8px">' + CR.ctaHeading + '</h3>' +
      '<p style="font-size:0.85rem;color:var(--text);line-height:1.7;margin-bottom:12px">' + CR.ctaBody + '</p>' +
      '<p style="font-size:0.72rem;color:var(--teal-glow);font-style:italic;opacity:0.7;line-height:1.5;margin-bottom:18px">Cu cât începi mai repede, cu atât corectăm mai repede ce te blochează acum.</p>' +
      '<a href="' + CR.ctaDirectWhatsApp + '" target="_blank" rel="noopener" class="btn btn-gold" style="display:inline-block;text-decoration:none;padding:14px 32px;font-size:0.95rem" onclick="try{gtag(\'event\',\'whatsapp_click\',{source:\'complet_results_direct\'});fbq(\'track\',\'Contact\');}catch(e){}">' + CR.ctaDirectButton + '</a>' +
      '<p style="margin-top:14px;font-size:0.78rem;color:var(--text)">Sau intră în comunitatea CYB:</p>' +
      '<a href="' + CR.ctaGroupWhatsApp + '" target="_blank" rel="noopener" style="display:inline-block;margin-top:6px;font-size:0.78rem;color:rgba(37,211,102,0.7);text-decoration:underline;transition:color 0.2s" onclick="try{gtag(\'event\',\'whatsapp_click\',{source:\'complet_results_group\'});fbq(\'track\',\'Contact\');}catch(e){}">' + CR.ctaGroupButton + '</a>' +
    '</div>' +
    resetHtml +
  '</div>';
}

// ── FALLBACK RENDERER ────────────────────────────────────────────────
function renderFallback(s) {
  return '<div class="slide active"><p style="color:var(--text);text-align:center;padding:40px 20px">Pas necunoscut: ' + (s.type || 'undefined') + '</p></div>';
}

// ── RENDERERS DISPATCH MAP (module scope — created once) ─────────────
// Keyed by step.type. Each entry is a function(ctx) returning HTML string.
// ctx = { s, P, A, btn, resetHtml }
var RENDERERS = {
  welcome:         function(c){ return renderWelcome(c.s, c.P, c.btn, c.resetHtml); },
  text:            function(c){ return renderTextInput(c.s, c.P, c.btn); },
  number:          function(c){ return renderNumberInput(c.s, c.P, c.btn); },
  measures:        function(c){ return renderMeasures(c.s, c.P, c.btn); },
  activity:        function(c){ return renderActivity(c.s, c.P, c.btn); },
  cards:           function(c){ return renderCards(c.s, c.P, c.btn); },
  gdpr_email:      function(c){ return renderGdprEmail(c.s, c.P, c.btn); },
  mini_results:    function(c){ return renderMiniResults(c.s, c.P, c.A, c.btn, c.resetHtml); },
  transition:      function(c){ return renderTransition(c.s, c.P, c.A, c.btn); },
  single:          function(c){ return renderSingle(c.s, c.A, c.btn); },
  multi:           function(c){ return renderMulti(c.s, c.A, c.btn); },
  scale:           function(c){ return renderScale(c.s, c.A, c.btn); },
  textarea:        function(c){ return renderTextarea(c.s, c.A, c.btn); },
  complet_results: function(c){ return renderCompletResults(c.s, c.P, c.A, c.btn, c.resetHtml); }
};

// ── dispatchRender: single entry point for render() to call ──────────
function dispatchRender(ctx) {
  var renderer = RENDERERS[ctx.s.type];
  if (renderer) return renderer(ctx);
  return renderFallback(ctx.s);
}
