"use client";

import type { Step } from "@/lib/cyb-steps";
import { COPY } from "@/lib/cyb-copy";
import * as S from "./step-styles";

export function GdprEmailStep({
  step,
  email,
  gdpr,
  onChange,
}: {
  step: Step;
  email: string;
  gdpr: boolean;
  onChange: (key: string, val: any) => void;
}) {
  return (
    <div style={S.slide}>
      <div style={S.qLabel}>{step.label || ""}</div>
      <div style={S.qTitle}>{step.title || ""}</div>
      <div style={S.qSub}>{step.sub || ""}</div>
      <input
        type="email"
        placeholder={step.ph || ""}
        value={email || ""}
        aria-label="Email"
        onChange={(e) => onChange("email", e.target.value)}
        style={S.emailInput}
      />
      <div
        role="checkbox"
        aria-checked={!!gdpr}
        tabIndex={0}
        onClick={() => onChange("gdpr", !gdpr)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange("gdpr", !gdpr); } }}
        style={{
          padding: "11px 14px",
          borderRadius: 11,
          border: `1.5px solid ${gdpr ? S.colors.teal : "rgba(255,255,255,0.07)"}`,
          background: gdpr ? "rgba(42,165,160,0.08)" : "rgba(255,255,255,0.025)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: "0.85rem",
          color: gdpr ? S.colors.tealGlow : "rgba(255,255,255,0.55)",
          marginTop: 4,
          transition: "all 0.2s",
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            border: `1.5px solid ${gdpr ? S.colors.teal : "rgba(255,255,255,0.12)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: gdpr ? S.colors.teal : "transparent",
            color: "white",
            fontSize: "0.7rem",
            transition: "all 0.2s",
          }}
        >
          {gdpr && "✓"}
        </div>
        <span style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>{step.consent || ""}</span>
      </div>
      <div style={{ ...S.emoMsg, marginTop: 20 }}>{COPY.mini.ui.emailPreResults}</div>
    </div>
  );
}
