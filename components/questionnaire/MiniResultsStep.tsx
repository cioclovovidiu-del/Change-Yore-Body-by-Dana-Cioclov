"use client";
// =============================================================================
// MiniResultsStep — React port of renderMiniResults() from CYB_Render.js
// =============================================================================

import { useEffect, useMemo } from "react";
import { COPY } from "@/lib/cyb-copy";
import { trackMiniComplete, trackWhatsAppClick } from "@/lib/cyb-analytics";
import { calcBMI, calcBMR, calcTDEE, bmiCat, bmiPercent, idealWeight, projWeeks } from "@/lib/cyb-calc";
import { interpretSignals, resolveRoute, selectMessage, personalize, calcStressScore, calcHormonalScore } from "@/lib/cyb-engine";
import { buildPsychContext, buildFlowMessage } from "@/lib/cyb-psych";
import * as S from "./step-styles";

const R = COPY.mini.ui.results;
const U = COPY.mini.ui.upgrade;
const gl = COPY.shared.gaugeLabels;
const ml = R.macroLabels;

// ── Category color map (matches legacy CSS) ──
const catColors: Record<string, string> = {
  "cat-normal": "rgba(72,187,120,0.15)",
  "cat-over": "rgba(201,168,76,0.15)",
  "cat-obese": "rgba(224,122,106,0.15)",
  "cat-under": "rgba(232,160,191,0.15)",
};
const catTextColors: Record<string, string> = {
  "cat-normal": S.colors.green,
  "cat-over": S.colors.gold,
  "cat-obese": "#E07A6A",
  "cat-under": "#E8A0BF",
};

export function MiniResultsStep({
  profile,
  hasSavedProgress,
  onStartComplet,
  onReset,
  tracked,
  onMarkTracked,
}: {
  profile: Record<string, any>;
  hasSavedProgress: boolean;
  onStartComplet: () => void;
  onReset: () => void;
  tracked?: boolean;
  onMarkTracked?: () => void;
}) {
  const P = profile;

  // ── Analytics: fire once on first render if not already tracked ────
  useEffect(() => {
    if (tracked) return;
    const bmi = calcBMI(P.weight, P.height);
    const route = COPY.route.get(P.moment ?? 5);
    trackMiniComplete(route, bmi.toFixed(1));
    onMarkTracked?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Computed values (mirrors legacy exactly) ──────────────────────
  const computed = useMemo(() => {
    const bmi = calcBMI(P.weight, P.height);
    const bmr = calcBMR(P.weight, P.height, P.age);
    const tdee = calcTDEE(bmr, P.activity || 0);
    const cat = bmiCat(bmi, COPY.shared.bmiCategories);
    const ideal = idealWeight(P.height);
    const protein = Math.round(P.weight * 1.6);
    const fat = Math.round(tdee * 0.25 / 9);
    const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4);
    const deficit = tdee - 500;
    const targetW = P.weight * 0.88;
    const weeks = projWeeks(P.weight, targetW);

    // Psych/engine messaging
    let valText = "";
    let resText = "";
    try {
      const signals = interpretSignals(P, {});
      const resolved = resolveRoute(P, signals);
      const msgVal = selectMessage({ route: resolved.route, signals, purpose: "VALIDATION", screenContext: "ONBOARDING" });
      const msgRes = selectMessage({ route: resolved.route, signals, purpose: "RESULTS", screenContext: "RESULTS" });
      const psychCtx = buildPsychContext(P, signals, resolved, { stress: calcStressScore({}), hormonal: calcHormonalScore(P, {}) }, null, [], {}, {});
      const psychMsg = buildFlowMessage(psychCtx, "mini_results");
      valText = psychMsg || personalize(msgVal.text, P.name);
      resText = personalize(msgRes.text, P.name);
    } catch {
      valText = "Ești în locul potrivit. Hai să construim împreună.";
      resText = valText;
    }

    return { bmi, bmr, tdee, cat, ideal, protein, fat, carbs, deficit, targetW, weeks, valText, resText };
  }, [P]);

  const { bmi, bmr, tdee, cat, ideal, protein, fat, carbs, deficit, targetW, weeks, valText, resText } = computed;
  const routeLabel = COPY.route.get(P.moment ?? 5);
  const goalName = COPY.shared.goalNames[P.goal ?? 0] || "sănătate";

  return (
    <div style={{ ...S.slide, paddingTop: "4vh" }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: "0.75rem", color: S.colors.tealGlow, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          {R.headerTitle(P.name)}
        </div>
        <h2
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.8rem", color: "white", fontWeight: 600, lineHeight: 1.2 }}
          dangerouslySetInnerHTML={{ __html: R.heading }}
        />
        <p style={{ fontSize: "0.82rem", color: S.colors.text, marginTop: 8 }}>
          {R.routePrefix}: <strong style={{ color: S.colors.gold }}>{routeLabel}</strong>
        </p>
      </div>

      {/* ── Validation / psych message ──────────────────────────── */}
      <div style={{ ...S.emoMsg, marginBottom: 20 }}>{valText}</div>

      {/* ── BMI Section ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={sectionHeading}>
          <span style={{ color: S.colors.green }}>✓</span> {R.imcHeading}
        </h3>
        <div style={resultCard}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2.8rem", fontWeight: 700, color: S.colors.tealGlow, lineHeight: 1 }}>
              {bmi.toFixed(1)}
            </div>
            <div>
              <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, background: catColors[cat.cls] || catColors["cat-normal"], color: catTextColors[cat.cls] || S.colors.green }}>
                {cat.label}
              </span>
            </div>
          </div>
          {/* Gauge */}
          <div style={{ width: "100%", height: 12, borderRadius: 6, background: "linear-gradient(90deg, #3B82F6 0%, #48BB78 25%, #48BB78 45%, #C9A84C 65%, #E07A6A 85%, #DC2626 100%)", position: "relative", margin: "16px 0 8px" }}>
            <div style={{ position: "absolute", top: -4, width: 4, height: 20, background: "white", borderRadius: 2, left: `${bmiPercent(bmi)}%`, transition: "left 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
            {gl.map((l, i) => <span key={i}>{l}</span>)}
          </div>
        </div>
      </div>

      {/* ── Recommendations ────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={sectionHeading}>
          <span style={{ color: S.colors.green }}>✓</span> {R.recoHeading}
        </h3>
        <div style={{ ...resultCard, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
          {resText}
        </div>
      </div>

      {/* ── Free items ─────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "20px 0" }}>
        {R.freeItems.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(72,187,120,0.06)", border: "1px solid rgba(72,187,120,0.1)" }}>
            <span style={{ color: S.colors.green, fontWeight: 700 }}>✓</span>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>{item}</p>
          </div>
        ))}
      </div>

      {/* ── CTA Zone (startComplet + WhatsApp) ─────────────────── */}
      <div style={{ margin: "28px 0", padding: 24, borderRadius: 16, background: "linear-gradient(135deg, rgba(42,165,160,0.08), rgba(201,168,76,0.06))", border: "1px solid rgba(201,168,76,0.15)", textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.3rem", color: "white", marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: U.heading }} />
        <p style={{ fontSize: "0.85rem", color: S.colors.text, marginBottom: 16, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: U.body }} />
        <button onClick={onStartComplet} style={{ ...btnFullStyle, marginTop: 14 }}>
          Deblochează analiza ta completă →
        </button>
        <p style={{ marginTop: 8, fontSize: "0.75rem", color: S.colors.text, lineHeight: 1.5 }}>
          Îți deblocăm profilul metabolic, obstacolele principale și direcția ta personalizată.
        </p>
        <p style={{ marginTop: 10, fontSize: "0.72rem", color: S.colors.tealGlow, fontStyle: "italic", opacity: 0.7, lineHeight: 1.5 }}>
          Dacă simți că ți se potrivește, nu amâna — direcția corectă contează chiar de la început.
        </p>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "18px 0" }} />
        <a href={U.ctaDirectWhatsApp} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick("mini_results_direct")} style={btnGoldLink}>
          {U.ctaDirectButton}
        </a>
        <p style={{ marginTop: 10, fontSize: "0.75rem", color: S.colors.text }}>{U.ctaGroupBody}</p>
        <a href={U.ctaGroupWhatsApp} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick("mini_results_group")} style={{ display: "inline-block", marginTop: 4, fontSize: "0.75rem", color: "rgba(37,211,102,0.7)", textDecoration: "underline" }}>
          {U.ctaGroupButton}
        </a>
      </div>

      {/* ── Blurred locked sections ────────────────────────────── */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, textAlign: "center", padding: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: "1.2rem" }}>🔒</div>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", color: "white", marginBottom: 16, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: R.blurOverlay }} />
        </div>
        {/* Blurred content */}
        <div style={{ filter: "blur(8px)", pointerEvents: "none", userSelect: "none" }}>
          <h3 style={sectionHeading}>{R.bmrHeading}</h3>
          <div style={resultCard}>
            <div style={bigNum}>{Math.round(bmr)}</div>
            <div style={resultLabel}>{R.bmrDesc}</div>
          </div>
          <h3 style={sectionHeading}>{R.tdeeHeading}</h3>
          <div style={resultCard}>
            <div style={bigNum}>{Math.round(tdee)}</div>
            <div style={resultLabel}>{R.tdeeDesc}</div>
          </div>
          <h3 style={sectionHeading}>{R.macroHeading}</h3>
          <div style={{ ...resultCard, display: "flex", gap: 20 }}>
            <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: "1.4rem", fontWeight: 700, color: S.colors.tealGlow }}>{protein}g</div><div style={resultLabel}>{ml[0]}</div></div>
            <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: "1.4rem", fontWeight: 700, color: S.colors.gold }}>{carbs}g</div><div style={resultLabel}>{ml[1]}</div></div>
            <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#E8A0BF" }}>{fat}g</div><div style={resultLabel}>{ml[2]}</div></div>
          </div>
          <h3 style={sectionHeading}>{R.projHeading}</h3>
          <div style={{ ...resultCard, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)" }} dangerouslySetInnerHTML={{ __html: R.projBody(Math.round(deficit), weeks, targetW.toFixed(1)) }} />
          <h3 style={sectionHeading}>{R.idealHeading}</h3>
          <div style={resultCard}>
            <div style={{ fontSize: "1.2rem", fontWeight: 600, color: S.colors.tealGlow }}>{ideal}</div>
            <div style={resultLabel}>{R.idealDesc(P.height)}</div>
          </div>
        </div>
      </div>

      {/* ── Upgrade plans ──────────────────────────────────────── */}
      <div style={{ margin: "20px 0", padding: 20, borderRadius: 16, background: "linear-gradient(135deg, rgba(42,165,160,0.08), rgba(201,168,76,0.06))", border: "1px solid rgba(201,168,76,0.15)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {U.plans.map((p, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", borderRadius: 10,
              background: p.gold ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${p.hl ? S.colors.teal : p.gold ? S.colors.gold : "rgba(255,255,255,0.06)"}`,
              fontSize: "0.82rem",
            }}>
              <span style={{ color: p.hl ? "white" : p.gold ? S.colors.gold : "rgba(255,255,255,0.7)" }}>{p.name}</span>
              <span style={{ fontWeight: 600, color: p.hl || p.gold ? S.colors.gold : S.colors.tealGlow }}>
                {p.price}
                {p.old && <span style={{ fontSize: "0.7rem", color: S.colors.text, textDecoration: "line-through", marginLeft: 4 }}>{p.old}</span>}
              </span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: "0.75rem", color: S.colors.text }} dangerouslySetInnerHTML={{ __html: U.footer(routeLabel) }} />
      </div>

      {/* ── Reset link ─────────────────────────────────────────── */}
      {hasSavedProgress && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={onReset} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textDecoration: "underline", cursor: "pointer", background: "none", border: "none" }}>
            {COPY.ui.resetButton}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shared styles ───────────────────────────────────────────────────

const sectionHeading: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: "1.2rem",
  color: "white",
  marginBottom: 12,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const resultCard: React.CSSProperties = {
  padding: 20,
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  marginBottom: 12,
};

const bigNum: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: "2.8rem",
  fontWeight: 700,
  color: S.colors.tealGlow,
  lineHeight: 1,
};

const resultLabel: React.CSSProperties = {
  fontSize: "0.8rem",
  color: S.colors.text,
  marginTop: 4,
};

const btnFullStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 28px",
  borderRadius: 50,
  border: "none",
  fontFamily: "'Outfit', system-ui, sans-serif",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  background: "linear-gradient(135deg, #2AA5A0, #157575)",
  color: "white",
  boxShadow: "0 4px 16px rgba(42,165,160,0.25)",
};

const btnGoldLink: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  padding: "12px 28px",
  borderRadius: 50,
  fontFamily: "'Outfit', system-ui, sans-serif",
  fontSize: "0.88rem",
  fontWeight: 600,
  background: "linear-gradient(135deg, #C9A84C, #D4AF37)",
  color: "white",
  boxShadow: "0 4px 16px rgba(201,168,76,0.25)",
};
