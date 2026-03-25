// =============================================================================
// C6/C7: Shared metabolic report — used by webhook (email) + /report (browser)
// Core math imported from lib/cyb-calc.ts (canonical source).
// =============================================================================

import { calcBMI, calcBMR, calcTDEE } from "./cyb-calc";
import { buildMultiDayPlan, calcSlotTargets } from "./cyb-recipes";

export { calcBMI, calcBMR, calcTDEE };

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

// ── D11: COMPLET answers extraction from Stripe metadata ─────────────
// Reassembles chunked JSON from cyb_ans_0, cyb_ans_1, ... keys
export function extractCompletAnswers(
  metadata: Record<string, string> | null | undefined
): Record<string, unknown> | null {
  if (!metadata) return null;
  const chunksStr = metadata["cyb_ans_chunks"];
  if (!chunksStr) return null;
  const chunks = Number(chunksStr);
  if (!chunks || chunks < 1 || chunks > 20) return null;
  try {
    let json = "";
    for (let i = 0; i < chunks; i++) {
      const part = metadata[`cyb_ans_${i}`];
      if (typeof part !== "string") return null;
      json += part;
    }
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ── calcBMI, calcBMR, calcTDEE: imported + re-exported from lib/cyb-calc.ts ─

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
  /** D13: COMPLET questionnaire answers for enriched report sections */
  completAnswers?: Record<string, unknown> | null;
  /** N9: Number of days for the nutrition plan. Defaults to 7 if omitted. */
  days?: number;
}

// ── D13: COMPLET answer interpretation helpers ──────────────────────

function _n(a: Record<string, unknown>, k: string): number | null {
  const v = a[k];
  return typeof v === "number" ? v : null;
}

function _a(a: Record<string, unknown>, k: string): number[] {
  const v = a[k];
  return Array.isArray(v)
    ? v.filter((x): x is number => typeof x === "number")
    : [];
}

function _card(title: string, body: string): string {
  return `<div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.06);">
<p style="color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 10px;">${title}</p>
${body}</div>`;
}

function _r(label: string, value: string, note?: string): string {
  return `<div style="margin-bottom:${note ? 10 : 6}px;">
<span style="color:#999;font-size:12px;">${escapeHtml(label)}: </span>
<span style="color:#e0e0e0;font-size:13px;">${escapeHtml(value)}</span>
${note ? `<div style="color:#777;font-size:11px;margin-top:2px;line-height:1.5;font-style:italic;">${escapeHtml(note)}</div>` : ""}</div>`;
}

function buildCompletSectionsHtml(
  answers: Record<string, unknown>,
  profile: CustomerProfile
): string {
  const parts: string[] = [];

  // ── LIFESTYLE ──
  {
    const rows: string[] = [];
    const sleep = _n(answers, "q13");
    if (sleep !== null) {
      const vals = [
        "Bun (7-8h, odihnitor)",
        "Acceptabil, dar nu optim",
        "Slab (sub 6h / treziri frecvente)",
        "Foarte slab (insomnie)",
      ];
      const tips: (string | undefined)[] = [
        undefined,
        "Calitatea somnului poate fi îmbunătățită — planul tău va include recomandări.",
        "Somnul insuficient încetinește metabolismul și crește pofta de dulce.",
        "Lipsa somnului afectează hormonal și metabolic — prioritate în program.",
      ];
      rows.push(_r("Somn", vals[sleep] || "—", tips[sleep]));
    }
    const stress = _n(answers, "q14");
    if (stress !== null) {
      const vals = ["Scăzut", "Moderat", "Ridicat", "Foarte ridicat"];
      const tips: (string | undefined)[] = [
        undefined,
        undefined,
        "Cortizolul crescut favorizează depunerea de grăsime abdominală.",
        "Stresul foarte ridicat afectează metabolismul, somnul și alegerile alimentare.",
      ];
      rows.push(_r("Stres", vals[stress] || "—", tips[stress]));
    }
    const routine = _n(answers, "q15");
    if (routine !== null) {
      const vals = [
        "Remote / acasă",
        "Birou (8h+ așezată)",
        "Muncă în picioare",
        "Mama cu program complet",
        "Ture",
        "Program mixt",
      ];
      rows.push(_r("Ritm zilnic", vals[routine] || "—"));
    }
    const act = _n(answers, "q16");
    if (act !== null) {
      const vals = ["Sedentară", "Ușor activă", "Moderat activă", "Foarte activă"];
      rows.push(_r("Activitate curentă", vals[act] || "—"));
    }
    if (rows.length) parts.push(_card("Stilul tău de viață", rows.join("")));
  }

  // ── NUTRITION ──
  {
    const rows: string[] = [];
    const meals = _n(answers, "q24");
    if (meals !== null) {
      const vals = [
        "1-2 mese (sare peste mese)",
        "3 mese principale",
        "3 mese + gustări",
        "Fără ritm fix",
      ];
      const tips: (string | undefined)[] = [
        "Prea puține mese pot încetini metabolismul. Planul tău va regla ritmul.",
        undefined,
        "Ritm alimentar bun — se poate optimiza compoziția.",
        "Lipsa ritmului alimentar destabilizează glicemia. Vom stabili o structură.",
      ];
      rows.push(_r("Mese pe zi", vals[meals] || "—", tips[meals]));
    }
    const breakfast = _n(answers, "q25");
    if (breakfast !== null) {
      const vals = ["Da, zilnic", "Uneori", "Aproape niciodată"];
      rows.push(
        _r(
          "Mic dejun",
          vals[breakfast] || "—",
          breakfast >= 1
            ? "Micul dejun activează metabolismul dimineața."
            : undefined
        )
      );
    }
    const emotional = _n(answers, "q26");
    if (emotional !== null) {
      const vals = ["Da, des", "Uneori", "Rar / nu"];
      const tips: (string | undefined)[] = [
        "Mâncatul emoțional este un pattern important — planul tău va include strategii alternative.",
        "Conștientizarea e un prim pas bun. Vom lucra la alternative.",
        undefined,
      ];
      rows.push(_r("Mâncat emoțional", vals[emotional] || "—", tips[emotional]));
    }
    const water = _n(answers, "q27");
    if (water !== null) {
      const vals = ["Sub 0.5L", "0.5-1L", "1-1.5L", "1.5-2L", "Peste 2L"];
      const tips: (string | undefined)[] = [
        "Hidratarea insuficientă încetinește metabolismul cu 3-5%. Obiectiv: minim 1.5L/zi.",
        "Sub necesar. Creșterea hidratării va îmbunătăți metabolismul și energia.",
        "Nivel acceptabil — ideal ar fi 1.5-2L/zi.",
        "Nivel bun de hidratare.",
        "Excelent — susține metabolismul optim.",
      ];
      rows.push(_r("Hidratare", vals[water] || "—", tips[water]));
    }
    const diet = _n(answers, "q30");
    if (diet !== null && diet > 0) {
      const vals = [
        "Omnivor",
        "Vegetariană",
        "Vegană",
        "Pescetariană",
        "Fără gluten",
        "Fără lactoză",
      ];
      rows.push(
        _r(
          "Alimentație",
          vals[diet] || "—",
          "Planul tău alimentar va respecta acest mod de alimentație."
        )
      );
    }
    const allergies = _a(answers, "q31");
    if (allergies.length > 0 && !(allergies.length === 1 && allergies[0] === 0)) {
      const labels = [
        "—",
        "Lactoză",
        "Gluten",
        "Nuci/arahide",
        "Ouă",
        "Peste/fructe de mare",
      ];
      const names = allergies
        .filter((i) => i > 0)
        .map((i) => labels[i] || "altele");
      if (names.length)
        rows.push(
          _r(
            "Alergii/intoleranțe",
            names.join(", "),
            "Toate rețetele vor evita aceste ingrediente."
          )
        );
    }
    if (rows.length) parts.push(_card("Profilul tău nutrițional", rows.join("")));
  }

  // ── TRAINING READINESS ──
  {
    const rows: string[] = [];
    const exp = _n(answers, "q23");
    if (exp !== null) {
      const vals = ["Începător total", "Începător", "Intermediar", "Avansat"];
      const tips: (string | undefined)[] = [
        "Programul va începe ușor și progresiv — fără suprasolicitare.",
        "Vom construi pe baza cunoștințelor tale, cu progresie graduală.",
        "Poți începe cu intensitate moderată — ai o bază bună.",
        "Programul va fi la nivelul tău — provocator dar eficient.",
      ];
      rows.push(_r("Experiență sport", vals[exp] || "—", tips[exp]));
    }
    const time = _n(answers, "q18");
    if (time !== null) {
      const vals = [
        "Sub 15 minute",
        "15-20 minute",
        "20-30 minute",
        "30-45 minute",
        "Peste 45 minute",
      ];
      rows.push(
        _r(
          "Timp disponibil",
          vals[time] || "—",
          "Antrenamentele vor fi adaptate la timpul tău real."
        )
      );
    }
    const equip = _a(answers, "q19");
    if (equip.length > 0) {
      const labels = [
        "Doar corpul",
        "Scaun + canapea",
        "Saltea",
        "Sticle apă",
        "Benzi ușoare",
        "Benzi medii",
        "Benzi grele",
        "Gantere mici (1-3kg)",
        "Gantere medii (4-6kg)",
        "Gantere mari (7+kg)",
        "Kettlebell",
        "Bicicletă/bandă",
      ];
      const names = equip.map((i) => labels[i] || "").filter(Boolean);
      if (names.length) rows.push(_r("Echipament", names.join(", ")));
    }
    const limits = _a(answers, "q22");
    if (limits.length > 0 && !(limits.length === 1 && limits[0] === 0)) {
      const labels = [
        "—",
        "Genunchi",
        "Spate lombar",
        "Cervicală/gât",
        "Umăr",
        "Încheietură mână",
        "Șold",
        "Hernie de disc",
        "Incontinență",
        "Diastază",
        "Varice",
        "Vertij",
        "Altele",
      ];
      const names = limits
        .filter((i) => i > 0)
        .map((i) => labels[i] || "altele");
      if (names.length)
        rows.push(
          _r(
            "Limitări fizice",
            names.join(", "),
            "Fiecare exercițiu va fi adaptat sau înlocuit pentru siguranța ta."
          )
        );
    }
    if (rows.length)
      parts.push(_card("Pregătirea ta pentru antrenament", rows.join("")));
  }

  // ── HEALTH / HORMONAL CONTEXT ──
  {
    const rows: string[] = [];
    const stage = _n(answers, "q6");
    const lifeStage = stage ?? profile.moment;

    if (lifeStage !== null && lifeStage !== undefined && lifeStage >= 2) {
      const vals = [
        "Sub 35 ani",
        "35-45 ani",
        "Pre-menopauză",
        "Menopauză",
        "Post-partum",
        "Alăptează",
      ];
      rows.push(_r("Etapă de viață", vals[lifeStage] || "—"));
    }
    // Hormonal symptoms (pre-menopause / menopause)
    if (lifeStage === 2 || lifeStage === 3) {
      const symptoms = _a(answers, "q7");
      if (symptoms.length > 0) {
        const labels = [
          "Bufeuri",
          "Insomnie",
          "Schimbări dispoziție",
          "Creștere greutate (abdominal)",
          "Oboseală cronică",
          "Libido scăzut",
          "Dureri articulare",
          "Altele",
        ];
        const names = symptoms.map((i) => labels[i] || "").filter(Boolean);
        if (names.length)
          rows.push(
            _r(
              "Simptome hormonale",
              names.join(", "),
              "Programul va ține cont de contextul hormonal."
            )
          );
      }
      const hrt = _n(answers, "q8");
      if (hrt !== null) {
        const vals = [
          "Da (prescris de medic)",
          "Nu",
          "Am urmat în trecut",
          "În discuții cu medicul",
        ];
        rows.push(_r("Tratament hormonal", vals[hrt] || "—"));
      }
    }
    // Postpartum context
    if (lifeStage === 4 || lifeStage === 5) {
      const months = _n(answers, "q9");
      if (months !== null) rows.push(_r("Luni de la naștere", String(months)));
      const birth = _n(answers, "q10");
      if (birth !== null) {
        rows.push(
          _r(
            "Tip naștere",
            birth === 0 ? "Natural" : "Cezariană",
            birth === 1
              ? "Recuperarea post-cezariană necesită atenție specială la exercițiile abdominale."
              : undefined
          )
        );
      }
      const bf = _n(answers, "q11");
      if (bf !== null && bf <= 1) {
        const vals = ["Da, exclusiv", "Da, parțial", "Nu"];
        rows.push(
          _r(
            "Alăptare",
            vals[bf] || "—",
            "Necesarul caloric va fi ajustat pentru alăptare."
          )
        );
      }
      const ppCond = _a(answers, "q12");
      if (ppCond.length > 0) {
        const labels = [
          "Aviz medical sport",
          "Diastază abdominală",
          "Incontinență urinară",
          "Nimic din cele de mai sus",
        ];
        const relevant = ppCond
          .filter((i) => i < 3)
          .map((i) => labels[i] || "");
        if (relevant.filter(Boolean).length)
          rows.push(_r("Context postpartum", relevant.filter(Boolean).join(", ")));
      }
    }
    // Medical conditions
    const medical = _a(answers, "q20");
    if (medical.length > 0 && !(medical.length === 1 && medical[0] === 0)) {
      const labels = [
        "—",
        "Diabet/rezistență insulină",
        "Hipotiroidism",
        "PCOS",
        "Hipertensiune",
        "Probleme cardiace",
        "Depresie/Anxietate",
      ];
      const names = medical
        .filter((i) => i > 0)
        .map((i) => labels[i] || "altele");
      if (names.length)
        rows.push(
          _r(
            "Condiții medicale",
            names.join(", "),
            "Planul va fi adaptat condițiilor tale medicale."
          )
        );
    }
    if (rows.length) parts.push(_card("Context de sănătate", rows.join("")));
  }

  // ── MOTIVATION ──
  {
    const rows: string[] = [];
    const motiv = _n(answers, "q37");
    if (motiv !== null) {
      let note: string;
      if (motiv >= 8)
        note = "Motivație excelentă — ești pregătită pentru transformare!";
      else if (motiv >= 5)
        note = "Motivație bună — cu structura potrivită, rezultatele vor veni.";
      else
        note =
          "E normal să ai dubii. Planul tău va fi construit pentru a genera rezultate rapide vizibile.";
      rows.push(_r("Motivație actuală", `${motiv} / 10`, note));
    }
    const obstacles = _a(answers, "q36");
    if (obstacles.length > 0) {
      const labels = [
        "Lipsa timpului",
        "Lipsa motivației",
        "Nu știu ce să mănânc",
        "Poftele/mâncatul emoțional",
        "Lipsa suportului din familie",
        "Stresul",
        "Rezultate prea lente",
        "Costurile",
      ];
      const names = obstacles.map((i) => labels[i] || "").filter(Boolean);
      if (names.length)
        rows.push(
          _r(
            "Obstacole identificate",
            names.join(", "),
            "Programul tău va include strategii specifice pentru aceste provocări."
          )
        );
    }
    if (rows.length) parts.push(_card("Motivația ta", rows.join("")));
  }

  if (parts.length === 0) return "";

  return `
      <!-- D13: Enriched COMPLET sections -->
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(201,168,76,0.12);">
        <p style="color:#C9A84C;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 14px;">Profilul tău complet</p>
        ${parts.join("")}
      </div>`;
}

// ── SLOT LABELS (Romanian) ───────────────────────────────────────────
const SLOT_LABELS: Record<string, string> = {
  breakfast: "Mic dejun",
  lunch: "Prânz",
  dinner: "Cină",
  snack1: "Gustare 1",
  snack2: "Gustare 2",
};

// ── N-DAY MEAL PLAN HTML BUILDER ────────────────────────────────────
function buildMealPlanHtml(
  profile: CustomerProfile,
  completAnswers: Record<string, unknown> | null | undefined,
  days: number = 7
): string {
  try {
    const planDays = Math.max(1, Math.floor(days));
    const ans = (completAnswers || {}) as Record<string, unknown>;
    const multiPlan = buildMultiDayPlan(profile, ans, planDays);
    if (!multiPlan || !multiPlan.days || multiPlan.days.length === 0) return "";

    const dayCards: string[] = [];
    for (let d = 0; d < multiPlan.days.length; d++) {
      const { plan } = multiPlan.days[d];
      if (!plan || !plan.slots) continue;

      const slotRows: string[] = [];
      const slotKeys = ["breakfast", "lunch", "dinner", "snack1", "snack2"];
      for (const key of slotKeys) {
        const slot = plan.slots[key];
        if (!slot || !slot.recipe) continue;
        const r = slot.recipe;
        slotRows.push(
          `<tr>
            <td style="padding:5px 8px;color:#C9A84C;font-size:12px;font-weight:600;vertical-align:top;white-space:nowrap;">${escapeHtml(SLOT_LABELS[key] || key)}</td>
            <td style="padding:5px 8px;color:#e0e0e0;font-size:13px;">
              ${escapeHtml(r.title)}
              <span style="color:#777;font-size:11px;margin-left:6px;">${r.kcal} kcal · P${r.protein}g · C${r.carbs}g · G${r.fat}g</span>
            </td>
          </tr>`
        );
      }

      if (slotRows.length === 0) continue;

      dayCards.push(
        `<div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:14px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.06);">
          <p style="color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 8px;">Ziua ${d + 1}</p>
          <table style="width:100%;border-collapse:collapse;">${slotRows.join("")}</table>
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);color:#666;font-size:11px;">
            Total: ${plan.totalKcal} kcal · P${plan.totalProtein}g · C${plan.totalCarbs}g · G${plan.totalFat}g
          </div>
        </div>`
      );
    }

    if (dayCards.length === 0) return "";

    // Shopping list
    let shoppingHtml = "";
    if (multiPlan.shoppingList && multiPlan.shoppingList.length > 0) {
      const items = multiPlan.shoppingList.map(
        (item) =>
          `<li style="color:#e0e0e0;font-size:13px;margin-bottom:4px;line-height:1.5;">${escapeHtml(item.name)}<span style="color:#777;font-size:11px;"> × ${item.count}</span></li>`
      );
      shoppingHtml = `
        <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:14px;margin-top:12px;border:1px solid rgba(255,255,255,0.06);">
          <p style="color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 10px;">Listă de cumpărături (${planDays} zile)</p>
          <ul style="margin:0;padding:0 0 0 18px;">${items.join("")}</ul>
        </div>`;
    }

    // Weekly totals
    const t = multiPlan.totals;
    const avgKcal = Math.round(t.kcal / multiPlan.days.length);
    const totalsHtml = `
      <div style="background:rgba(201,168,76,0.06);border-radius:10px;padding:14px;margin-top:12px;border:1px solid rgba(201,168,76,0.12);">
        <p style="color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 8px;">Totaluri (${planDays} zile)</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="text-align:center;padding:6px;">
              <div style="color:#fff;font-size:16px;font-weight:700;">${t.kcal}</div>
              <div style="color:#666;font-size:11px;">kcal total</div>
            </td>
            <td style="text-align:center;padding:6px;border-left:1px solid rgba(255,255,255,0.06);">
              <div style="color:#3B82F6;font-size:16px;font-weight:700;">${t.protein}g</div>
              <div style="color:#666;font-size:11px;">Proteine</div>
            </td>
            <td style="text-align:center;padding:6px;border-left:1px solid rgba(255,255,255,0.06);">
              <div style="color:#F59E0B;font-size:16px;font-weight:700;">${t.carbs}g</div>
              <div style="color:#666;font-size:11px;">Carbohidrați</div>
            </td>
            <td style="text-align:center;padding:6px;border-left:1px solid rgba(255,255,255,0.06);">
              <div style="color:#EF4444;font-size:16px;font-weight:700;">${t.fat}g</div>
              <div style="color:#666;font-size:11px;">Grăsimi</div>
            </td>
          </tr>
        </table>
        <p style="color:#777;font-size:11px;margin:8px 0 0;text-align:center;">Media zilnică: ${avgKcal} kcal</p>
      </div>`;

    return `
      <!-- N-Day Nutrition Plan -->
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(201,168,76,0.12);">
        <p style="color:#C9A84C;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 14px;">Planul tău nutrițional — ${planDays} zile</p>
        ${dayCards.join("")}
        ${totalsHtml}
        ${shoppingHtml}
      </div>`;
  } catch (err) {
    console.error("[metabolic-report] Meal plan generation failed:", err);
    return "";
  }
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

  // N6B: Use calcSlotTargets for parity with the 7-day planner
  const slotResult = calcSlotTargets(profile, (input.completAnswers || {}) as any);
  const targetKcal = slotResult.targetKcal;
  const proteinG = slotResult.proteinTarget;
  const carbsG = slotResult.carbsTarget;
  const fatG = slotResult.fatTarget;

  let targetNote: string;
  if (profile.goal === 0) {
    targetNote =
      "Deficit calculat pe baza profilului tău pentru pierdere sănătoasă";
  } else if (profile.goal === 1) {
    targetNote = "Ușor sub mentenanță pentru recompoziție corporală";
  } else {
    targetNote = "Mentenanță calorică pentru energie optimă";
  }

  // D13: Build enriched COMPLET sections (empty string if no answers)
  const enrichedHtml = input.completAnswers
    ? buildCompletSectionsHtml(input.completAnswers, profile)
    : "";

  // N6/N9: Build nutrition plan for the delivered report (default 7 days, custom if specified)
  const reportDays = input.days && Number.isInteger(input.days) && input.days >= 1 ? input.days : 7;
  const mealPlanHtml = buildMealPlanHtml(profile, input.completAnswers, reportDays);

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

      ${enrichedHtml}

      ${mealPlanHtml}

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
