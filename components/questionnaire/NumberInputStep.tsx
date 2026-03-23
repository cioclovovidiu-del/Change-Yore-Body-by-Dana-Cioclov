"use client";

import type { Step } from "@/lib/cyb-steps";
import { emoMessages } from "@/lib/cyb-steps";
import * as S from "./step-styles";

export function NumberInputStep({
  step,
  value,
  profile,
  onChange,
}: {
  step: Step;
  value: number | undefined;
  profile: Record<string, any>;
  onChange: (key: string, val: number | undefined) => void;
}) {
  const isValid =
    typeof value === "number" &&
    !isNaN(value) &&
    (step.min === undefined || value >= step.min) &&
    (step.max === undefined || value <= step.max);

  const emo = isValid && emoMessages[step.id] ? emoMessages[step.id](profile) : "";

  return (
    <div style={S.slide}>
      <div style={S.qLabel}>{step.label || ""}</div>
      <div style={S.qTitle}>{step.title || ""}</div>
      <div style={S.qSub}>{step.sub || ""}</div>
      <input
        type="number"
        placeholder={step.ph || ""}
        min={step.min}
        max={step.max}
        value={value ?? ""}
        aria-label={step.title || step.id}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          onChange(step.id, isNaN(v) ? undefined : v);
        }}
        style={S.numberInput}
      />
      {emo && <div style={S.emoMsg}>{emo}</div>}
    </div>
  );
}
