"use client";
// =============================================================================
// CompletResultsStep — React port of renderCompletResults() from CYB_Render.js
// =============================================================================

import { useEffect, useMemo } from "react";
import { trackCompletComplete, trackWhatsAppClick } from "@/lib/cyb-analytics";
import { COPY } from "@/lib/cyb-copy";
import { calcBMR, calcTDEE } from "@/lib/cyb-calc";
import {
  interpretSignals,
  resolveRoute,
  selectMessage,
  personalize,
  calcStressScore,
  calcHormonalScore,
  getMetabolicProfile,
  getSafetyTags,
} from "@/lib/cyb-engine";
import type { SafetyTag } from "@/lib/cyb-engine";
import {
  buildPsychContext,
  buildFlowMessage,
  buildPersonalLetterContext,
  getPersonalLetterPolicy,
  buildPersonalLetter,
} from "@/lib/cyb-psych";
import { buildDayPlan, shoppingList } from "@/lib/cyb-recipes";
import { buildTrainingPlan } from "@/lib/cyb-training";
import { buildVisible, totalQ } from "@/lib/cyb-steps";
import * as S from "./step-styles";

// ── COPY aliases ────────────────────────────────────────────────────
const CR = COPY.complet.ui.results;
const SL = CR.stressLevels;
const HL = CR.hormonalLevels;
const PL = CR.paramLabels;

// ── Helpers ─────────────────────────────────────────────────────────

/** Safe name: trimmed, reject raw placeholder, HTML-escape */
function _safeName(name: unknown): string {
  const n = typeof name === "string" ? name.trim() : "";
  if (!n || n === "[Prenume]") return "";
  return _esc(n);
}

/** Minimal HTML escape (for personal letter text) */
function _esc(s: unknown): string {
  if (typeof s !== "string") return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Slot display labels ─────────────────────────────────────────────
const SLOT_LABELS: Record<string, string> = {
  breakfast: "☀️ Mic dejun",
  lunch: "🍽️ Prânz",
  dinner: "🌙 Cină",
  snack1: "🥜 Gustare 1",
  snack2: "🥜 Gustare 2",
};

// ── Component ───────────────────────────────────────────────────────

export function CompletResultsStep({
  profile,
  ans,
  hasSavedProgress,
  onReset,
  tracked,
  onMarkTracked,
}: {
  profile: Record<string, any>;
  ans: Record<string, any>;
  hasSavedProgress: boolean;
  onReset: () => void;
  tracked?: boolean;
  onMarkTracked?: () => void;
}) {
  const P = profile;
  const A = ans;

  // ── Analytics: fire once on first render if not already tracked ────
  useEffect(() => {
    if (tracked) return;
    const route = COPY.route.get(P.moment ?? 5);
    trackCompletComplete(route);
    onMarkTracked?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Computed values ─────────────────────────────────────────────
  const computed = useMemo(() => {
    let valText = "";
    let resText = "";
    let cStress = 0;
    let cHormonal = 0;
    let cMetaProfile: { name: string; color: string; desc: string } = {
      name: "Profil General",
      desc: "Profil metabolic standard.",
      color: "var(--teal-glow)",
    };
    let cTags: SafetyTag[] = [];
    let cLetter: { text: string } | null = null;

    try {
      const sig = interpretSignals(P, A);
      const route = resolveRoute(P, sig);
      const msgVal = selectMessage({
        route: route.route,
        signals: sig,
        purpose: "VALIDATION",
        screenContext: "ONBOARDING",
      });
      const msgRes = selectMessage({
        route: route.route,
        signals: sig,
        purpose: "RESULTS",
        screenContext: "RESULTS",
      });
      resText = personalize(msgRes.text, P.name);
      cStress = calcStressScore(A);
      cHormonal = calcHormonalScore(P, A);
      cMetaProfile = getMetabolicProfile(
        P,
        A,
        COPY.metabolicProfiles,
        (COPY.fallback || ({} as any)).metabolicProfile || {
          name: "Profil General",
          desc: "Profil metabolic standard.",
          color: "var(--teal-glow)",
        }
      );
      cTags = getSafetyTags(P, A);
      const psychCtx = buildPsychContext(
        P,
        sig,
        route,
        { stress: cStress, hormonal: cHormonal },
        cMetaProfile,
        cTags,
        A,
        {}
      );
      const psychMsg = buildFlowMessage(psychCtx, "complet_results");
      valText = psychMsg || personalize(msgVal.text, P.name);

      // Personal letter
      try {
        const letterCtx = buildPersonalLetterContext(
          P,
          sig,
          route,
          { stress: cStress, hormonal: cHormonal },
          cMetaProfile,
          cTags,
          A,
          {},
          psychCtx.tone
        );
        const letterPolicy = getPersonalLetterPolicy(letterCtx);
        if (letterPolicy.allowed) {
          cLetter = buildPersonalLetter(letterCtx);
        }
      } catch {
        cLetter = null;
      }
    } catch {
      valText = valText || "Ești în locul potrivit. Hai să construim împreună.";
      resText = resText || valText;
    }

    const cBmr = calcBMR(P.weight, P.height, P.age);
    const cTdee = calcTDEE(cBmr, P.activity || 0);
    const cSteps = buildVisible(P, A);
    const cTotalQ = totalQ(cSteps);

    const stressLabel =
      cStress > 65 ? SL.high : cStress > 40 ? SL.moderate : SL.low;
    const hormonalLabel =
      cHormonal > 60 ? HL.high : cHormonal > 35 ? HL.moderate : HL.low;

    // Key Takeaways (D7)
    const takeaways: { icon: string; text: string }[] = [];
    if (cStress > 65) {
      takeaways.push({
        icon: "🔴",
        text: "Nivelul tău de stres este ridicat — cortizolul probabil îți influențează greutatea mai mult decât alimentația în sine.",
      });
    } else if (cStress > 40) {
      takeaways.push({
        icon: "🟡",
        text: "Stresul tău moderat sugerează că un plan bazat pe consistență va funcționa mai bine decât restricții severe.",
      });
    } else {
      takeaways.push({
        icon: "🟢",
        text: "Nivelul tău scăzut de stres e un avantaj real — corpul tău e pregătit să răspundă bine la schimbări.",
      });
    }
    if (cHormonal > 60) {
      takeaways.push({
        icon: "💜",
        text: 'Schimbările hormonale pe care le traversezi cer o abordare adaptată — nu doar „mănâncă mai puțin, mișcă-te mai mult".',
      });
    } else if (cHormonal > 35) {
      takeaways.push({
        icon: "💛",
        text: "Corpul tău traversează ajustări hormonale moderate — planul va ține cont de ele pentru rezultate reale.",
      });
    }
    if (A.q14 === 0) {
      takeaways.push({
        icon: "🍽️",
        text: 'Cu 1–2 mese pe zi, metabolismul tău poate fi în „mod conservare". Restructurarea meselor poate face diferența.',
      });
    } else if (A.q14 === 4) {
      takeaways.push({
        icon: "🍽️",
        text: "Lipsa unui ritm alimentar clar îți perturbă metabolismul. Structura meselor va fi prioritară în planul tău.",
      });
    } else if (A.q15 === 0) {
      takeaways.push({
        icon: "💡",
        text: "Mâncatul emoțional frecvent nu e lipsă de voință — e biologie. Planul tău va include strategii concrete pentru gestionare.",
      });
    }
    if (A.q17 >= 3) {
      takeaways.push({
        icon: "🔄",
        text: "Ai experiență cu multe diete anterioare — ai nevoie de un plan sustenabil, nu de încă un restart drastic.",
      });
    } else if (A.q17 === 0) {
      takeaways.push({
        icon: "✨",
        text: "Nu ai experiență cu diete — asta e un avantaj. Corpul tău va răspunde bine la o primă abordare structurată.",
      });
    }
    if ((A.q5 || 0) >= 2) {
      takeaways.push({
        icon: "🌙",
        text: "Somnul tău afectează producția de leptină și grelină — hormonii care controlează foamea și sațietatea.",
      });
    }
    const finalTakeaways = takeaways.slice(0, 4);

    // Meal plan
    let dayPlan: any = null;
    let shopList: { name: string; count: number; recipes: string[] }[] = [];
    try {
      dayPlan = buildDayPlan(P, A);
      if (dayPlan && dayPlan.slots) {
        shopList = shoppingList(dayPlan);
      }
    } catch {
      dayPlan = null;
    }

    // Training plan
    let trainingPlan: any = null;
    try {
      trainingPlan = buildTrainingPlan(P, A);
      if (
        trainingPlan &&
        (!trainingPlan.sessions || trainingPlan.sessions.length === 0)
      ) {
        trainingPlan = null;
      }
    } catch {
      trainingPlan = null;
    }

    // Allergies display
    const allergiesDisplay = (() => {
      const al: number[] = A.q19b || [];
      if (al.length === 0 || al.indexOf(6) !== -1)
        return CR.allergyOptions[6];
      return al
        .map((i: number) => CR.allergyOptions[i] || "")
        .filter(Boolean)
        .join(", ");
    })();

    return {
      valText,
      resText,
      cStress,
      cHormonal,
      cMetaProfile,
      cTags,
      cLetter,
      cBmr,
      cTdee,
      cTotalQ,
      stressLabel,
      hormonalLabel,
      finalTakeaways,
      dayPlan,
      shopList,
      trainingPlan,
      allergiesDisplay,
    };
  }, [P, A]);

  const {
    valText,
    resText,
    cStress,
    cHormonal,
    cMetaProfile,
    cTags,
    cLetter,
    cBmr,
    cTdee,
    cTotalQ,
    stressLabel,
    hormonalLabel,
    finalTakeaways,
    dayPlan,
    shopList,
    trainingPlan,
    allergiesDisplay,
  } = computed;

  // ── Personal letter paragraphs ──────────────────────────────────
  const letterParagraphs = useMemo(() => {
    if (
      !cLetter ||
      typeof cLetter.text !== "string" ||
      cLetter.text.length < 100
    )
      return null;
    const safeText = cLetter.text.replace(/\[Prenume\]/g, _safeName(P.name));
    const paragraphs = safeText.split("\n\n");
    return paragraphs
      .map((p, i) => {
        const trimmed = p.replace(/^\s+|\s+$/g, "");
        if (!trimmed) return null;
        const isSignature =
          i === paragraphs.length - 1 && trimmed.indexOf("\n") !== -1;
        return { text: trimmed, isSignature };
      })
      .filter(Boolean) as { text: string; isSignature: boolean }[];
  }, [cLetter, P.name]);

  const stressColor =
    cStress > 65
      ? "#DC2626"
      : cStress > 40
        ? S.colors.gold
        : S.colors.green;
  const hormonalColor =
    cHormonal > 60
      ? "#9333EA"
      : cHormonal > 35
        ? S.colors.gold
        : S.colors.green;

  return (
    <div style={{ ...S.slide, paddingTop: 24 }}>
      {/* ── A. HEADER ────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            fontSize: "0.7rem",
            color: S.colors.tealGlow,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {CR.headerTag}
        </div>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.6rem",
            color: "white",
            margin: "12px 0 4px",
            fontWeight: 600,
            lineHeight: 1.2,
          }}
          dangerouslySetInnerHTML={{ __html: CR.headerTitle(P.name) }}
        />
        <p style={{ fontSize: "0.82rem", color: S.colors.text }}>
          {CR.routePrefix}:{" "}
          <strong style={{ color: S.colors.gold }}>
            {COPY.route.get(P.moment)}
          </strong>{" "}
          · {cTotalQ} {CR.analyzedSuffix}
        </p>
      </div>

      {/* ── B. PSYCH VALIDATION MESSAGE ──────────────────────────── */}
      <div style={{ ...S.emoMsg, marginBottom: 20 }}>{valText}</div>

      {/* ── C. PERSONAL LETTER ───────────────────────────────────── */}
      {letterParagraphs && letterParagraphs.length > 0 && (
        <div
          style={{
            margin: "24px 0",
            padding: "24px 20px",
            borderRadius: 16,
            background:
              "linear-gradient(135deg, rgba(42,165,160,0.04), rgba(201,168,76,0.03))",
            border: "1px solid rgba(42,165,160,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: S.colors.tealGlow,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 14,
              fontWeight: 600,
            }}
          >
            Scrisoarea ta personală
          </div>
          <div>
            {letterParagraphs.map((p, i) =>
              p.isSignature ? (
                <p
                  key={i}
                  style={{
                    fontSize: "0.88rem",
                    color: S.colors.tealGlow,
                    lineHeight: 1.8,
                    marginTop: 16,
                    fontStyle: "italic",
                    whiteSpace: "pre-line",
                    marginBottom: 0,
                  }}
                >
                  {p.text}
                </p>
              ) : (
                <p
                  key={i}
                  style={{
                    fontSize: "0.88rem",
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: 1.8,
                    marginBottom: 14,
                    marginTop: 0,
                  }}
                >
                  {p.text}
                </p>
              )
            )}
          </div>
        </div>
      )}

      {/* ── D. KEY TAKEAWAYS (D7) ────────────────────────────────── */}
      {finalTakeaways.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <h3 style={{ ...sectionHeading, fontSize: "1.05rem", marginBottom: 4 }}>
            Ce am observat din răspunsurile tale
          </h3>
          <p
            style={{
              fontSize: "0.75rem",
              color: S.colors.text,
              marginBottom: 14,
            }}
          >
            Observații personalizate pe baza celor {cTotalQ} de răspunsuri:
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {finalTakeaways.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(42,165,160,0.04)",
                  border: "1px solid rgba(42,165,160,0.08)",
                }}
              >
                <span
                  style={{
                    fontSize: "1.1rem",
                    flexShrink: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {t.icon}
                </span>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── E. METABOLIC PROFILE CARD ────────────────────────────── */}
      <div style={profileCard}>
        <div
          style={{
            fontSize: "0.7rem",
            color: S.colors.text,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          {CR.profileLabel}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: cMetaProfile.color,
            marginBottom: 6,
          }}
        >
          {cMetaProfile.name}
        </div>
        <div style={{ fontSize: "0.85rem", color: S.colors.text, lineHeight: 1.7 }}>
          {cMetaProfile.desc}
        </div>
      </div>

      {/* ── F. STRESS SCORE ──────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={sectionHeading}>{CR.stressHeading}</h3>
        <div style={resCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: stressColor,
              }}
            >
              {cStress}%
            </div>
            <div style={{ fontSize: "0.78rem", color: S.colors.text }}>
              {stressLabel}
            </div>
          </div>
          <div style={scoreBar}>
            <div
              style={{
                width: `${cStress}%`,
                height: "100%",
                borderRadius: 4,
                background: stressColor,
                transition: "width 0.8s ease",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.3)",
              marginTop: 4,
            }}
          >
            {CR.stressSource}
          </div>
        </div>
      </div>

      {/* ── G. HORMONAL SCORE ────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={sectionHeading}>{CR.hormonalHeading}</h3>
        <div style={resCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: hormonalColor,
              }}
            >
              {cHormonal}%
            </div>
            <div style={{ fontSize: "0.78rem", color: S.colors.text }}>
              {hormonalLabel}
            </div>
          </div>
          <div style={scoreBar}>
            <div
              style={{
                width: `${cHormonal}%`,
                height: "100%",
                borderRadius: 4,
                background: hormonalColor,
                transition: "width 0.8s ease",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.3)",
              marginTop: 4,
            }}
          >
            {CR.hormonalSource}
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: S.colors.tealGlow,
              marginTop: 6,
              fontStyle: "italic",
            }}
          >
            {CR.hormonalDisclaimer}
          </div>
        </div>
      </div>

      {/* ── H. CALORIC SECTION ───────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={sectionHeading}>
          <span style={{ color: S.colors.green }}>✓</span> {CR.caloricHeading}
        </h3>
        <div style={{ ...resCard, display: "flex", gap: 16 }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: S.colors.tealGlow,
              }}
            >
              {Math.round(cBmr)}
            </div>
            <div style={{ fontSize: "0.72rem", color: S.colors.text }}>
              {CR.bmrLabel}
            </div>
          </div>
          <div
            style={{ width: 1, background: "rgba(255,255,255,0.06)" }}
          />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: S.colors.gold,
              }}
            >
              {Math.round(cTdee)}
            </div>
            <div style={{ fontSize: "0.72rem", color: S.colors.text }}>
              {CR.tdeeLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ── I. SAFETY TAGS ───────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={sectionHeading}>{CR.tagsHeading}</h3>
        <div style={resCard}>
          {cTags.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: S.colors.text, margin: 0 }}>
              {CR.tagsEmpty}
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {cTags.map((t, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background:
                      t.type === "exclude"
                        ? "rgba(220,38,38,0.1)"
                        : t.type === "include"
                          ? "rgba(72,187,120,0.1)"
                          : "rgba(201,168,76,0.1)",
                    color:
                      t.type === "exclude"
                        ? "#DC2626"
                        : t.type === "include"
                          ? S.colors.green
                          : S.colors.gold,
                    border: `1px solid ${
                      t.type === "exclude"
                        ? "rgba(220,38,38,0.2)"
                        : t.type === "include"
                          ? "rgba(72,187,120,0.2)"
                          : "rgba(201,168,76,0.2)"
                    }`,
                  }}
                >
                  {t.type === "exclude" ? "✕" : "✓"} {t.label}
                </span>
              ))}
            </div>
          )}
          <div
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.25)",
              marginTop: 10,
            }}
          >
            {CR.tagsFooter}
          </div>
        </div>
      </div>

      {/* ── J. PROGRAM PARAMS GRID ───────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={sectionHeading}>{CR.paramsHeading}</h3>
        <div style={resCard}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              fontSize: "0.82rem",
            }}
          >
            <div>
              <span style={{ color: S.colors.text }}>{PL.time}</span>{" "}
              <strong style={{ color: "white" }}>
                {CR.timeOptions[A.q8 || 2] || ""}
              </strong>
            </div>
            <div>
              <span style={{ color: S.colors.text }}>{PL.experience}</span>{" "}
              <strong style={{ color: "white" }}>
                {CR.expOptions[A.q13 || 0] || ""}
              </strong>
            </div>
            <div>
              <span style={{ color: S.colors.text }}>{PL.meals}</span>{" "}
              <strong style={{ color: "white" }}>
                {CR.mealOptions[A.q14 || 1] || ""}
              </strong>
            </div>
            <div>
              <span style={{ color: S.colors.text }}>{PL.budget}</span>{" "}
              <strong style={{ color: "white" }}>
                {CR.budgetOptions[A.q19 || 1] || ""} RON
              </strong>
            </div>
            <div>
              <span style={{ color: S.colors.text }}>{PL.motivation}</span>{" "}
              <strong style={{ color: "white" }}>
                {["Curioasă", "Motivată", "Foarte motivată", "ALL-IN"][
                  A.q21 as number
                ] || "Motivată"}
              </strong>
            </div>
            <div>
              <span style={{ color: S.colors.text }}>{PL.equipment}</span>{" "}
              <strong style={{ color: "white" }}>
                {(A.q9 || []).length} tipuri
              </strong>
            </div>
            <div>
              <span style={{ color: S.colors.text }}>{PL.allergies}</span>{" "}
              <strong style={{ color: "white" }}>{allergiesDisplay}</strong>
            </div>
            <div>
              <span style={{ color: S.colors.text }}>{PL.cookTime}</span>{" "}
              <strong style={{ color: "white" }}>
                {CR.cookTimeOptions[A.q19c !== undefined ? A.q19c : 3] ||
                  ""}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── K. NUTRITION PREVIEW ─────────────────────────────────── */}
      {dayPlan && dayPlan.slots && (
        <>
          <div style={{ marginBottom: 20 }}>
            <h3 style={sectionHeading}>
              🍽️ Nutriție personalizată — Ziua ta model
            </h3>
            <p
              style={{
                fontSize: "0.75rem",
                color: S.colors.text,
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              Aceasta este o zi model construită din profilul tău metabolic,
              preferințele tale alimentare și necesarul tău caloric de{" "}
              <strong style={{ color: "white" }}>
                {Math.round(cTdee)} kcal
              </strong>
              .
            </p>
            <div style={resCard}>
              {Object.keys(dayPlan.slots).map((slotKey) => {
                const slot = dayPlan.slots[slotKey];
                if (!slot || !slot.recipe) return null;
                const r = slot.recipe;
                return (
                  <div
                    key={slotKey}
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: S.colors.tealGlow,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      {SLOT_LABELS[slotKey] || slotKey}
                    </div>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        color: "white",
                        fontWeight: 500,
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: S.colors.text,
                        marginTop: 2,
                      }}
                    >
                      {r.kcal} kcal · {r.prepMin} min preparare
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shopping list */}
          {shopList.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={resCard}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: S.colors.tealGlow,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 10,
                  }}
                >
                  🛒 Lista de cumpărături
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {shopList.map((item, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.6)",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Blurred teaser: remaining 6 days */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                filter: "blur(6px)",
                WebkitFilter: "blur(6px)",
                pointerEvents: "none",
                opacity: 0.5,
              }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  color: S.colors.text,
                  marginBottom: 6,
                }}
              >
                🍽️ Zilele 2–7 — Plan alimentar complet
              </h3>
              <div style={{ ...resCard, minHeight: 90 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: S.colors.text,
                    margin: "4px 0",
                  }}
                >
                  ☀️ Prânz: Salată mediteraneană cu quinoa
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: S.colors.text,
                    margin: "4px 0",
                  }}
                >
                  🌙 Cină: Pui la cuptor cu legume de sezon
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: S.colors.text,
                    margin: "4px 0",
                  }}
                >
                  🌅 Mic dejun: Smoothie proteic cu fructe
                </p>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: "rgba(15,15,20,0.7)",
                  padding: "14px 24px",
                  borderRadius: 12,
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                <p
                  style={{
                    color: S.colors.gold,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  🔒 6 zile rămase — plan complet personalizat
                </p>
                <p
                  style={{
                    color: S.colors.text,
                    fontSize: "0.75rem",
                    margin: "4px 0 0",
                  }}
                >
                  Incluse în pachetele CYB
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── L. TRAINING PREVIEW ──────────────────────────────────── */}
      {trainingPlan && trainingPlan.sessions && (
        <>
          <div style={{ marginBottom: 20 }}>
            <h3 style={sectionHeading}>
              💪 Antrenament personalizat — Săptămâna 1
            </h3>
            <p
              style={{
                fontSize: "0.75rem",
                color: S.colors.text,
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              Adaptat nivelului tău{" "}
              <strong style={{ color: "white" }}>
                {CR.expOptions[A.q13 || 0] || "Începător"}
              </strong>
              , cu sesiuni de{" "}
              <strong style={{ color: "white" }}>
                {CR.timeOptions[A.q8 || 2] || "20-30 min"}
              </strong>{" "}
              și {(A.q9 || []).length} tipuri de echipament.
            </p>
            <div style={resCard}>
              {trainingPlan.sessions.map(
                (
                  session: {
                    title: string;
                    durationMin: number;
                    intensity: number;
                  },
                  i: number
                ) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: S.colors.tealGlow,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      Ziua {i + 1}
                    </div>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        color: "white",
                        fontWeight: 500,
                      }}
                    >
                      {session.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: S.colors.text,
                        marginTop: 2,
                      }}
                    >
                      {session.durationMin} min · Intensitate {session.intensity}
                      /5
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Blurred teaser: remaining 11 weeks */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                filter: "blur(6px)",
                WebkitFilter: "blur(6px)",
                pointerEvents: "none",
                opacity: 0.5,
              }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  color: S.colors.text,
                  marginBottom: 6,
                }}
              >
                💪 Săptămânile 2–12 — Progresie completă
              </h3>
              <div style={{ ...resCard, minHeight: 90 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: S.colors.text,
                    margin: "4px 0",
                  }}
                >
                  Ziua 1: Full Body — Nivel 2 (intensitate crescută)
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: S.colors.text,
                    margin: "4px 0",
                  }}
                >
                  Ziua 2: Lower Body — Forță progresivă
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: S.colors.text,
                    margin: "4px 0",
                  }}
                >
                  Ziua 3: Upper Body + Core — Circuit
                </p>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: "rgba(15,15,20,0.7)",
                  padding: "14px 24px",
                  borderRadius: 12,
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                <p
                  style={{
                    color: S.colors.gold,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  🔒 11 săptămâni de progresie
                </p>
                <p
                  style={{
                    color: S.colors.text,
                    fontSize: "0.75rem",
                    margin: "4px 0 0",
                  }}
                >
                  Programul complet adaptat pe profilul tău
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── M. VALUE BRIDGE ──────────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          padding: "24px 16px",
          marginTop: 8,
        }}
      >
        <p
          style={{
            fontSize: "0.88rem",
            color: S.colors.text,
            lineHeight: 1.8,
            marginBottom: 6,
          }}
        >
          {resText}
        </p>
        <p
          style={{
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.7,
            marginTop: 14,
          }}
        >
          Acum ai văzut direcția. Planul complet înseamnă să transformăm aceste
          date într-un sistem clar — nutriție, antrenament și ghidare — totul
          adaptat corpului și ritmului tău.
        </p>
        <p
          style={{
            marginTop: 16,
            fontSize: "0.88rem",
            fontStyle: "italic",
            color: S.colors.tealGlow,
          }}
        >
          {CR.finalQuote}
        </p>
      </div>

      {/* ── N. CTA ZONE ──────────────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          padding: "28px 20px",
          marginTop: 12,
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(42,165,160,0.08), rgba(201,168,76,0.06))",
          border: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.3rem",
            color: "white",
            marginBottom: 8,
          }}
        >
          {CR.ctaHeading}
        </h3>
        <p
          style={{
            fontSize: "0.85rem",
            color: S.colors.text,
            lineHeight: 1.7,
            marginBottom: 14,
          }}
        >
          {CR.ctaBody}
        </p>

        {/* Deliverables list */}
        <div
          style={{
            textAlign: "left",
            fontSize: "0.78rem",
            color: S.colors.text,
            lineHeight: 1.8,
            marginBottom: 18,
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
              fontWeight: 600,
              marginTop: 0,
            }}
          >
            Ce primești în fiecare pachet:
          </p>
          {[
            "Plan alimentar personalizat pe profilul tău metabolic",
            "Program antrenament adaptat nivelului și echipamentului tău",
            "Raport complet de interpretare a profilului tău",
            "Ghidare pas cu pas — nu doar informație, ci direcție clară",
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: i < 3 ? 6 : 0,
              }}
            >
              <span
                style={{ color: S.colors.tealGlow, flexShrink: 0 }}
              >
                ✓
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Package cards */}
        {CR.packages.map((pk, pi) => {
          const isFeatured = !!pk.badge;
          const borderColor = isFeatured
            ? "rgba(201,168,76,0.4)"
            : "rgba(255,255,255,0.08)";
          const bgColor = isFeatured
            ? "rgba(201,168,76,0.06)"
            : "rgba(255,255,255,0.02)";
          return (
            <div
              key={pi}
              style={{
                textAlign: "left",
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
                background: bgColor,
                marginBottom: 12,
              }}
            >
              {pk.badge && (
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: S.colors.gold,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {pk.badge}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.05rem",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {pk.name}
                </span>
                <span
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.1rem",
                    color: S.colors.gold,
                    fontWeight: 700,
                  }}
                >
                  {pk.price}
                  {pk.old && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: S.colors.text,
                        textDecoration: "line-through",
                        marginLeft: 4,
                      }}
                    >
                      {pk.old}
                    </span>
                  )}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: S.colors.text,
                  lineHeight: 1.6,
                  margin: "0 0 12px",
                }}
              >
                {pk.desc}
              </p>
              {/* checkout integration deferred */}
              <button
                style={{
                  ...btnGoldFull,
                  width: "100%",
                  padding: 12,
                  fontSize: "0.88rem",
                  cursor: "default",
                  opacity: 0.85,
                }}
                data-pkg={pk.id}
              >
                {CR.ctaBuyLabel || "Vreau planul meu personalizat →"}
              </button>
            </div>
          );
        })}

        <p
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.45)",
            fontStyle: "italic",
            lineHeight: 1.5,
            margin: "16px 0 12px",
          }}
        >
          Diferența nu e doar în informație — e în felul în care totul se
          leagă pentru tine.
        </p>

        {/* WhatsApp links */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.06)",
            margin: "16px 0",
          }}
        />
        <p
          style={{
            fontSize: "0.78rem",
            color: S.colors.text,
            marginBottom: 8,
          }}
        >
          {CR.ctaWhatsAppAlt || "Preferi să vorbești cu Daniela mai întâi?"}
        </p>
        <a
          href={CR.ctaDirectWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("complet_results_direct")}
          style={{
            display: "inline-block",
            padding: "10px 24px",
            fontSize: "0.82rem",
            color: "rgba(37,211,102,0.9)",
            textDecoration: "none",
            border: "1px solid rgba(37,211,102,0.2)",
            borderRadius: 8,
          }}
        >
          {CR.ctaDirectButton}
        </a>
        <p
          style={{
            marginTop: 10,
            fontSize: "0.72rem",
            color: S.colors.text,
          }}
        >
          Sau intră în comunitatea CYB:
        </p>
        <a
          href={CR.ctaGroupWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("complet_results_group")}
          style={{
            display: "inline-block",
            marginTop: 4,
            fontSize: "0.72rem",
            color: "rgba(37,211,102,0.6)",
            textDecoration: "underline",
          }}
        >
          {CR.ctaGroupButton}
        </a>
      </div>

      {/* ── O. REASSURANCE FOOTER ────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          marginTop: 20,
          padding: 16,
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.35)",
            lineHeight: 1.6,
          }}
        >
          Datele tale sunt protejate și nu sunt partajate cu nimeni. Poți
          reveni oricând la aceste rezultate.
        </p>
      </div>

      {/* ── P. RESET LINK ────────────────────────────────────────── */}
      {hasSavedProgress && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={onReset}
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.3)",
              textDecoration: "underline",
              cursor: "pointer",
              background: "none",
              border: "none",
            }}
          >
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

const resCard: React.CSSProperties = {
  padding: 20,
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  marginBottom: 12,
};

const profileCard: React.CSSProperties = {
  padding: 20,
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  marginBottom: 20,
};

const scoreBar: React.CSSProperties = {
  width: "100%",
  height: 8,
  borderRadius: 4,
  background: "rgba(255,255,255,0.06)",
  margin: "12px 0 4px",
  overflow: "hidden",
};

const btnGoldFull: React.CSSProperties = {
  borderRadius: 50,
  border: "none",
  fontFamily: "'Outfit', system-ui, sans-serif",
  fontWeight: 600,
  background: "linear-gradient(135deg, #C9A84C, #D4AF37)",
  color: "white",
  boxShadow: "0 4px 16px rgba(201,168,76,0.25)",
};
