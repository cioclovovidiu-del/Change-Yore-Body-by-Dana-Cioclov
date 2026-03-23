"use client";

import type { Step } from "@/lib/cyb-steps";
import { COPY } from "@/lib/cyb-copy";
import * as S from "./step-styles";
import { blockBg, blockColor, blockBorder } from "./SingleChoiceStep";

export function TextareaStep({
  step,
  value,
  onChange,
}: {
  step: Step;
  value: string;
  onChange: (key: string, val: string) => void;
}) {
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
      <textarea
        aria-label={step.title || "Răspuns"}
        placeholder={COPY.complet.ui.textareaPlaceholder}
        value={value || ""}
        onChange={(e) => onChange(step.id, e.target.value)}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 12,
          border: "1.5px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.03)",
          color: "white",
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontSize: "0.92rem",
          outline: "none",
          minHeight: 80,
          resize: "vertical",
        }}
      />
    </div>
  );
}
