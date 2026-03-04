export type QuestionType =
  | "welcome"
  | "end"
  | "declined"
  | "text"
  | "email"
  | "tel"
  | "number"
  | "textarea"
  | "single"
  | "multi"
  | "scale"
  | "gdpr";

export interface ShowIfRule {
  q: string;
  vals: number[];
}

interface BaseQuestion {
  id: string;
  type: QuestionType;
  block?: string;
  icon?: string;
  num?: string;
  title?: string;
  sub?: string | null;
  req?: boolean;
  showIf?: ShowIfRule;
}

export interface TextQuestion extends BaseQuestion {
  type: "text" | "email" | "tel" | "number" | "textarea";
  ph?: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: "single" | "multi" | "gdpr";
  opts: string[];
}

export interface ScaleQuestion extends BaseQuestion {
  type: "scale";
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface ScreenQuestion extends BaseQuestion {
  type: "welcome" | "end" | "declined";
}

export type Question = TextQuestion | ChoiceQuestion | ScaleQuestion | ScreenQuestion;

export type AnswerValue = string | number | number[] | undefined;
export type Answers = Record<string, AnswerValue>;
