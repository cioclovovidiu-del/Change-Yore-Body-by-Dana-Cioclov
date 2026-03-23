"use client";

import { COPY } from "@/lib/cyb-copy";
import { colors } from "./step-styles";

const w = COPY.mini.ui.welcome;

export function WelcomeStep({ hasSavedProgress, onReset }: { hasSavedProgress: boolean; onReset: () => void }) {
  return (
    <div style={{ textAlign: "center", paddingTop: "8vh", maxWidth: 520, padding: "32px 24px 140px" }}>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "2rem",
          color: "white",
          lineHeight: 1.2,
          marginBottom: 16,
          fontWeight: 600,
        }}
        dangerouslySetInnerHTML={{ __html: w.heading }}
      />
      <p style={{ color: colors.text, fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 10 }}>{w.subtitle}</p>

      <div
        style={{
          margin: "24px 0",
          padding: 18,
          borderRadius: 14,
          background: "rgba(42,165,160,0.06)",
          border: "1px solid rgba(42,165,160,0.12)",
          textAlign: "left",
        }}
      >
        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", color: colors.tealGlow, marginBottom: 10 }}>
          {w.freeHeading}
        </h3>
        {w.freeItems.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.green, flexShrink: 0 }} />
            {item}
          </div>
        ))}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", color: colors.gold, marginBottom: 10 }}>
          {w.blurHeading}
        </h3>
        {w.blurItems.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.gold, flexShrink: 0 }} />
            {item}
          </div>
        ))}
      </div>

      {hasSavedProgress && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={onReset}
            style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textDecoration: "underline", cursor: "pointer", background: "none", border: "none" }}
          >
            {COPY.ui.resetButton}
          </button>
        </div>
      )}
    </div>
  );
}
