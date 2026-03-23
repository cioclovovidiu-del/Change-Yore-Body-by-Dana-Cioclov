"use client";

import type { Step } from "@/lib/cyb-steps";
import * as S from "./step-styles";
import { blockBg, blockColor, blockBorder } from "./SingleChoiceStep";

export function ScaleStep({
  step,
  value,
  onChange,
}: {
  step: Step;
  value: number | undefined;
  onChange: (key: string, val: number) => void;
}) {
  const min = step.min ?? 0;
  const max = step.max ?? 5;
  const buttons: number[] = [];
  for (let v = min; v <= max; v++) buttons.push(v);

  return (
    <div style={S.slide}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 14px",
          borderRadius: 50,
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 10,
          background: blockBg(step.blockColor),
          color: blockColor(step.blockColor),
          border: `1px solid ${blockBorder(step.blockColor)}`,
        }}
      >
        {step.block}
      </div>
      <div style={S.qTitle}>{step.title || ""}</div>
      {step.sub && <div style={S.qSub}>{step.sub}</div>}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
        {buttons.map((v) => (
          <button
            key={v}
            onClick={() => onChange(step.id, v)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: value === v ? S.colors.teal : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${value === v ? S.colors.teal : "rgba(255,255,255,0.07)"}`,
              color: value === v ? "white" : "rgba(255,255,255,0.4)",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            {v}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 8, fontSize: "0.68rem", color: "rgba(255,255,255,0.2)" }}>
        <span>{step.minL || ""}</span>
        <span>{step.maxL || ""}</span>
      </div>
    </div>
  );
}
