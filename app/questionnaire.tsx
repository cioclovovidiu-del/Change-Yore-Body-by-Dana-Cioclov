"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { QUESTIONS } from "./questionnaire.data";
import { buildVisibleQuestions, getProgress, isQuestionValid, toSubmissionData } from "./questionnaire.logic";
import styles from "./questionnaire.module.css";
import { DeclinedScreen, EndScreen, Footer, Header, QuestionBody, WelcomeScreen } from "./questionnaire.ui";
import type { Answers, Question } from "./questionnaire.types";

type RealQuestion = Exclude<Question, { type: "welcome" | "end" | "declined" }>;

export default function Questionnaire() {
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [showError, setShowError] = useState(false);

  const visibleQuestions = useMemo(() => buildVisibleQuestions(QUESTIONS, answers), [answers]);
  const safeIndex = Math.min(index, Math.max(visibleQuestions.length - 1, 0));
  const currentQuestion = visibleQuestions[safeIndex] ?? visibleQuestions[0];

  const progress = useMemo(() => getProgress(visibleQuestions, safeIndex), [visibleQuestions, safeIndex]);

  const progressText =
    currentQuestion?.type === "welcome"
      ? ""
      : currentQuestion?.type === "end" || currentQuestion?.type === "declined"
        ? "Completat"
        : `${progress.current} / ${progress.total}`;

  const setTextAnswer = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      setShowError(false);
    },
    [currentQuestion],
  );

  const pickSingle = useCallback(
    (optionIndex: number) => {
      if (!currentQuestion) return;

      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
      setShowError(false);

      if (currentQuestion.type === "single") {
        window.setTimeout(() => {
          setIndex((prev) => Math.min(prev + 1, visibleQuestions.length - 1));
        }, 220);
      }
    },
    [currentQuestion, visibleQuestions.length],
  );

  const toggleMulti = useCallback(
    (optionIndex: number) => {
      if (!currentQuestion) return;

      setAnswers((prev) => {
        const existing = Array.isArray(prev[currentQuestion.id]) ? [...(prev[currentQuestion.id] as number[])] : [];
        const hasItem = existing.includes(optionIndex);
        const nextValue = hasItem ? existing.filter((item) => item !== optionIndex) : [...existing, optionIndex];

        return { ...prev, [currentQuestion.id]: nextValue };
      });

      setShowError(false);
    },
    [currentQuestion],
  );

  const pickScale = useCallback(
    (value: number) => {
      if (!currentQuestion) return;

      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      setShowError(false);

      window.setTimeout(() => {
        setIndex((prev) => Math.min(prev + 1, visibleQuestions.length - 1));
      }, 220);
    },
    [currentQuestion, visibleQuestions.length],
  );

  const goNext = useCallback(() => {
    if (!currentQuestion) return;

    if (currentQuestion.type !== "welcome" && currentQuestion.req && !isQuestionValid(currentQuestion, answers)) {
      setShowError(true);
      return;
    }

    setShowError(false);

    if (currentQuestion.type === "gdpr" && answers[currentQuestion.id] === 1) {
      const declinedIndex = visibleQuestions.findIndex((item) => item.id === "declined");
      if (declinedIndex >= 0) setIndex(declinedIndex);
      return;
    }

    if (currentQuestion.id === "q40" && answers[currentQuestion.id] === 0) {
      const payload = toSubmissionData(visibleQuestions, answers);
      console.log("CYB questionnaire payload", payload);

      const questionsMeta = visibleQuestions
        .filter((q) => q.num && q.title && q.block)
        .map((q) => ({ id: q.id, title: q.title!, block: q.block! }));

      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload, questions: questionsMeta }),
      }).catch((err) => console.error("Email send failed:", err));

      const endIndex = visibleQuestions.findIndex((item) => item.id === "end");
      if (endIndex >= 0) setIndex(endIndex);
      return;
    }

    setIndex((prev) => {
      const next = Math.min(prev + 1, visibleQuestions.length - 1);
      if (visibleQuestions[next]?.type === "declined") return Math.min(next + 1, visibleQuestions.length - 1);
      return next;
    });
  }, [answers, currentQuestion, visibleQuestions]);

  const goBack = useCallback(() => {
    setShowError(false);
    setIndex((prev) => {
      if (prev <= 0) return 0;
      const candidate = prev - 1;
      if (visibleQuestions[candidate]?.type === "declined" || visibleQuestions[candidate]?.type === "end") {
        return Math.max(candidate - 1, 0);
      }
      return candidate;
    });
  }, [visibleQuestions]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (event.key === "Enter" && !event.shiftKey && tag !== "TEXTAREA") {
        event.preventDefault();
        goNext();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [goNext]);

  if (!currentQuestion) return null;

  const isTerminal = currentQuestion.type === "end" || currentQuestion.type === "declined";
  const isWelcome = currentQuestion.type === "welcome";
  const isSubmitStep = currentQuestion.id === "q40";
  const isQuestionStep = currentQuestion.type !== "welcome" && currentQuestion.type !== "end" && currentQuestion.type !== "declined";

  return (
    <div className={styles.shell}>
      <Header progressText={progressText} percent={progress.pct} />

      <main className={styles.main}>
        <div className={`${styles.slide} ${styles.active}`}>
          {currentQuestion.type === "welcome" ? <WelcomeScreen /> : null}
          {currentQuestion.type === "end" ? <EndScreen name={typeof answers.q1 === "string" ? answers.q1 : ""} /> : null}
          {currentQuestion.type === "declined" ? <DeclinedScreen /> : null}

          {isQuestionStep ? (
            <QuestionBody
              question={currentQuestion as RealQuestion}
              answer={answers[currentQuestion.id]}
              error={showError}
              onTextChange={setTextAnswer}
              onPickSingle={pickSingle}
              onToggleMulti={toggleMulti}
              onPickScale={pickScale}
            />
          ) : null}
        </div>
      </main>

      <Footer show={!isTerminal} canGoBack={safeIndex > 0} isWelcome={isWelcome} isSubmitStep={isSubmitStep} onBack={goBack} onNext={goNext} />
    </div>
  );
}
