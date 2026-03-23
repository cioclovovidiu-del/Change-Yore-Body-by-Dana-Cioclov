"use client";
// =============================================================================
// DEV-ONLY: Questionnaire Runtime Shell
// Hidden route for verifying the extracted state machine + hook in React.
// NOT the final questionnaire UI. NOT linked from production pages.
// Route: /dev/questionnaire-runtime
// =============================================================================

import { useQuestionnaireRuntime } from "@/hooks/useQuestionnaireRuntime";
import type { Step } from "@/lib/cyb-steps";

// ── Generic step input control ──────────────────────────────────────────

function StepInput({
  step,
  profileValue,
  answerValue,
  onProfileChange,
  onAnswerChange,
  onToggleMulti,
}: {
  step: Step;
  profileValue: any;
  answerValue: any;
  onProfileChange: (key: string, val: any) => void;
  onAnswerChange: (key: string, val: any) => void;
  onToggleMulti: (id: string, val: number) => void;
}) {
  const t = step.type;

  // Profile-driven types: text, number, measures, activity, cards, gdpr_email
  if (t === "text") {
    return (
      <input
        type="text"
        placeholder={step.ph || step.id}
        value={profileValue ?? ""}
        onChange={(e) => onProfileChange(step.id, e.target.value)}
        style={inputStyle}
      />
    );
  }

  if (t === "number") {
    return (
      <input
        type="number"
        placeholder={step.ph || ""}
        min={step.min}
        max={step.max}
        value={profileValue ?? ""}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          onProfileChange(step.id, isNaN(v) ? undefined : v);
        }}
        style={inputStyle}
      />
    );
  }

  if (t === "measures") {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          placeholder="Height (cm)"
          value={profileValue?.height ?? ""}
          onChange={(e) =>
            onProfileChange("height", parseFloat(e.target.value) || undefined)
          }
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={profileValue?.weight ?? ""}
          onChange={(e) =>
            onProfileChange("weight", parseFloat(e.target.value) || undefined)
          }
          style={inputStyle}
        />
      </div>
    );
  }

  if (t === "activity") {
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => onProfileChange("activity", i)}
            style={profileValue === i ? btnActiveStyle : btnStyle}
          >
            Activity {i}
          </button>
        ))}
      </div>
    );
  }

  if (t === "cards") {
    const opts = step.opts || [];
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {opts.map((o: any, i: number) => {
          const label = typeof o === "string" ? o : o.title || `Option ${i}`;
          return (
            <button
              key={i}
              onClick={() => onProfileChange(step.id, i)}
              style={profileValue === i ? btnActiveStyle : btnStyle}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  if (t === "gdpr_email") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <input
          type="email"
          placeholder="email@example.ro"
          value={profileValue?.email ?? ""}
          onChange={(e) => onProfileChange("email", e.target.value)}
          style={inputStyle}
        />
        <label style={{ fontSize: 12, color: "#aaa" }}>
          <input
            type="checkbox"
            checked={!!profileValue?.gdpr}
            onChange={(e) => onProfileChange("gdpr", e.target.checked)}
          />{" "}
          GDPR consent
        </label>
      </div>
    );
  }

  // Answer-driven types: single, multi, scale, textarea
  if (t === "single") {
    const opts = (step.opts || []) as string[];
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {opts.map((o, i) => (
          <button
            key={i}
            onClick={() => onAnswerChange(step.id, i)}
            style={answerValue === i ? btnActiveStyle : btnStyle}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }

  if (t === "multi") {
    const opts = (step.opts || []) as string[];
    const selected: number[] = Array.isArray(answerValue) ? answerValue : [];
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {opts.map((o, i) => (
          <button
            key={i}
            onClick={() => onToggleMulti(step.id, i)}
            style={selected.includes(i) ? btnActiveStyle : btnStyle}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }

  if (t === "scale") {
    const min = step.min ?? 0;
    const max = step.max ?? 5;
    const buttons = [];
    for (let i = min; i <= max; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onAnswerChange(step.id, i)}
          style={answerValue === i ? btnActiveStyle : btnStyle}
        >
          {i}
        </button>
      );
    }
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {buttons}
      </div>
    );
  }

  if (t === "textarea") {
    return (
      <textarea
        placeholder={step.ph || "Scrie aici..."}
        value={answerValue ?? ""}
        onChange={(e) => onAnswerChange(step.id, e.target.value)}
        style={{ ...inputStyle, minHeight: 60 }}
      />
    );
  }

  // Passthrough types: welcome, transition, mini_results, complet_results
  if (t === "welcome" || t === "transition" || t === "mini_results" || t === "complet_results") {
    return <div style={{ color: "#888", fontSize: 13 }}>[ {t} screen — press Next to continue ]</div>;
  }

  return <div style={{ color: "#666", fontSize: 12 }}>Unknown step type: {t}</div>;
}

// ── Page Component ──────────────────────────────────────────────────────

export default function QuestionnaireRuntimeDevPage() {
  const rt = useQuestionnaireRuntime();

  if (!rt.hydrated) {
    return <div style={pageStyle}><p style={{ color: "#888" }}>Hydrating...</p></div>;
  }

  const s = rt.currentStep;

  // Determine the value source for the current step
  const isProfileStep = ["text", "number", "measures", "activity", "cards", "gdpr_email"].includes(s.type);
  const profileVal = s.type === "measures"
    ? { height: rt.state.profile.height, weight: rt.state.profile.weight }
    : s.type === "gdpr_email"
      ? { email: rt.state.profile.email, gdpr: rt.state.profile.gdpr }
      : rt.state.profile[s.id];
  const answerVal = rt.state.ans[s.id];

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: 16, color: "#3ECDC6", marginBottom: 16 }}>
        DEV: Questionnaire Runtime Shell
      </h1>

      {/* ── State Dashboard ─────────────────────────────────────── */}
      <table style={tableStyle}>
        <tbody>
          <tr><td style={tdLabel}>Phase</td><td style={tdVal}>{rt.state.phase}</td></tr>
          <tr><td style={tdLabel}>Step</td><td style={tdVal}>{rt.state.step} / {rt.activeSteps.length - 1}</td></tr>
          <tr><td style={tdLabel}>Step ID</td><td style={tdVal}>{s.id}</td></tr>
          <tr><td style={tdLabel}>Step Type</td><td style={tdVal}>{s.type}</td></tr>
          <tr><td style={tdLabel}>Block</td><td style={tdVal}>{s.block || "—"}</td></tr>
          <tr><td style={tdLabel}>Progress</td><td style={tdVal}>{rt.progress.pct}%</td></tr>
          <tr><td style={tdLabel}>Info</td><td style={tdVal}>{rt.progress.info || "—"}</td></tr>
          <tr><td style={tdLabel}>Can Go Back</td><td style={tdVal}>{rt.progress.canGoBack ? "Yes" : "No"}</td></tr>
          <tr><td style={tdLabel}>Is Results</td><td style={tdVal}>{rt.progress.isResults ? "Yes" : "No"}</td></tr>
          <tr><td style={tdLabel}>Saved Progress</td><td style={tdVal}>{rt.hasSavedProgress ? "Yes" : "No"}</td></tr>
          <tr><td style={tdLabel}>Active Steps</td><td style={tdVal}>{rt.activeSteps.length}</td></tr>
        </tbody>
      </table>

      {/* ── Step Title ──────────────────────────────────────────── */}
      {s.title && (
        <div style={{ margin: "12px 0 4px", color: "#e0e0e0", fontSize: 14, fontWeight: 600 }}>
          {s.title}
        </div>
      )}
      {s.sub && (
        <div style={{ marginBottom: 8, color: "#888", fontSize: 12 }}>
          {s.sub}
        </div>
      )}

      {/* ── Step Input ──────────────────────────────────────────── */}
      <div style={{ margin: "8px 0 16px" }}>
        <StepInput
          step={s}
          profileValue={profileVal}
          answerValue={answerVal}
          onProfileChange={rt.setProfileValue}
          onAnswerChange={rt.setAnswerValue}
          onToggleMulti={rt.toggleMulti}
        />
      </div>

      {/* ── Navigation Buttons ──────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => rt.goBack()} disabled={!rt.progress.canGoBack} style={navBtnStyle}>
          Back
        </button>
        <button onClick={() => rt.goNext()} style={{ ...navBtnStyle, background: "#2AA5A0", color: "#fff" }}>
          Next
        </button>
        {rt.state.phase === "MINI" && s.type === "mini_results" && (
          <button onClick={() => rt.startComplet()} style={{ ...navBtnStyle, background: "#C9A84C", color: "#fff" }}>
            Start COMPLET
          </button>
        )}
        <button onClick={() => rt.reset()} style={{ ...navBtnStyle, background: "#E07A6A", color: "#fff" }}>
          Reset
        </button>
      </div>

      {/* ── Raw State (collapsed) ───────────────────────────────── */}
      <details style={{ marginTop: 8 }}>
        <summary style={{ fontSize: 12, color: "#666", cursor: "pointer" }}>Raw State JSON</summary>
        <pre style={{ fontSize: 11, color: "#aaa", whiteSpace: "pre-wrap", marginTop: 4, maxHeight: 300, overflow: "auto" }}>
          {JSON.stringify(rt.state, null, 2)}
        </pre>
      </details>
    </div>
  );
}

// ── Minimal inline styles ───────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  maxWidth: 600,
  margin: "0 auto",
  padding: "24px 16px",
  fontFamily: "system-ui, sans-serif",
  background: "#0F1923",
  color: "#e0e0e0",
  minHeight: "100vh",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 13,
  borderCollapse: "collapse",
  marginBottom: 12,
};

const tdLabel: React.CSSProperties = {
  padding: "3px 8px 3px 0",
  color: "#888",
  whiteSpace: "nowrap",
  verticalAlign: "top",
};

const tdVal: React.CSSProperties = {
  padding: "3px 0",
  color: "#e0e0e0",
  fontFamily: "monospace",
  fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #333",
  background: "#1A2733",
  color: "#e0e0e0",
  fontSize: 14,
  width: "100%",
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #333",
  background: "#1A2733",
  color: "#aaa",
  fontSize: 12,
  cursor: "pointer",
};

const btnActiveStyle: React.CSSProperties = {
  ...btnStyle,
  borderColor: "#2AA5A0",
  background: "rgba(42,165,160,0.15)",
  color: "#3ECDC6",
};

const navBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #333",
  background: "#243442",
  color: "#e0e0e0",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
