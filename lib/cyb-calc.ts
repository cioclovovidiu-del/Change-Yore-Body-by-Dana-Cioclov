// =============================================================================
// CYB CALC — Shared utility/math functions
// Extracted from: public/landing-v2/CYB_Calc.js
// Pure functions: no DOM, no state, no browser APIs.
// =============================================================================

export interface BmiCategory {
  max: number;
  label: string;
  cls: string;
}

/** BMI = weight / (height_m)^2. Defensive: coerces inputs, prevents div-by-zero. */
export function calcBMI(w: number, h: number): number {
  w = Number(w) || 0;
  h = Number(h) || 1;
  if (h < 1) h = 1;
  return w / ((h / 100) ** 2);
}

/** Mifflin-St Jeor (female): 10w + 6.25h - 5a - 161 */
export function calcBMR(w: number, h: number, a: number): number {
  w = Number(w) || 0;
  h = Number(h) || 0;
  a = Number(a) || 0;
  return 10 * w + 6.25 * h - 5 * a - 161;
}

/** TDEE = BMR × activity factor. Activity clamped to 0-3. */
export function calcTDEE(bmr: number, act: number): number {
  const factors = [1.2, 1.375, 1.55, 1.725];
  bmr = Number(bmr) || 0;
  act = Math.min(Math.max(Math.floor(Number(act) || 0), 0), 3);
  return bmr * factors[act];
}

/** Classify BMI using provided category table. Returns last category as fallback. */
export function bmiCat(
  bmi: number,
  categories: BmiCategory[]
): { label: string; cls: string } {
  for (const cat of categories) {
    if (bmi < cat.max) return { label: cat.label, cls: cat.cls };
  }
  return {
    label: categories[categories.length - 1].label,
    cls: categories[categories.length - 1].cls,
  };
}

/** BMI → gauge percentage (2-98% range, mapped from BMI 15-40). */
export function bmiPercent(bmi: number): number {
  return Math.min(Math.max(((bmi - 15) / (40 - 15)) * 100, 2), 98);
}

/** Ideal weight range string for a given height (cm). */
export function idealWeight(h: number): string {
  const low = (18.5 * (h / 100) ** 2).toFixed(0);
  const high = (24.9 * (h / 100) ** 2).toFixed(0);
  return `${low}–${high} kg`;
}

/** Projected weeks to reach target weight at 500 kcal/day deficit. Capped at 52. */
export function projWeeks(current: number, target: number): number {
  const deficit = 500;
  const perWeek = (deficit * 7) / 7700;
  const diff = current - target;
  if (diff <= 0) return 12;
  return Math.min(Math.ceil(diff / perWeek), 52);
}
