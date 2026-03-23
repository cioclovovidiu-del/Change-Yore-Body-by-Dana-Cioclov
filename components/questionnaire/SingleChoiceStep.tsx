"use client";

import type { Step } from "@/lib/cyb-steps";
import * as S from "./step-styles";

const LETTERS = "ABCDEFGHIJKLM";

export function SingleChoiceStep({
  step,
  value,
  onChange,
}: {
  step: Step;
  value: number | undefined;
  onChange: (key: string, val: number) => void;
}) {
  const opts = (step.opts || []) as string[];

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
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.map((o, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => onChange(step.id, i)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(step.id, i); } }}
            style={{
              padding: "12px 16px",
              borderRadius: 11,
              border: `1.5px solid ${value === i ? S.colors.teal : "rgba(255,255,255,0.07)"}`,
              background: value === i ? "rgba(42,165,160,0.1)" : "rgba(255,255,255,0.025)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.88rem",
              color: value === i ? S.colors.tealGlow : "rgba(255,255,255,0.6)",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                fontWeight: 700,
                flexShrink: 0,
                border: `1.5px solid ${value === i ? S.colors.teal : "rgba(255,255,255,0.1)"}`,
                background: value === i ? S.colors.teal : "transparent",
                color: value === i ? "white" : "rgba(255,255,255,0.3)",
                transition: "all 0.2s",
              }}
            >
              {LETTERS[i]}
            </div>
            <span>{o}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Block color helpers matching legacy CSS
function blockBg(c?: string): string {
  const map: Record<string, string> = {
    teal: "rgba(42,165,160,0.1)", gold: "rgba(201,168,76,0.1)",
    rose: "rgba(232,160,191,0.1)", purple: "rgba(139,92,246,0.1)", coral: "rgba(216,90,48,0.1)",
  };
  return map[c || ""] || "rgba(42,165,160,0.1)";
}
function blockColor(c?: string): string {
  const map: Record<string, string> = {
    teal: S.colors.tealGlow, gold: S.colors.gold,
    rose: "#E8A0BF", purple: "#8B5CF6", coral: "#D85A30",
  };
  return map[c || ""] || S.colors.tealGlow;
}
function blockBorder(c?: string): string {
  const map: Record<string, string> = {
    teal: "rgba(42,165,160,0.15)", gold: "rgba(201,168,76,0.15)",
    rose: "rgba(232,160,191,0.15)", purple: "rgba(139,92,246,0.15)", coral: "rgba(216,90,48,0.15)",
  };
  return map[c || ""] || "rgba(42,165,160,0.15)";
}

export { blockBg, blockColor, blockBorder };
