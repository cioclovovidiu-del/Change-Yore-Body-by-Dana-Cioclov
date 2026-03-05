"use client";

import Link from "next/link";
import { useState } from "react";
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
      <h1>Hai să ne cunoaștem!</h1>
      <p>Bine ai venit! Sunt Daniela și vreau să te ajut să devii, cea mai bună versiune a ta. 💜</p>
      <p>Hai să ne cunoaștem! 😊</p>
      <p>Acest chestionar este dedicat femeilor ocupate care vor o schimbare reală — dar nu au timp de sală, de diete complicate sau de planuri care nu se potrivesc cu viața lor.</p>
      <p>Surprize frumoase te așteaptă odată ce termini de completat! 🎁</p>
      <p>Informațiile de aici mă vor ajuta să gândesc ceva special, conceput numai pentru tine. Fiecare întrebare are un scop — vei înțelege în curând. 😊</p>
      <p>Cu cât ești mai sinceră și mai detaliată, cu atât surpriza va fi mai bună pentru tine.</p>
      <div className={styles.welcomeBadges}>
        <span className={styles.wBadge}>⏱ Durează aproximativ 5-6 minute</span>
        <span className={styles.wBadge}>✅ Nu există răspunsuri greșite — doar răspunsuri sincere</span>
        <span className={styles.wBadge}>🔒 Toate datele tale sunt 100% confidențiale</span>
      </div>
      <p>La final primești acces la grupul meu PRIVAT de WhatsApp, unde te așteaptă conținut gratuit valoros: ghiduri, sfaturi și multe surprize. 💚</p>
      <p>Ia-ți câteva minute de liniște, un pahar cu apă și hai să începem! 😊</p>
      <div className={styles.welcomeCreds}>
        <strong>CYB — Daniela Cioclov</strong><br />
        Tehnician Nutriționist | Fizioterapie &amp; Kinetoterapie | Instructor Fitness 10+ ani
      </div>
    </section>
  );
}

export function EndScreen({ name }: { name: string }) {
  const [agreedRules, setAgreedRules] = useState(false);

  return (
    <section className={styles.endScreen}>
      <div className={styles.endEmoji}>🎉</div>
      <h2>{name ? `Gata! Mulțumesc frumos, ${name}! 💜` : "Gata! Mulțumesc frumos! 💜"}</h2>
      <p>🎉 Gata! Am primit răspunsurile tale.</p>
      <p>Mulțumesc că ți-ai făcut timp — fiecare răspuns contează mai mult decât crezi. 😉</p>
      <p><strong>Ce primești ACUM:</strong></p>
      <p>💚 Accesul tău la grupul PRIVAT de WhatsApp — doar pentru cele care au completat chestionarul, adică TU 🫵</p>

      <label className={styles.rulesCheckbox}>
        <input type="checkbox" checked={agreedRules} onChange={() => setAgreedRules(!agreedRules)} />
        <span className={styles.rulesCheckmark}>{agreedRules ? "✓" : ""}</span>
        <span className={styles.rulesText}>
          Sunt de acord cu regulile grupului:
          <span className={styles.rulesList}>
            • Respect față de toate membrele<br />
            • Fără spam sau promovare personală<br />
            • Informațiile partajate în grup sunt confidențiale<br />
            • Întrebările sunt binevenite — nu există întrebări proaste
          </span>
        </span>
      </label>

      {agreedRules ? (
        <Link href="https://chat.whatsapp.com/Gyi1jBE4lI5JQZKTJ9jxsC" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>👉 INTRĂ ÎN GRUPUL WHATSAPP</Link>
      ) : (
        <span className={styles.whatsappBtnDisabled}>👉 INTRĂ ÎN GRUPUL WHATSAPP</span>
      )}

      <div className={styles.endSub}>
        <p>Acolo vei primi GRATUIT: ghiduri, planuri de antrenament, sfaturi de nutriție și mult conținut valoros.</p>
        <p>📩 Dacă nu poți copia sau deschide link-ul, trimite-mi un mesaj și ți-l trimit imediat în privat.</p>
      </div>
    </section>
  );
}

export function DeclinedScreen() {
  return (
    <section className={styles.declined}>
      <div className={styles.endEmoji}>🤍</div>
      <h2>Înțelegem.</h2>
      <p>Din păcate, nu putem continua fără acordul tău pentru prelucrarea datelor.</p>
      <p>Datele tale NU au fost salvate sau trimise.</p>
      <p>Dacă te răzgândești, ești oricând binevenită! 💜</p>
    </section>
  );
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
      {question.sub ? <p className={styles.qSubtitle} style={{ whiteSpace: "pre-line" }}>{question.sub}</p> : <div className={styles.qSpacer} />}
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
  return <footer className={styles.footerNav}><button type="button" className={`${styles.navBtn} ${styles.btnBack}`} onClick={onBack} style={{ visibility: canGoBack ? "visible" : "hidden" }}>Back</button><span className={styles.enterHint}>{isWelcome ? "Takes 5 minutes" : "Enter"}</span><button type="button" className={`${styles.navBtn} ${isSubmitStep ? styles.btnSubmit : styles.btnNext}`} onClick={onNext}>{isWelcome ? "Sunt gata! Să începem →" : isSubmitStep ? "Submit" : "Next"}</button></footer>;
}
