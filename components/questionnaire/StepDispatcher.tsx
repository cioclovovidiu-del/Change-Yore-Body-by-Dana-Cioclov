"use client";

import type { Step } from "@/lib/cyb-steps";
import { WelcomeStep } from "./WelcomeStep";
import { TextInputStep } from "./TextInputStep";
import { NumberInputStep } from "./NumberInputStep";
import { MeasuresStep } from "./MeasuresStep";
import { ActivityStep } from "./ActivityStep";
import { CardsStep } from "./CardsStep";
import { GdprEmailStep } from "./GdprEmailStep";
import { SingleChoiceStep } from "./SingleChoiceStep";
import { MultiChoiceStep } from "./MultiChoiceStep";
import { ScaleStep } from "./ScaleStep";
import { TextareaStep } from "./TextareaStep";
import { TransitionStep } from "./TransitionStep";
import { MiniResultsStep } from "./MiniResultsStep";

export interface StepDispatcherProps {
  step: Step;
  profile: Record<string, any>;
  ans: Record<string, any>;
  hasSavedProgress: boolean;
  onProfileChange: (key: string, val: any) => void;
  onAnswerChange: (key: string, val: any) => void;
  onToggleMulti: (id: string, val: number) => void;
  onStartComplet: () => void;
  onReset: () => void;
}

export function StepDispatcher(props: StepDispatcherProps) {
  const { step, profile, ans, hasSavedProgress, onProfileChange, onAnswerChange, onToggleMulti, onStartComplet, onReset } = props;
  const t = step.type;

  // ── MINI profile-driven types ───────────────────────────────────────
  if (t === "welcome") {
    return <WelcomeStep hasSavedProgress={hasSavedProgress} onReset={onReset} />;
  }
  if (t === "text") {
    return <TextInputStep step={step} value={profile[step.id] || ""} profile={profile} onChange={onProfileChange} />;
  }
  if (t === "number") {
    return <NumberInputStep step={step} value={profile[step.id]} profile={profile} onChange={onProfileChange} />;
  }
  if (t === "measures") {
    return <MeasuresStep step={step} height={profile.height} weight={profile.weight} profile={profile} onChange={onProfileChange} />;
  }
  if (t === "activity") {
    return <ActivityStep step={step} value={profile.activity} profile={profile} onChange={onProfileChange} />;
  }
  if (t === "cards") {
    return <CardsStep step={step} value={profile[step.id]} profile={profile} onChange={onProfileChange} />;
  }
  if (t === "gdpr_email") {
    return <GdprEmailStep step={step} email={profile.email || ""} gdpr={!!profile.gdpr} onChange={onProfileChange} />;
  }

  // ── COMPLET answer-driven types ─────────────────────────────────────
  if (t === "single") {
    return <SingleChoiceStep step={step} value={ans[step.id]} onChange={onAnswerChange} />;
  }
  if (t === "multi") {
    return <MultiChoiceStep step={step} value={ans[step.id] || []} onToggle={onToggleMulti} />;
  }
  if (t === "scale") {
    return <ScaleStep step={step} value={ans[step.id]} onChange={onAnswerChange} />;
  }
  if (t === "textarea") {
    return <TextareaStep step={step} value={ans[step.id] || ""} onChange={onAnswerChange} />;
  }

  // ── Transition screens ──────────────────────────────────────────────
  if (t === "transition") {
    return <TransitionStep step={step} profile={profile} />;
  }

  // ── Results screens ─────────────────────────────────────────────────
  if (t === "mini_results") {
    return <MiniResultsStep profile={profile} hasSavedProgress={hasSavedProgress} onStartComplet={onStartComplet} onReset={onReset} />;
  }

  // ── Unsupported step types — generic fallback ───────────────────────
  return (
    <div style={{ padding: "32px 24px", maxWidth: 520, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
      <div style={{ marginBottom: 8, fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {step.type}
      </div>
      {step.title && <div style={{ color: "white", fontSize: 16, marginBottom: 4 }}>{step.title}</div>}
      {step.sub && <div style={{ fontSize: 13, marginBottom: 12 }}>{step.sub}</div>}
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
        [ {step.type} — press Next to continue ]
      </div>
    </div>
  );
}
