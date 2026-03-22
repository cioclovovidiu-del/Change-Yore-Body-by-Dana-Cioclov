// =============================================================================
// C6/C7: Shared metabolic report — used by webhook (email) + /report (browser)
// Exact same formulas as public/landing-v2/CYB_Calc.js
// =============================================================================

export interface CustomerProfile {
  age: number;
  height: number; // cm
  weight: number; // kg
  activity: number; // 0-3
  goal: number; // 0-3
  moment: number; // 0-5
}

// ── Profile extraction from Stripe metadata ─────────────────────────
export function extractProfile(
  metadata: Record<string, string> | null | undefined
): CustomerProfile | null {
  if (!metadata) return null;
  const age = Number(metadata.cyb_age);
  const height = Number(metadata.cyb_height);
  const weight = Number(metadata.cyb_weight);
  const activity = Number(metadata.cyb_activity);
  const goal = Number(metadata.cyb_goal);
  const moment = Number(metadata.cyb_moment);

  if (!age || age < 10 || age > 100) return null;
  if (!height || height < 80 || height > 260) return null;
  if (!weight || weight < 20 || weight > 300) return null;
  if (isNaN(activity) || activity < 0 || activity > 3) return null;

  return { age, height, weight, activity, goal, moment };
}

// ── Pure math (CYB_Calc.js replicated) ──────────────────────────────
export function calcBMI(w: number, h: number): number {
  return w / ((h / 100) ** 2);
}

export function calcBMR(w: number, h: number, a: number): number {
  return 10 * w + 6.25 * h - 5 * a - 161;
}

export function calcTDEE(bmr: number, act: number): number {
  const factors = [1.2, 1.375, 1.55, 1.725];
  const idx = Math.min(Math.max(Math.floor(act), 0), 3);
  return bmr * factors[idx];
}

export function idealWeightRange(h: number): { low: number; high: number } {
  return {
    low: Math.round(18.5 * (h / 100) ** 2),
    high: Math.round(24.9 * (h / 100) ** 2),
  };
}

export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Subponderală", color: "#3B82F6" };
  if (bmi < 25) return { label: "Greutate normală", color: "#22C55E" };
  if (bmi < 30) return { label: "Supraponderală", color: "#F59E0B" };
  return { label: "Obezitate", color: "#EF4444" };
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const ACTIVITY_LABELS = [
  "Sedentar (birou, puțină mișcare)",
  "Ușor activ (plimbări, mișcare ușoară)",
  "Moderat activ (sport 3-4x/săpt.)",
  "Foarte activ (sport intens zilnic)",
];

export const GOAL_LABELS = [
  "Slăbire",
  "Tonifiere",
  "Mai multă energie",
  "Sănătate generală",
];

// ── Report data input ───────────────────────────────────────────────
export interface ReportInput {
  customerName: string;
  packageName: string;
  profile: CustomerProfile;
  /** 'email' = inline styles only; 'browser' = adds print button + print CSS */
  mode?: "email" | "browser";
  /** Optional link to browser-viewable report (shown in email mode only) */
  reportUrl?: string;
}

// ── Shared report HTML generator ────────────────────────────────────
export function buildMetabolicReportHtml(input: ReportInput): string {
  const { profile, mode = "email" } = input;
  const name = escapeHtml(input.customerName || "");
  const greeting = name ? `Dragă ${name},` : "Bună,";

  const bmi = calcBMI(profile.weight, profile.height);
  const bmr = calcBMR(profile.weight, profile.height, profile.age);
  const tdee = calcTDEE(bmr, profile.activity);
  const ideal = idealWeightRange(profile.height);
  const cat = bmiCategory(bmi);

  const actLabel = ACTIVITY_LABELS[profile.activity] || "Necunoscut";
  const goalLabel = GOAL_LABELS[profile.goal] || "Necunoscut";

  let targetKcal: number;
  let targetNote: string;
  if (profile.goal === 0) {
    targetKcal = Math.round(tdee - 500);
    targetNote =
      "Deficit moderat de 500 kcal/zi pentru pierdere sănătoasă (~0.5 kg/săpt.)";
  } else if (profile.goal === 1) {
    targetKcal = Math.round(tdee - 200);
    targetNote = "Ușor sub mentenanță pentru recompoziție corporală";
  } else {
    targetKcal = Math.round(tdee);
    targetNote = "Mentenanță calorică pentru energie optimă";
  }

  const proteinG = Math.round((targetKcal * 0.3) / 4);
  const carbsG = Math.round((targetKcal * 0.35) / 4);
  const fatG = Math.round((targetKcal * 0.35) / 9);

  // Browser mode extras
  const printButton =
    mode === "browser"
      ? `<div style="text-align:center;margin-bottom:20px;" class="no-print">
        <button onclick="window.print()" style="padding:12px 32px;background:#C9A84C;color:#0f1923;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:Arial,sans-serif;">Salvează ca PDF / Printează</button>
      </div>`
      : "";

  const printStyles =
    mode === "browser"
      ? `<style>
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          div[style*="max-width:560px"] { max-width: 100% !important; }
        }
      </style>`
      : "";

  const reportLink =
    mode === "email" && input.reportUrl
      ? `<div style="text-align:center;margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="color:#999;font-size:13px;margin:0 0 8px;">Vrei să salvezi raportul?</p>
        <a href="${escapeHtml(input.reportUrl)}" style="display:inline-block;padding:10px 24px;background:rgba(201,168,76,0.1);color:#C9A84C;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid rgba(201,168,76,0.2);">Deschide raportul în browser →</a>
        <p style="color:#666;font-size:11px;margin:8px 0 0;">Poți salva ca PDF din browser (Print → Save as PDF)</p>
      </div>`
      : "";

  const titleSuffix =
    mode === "browser"
      ? `<title>Raport Metabolic — Change Your Body</title>`
      : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${titleSuffix}${printStyles}</head>
<body style="margin:0;padding:0;background:#0f1923;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#C9A84C;font-size:24px;margin:0 0 4px;">Change Your Body</h1>
      <p style="color:#666;font-size:13px;margin:0;">Raportul tău metabolic personalizat</p>
    </div>

    ${printButton}

    <div style="background:#141e29;border-radius:16px;padding:28px 24px;border:1px solid rgba(201,168,76,0.15);">
      <p style="color:#e0e0e0;font-size:15px;line-height:1.8;margin:0 0 16px;">${greeting}</p>
      <p style="color:#e0e0e0;font-size:15px;line-height:1.8;margin:0 0 24px;">
        Acesta este raportul tău metabolic personalizat, calculat pe baza datelor tale reale.
        Folosește-l ca punct de plecare pentru transformarea ta.
      </p>

      <!-- Profile Summary -->
      <div style="background:rgba(201,168,76,0.06);border-radius:10px;padding:16px;border:1px solid rgba(201,168,76,0.12);margin-bottom:20px;">
        <p style="color:#C9A84C;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 12px;">Profilul tău</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 8px;color:#999;font-size:13px;">Vârstă</td><td style="padding:4px 8px;color:#fff;font-size:13px;text-align:right;">${profile.age} ani</td></tr>
          <tr><td style="padding:4px 8px;color:#999;font-size:13px;">Înălțime</td><td style="padding:4px 8px;color:#fff;font-size:13px;text-align:right;">${profile.height} cm</td></tr>
          <tr><td style="padding:4px 8px;color:#999;font-size:13px;">Greutate</td><td style="padding:4px 8px;color:#fff;font-size:13px;text-align:right;">${profile.weight} kg</td></tr>
          <tr><td style="padding:4px 8px;color:#999;font-size:13px;">Activitate</td><td style="padding:4px 8px;color:#fff;font-size:13px;text-align:right;">${escapeHtml(actLabel)}</td></tr>
          <tr><td style="padding:4px 8px;color:#999;font-size:13px;">Obiectiv</td><td style="padding:4px 8px;color:#C9A84C;font-size:13px;text-align:right;font-weight:600;">${escapeHtml(goalLabel)}</td></tr>
        </table>
      </div>

      <!-- BMI -->
      <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06);">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;"><span style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">IMC (Body Mass Index)</span></td>
            <td style="padding:4px 0;text-align:right;">
              <span style="color:${cat.color};font-size:22px;font-weight:700;">${bmi.toFixed(1)}</span>
              <span style="color:${cat.color};font-size:12px;margin-left:4px;">${escapeHtml(cat.label)}</span>
            </td>
          </tr>
          <tr><td colspan="2" style="padding:6px 0 0;color:#666;font-size:12px;">Greutate ideală pentru tine: <strong style="color:#e0e0e0;">${ideal.low}–${ideal.high} kg</strong></td></tr>
        </table>
      </div>

      <!-- BMR -->
      <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06);">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;"><span style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Metabolism bazal (BMR)</span></td>
            <td style="padding:4px 0;text-align:right;">
              <span style="color:#2AA5A0;font-size:22px;font-weight:700;">${Math.round(bmr)}</span>
              <span style="color:#2AA5A0;font-size:12px;margin-left:2px;">kcal/zi</span>
            </td>
          </tr>
          <tr><td colspan="2" style="padding:6px 0 0;color:#666;font-size:12px;">Caloriile de care ai nevoie doar pentru funcții vitale (în repaus complet).</td></tr>
        </table>
      </div>

      <!-- TDEE -->
      <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06);">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;"><span style="color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Consum zilnic total (TDEE)</span></td>
            <td style="padding:4px 0;text-align:right;">
              <span style="color:#C9A84C;font-size:22px;font-weight:700;">${Math.round(tdee)}</span>
              <span style="color:#C9A84C;font-size:12px;margin-left:2px;">kcal/zi</span>
            </td>
          </tr>
          <tr><td colspan="2" style="padding:6px 0 0;color:#666;font-size:12px;">Caloriile totale consumate zilnic, inclusiv activitatea fizică.</td></tr>
        </table>
      </div>

      <!-- Target Calories + Macros -->
      <div style="background:rgba(201,168,76,0.08);border-radius:10px;padding:16px;margin-bottom:20px;border:1px solid rgba(201,168,76,0.15);">
        <p style="color:#C9A84C;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 8px;">Ținta ta calorică recomandată</p>
        <p style="color:white;font-size:28px;font-weight:700;margin:0 0 4px;">${targetKcal} kcal/zi</p>
        <p style="color:#888;font-size:12px;margin:0 0 12px;">${escapeHtml(targetNote)}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="text-align:center;padding:8px;">
              <div style="color:#3B82F6;font-size:18px;font-weight:700;">${proteinG}g</div>
              <div style="color:#666;font-size:11px;">Proteine</div>
            </td>
            <td style="text-align:center;padding:8px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
              <div style="color:#F59E0B;font-size:18px;font-weight:700;">${carbsG}g</div>
              <div style="color:#666;font-size:11px;">Carbohidrați</div>
            </td>
            <td style="text-align:center;padding:8px;">
              <div style="color:#EF4444;font-size:18px;font-weight:700;">${fatG}g</div>
              <div style="color:#666;font-size:11px;">Grăsimi</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Next Steps -->
      <p style="color:#999;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin:0 0 10px;">Ce urmează:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#C9A84C;font-weight:700;font-size:15px;">1.</td><td style="padding:6px 0;color:#ccc;font-size:14px;line-height:1.6;">Daniela va analiza profilul tău și va crea planul personalizat</td></tr>
        <tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#C9A84C;font-weight:700;font-size:15px;">2.</td><td style="padding:6px 0;color:#ccc;font-size:14px;line-height:1.6;">Primești planul alimentar + antrenament pe email în max 24h</td></tr>
        <tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#C9A84C;font-weight:700;font-size:15px;">3.</td><td style="padding:6px 0;color:#ccc;font-size:14px;line-height:1.6;">Folosește acest raport ca referință pe tot parcursul programului</td></tr>
      </table>

      <div style="text-align:center;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="color:#999;font-size:13px;margin:0 0 12px;">Ai întrebări despre valorile tale? Scrie-i Danielei:</p>
        <a href="https://wa.me/40721333040?text=Bun%C4%83%20Daniela,%20am%20primit%20raportul%20metabolic%20%C8%99i%20am%20c%C3%A2teva%20%C3%AEntreb%C4%83ri." style="display:inline-block;padding:10px 24px;background:rgba(37,211,102,0.12);color:#25D366;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid rgba(37,211,102,0.2);">Scrie pe WhatsApp →</a>
      </div>

      ${reportLink}
    </div>

    <p style="text-align:center;color:#444;font-size:11px;margin-top:20px;">
      Change Your Body by Daniela Cioclov · changeyourbody.ro
    </p>
  </div>
</body>
</html>`;
}
