"use client";
// =============================================================================
// DEV-ONLY: Questionnaire Runtime Shell
// Hidden route for verifying the extracted state machine + hook + components.
// NOT the final questionnaire UI. NOT linked from production pages.
// Route: /dev/questionnaire-runtime
// =============================================================================

import { useQuestionnaireRuntime } from "@/hooks/useQuestionnaireRuntime";
import { StepDispatcher } from "@/components/questionnaire/StepDispatcher";
import { COPY } from "@/lib/cyb-copy";
import { canAdvanceStep } from "@/lib/cyb-questionnaire-state";

export default function QuestionnaireRuntimeDevPage() {
  const rt = useQuestionnaireRuntime();

  if (!rt.hydrated) {
    return (
      <div style={shellStyle}>
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
    <div style={shellStyle}>
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
          hasSavedProgress={rt.hasSavedProgress}
          onProfileChange={rt.setProfileValue}
          onAnswerChange={rt.setAnswerValue}
          onToggleMulti={rt.toggleMulti}
          onStartComplet={rt.startComplet}
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
            onClick={() => rt.goNext()}
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

      {/* ── Debug panel (collapsed) ───────────────────────────────── */}
      <details style={{ padding: "8px 24px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <summary style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", cursor: "pointer" }}>Debug</summary>
        <table style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6, borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            <tr><td style={dbgL}>Phase</td><td>{rt.state.phase}</td></tr>
            <tr><td style={dbgL}>Step</td><td>{rt.state.step} / {rt.activeSteps.length - 1}</td></tr>
            <tr><td style={dbgL}>ID</td><td>{s.id}</td></tr>
            <tr><td style={dbgL}>Type</td><td>{s.type}</td></tr>
            <tr><td style={dbgL}>Block</td><td>{s.block || "—"}</td></tr>
            <tr><td style={dbgL}>Pct</td><td>{rt.progress.pct}%</td></tr>
            <tr><td style={dbgL}>Saved</td><td>{rt.hasSavedProgress ? "Y" : "N"}</td></tr>
          </tbody>
        </table>
        <details style={{ marginTop: 4 }}>
          <summary style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", cursor: "pointer" }}>Raw JSON</summary>
          <pre style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: "pre-wrap", marginTop: 2, maxHeight: 200, overflow: "auto" }}>
            {JSON.stringify(rt.state, null, 2)}
          </pre>
        </details>
      </details>
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

const dbgL: React.CSSProperties = {
  padding: "1px 8px 1px 0",
  color: "rgba(255,255,255,0.25)",
  whiteSpace: "nowrap",
};
