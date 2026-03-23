"use client";

import type { Step, CardOption } from "@/lib/cyb-steps";
import { emoMessages } from "@/lib/cyb-steps";
import * as S from "./step-styles";

export function CardsStep({
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
  const opts = (step.opts || []) as CardOption[];
  const emo = value !== undefined && emoMessages[step.id] ? emoMessages[step.id](profile) : "";

  return (
    <div style={S.slide}>
      <div style={S.qLabel}>{step.label || ""}</div>
      <div style={S.qTitle}>{step.title || ""}</div>
      <div style={S.qSub}>{step.sub || ""}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {opts.map((o, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => onChange(step.id, i)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(step.id, i); } }}
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              border: `1.5px solid ${value === i ? S.colors.teal : "rgba(255,255,255,0.08)"}`,
              background: value === i ? "rgba(42,165,160,0.1)" : "rgba(255,255,255,0.03)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "all 0.25s",
            }}
          >
            <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>{o.icon}</div>
            <div>
              <h4 style={{ fontSize: "0.92rem", color: "white", fontWeight: 500, marginBottom: 2 }}>{o.title}</h4>
              <p style={{ fontSize: "0.75rem", color: S.colors.text, lineHeight: 1.4, margin: 0 }}>{o.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {emo && <div style={S.emoMsg}>{emo}</div>}
    </div>
  );
}
