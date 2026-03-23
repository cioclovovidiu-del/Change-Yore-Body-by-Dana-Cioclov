"use client";
// =============================================================================
// Production Questionnaire Runtime
// Serves the React questionnaire inside the landing page iframe.
// Route: /questionnaire-runtime
// Replaces: /landing-v2/CYB_Chestionar_Unified.html (via next.config rewrite)
// =============================================================================

import { useCallback, useEffect, useRef } from "react";
import { useQuestionnaireRuntime } from "@/hooks/useQuestionnaireRuntime";
import { StepDispatcher } from "@/components/questionnaire/StepDispatcher";
import { COPY } from "@/lib/cyb-copy";
import { canAdvanceStep, getActiveSteps } from "@/lib/cyb-questionnaire-state";
import {
  trackQuestionnaireStart,
  trackEmailProvided,
  trackMiniStep,
  trackCompletStart,
} from "@/lib/cyb-analytics";

export default function QuestionnaireRuntimePage() {
  const rt = useQuestionnaireRuntime();
  const mainRef = useRef<HTMLDivElement>(null);

  // ── Iframe height sync (matches legacy CYB_HEIGHT postMessage) ──────
  useEffect(() => {
    if (!mainRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.ceil(entry.contentRect.height);
        try {
          window.parent.postMessage({ type: "CYB_HEIGHT", height: h }, "*");
        } catch { /* not in iframe — safe to ignore */ }
      }
    });
    observer.observe(mainRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Navigation analytics wrapper (mirrors legacy goNext analytics) ──
  const handleGoNext = useCallback(() => {
    const s = rt.currentStep;
    const state = rt.state;

    if (s.type === "welcome" && !state._questionnaireStartTracked) {
      trackQuestionnaireStart();
      rt.markFlag("_questionnaireStartTracked");
    }
    if (s.type === "gdpr_email" && state.profile.email?.includes("@") && !state._emailProvidedTracked) {
      trackEmailProvided();
      rt.markFlag("_emailProvidedTracked");
    }

    const advanced = rt.goNext();

    if (advanced && state.phase === "MINI") {
      const newSteps = getActiveSteps({ ...state, step: state.step + 1 });
      const newStep = newSteps[state.step + 1];
      if (newStep) {
        trackMiniStep(newStep.id, state.step + 1);
      }
    }

    return advanced;
  }, [rt]);

  // ── startComplet wrapper (mirrors legacy startComplet analytics + email) ──
  const handleStartComplet = useCallback(() => {
    const state = rt.state;
    const route = COPY.route.get(state.profile.moment ?? 5);
    trackCompletStart(route);

    if (state.profile.gdpr && !state._miniEmailSent) {
      rt.markFlag("_miniEmailSent");
      try {
        fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "mini", profile: state.profile }),
        }).catch(() => {});
      } catch { /* swallow */ }
    }

    rt.startComplet();
  }, [rt]);

  if (!rt.hydrated) {
    return (
      <div ref={mainRef} style={shellStyle}>
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Hydrating...</p>
      </div>
    );
  }

  const s = rt.currentStep;
  const btnLabel = s.type === "welcome"
    ? COPY.ui.buttons.start
    : s.type === "gdpr_email"
      ? COPY.ui.buttons.seeResults
      : COPY.ui.buttons.next;

  return (
    <div ref={mainRef} style={shellStyle}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={headerStyle}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "#3ECDC6" }}>
          Change Your Body <span style={{ color: "#C9A84C", fontWeight: 400, fontStyle: "italic", fontSize: "0.75rem" }}>by Dana Cioclov</span>
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
          {rt.progress.info || ""}
        </div>
      </div>

      {/* ── Progress bar ──────────────────────────────────────────── */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #2AA5A0, #3ECDC6)",
            borderRadius: 2,
            width: `${rt.progress.pct}%`,
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      {/* ── Step content ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        <StepDispatcher
          step={s}
          profile={rt.state.profile}
          ans={rt.state.ans}
          state={rt.state}
          hasSavedProgress={rt.hasSavedProgress}
          onProfileChange={rt.setProfileValue}
          onAnswerChange={rt.setAnswerValue}
          onToggleMulti={rt.toggleMulti}
          onStartComplet={handleStartComplet}
          onMarkFlag={rt.markFlag}
          onReset={rt.reset}
        />
      </div>

      {/* ── Navigation buttons ────────────────────────────────────── */}
      {!rt.progress.isResults && (
        <div style={btnRowStyle}>
          <button
            onClick={() => rt.goBack()}
            style={{
              ...btnBackStyle,
              visibility: rt.progress.canGoBack ? "visible" : "hidden",
            }}
          >
            ← Înapoi
          </button>
          <button
            onClick={() => handleGoNext()}
            disabled={!canAdvanceStep(s, rt.state)}
            style={{
              ...(s.type === "gdpr_email" ? btnGoldStyle : btnNextStyle),
              ...(!canAdvanceStep(s, rt.state) ? { opacity: 0.35, pointerEvents: "none" as const, cursor: "not-allowed" } : {}),
            }}
          >
            {btnLabel}
          </button>
        </div>
      )}

      {/* ── Results actions (complet_results only — mini_results has inline CTA) */}
      {rt.progress.isResults && s.type === "complet_results" && (
        <div style={{ ...btnRowStyle, justifyContent: "center", gap: 12 }}>
          <button onClick={() => rt.reset()} style={{ ...btnBackStyle, visibility: "visible" }}>
            {COPY.ui.resetButton}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

const shellStyle: React.CSSProperties = {
  maxWidth: 520,
  margin: "0 auto",
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  fontFamily: "'Outfit', system-ui, sans-serif",
  color: "rgba(255,255,255,0.55)",
  background: "#0F1923",
};

const headerStyle: React.CSSProperties = {
  padding: "14px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid rgba(42,165,160,0.08)",
};

const btnRowStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "12px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(15,25,35,0.95)",
  backdropFilter: "blur(20px)",
  borderTop: "1px solid rgba(42,165,160,0.06)",
  zIndex: 100,
};

const btnNextStyle: React.CSSProperties = {
  padding: "12px 28px",
  borderRadius: 50,
  border: "none",
  fontFamily: "'Outfit', system-ui, sans-serif",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
  background: "linear-gradient(135deg, #2AA5A0, #157575)",
  color: "white",
  boxShadow: "0 4px 16px rgba(42,165,160,0.25)",
};

const btnGoldStyle: React.CSSProperties = {
  ...btnNextStyle,
  background: "linear-gradient(135deg, #C9A84C, #D4AF37)",
  boxShadow: "0 4px 16px rgba(201,168,76,0.25)",
};

const btnBackStyle: React.CSSProperties = {
  padding: "12px 28px",
  borderRadius: 50,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "rgba(255,255,255,0.4)",
  fontFamily: "'Outfit', system-ui, sans-serif",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
};
