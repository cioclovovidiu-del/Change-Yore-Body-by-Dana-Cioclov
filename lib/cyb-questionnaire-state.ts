// =============================================================================
// CYB QUESTIONNAIRE STATE MACHINE
// Extracted from: public/landing-v2/CYB_Chestionar_Unified.html runtime
// Pure state logic: no DOM, no localStorage, no fetch, no analytics, no render.
// =============================================================================

import { STEPS_MINI, STEPS_COMPLET, buildVisible, totalQ, curQ } from "./cyb-steps";
import type { Step } from "./cyb-steps";

// ── Constants ───────────────────────────────────────────────────────────

export const CYB_STATE_VERSION = 2;

// ── Types ───────────────────────────────────────────────────────────────

export type QuestionnairePhase = "MINI" | "COMPLET";

export interface QuestionnaireState {
  profile: Record<string, any>;
  ans: Record<string, any>;
  phase: QuestionnairePhase;
  step: number;
  _v: number;
  _miniEmailSent?: boolean;
  _completEmailSent?: boolean;
  _miniResultsTracked?: boolean;
  _completResultsTracked?: boolean;
}

export interface QuestionnaireProgress {
  /** Progress bar percentage (0-100) */
  pct: number;
  /** Step info text (e.g. "Pas 3 din 6", "Pas 5 din 21 · Peste jumătate!") */
  info: string;
  /** Whether back button should be visible */
  canGoBack: boolean;
  /** Whether this is a results screen (mini_results or complet_results) */
  isResults: boolean;
}

// ── State Factory ───────────────────────────────────────────────────────

export function createInitialQuestionnaireState(): QuestionnaireState {
  return {
    profile: {},
    ans: {},
    phase: "MINI",
    step: 0,
    _v: CYB_STATE_VERSION,
  };
}

// ── Step Resolution ─────────────────────────────────────────────────────

export function getActiveSteps(state: QuestionnaireState): Step[] {
  if (state.phase === "MINI") return STEPS_MINI;
  return buildVisible(state.profile, state.ans);
}

export function getCurrentStep(state: QuestionnaireState): Step {
  const steps = getActiveSteps(state);
  return steps[state.step] || steps[0];
}

// ── Validation Guards ───────────────────────────────────────────────────
// Mirrors the exact validation logic from goNext() in the browser runtime.
// Returns true if the current step's input is valid and navigation can proceed.

export function canAdvanceStep(
  step: Step,
  state: QuestionnaireState
): boolean {
  const P = state.profile;
  const A = state.ans;

  if (step.type === "text" && !P[step.id]) return false;

  if (step.type === "number") {
    const nv = P[step.id];
    if (nv === undefined || nv === null || isNaN(nv)) return false;
    if (step.min !== undefined && nv < step.min) return false;
    if (step.max !== undefined && nv > step.max) return false;
  }

  if (
    step.type === "measures" &&
    !(P.height > 100 && P.height < 250 && P.weight > 30 && P.weight < 250)
  )
    return false;

  if (step.type === "activity" && P.activity === undefined) return false;

  if (step.type === "cards" && P[step.id] === undefined) return false;

  if (step.type === "gdpr_email" && !P.gdpr) return false;

  if (step.type === "single" && A[step.id] === undefined) return false;

  if (step.type === "multi" && (!A[step.id] || A[step.id].length === 0))
    return false;

  if (step.type === "scale" && A[step.id] === undefined) return false;

  if (
    step.type === "textarea" &&
    !step.optional &&
    !(A[step.id] || "").trim()
  )
    return false;

  // welcome, transition, mini_results, complet_results: always passable
  return true;
}

// ── Progress Computation ────────────────────────────────────────────────
// Mirrors the progress bar + step info + momentum cues from render().

export function computeQuestionnaireProgress(
  state: QuestionnaireState
): QuestionnaireProgress {
  const steps = getActiveSteps(state);
  const s = getCurrentStep(state);

  const isResults =
    s.type === "mini_results" || s.type === "complet_results";

  // Progress percentage
  let pct: number;
  if (state.step === 0 && s.type === "welcome") {
    pct = 0;
  } else if (isResults) {
    pct = 100;
  } else {
    pct = Math.round((state.step / (steps.length - 1)) * 100);
  }

  // Step info text with D6 momentum cues
  let info = "";
  if (
    state.phase === "MINI" &&
    s.type !== "welcome" &&
    s.type !== "mini_results"
  ) {
    info = "Pas " + state.step + " din " + (steps.length - 2);
  } else if (
    state.phase === "COMPLET" &&
    s.id &&
    s.id.startsWith("q")
  ) {
    const _cQ = curQ(steps, state.step);
    const _tQ = totalQ(steps);
    info = "Pas " + _cQ + " din " + _tQ;
    // D6: Momentum micro-cues at key progress points
    const _pctDone = Math.round((_cQ / _tQ) * 100);
    if (_pctDone >= 25 && _pctDone < 50) info += " · Foarte bine!";
    else if (_pctDone >= 50 && _pctDone < 75) info += " · Peste jumătate!";
    else if (_pctDone >= 75 && _pctDone < 95) info += " · Aproape gata!";
    else if (_pctDone >= 95) info += " · Ultimul pas!";
  } else if (s.type === "transition") {
    info = s.block || "";
  }

  // Back button visibility
  const canGoBack = state.step > 0 && !isResults;

  return { pct, info, canGoBack, isResults };
}

// ── State Transitions ───────────────────────────────────────────────────
// All return new state objects (immutable pattern for React compatibility).
// Side effects (analytics, API calls, render, scroll) are NOT included —
// those remain the responsibility of the caller (browser runtime or React hook).

/** Advance to next step. Returns null if validation fails or already at end. */
export function goToNextStep(
  state: QuestionnaireState
): QuestionnaireState | null {
  const steps = getActiveSteps(state);
  const s = getCurrentStep(state);

  if (!canAdvanceStep(s, state)) return null;
  if (state.step >= steps.length - 1) return null;

  return {
    ...state,
    step: state.step + 1,
  };
}

/** Go back one step. Returns null if already at step 0. */
export function goToPreviousStep(
  state: QuestionnaireState
): QuestionnaireState | null {
  if (state.step <= 0) return null;

  return {
    ...state,
    step: state.step - 1,
  };
}

/** Transition from MINI to COMPLET phase. Pure state change only.
 *  Caller is responsible for analytics, email send, render. */
export function startCompletPhase(
  state: QuestionnaireState
): QuestionnaireState {
  return {
    ...state,
    phase: "COMPLET" as QuestionnairePhase,
    step: 0,
  };
}

/** Toggle a value in a multi-select answer array. */
export function toggleMultiAnswer(
  state: QuestionnaireState,
  id: string,
  val: number
): QuestionnaireState {
  const current = state.ans[id] ? [...state.ans[id]] : [];
  const idx = current.indexOf(val);
  if (idx > -1) {
    current.splice(idx, 1);
  } else {
    current.push(val);
  }
  return {
    ...state,
    ans: {
      ...state.ans,
      [id]: [...current],
    },
  };
}

/** Create a fresh reset state. */
export function resetQuestionnaireState(): QuestionnaireState {
  return createInitialQuestionnaireState();
}

// ── Persistence Validation ──────────────────────────────────────────────
// Pure validation of a serialized state object (from localStorage or elsewhere).
// Does NOT access localStorage — that's the caller's responsibility.

/** Validate and normalize a raw persisted state object.
 *  Returns a valid QuestionnaireState or null if the data is invalid/incompatible. */
export function validatePersistedState(
  raw: unknown
): QuestionnaireState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, any>;

  // H3: reject incompatible schema versions
  if (s._v && s._v > CYB_STATE_VERSION) return null;

  if (s.phase !== "MINI" && s.phase !== "COMPLET") return null;
  if (typeof s.step !== "number" || s.step < 0) return null;
  if (!s.profile || typeof s.profile !== "object") return null;
  if (!s.ans || typeof s.ans !== "object") return null;

  const state: QuestionnaireState = {
    profile: s.profile,
    ans: s.ans,
    phase: s.phase as QuestionnairePhase,
    step: s.step,
    _v: CYB_STATE_VERSION,
  };

  // C1: restore dedup flags
  if (s._miniEmailSent) state._miniEmailSent = true;
  if (s._completEmailSent) state._completEmailSent = true;
  if (s._miniResultsTracked) state._miniResultsTracked = true;
  if (s._completResultsTracked) state._completResultsTracked = true;

  // Clamp step to valid range
  const steps = getActiveSteps(state);
  state.step = Math.min(state.step, steps.length - 1);

  return state;
}

/** Check whether a raw persisted object represents meaningful saved progress.
 *  Mirrors hasSavedState() from the browser runtime. */
export function hasPersistedProgress(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const s = raw as Record<string, any>;

  if (s.phase === "COMPLET") return true;
  if (typeof s.step === "number" && s.step > 0) return true;
  if (
    s.profile &&
    typeof s.profile === "object" &&
    Object.keys(s.profile).length > 0
  )
    return true;
  if (s.ans && typeof s.ans === "object" && Object.keys(s.ans).length > 0)
    return true;
  return false;
}
