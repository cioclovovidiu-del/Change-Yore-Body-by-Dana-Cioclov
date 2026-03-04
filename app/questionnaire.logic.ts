import type { Answers, Question } from "./questionnaire.types";

const NUMERIC_RULES: Record<string, { min: number; max: number }> = {
  q2: { min: 14, max: 90 },
  q3: { min: 130, max: 210 },
  q4: { min: 35, max: 250 },
  q9: { min: 0, max: 36 },
};

function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim();
  const at = trimmed.indexOf("@");
  const dot = trimmed.lastIndexOf(".");
  return at > 0 && dot > at + 1 && dot < trimmed.length - 1;
}

function looksLikePhone(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 8 || trimmed.length > 20) return false;

  for (const char of trimmed) {
    const isDigit = char >= "0" && char <= "9";
    if (!isDigit && char !== "+" && char !== " " && char !== "(" && char !== ")" && char !== "-") {
      return false;
    }
  }

  return true;
}

export function buildVisibleQuestions(questions: Question[], answers: Answers): Question[] {
  return questions.filter((question) => {
    if (!question.showIf) return true;

    const answer = answers[question.showIf.q];
    if (typeof answer !== "number") return false;

    return question.showIf.vals.includes(answer);
  });
}

export function getProgress(visibleQuestions: Question[], index: number): { current: number; total: number; pct: number } {
  const current = visibleQuestions[index];
  const total = visibleQuestions.filter((question) => Boolean(question.num)).length;

  let step = 0;
  for (let i = 0; i <= index; i += 1) {
    if (visibleQuestions[i]?.num) step += 1;
  }

  if (!current) return { current: step, total, pct: 0 };
  if (current.type === "welcome") return { current: step, total, pct: 0 };
  if (current.type === "end" || current.type === "declined") return { current: step, total, pct: 100 };

  return { current: step, total, pct: total > 0 ? Math.round((step / total) * 100) : 0 };
}

export function isQuestionValid(question: Question, answers: Answers): boolean {
  if (!question.req) return true;

  const value = answers[question.id];

  switch (question.type) {
    case "text":
    case "textarea":
      return typeof value === "string" && value.trim().length > 0;
    case "email":
      return typeof value === "string" && looksLikeEmail(value);
    case "tel":
      if (value === undefined || value === "") return !question.req;
      return typeof value === "string" && looksLikePhone(value);
    case "number": {
      if (value === undefined || value === "" || Number.isNaN(Number(value))) return false;
      const parsed = Number(value);
      const rule = NUMERIC_RULES[question.id];
      if (!rule) return true;
      return parsed >= rule.min && parsed <= rule.max;
    }
    case "single":
    case "gdpr":
    case "scale":
      return typeof value === "number";
    case "multi":
      return Array.isArray(value) && value.length > 0;
    default:
      return true;
  }
}

export function toSubmissionData(visibleQuestions: Question[], answers: Answers): Record<string, string> {
  const result: Record<string, string> = {};

  visibleQuestions.forEach((question) => {
    if (!question.num) return;

    const value = answers[question.id];

    if (question.type === "single" || question.type === "gdpr") {
      const mapped = typeof value === "number" && question.opts ? question.opts[value] : "";
      result[question.id] = mapped ?? "";
      return;
    }

    if (question.type === "multi") {
      const mapped = Array.isArray(value)
        ? value.map((optionIndex) => question.opts?.[optionIndex]).filter(Boolean).join(", ")
        : "";
      result[question.id] = mapped;
      return;
    }

    if (question.type === "scale") {
      result[question.id] = typeof value === "number" ? String(value) + "/10" : "";
      return;
    }

    result[question.id] = typeof value === "string" || typeof value === "number" ? String(value) : "";
  });

  return result;
}
