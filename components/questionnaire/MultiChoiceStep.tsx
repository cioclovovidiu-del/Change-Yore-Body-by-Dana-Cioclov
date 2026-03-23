"use client";

import type { Step } from "@/lib/cyb-steps";
import * as S from "./step-styles";
import { blockBg, blockColor, blockBorder } from "./SingleChoiceStep";

export function MultiChoiceStep({
  step,
  value,
  onToggle,
}: {
  step: Step;
  value: number[];
  onToggle: (id: string, val: number) => void;
}) {
  const opts = (step.opts || []) as string[];
  const selected = Array.isArray(value) ? value : [];

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
      {step.note && (
        <div style={{ fontSize: "0.75rem", color: "rgba(42,165,160,0.6)", fontStyle: "italic", marginBottom: 16 }}>
          {step.note}
        </div>
      )}
      <div>
        {opts.map((o, i) => {
          const isSel = selected.includes(i);
          return (
            <div
              key={i}
              role="checkbox"
              aria-checked={isSel}
              tabIndex={0}
              onClick={() => onToggle(step.id, i)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(step.id, i); } }}
              style={{
                padding: "11px 14px",
                borderRadius: 11,
                border: `1.5px solid ${isSel ? S.colors.teal : "rgba(255,255,255,0.07)"}`,
                background: isSel ? "rgba(42,165,160,0.08)" : "rgba(255,255,255,0.025)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "0.85rem",
                color: isSel ? S.colors.tealGlow : "rgba(255,255,255,0.55)",
                marginBottom: 6,
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  border: `1.5px solid ${isSel ? S.colors.teal : "rgba(255,255,255,0.12)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isSel ? S.colors.teal : "transparent",
                  color: "white",
                  fontSize: "0.7rem",
                  transition: "all 0.2s",
                }}
              >
                {isSel && "✓"}
              </div>
              <span>{o}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
