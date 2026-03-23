"use client";
// =============================================================================
// useQuestionnaireRuntime — Client-side runtime hook for CYB questionnaire
// Wraps the pure state machine (lib/cyb-questionnaire-state.ts) with:
// - localStorage hydration/persistence (key: CYB_STATE)
// - derived values (activeSteps, currentStep, progress)
// - action dispatchers for React usage
//
// No DOM access. No render logic. No analytics. No fetch. No iframe.
// =============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createInitialQuestionnaireState,
  getActiveSteps,
  getCurrentStep,
  computeQuestionnaireProgress,
  goToNextStep,
  goToPreviousStep,
  startCompletPhase,
  toggleMultiAnswer,
  resetQuestionnaireState,
  validatePersistedState,
  hasPersistedProgress,
} from "@/lib/cyb-questionnaire-state";

import type {
  QuestionnaireState,
  QuestionnaireProgress,
} from "@/lib/cyb-questionnaire-state";

import type { Step } from "@/lib/cyb-steps";

// ── Constants ───────────────────────────────────────────────────────────

const STORAGE_KEY = "CYB_STATE";

// ── localStorage helpers (safe for SSR — guarded) ───────────────────────

function loadFromStorage(): QuestionnaireState | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validatePersistedState(parsed);
  } catch {
    return null;
  }
}

function saveToStorage(state: QuestionnaireState): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — silently ignore
  }
}

function clearStorage(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable — silently ignore
  }
}

function checkStorageHasProgress(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return hasPersistedProgress(JSON.parse(raw));
  } catch {
    return false;
  }
}

// ── Hook Return Type ────────────────────────────────────────────────────

export interface QuestionnaireRuntime {
  /** Current questionnaire state */
  state: QuestionnaireState;
  /** Steps visible in the current phase (MINI or filtered COMPLET) */
  activeSteps: Step[];
  /** The current step object */
  currentStep: Step;
  /** Progress bar %, step info text, back button visibility, results flag */
  progress: QuestionnaireProgress;
  /** Whether localStorage has meaningful saved progress */
  hasSavedProgress: boolean;
  /** Whether hydration from localStorage has completed */
  hydrated: boolean;

  // ── Actions ─────────────────────────────────────────────────────────
  /** Advance to next step. Returns false if validation blocked it. */
  goNext: () => boolean;
  /** Go back one step. Returns false if already at step 0. */
  goBack: () => boolean;
  /** Switch from MINI phase to COMPLET phase. */
  startComplet: () => void;
  /** Toggle a value in a multi-select answer array. */
  toggleMulti: (id: string, val: number) => void;
  /** Set a profile field (name, age, height, weight, activity, goal, moment, email, gdpr). */
  setProfileValue: (key: string, value: any) => void;
  /** Set an answer field (q1, q5, etc.). */
  setAnswerValue: (key: string, value: any) => void;
  /** Set a dedup/tracking flag on state (e.g. _miniResultsTracked). */
  markFlag: (flag: string) => void;
  /** Reset to fresh initial state and clear storage. */
  reset: () => void;
}

// ── Hook ────────────────────────────────────────────────────────────────

export function useQuestionnaireRuntime(): QuestionnaireRuntime {
  const [state, setState] = useState<QuestionnaireState>(
    createInitialQuestionnaireState
  );
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  // ── Hydrate from localStorage once on mount ───────────────────────
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const persisted = loadFromStorage();
    if (persisted) {
      setState(persisted);
    }
    setHydrated(true);
  }, []);

  // ── Persist to localStorage on state change (after hydration) ─────
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(state);
  }, [state, hydrated]);

  // ── Derived values ────────────────────────────────────────────────
  const activeSteps = useMemo(() => getActiveSteps(state), [state]);
  const currentStep = useMemo(() => getCurrentStep(state), [state]);
  const progress = useMemo(
    () => computeQuestionnaireProgress(state),
    [state]
  );
  const hasSavedProgress = useMemo(() => checkStorageHasProgress(), [state]);

  // ── Actions ───────────────────────────────────────────────────────

  const goNext = useCallback((): boolean => {
    const next = goToNextStep(state);
    if (!next) return false;
    setState(next);
    return true;
  }, [state]);

  const goBack = useCallback((): boolean => {
    const prev = goToPreviousStep(state);
    if (!prev) return false;
    setState(prev);
    return true;
  }, [state]);

  const startComplet = useCallback((): void => {
    setState((s) => startCompletPhase(s));
  }, []);

  const toggleMulti = useCallback((id: string, val: number): void => {
    setState((s) => toggleMultiAnswer(s, id, val));
  }, []);

  const setProfileValue = useCallback((key: string, value: any): void => {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, [key]: value },
    }));
  }, []);

  const setAnswerValue = useCallback((key: string, value: any): void => {
    setState((s) => ({
      ...s,
      ans: { ...s.ans, [key]: value },
    }));
  }, []);

  const markFlag = useCallback((flag: string): void => {
    setState((s) => ({ ...s, [flag]: true }));
  }, []);

  const reset = useCallback((): void => {
    clearStorage();
    setState(resetQuestionnaireState());
  }, []);

  return {
    state,
    activeSteps,
    currentStep,
    progress,
    hasSavedProgress,
    hydrated,
    goNext,
    goBack,
    startComplet,
    toggleMulti,
    setProfileValue,
    setAnswerValue,
    markFlag,
    reset,
  };
}
