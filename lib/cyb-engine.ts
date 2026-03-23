// =============================================================================
// CYB ENGINE — Canonical (MINI + COMPLET)
// Extracted from: public/landing-v2/CYB_Engine_STABLE.js
// Modules: SignalInterpreter + RouteResolver + MessageEngine
//          + StressScore + HormonalScore + MetabolicProfile + SafetyTags
// Pure functions: no DOM, no state, no browser APIs.
// =============================================================================

// ── Types ───────────────────────────────────────────────────────────────

/** MINI profile fields used by the engine. */
export interface MiniProfile {
  moment?: number;
  activity?: number;
  age?: number;
  [key: string]: unknown;
}

/** COMPLET answers map used by the engine. */
export interface CompletAnswers {
  q3?: number;
  q4b?: number;
  q5?: number;
  q6?: number;
  q8?: number;
  q9?: number[];
  q12?: number[];
  q13?: number;
  q13b?: number[];
  q14?: number;
  q15?: number;
  q16?: number;
  q17?: number;
  q21?: number;
  [key: string]: unknown;
}

export type SignalLevel = "high" | "medium" | "low";
export type MotivationStyle = "gentle" | "structured" | "direct";

export interface Signals {
  overwhelmed: boolean;
  selfBlame: SignalLevel;
  actionCapacity: SignalLevel;
  shameRisk: SignalLevel;
  structureNeed: SignalLevel;
  pressureTolerance: SignalLevel;
  motivationStyle: MotivationStyle;
  [key: string]: unknown;
}

export type RouteName =
  | "POSTPARTUM"
  | "DIVORCE"
  | "HORMONAL"
  | "BURNOUT"
  | "LOSS"
  | "GENERAL";

export interface RouteResult {
  route: RouteName;
  confidence: "high" | "medium";
  source: "questionnaire" | "signals" | "combined";
  notes: string | null;
}

export interface EngineMessage {
  id: string;
  route: string;
  purpose: string;
  ctx: string;
  cond: Record<string, unknown> | null;
  block: string | null;
  text: string;
}

export interface SelectedMessage {
  id: string;
  text: string;
  score: number;
  fallback: boolean;
}

export interface SelectMessageOpts {
  route?: string;
  signals?: Record<string, unknown>;
  purpose?: string;
  screenContext?: string | null;
  block?: string | null;
}

export type SafetyTagType = "exclude" | "include" | "info";

export interface SafetyTag {
  tag: string;
  type: SafetyTagType;
  label: string;
}

// ── SIGNAL INTERPRETER ──────────────────────────────────────────────

export function interpretSignals(
  mini: MiniProfile,
  ans: CompletAnswers
): Signals {
  mini = mini || {};
  ans = ans || {};
  const moment = mini.moment,
    activity = mini.activity,
    sleep = ans.q5,
    stress = ans.q6,
    emoEat = ans.q15,
    water = ans.q16,
    diets = ans.q17,
    motiv = ans.q21,
    exp = ans.q13,
    limits = ans.q12 || [],
    time = ans.q8;

  const signals: Record<string, unknown> = {};

  // overwhelmed
  signals.overwhelmed =
    moment === 3 ||
    moment === 4 ||
    (sleep === 3 && (stress as number) >= 2) ||
    stress === 3;

  // selfBlame
  if ((emoEat === 0 && (diets as number) >= 3) || moment === 1)
    signals.selfBlame = "high";
  else if ((emoEat as number) <= 1 || diets === 2)
    signals.selfBlame = "medium";
  else signals.selfBlame = "low";

  // actionCapacity
  if (signals.overwhelmed || ((sleep as number) >= 2 && (time as number) <= 1))
    signals.actionCapacity = "low";
  else if (
    (sleep as number) >= 2 ||
    (time as number) <= 1 ||
    (stress as number) >= 2
  )
    signals.actionCapacity = "medium";
  else signals.actionCapacity = "high";

  // shameRisk
  const limCount = (limits as number[]).filter((l) => l > 0).length;
  if (
    moment === 4 ||
    (emoEat === 0 && limCount >= 3) ||
    ((diets as number) >= 3 && emoEat === 0)
  )
    signals.shameRisk = "high";
  else if (limCount >= 1 || (diets as number) >= 2 || (emoEat as number) <= 1)
    signals.shameRisk = "medium";
  else signals.shameRisk = "low";

  // structureNeed
  // D4: q21 now 0-3 (0=curious, 1=motivated, 2=very motivated, 3=all-in); q14 has 5 opts (4=fără ritm)
  const meals = ans.q14,
    irregMeals = meals === 4,
    lowM = motiv !== undefined && motiv === 0,
    hiM = motiv !== undefined && (motiv as number) >= 2;
  if ((exp as number) <= 1 || irregMeals || lowM)
    signals.structureNeed = "high";
  else if (exp === 2 || motiv === 1) signals.structureNeed = "medium";
  else if ((exp as number) >= 3 && hiM) signals.structureNeed = "low";
  else signals.structureNeed = "medium";

  // pressureTolerance
  if (moment === 4 || moment === 3 || signals.overwhelmed)
    signals.pressureTolerance = "low";
  else if (moment === 0 || moment === 1 || moment === 2)
    signals.pressureTolerance = "medium";
  else if (signals.actionCapacity !== "low")
    signals.pressureTolerance = "high";
  else signals.pressureTolerance = "medium";

  // motivationStyle
  if (signals.pressureTolerance === "low") signals.motivationStyle = "gentle";
  else if (
    signals.pressureTolerance === "medium" ||
    signals.structureNeed === "high"
  )
    signals.motivationStyle = "structured";
  else signals.motivationStyle = "direct";

  return signals as Signals;
}

// ── ROUTE RESOLVER ──────────────────────────────────────────────────

export const ROUTES: Record<string, RouteName> = {
  POSTPARTUM: "POSTPARTUM",
  DIVORCE: "DIVORCE",
  HORMONAL: "HORMONAL",
  BURNOUT: "BURNOUT",
  LOSS: "LOSS",
  GENERAL: "GENERAL",
};

export const MOMENT_TO_ROUTE: Record<number, RouteName> = {
  0: ROUTES.POSTPARTUM,
  1: ROUTES.DIVORCE,
  2: ROUTES.HORMONAL,
  3: ROUTES.BURNOUT,
  4: ROUTES.LOSS,
  5: ROUTES.GENERAL,
};

export function resolveRoute(
  mini: MiniProfile,
  signals: Partial<Signals>
): RouteResult {
  mini = mini || {};
  signals = signals || {};
  const base = MOMENT_TO_ROUTE[mini.moment as number];

  if (base === ROUTES.LOSS)
    return {
      route: ROUTES.LOSS,
      confidence: "high",
      source: "questionnaire",
      notes: null,
    };
  if (base === ROUTES.POSTPARTUM)
    return {
      route: ROUTES.POSTPARTUM,
      confidence: "high",
      source: signals.overwhelmed ? "combined" : "questionnaire",
      notes: signals.overwhelmed ? "Postpartum + overwhelmed" : null,
    };
  if (base === ROUTES.BURNOUT)
    return {
      route: ROUTES.BURNOUT,
      confidence: "high",
      source: "questionnaire",
      notes: null,
    };
  if (
    base !== ROUTES.BURNOUT &&
    signals.overwhelmed &&
    signals.actionCapacity === "low" &&
    signals.pressureTolerance === "low"
  ) {
    if (base === ROUTES.GENERAL)
      return {
        route: ROUTES.BURNOUT,
        confidence: "medium",
        source: "signals",
        notes: "Signal-detected burnout",
      };
    return {
      route: base,
      confidence: "high",
      source: "combined",
      notes: "Burnout-like signals on " + base,
    };
  }
  if (base === ROUTES.DIVORCE)
    return {
      route: ROUTES.DIVORCE,
      confidence: "high",
      source: "questionnaire",
      notes: null,
    };
  if (base === ROUTES.HORMONAL)
    return {
      route: ROUTES.HORMONAL,
      confidence: "high",
      source: "questionnaire",
      notes: null,
    };
  if (base === ROUTES.GENERAL)
    return {
      route: ROUTES.GENERAL,
      confidence: "high",
      source: "questionnaire",
      notes: null,
    };
  return {
    route: ROUTES.GENERAL,
    confidence: "medium",
    source: "questionnaire",
    notes: "Fallback",
  };
}

// ── MESSAGE ENGINE ──────────────────────────────────────────────────

export const ENGINE_MESSAGES: EngineMessage[] = [
  // POSTPARTUM
  {
    id: "pp_val_onb_01",
    route: "POSTPARTUM",
    purpose: "VALIDATION",
    ctx: "ONBOARDING",
    cond: null,
    block: null,
    text: "Corpul tău tocmai a făcut cel mai greu și cel mai frumos lucru posibil. Ce simți acum — oboseala, schimbările, poate chiar sentimentul că nu te mai recunoști — e absolut normal.",
  },
  {
    id: "pp_val_onb_02",
    route: "POSTPARTUM",
    purpose: "VALIDATION",
    ctx: "ONBOARDING",
    cond: { overwhelmed: true },
    block: null,
    text: "Știu că totul e mult acum. Somnul, bebelușul, corpul care s-a schimbat. Nu trebuie să faci totul perfect — trebuie doar să fii aici. Și ești.",
  },
  {
    id: "pp_results_01",
    route: "POSTPARTUM",
    purpose: "RESULTS",
    ctx: "RESULTS",
    cond: null,
    block: null,
    text: "[Prenume], planul tău e construit pentru o mamă — nu pentru o sportivă. Rețete rapide, antrenamente scurte, tot ce ține cont de alăptare, de diastază, de nopțile nedormite. Pas cu pas. Fără grabă.",
  },
  // DIVORCE
  {
    id: "div_val_onb_01",
    route: "DIVORCE",
    purpose: "VALIDATION",
    ctx: "ONBOARDING",
    cond: null,
    block: null,
    text: "O despărțire nu e un capăt de drum — e un nou început pe care încă nu îl vezi clar. Ce simți acum e răspunsul normal al corpului tău la o schimbare imensă.",
  },
  {
    id: "div_val_onb_02",
    route: "DIVORCE",
    purpose: "VALIDATION",
    ctx: "ONBOARDING",
    cond: { selfBlame: "high" },
    block: null,
    text: "Nu e vina ta că te simți așa. Cortizolul, hormonul stresului, îți afectează somnul, greutatea și energia. E biochimie, nu slăbiciune.",
  },
  {
    id: "div_results_01",
    route: "DIVORCE",
    purpose: "RESULTS",
    ctx: "RESULTS",
    cond: null,
    block: null,
    text: "[Prenume], ai avut curajul să începi ceva nou. Planul tău se concentrează pe reducerea stresului, pe mișcare care te face să te simți puternică, și pe alimentație care susține — nu restricționează.",
  },
  // HORMONAL
  {
    id: "hor_val_onb_01",
    route: "HORMONAL",
    purpose: "VALIDATION",
    ctx: "ONBOARDING",
    cond: null,
    block: null,
    text: "Dacă simți că faci totul corect dar corpul nu mai răspunde — e pentru că regulile s-au schimbat fără să te întrebe nimeni. Nu e vina ta. E biologie.",
  },
  {
    id: "hor_results_01",
    route: "HORMONAL",
    purpose: "RESULTS",
    ctx: "RESULTS",
    cond: null,
    block: null,
    text: "[Prenume], planul tău e construit pe biologia ta de ACUM — nu pe cea de acum 10 ani. Antrenament de forță prioritar, nutriție adaptată, strategii pentru somn și energie.",
  },
  // BURNOUT
  {
    id: "burn_val_onb_01",
    route: "BURNOUT",
    purpose: "VALIDATION",
    ctx: "ONBOARDING",
    cond: null,
    block: null,
    text: "Nu e normal să te simți epuizată tot timpul — dar la câte faci zilnic, e complet de înțeles că ai ajuns aici.",
  },
  {
    id: "burn_val_onb_02",
    route: "BURNOUT",
    purpose: "VALIDATION",
    ctx: "ONBOARDING",
    cond: { overwhelmed: true, actionCapacity: "low" },
    block: null,
    text: "Ești epuizată dar încă funcționezi — și tocmai asta e problema. Corpul ține scorul chiar și când tu nu mai ții.",
  },
  {
    id: "burn_results_01",
    route: "BURNOUT",
    purpose: "RESULTS",
    ctx: "RESULTS",
    cond: null,
    block: null,
    text: "[Prenume], programul tău începe cu liniște. Primele săptămâni: somn, hidratare, mișcare blândă. Zero presiune, zero HIIT. Abia când corpul tău iese din modul de supraviețuire, începem să construim.",
  },
  // LOSS
  {
    id: "loss_val_onb_01",
    route: "LOSS",
    purpose: "VALIDATION",
    ctx: "ONBOARDING",
    cond: null,
    block: null,
    text: "Nu o să pretindem că înțelegem ce simți — pentru că fiecare pierdere e unică. Dar știm un lucru: corpul tău simte această durere la fel de profund ca sufletul tău.",
  },
  {
    id: "loss_results_01",
    route: "LOSS",
    purpose: "RESULTS",
    ctx: "RESULTS",
    cond: null,
    block: null,
    text: "[Prenume], nu îți cerem să fii motivată. Îți oferim un loc sigur în care să ai grijă de tine — când și cum poți. Suntem aici. Fără presiune. Fără termen limită.",
  },
  // GENERAL
  {
    id: "gen_val_onb_01",
    route: "GENERAL",
    purpose: "VALIDATION",
    ctx: "ONBOARDING",
    cond: null,
    block: null,
    text: "Faptul că ești aici înseamnă că ai luat deja cea mai grea decizie: să începi. Ce urmează e diferit — pentru că e construit pe tine.",
  },
  {
    id: "gen_results_01",
    route: "GENERAL",
    purpose: "RESULTS",
    ctx: "RESULTS",
    cond: null,
    block: null,
    text: "[Prenume], profilul tău e unic — și planul tău va fi la fel. Tot ce urmează e construit pe răspunsurile tale. Consistența bate intensitatea.",
  },
  // TRANSITION (block-specific)
  {
    id: "trans_despre_01",
    route: "GENERAL",
    purpose: "TRANSITION",
    ctx: "ONBOARDING",
    cond: null,
    block: "despre_tine",
    text: 'Deja știm câteva lucruri importante despre tine. Acum vrem să înțelegem ce îți dorești cu adevărat — nu ce „ar trebui", ci ce simți TU că e important.',
  },
  {
    id: "trans_stil_01",
    route: "GENERAL",
    purpose: "TRANSITION",
    ctx: "ONBOARDING",
    cond: null,
    block: "stil_viata",
    text: "Următoarele întrebări sunt despre viața ta de zi cu zi. Nu există răspunsuri greșite — dacă dormi 4 ore și bei 5 cafele, asta e realitatea ta și noi lucrăm cu ea, nu împotriva ei.",
  },
  {
    id: "trans_sanatate_01",
    route: "GENERAL",
    purpose: "TRANSITION",
    ctx: "ONBOARDING",
    cond: null,
    block: "sanatate",
    text: "Ce urmează e important și poate fi personal. Fiecare răspuns ne ajută să facem programul tău mai sigur. Nu împărtășim aceste date cu nimeni — sunt doar pentru a te proteja.",
  },
  {
    id: "trans_alimentatie_01",
    route: "GENERAL",
    purpose: "TRANSITION",
    ctx: "ONBOARDING",
    cond: null,
    block: "alimentatie",
    text: 'Relația cu mâncarea e complicată — mai ales după diete, stres, sau schimbări de viață. Nu îți cerem să fii „perfectă" în alimentație. Îți cerem doar să fii sinceră, ca să putem construi ceva care chiar funcționează pentru tine.',
  },
  {
    id: "trans_motivatie_01",
    route: "GENERAL",
    purpose: "TRANSITION",
    ctx: "ONBOARDING",
    cond: null,
    block: "motivatie",
    text: "[Prenume], ești aproape gata. Faptul că ai ajuns până aici spune ceva important despre tine: ești genul de femeie care nu renunță. Ține minte asta în zilele grele.",
  },
  {
    id: "trans_final_01",
    route: "GENERAL",
    purpose: "TRANSITION",
    ctx: "ONBOARDING",
    cond: null,
    block: "final",
    text: "[Prenume], profilul tău e complet. Am ascultat fiecare răspuns. Ce urmează e construit din tot ce ne-ai spus — pe obiectivul tău, pe viața ta, pe corpul tău. Ca apa, se mulează pe forma ta.",
  },
];

export const SAFE_MSG = {
  id: "_safe",
  text: "Ești în locul potrivit. Hai să construim împreună.",
  fallback: true as const,
};

export function selectMessage(opts: SelectMessageOpts): SelectedMessage {
  const route = opts.route || "GENERAL",
    signals = opts.signals || {},
    purpose = opts.purpose || "VALIDATION",
    ctx = opts.screenContext || null,
    block = opts.block || null;
  let best: EngineMessage | null = null,
    bestScore = -1;
  for (const m of ENGINE_MESSAGES) {
    let score = 0;
    if (m.route === route) score += 100;
    else if (m.route === "GENERAL") score += 10;
    else continue;
    if (m.purpose !== purpose) continue;
    if (ctx && m.ctx === ctx) score += 50;
    else if (m.ctx && m.ctx !== ctx) score -= 20;
    if (block && m.block === block) score += 40;
    else if (block && m.block && m.block !== block) continue;
    if (m.cond) {
      let ok = true;
      for (const [k, v] of Object.entries(m.cond)) {
        if (signals[k] !== v) {
          ok = false;
          break;
        }
      }
      if (ok) score += 30;
      else continue;
    }
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best
    ? { id: best.id, text: best.text, score: bestScore, fallback: false }
    : { id: SAFE_MSG.id, text: SAFE_MSG.text, score: 0, fallback: true };
}

// ── PERSONALIZATION HELPER ──────────────────────────────────────────

export function personalize(text: string, name?: string): string {
  return (text || "").replace(/\[Prenume\]/g, name || "");
}

// ── STRESS SCORE ────────────────────────────────────────────────────

export function calcStressScore(ans: CompletAnswers): number {
  ans = ans || {};
  let score = 0;
  const sleep = ans.q5 || 0;
  const stress = ans.q6 || 0;
  const emoEat = ans.q15 || 0;
  const water = ans.q16 || 0;
  const diets = ans.q17 || 0;
  score += sleep * 2.5;
  score += stress * 2.5;
  score += (2 - emoEat) * 1.5;
  score += Math.max(0, 3 - water) * 0.8;
  score += Math.min(diets, 3) * 0.5;
  return Math.min(Math.round((score / 22.4) * 100), 100);
}

// ── HORMONAL SCORE ──────────────────────────────────────────────────

export function calcHormonalScore(
  mini: MiniProfile,
  ans: CompletAnswers
): number {
  mini = mini || {};
  ans = ans || {};
  let score = 0;
  if ((mini.age as number) >= 40) score += 15;
  if ((mini.age as number) >= 45) score += 15;
  if (mini.moment === 2) score += 20;
  if (mini.moment === 0) score += 10;
  const sleep = ans.q5 || 0;
  if (sleep >= 2) score += 10;
  const stress = ans.q6 || 0;
  if (stress >= 2) score += 10;
  const weightChange = ans.q3 || 0;
  if (weightChange === 0) score += 10;
  if (ans.q13b && ans.q13b.length > 0) {
    score += Math.min(ans.q13b.length * 5, 20);
  }
  return Math.min(score, 100);
}

// ── METABOLIC PROFILE ───────────────────────────────────────────────

export function getMetabolicProfile<T>(
  mini: MiniProfile,
  ans: CompletAnswers,
  profiles: Record<string, T>,
  fallback: T
): T {
  mini = mini || {};
  ans = ans || {};
  profiles = profiles || ({} as Record<string, T>);
  const stress = calcStressScore(ans);
  const hormonal = calcHormonalScore(mini, ans);
  const moment = mini.moment;
  if (moment === 0) return profiles.postpartum || fallback;
  if (moment === 4) return profiles.pierdere || fallback;
  if (stress > 65) return profiles.antiCortizol || fallback;
  if (hormonal > 60) return profiles.hormonalReset || fallback;
  if ((mini.activity as number) <= 1)
    return profiles.metabolismLent || fallback;
  return profiles.echilibrat || fallback;
}

// ── SAFETY TAGS ─────────────────────────────────────────────────────

export function getSafetyTags(
  mini: MiniProfile,
  ans: CompletAnswers
): SafetyTag[] {
  mini = mini || {};
  ans = ans || {};
  const tags: SafetyTag[] = [];
  const limits = ans.q12 || [];
  if (limits.includes(1))
    tags.push({
      tag: "NO_KNEE",
      type: "exclude",
      label: "Fără exerciții genunchi",
    });
  if (limits.includes(2))
    tags.push({
      tag: "NO_BACK_L",
      type: "exclude",
      label: "Fără încărcare lombară",
    });
  if (limits.includes(3))
    tags.push({
      tag: "NO_BACK_C",
      type: "exclude",
      label: "Fără presiune cervicală",
    });
  if (limits.includes(4))
    tags.push({
      tag: "NO_SHOULDER",
      type: "exclude",
      label: "Fără exerciții umăr intens",
    });
  if (limits.includes(5))
    tags.push({ tag: "NO_HIP", type: "exclude", label: "Fără impact șold" });
  if (limits.includes(6))
    tags.push({
      tag: "NO_DISC",
      type: "exclude",
      label: "Protecție hernie de disc",
    });
  if (limits.includes(7))
    tags.push({
      tag: "PELVIC_SAFE",
      type: "include",
      label: "Exerciții planșeu pelvian",
    });
  if (limits.includes(8))
    tags.push({
      tag: "NO_DIASTASIS",
      type: "exclude",
      label: "Fără exerciții diastază",
    });
  if (limits.includes(9))
    tags.push({
      tag: "NO_STANDING_LONG",
      type: "info",
      label: "Atenție varice",
    });
  if (limits.includes(10))
    tags.push({
      tag: "NO_POSITION_CHANGE",
      type: "exclude",
      label: "Tranziții lente",
    });
  const exp = ans.q13 || 0;
  if (exp <= 1)
    tags.push({ tag: "BEGINNER", type: "include", label: "Nivel începător" });
  const equip = ans.q9 || [];
  if (equip.length === 1 && equip[0] === 0)
    tags.push({ tag: "BODYWEIGHT_ONLY", type: "info", label: "Doar corp" });
  if (mini.moment === 0)
    tags.push({
      tag: "POSTPARTUM",
      type: "include",
      label: "Sigur postpartum",
    });
  if (ans.q4b === 0 || ans.q4b === 1)
    tags.push({
      tag: "BREASTFEEDING",
      type: "info",
      label: "Alăptare — atenție calorii",
    });
  return tags;
}
