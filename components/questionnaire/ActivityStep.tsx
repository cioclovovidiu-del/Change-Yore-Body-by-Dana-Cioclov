"use client";

import type { Step } from "@/lib/cyb-steps";
import { emoMessages } from "@/lib/cyb-steps";
import * as S from "./step-styles";

const ACTIVITY_OPTIONS = [
  "Sedentară — birou, mașină, canapea",
  "Ușor activă — mers pe jos ocazional",
  "Moderat activă — mișcare 2-3x/săpt.",
  "Foarte activă — sport zilnic",
];

export function ActivityStep({
  step,
  value,
  profile,
  onChange,
}: {
  step: Step;
  value: number | undefined;
  profile: Record<string, any>;
  onChange: (key: string, val: number) => void;
}) {
  const emo = value !== undefined && emoMessages.activity ? emoMessages.activity(profile) : "";

  return (
    <div style={S.slide}>
      <div style={S.qLabel}>{step.label || ""}</div>
      <div style={S.qTitle}>{step.title || ""}</div>
      <div style={S.qSub}>{step.sub || ""}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ACTIVITY_OPTIONS.map((label, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => onChange("activity", i)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange("activity", i); } }}
            style={{
              padding: 12,
              borderRadius: 12,
              border: `1.5px solid ${value === i ? S.colors.teal : "rgba(255,255,255,0.08)"}`,
              background: value === i ? "rgba(42,165,160,0.1)" : "rgba(255,255,255,0.03)",
              cursor: "pointer",
              textAlign: "center",
              fontSize: "0.82rem",
              color: value === i ? S.colors.tealGlow : "rgba(255,255,255,0.5)",
              transition: "all 0.25s",
            }}
          >
            {label}
          </div>
        ))}
      </div>
      {emo && <div style={S.emoMsg}>{emo}</div>}
    </div>
  );
}
