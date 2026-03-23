"use client";

import type { Step } from "@/lib/cyb-steps";
import { COPY } from "@/lib/cyb-copy";
import { calcBMI } from "@/lib/cyb-calc";
import { blockBg, blockColor, blockBorder } from "./SingleChoiceStep";
import * as S from "./step-styles";

export function TransitionStep({
  step,
  profile,
}: {
  step: Step;
  profile: Record<string, any>;
}) {
  const bmi = calcBMI(profile.weight, profile.height);

  return (
    <div style={{ ...S.slide, textAlign: "center", paddingTop: "12vh" }}>
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
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "1.6rem",
          color: "white",
          marginBottom: 12,
          fontWeight: 600,
        }}
        dangerouslySetInnerHTML={{ __html: step.title || "" }}
      />
      <p style={{ fontSize: "0.88rem", color: S.colors.text, lineHeight: 1.7 }}>
        {step.body || ""}
      </p>
      {step.miniResult && bmi > 0 && (
        <div
          style={{
            margin: "20px auto",
            padding: "16px 20px",
            borderRadius: 12,
            background: "rgba(42,165,160,0.06)",
            border: "1px solid rgba(42,165,160,0.1)",
            display: "inline-block",
          }}
        >
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2rem", fontWeight: 700, color: S.colors.tealGlow }}>
            {bmi.toFixed(1)}
          </div>
          <div style={{ fontSize: "0.75rem", color: S.colors.text }}>
            {COPY.complet.ui.miniResultLabel}
          </div>
        </div>
      )}
    </div>
  );
}
