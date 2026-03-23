"use client";

import type { Step } from "@/lib/cyb-steps";
import { emoMessages } from "@/lib/cyb-steps";
import { COPY } from "@/lib/cyb-copy";
import * as S from "./step-styles";

export function MeasuresStep({
  step,
  height,
  weight,
  profile,
  onChange,
}: {
  step: Step;
  height: number | undefined;
  weight: number | undefined;
  profile: Record<string, any>;
  onChange: (key: string, val: number | undefined) => void;
}) {
  const ok = (height ?? 0) > 100 && (height ?? 0) < 250 && (weight ?? 0) > 30 && (weight ?? 0) < 250;
  const emo = ok && emoMessages.measures ? emoMessages.measures(profile) : "";

  return (
    <div style={S.slide}>
      <div style={S.qLabel}>{step.label || ""}</div>
      <div style={S.qTitle}>{step.title || ""}</div>
      <div style={S.qSub}>{step.sub || ""}</div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "0.75rem", color: S.colors.text, marginBottom: 6 }}>
            {COPY.mini.ui.measures.heightLabel}
          </label>
          <input
            type="number"
            placeholder="165"
            value={height ?? ""}
            onChange={(e) => onChange("height", parseFloat(e.target.value) || undefined)}
            style={{ ...S.numberInput, margin: 0, maxWidth: "none", width: "100%", fontSize: "1.4rem" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "0.75rem", color: S.colors.text, marginBottom: 6 }}>
            {COPY.mini.ui.measures.weightLabel}
          </label>
          <input
            type="number"
            placeholder="72"
            value={weight ?? ""}
            onChange={(e) => onChange("weight", parseFloat(e.target.value) || undefined)}
            style={{ ...S.numberInput, margin: 0, maxWidth: "none", width: "100%", fontSize: "1.4rem" }}
          />
        </div>
      </div>
      {emo && <div style={S.emoMsg}>{emo}</div>}
    </div>
  );
}
