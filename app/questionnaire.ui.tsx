import Link from "next/link";
import styles from "./questionnaire.module.css";
import type { AnswerValue, Question } from "./questionnaire.types";

type PrimitiveQuestion = Extract<Question, { type: "text" | "email" | "tel" | "number" | "textarea" }>;
type ChoiceQuestion = Extract<Question, { type: "single" | "multi" | "gdpr" }>;
type ScaleQuestion = Extract<Question, { type: "scale" }>;

export function Header({ progressText, percent }: { progressText: string; percent: number }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>Dana Cioclov <span>- CYB</span></div>
      <p className={styles.progressInfo} aria-live="polite">{progressText}</p>
      <div className={styles.progressBarWrap}><div className={styles.progressBar} style={{ width: `${percent}%` }} /></div>
    </header>
  );
}

export function WelcomeScreen() {
  return (
    <section className={styles.welcome}>
      <div className={styles.welcomeEmoji}>💜</div>
      <h1>Welcome</h1>
      <div className={styles.welcomeBadges}>
        <span className={styles.wBadge}>5-6 min</span>
        <span className={styles.wBadge}>Safe data</span>
      </div>
    </section>
  );
}

export function EndScreen({ name }: { name: string }) {
  return (
    <section className={styles.endScreen}>
      <div className={styles.endEmoji}>🎉</div>
      <h2>{name ? `Multumesc ${name}` : "Multumesc"}</h2>
      <Link href="https://chat.whatsapp.com/DLDKG6cIXZ3EH0GtDbfK6Y" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>WhatsApp</Link>
    </section>
  );
}

export function DeclinedScreen() {
  return <section className={styles.declined}><h2>Declined</h2></section>;
}

interface QuestionBodyProps {
  question: Exclude<Question, { type: "welcome" | "end" | "declined" }>;
  answer: AnswerValue;
  error: boolean;
  onTextChange: (value: string) => void;
  onPickSingle: (index: number) => void;
  onToggleMulti: (index: number) => void;
  onPickScale: (value: number) => void;
}

export function QuestionBody({ question, answer, error, onTextChange, onPickSingle, onToggleMulti, onPickScale }: QuestionBodyProps) {
  return (
    <section className={styles.qCard}>
      {question.block ? <p className={styles.qBlockTag}>{`${question.icon ?? ""} ${question.block}`}</p> : null}
      {question.num ? <p className={styles.qNumber}>{question.num}</p> : null}
      <h2 className={styles.qTitle}>{question.title}</h2>
      {question.sub ? <p className={styles.qSubtitle}>{question.sub}</p> : <div className={styles.qSpacer} />}
      <QuestionInput question={question} answer={answer} onTextChange={onTextChange} onPickSingle={onPickSingle} onToggleMulti={onToggleMulti} onPickScale={onPickScale} />
      <p className={error ? `${styles.errorMsg} ${styles.show}` : styles.errorMsg}>Required field</p>
    </section>
  );
}

function QuestionInput({ question, answer, onTextChange, onPickSingle, onToggleMulti, onPickScale }: Omit<QuestionBodyProps, "error">) {
  if (question.type === "text" || question.type === "email" || question.type === "tel" || question.type === "number") {
    const inputQuestion = question as PrimitiveQuestion;
    const type = inputQuestion.type === "text" ? "text" : inputQuestion.type;
    return <input className={inputQuestion.type === "number" ? styles.numberInput : styles.textInput} type={type} placeholder={inputQuestion.ph ?? ""} value={typeof answer === "string" || typeof answer === "number" ? String(answer) : ""} onChange={(event) => onTextChange(event.target.value)} inputMode={inputQuestion.type === "number" ? "numeric" : inputQuestion.type === "tel" ? "tel" : undefined} />;
  }

  if (question.type === "textarea") {
    const textAreaQuestion = question as PrimitiveQuestion;
    return <textarea className={styles.textArea} placeholder={textAreaQuestion.ph ?? ""} value={typeof answer === "string" ? answer : ""} onChange={(event) => onTextChange(event.target.value)} />;
  }

  if (question.type === "single" || question.type === "gdpr") {
    const choiceQuestion = question as ChoiceQuestion;
    return <fieldset className={styles.optionsList}>{choiceQuestion.opts.map((option, index) => { const selected = answer === index; const prefix = question.type === "gdpr" ? (index === 0 ? "OK" : "NO") : String.fromCharCode(65 + index); return <button key={option} type="button" className={selected ? `${styles.option} ${styles.selected}` : styles.option} onClick={() => onPickSingle(index)}><span className={styles.optionLetter}>{prefix}</span><span>{option}</span></button>; })}</fieldset>;
  }

  if (question.type === "multi") {
    const choiceQuestion = question as ChoiceQuestion;
    const selectedValues = Array.isArray(answer) ? answer : [];
    return <fieldset className={styles.checkboxList}>{choiceQuestion.opts.map((option, index) => { const checked = selectedValues.includes(index); return <button key={option} type="button" className={checked ? `${styles.checkboxItem} ${styles.checked}` : styles.checkboxItem} onClick={() => onToggleMulti(index)}><span className={styles.checkBox}>{checked ? "✓" : ""}</span><span>{option}</span></button>; })}</fieldset>;
  }

  if (question.type === "scale") {
    const scaleQuestion = question as ScaleQuestion;
    return <fieldset className={styles.scaleFieldset}><div className={styles.scaleWrap}>{Array.from({ length: scaleQuestion.max - scaleQuestion.min + 1 }, (_, i) => scaleQuestion.min + i).map((value) => { const selected = answer === value; return <button key={value} type="button" className={selected ? `${styles.scaleBtn} ${styles.selected}` : styles.scaleBtn} onClick={() => onPickScale(value)}>{value}</button>; })}</div><div className={styles.scaleLabels}><span>{scaleQuestion.minLabel}</span><span>{scaleQuestion.maxLabel}</span></div></fieldset>;
  }

  return null;
}

interface FooterProps {
  show: boolean;
  canGoBack: boolean;
  isWelcome: boolean;
  isSubmitStep: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function Footer({ show, canGoBack, isWelcome, isSubmitStep, onBack, onNext }: FooterProps) {
  if (!show) return null;
  return <footer className={styles.footerNav}><button type="button" className={`${styles.navBtn} ${styles.btnBack}`} onClick={onBack} style={{ visibility: canGoBack ? "visible" : "hidden" }}>Back</button><span className={styles.enterHint}>Enter</span><button type="button" className={`${styles.navBtn} ${isSubmitStep ? styles.btnSubmit : styles.btnNext}`} onClick={onNext}>{isWelcome ? "Start" : isSubmitStep ? "Submit" : "Next"}</button></footer>;
}
