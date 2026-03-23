"use client";

import type { Step } from "@/lib/cyb-steps";
import { emoMessages } from "@/lib/cyb-steps";
import * as S from "./step-styles";

export function TextInputStep({
  step,
  value,
  profile,
  onChange,
}: {
  step: Step;
  value: string;
  profile: Record<string, any>;
  onChange: (key: string, val: string) => void;
}) {
  const emo = value && emoMessages[step.id] ? emoMessages[step.id](profile) : "";

  return (
    <div style={S.slide}>
      <div style={S.qLabel}>{step.label || ""}</div>
      <div style={S.qTitle}>{step.title || ""}</div>
      <div style={S.qSub}>{step.sub || ""}</div>
      <input
        type="text"
        placeholder={step.ph || ""}
        value={value || ""}
        aria-label={step.title || step.id}
        onChange={(e) => onChange(step.id, e.target.value)}
        style={S.textInput}
      />
      {emo && <div style={S.emoMsg}>{emo}</div>}
    </div>
  );
}
