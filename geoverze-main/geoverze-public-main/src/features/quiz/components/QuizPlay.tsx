import { ArrowLeft, ArrowRight, Check, Flag, SkipForward } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";
import { useQuizStore, type QuizMode } from "@/stores/quizStore";
import type { QuizSet } from "../data/types";
import { correctLabels, isCorrect, isPlayable } from "../lib/session";
import { ExitDialog } from "./ExitDialog";
import { QuestionRenderer } from "./QuestionRenderer";
import { QuizHeader } from "./QuizHeader";
import { QuizLayout } from "./QuizLayout";

const MODE_LABEL: Record<QuizMode, string> = {
  solo: "Solo",
  pvp: "1v1 duel",
  multiplayer: "Multiplayer",
  practice: "Practice",
};

/**
 * The play screen — one engine for every mode and question type.
 *
 * Flow per question: select → check (locks and grades locally) → next. Skipping
 * records an unanswered result so the summary stays honest.
 */
export function QuizPlay({
  set,
  mode,
  onFinish,
  onExit,
  sidebar,
}: {
  set: QuizSet;
  mode: QuizMode;
  onFinish: () => void;
  onExit: () => void;
  sidebar?: React.ReactNode;
}) {
  const index = useQuizStore((s) => s.index);
  const answers = useQuizStore((s) => s.answers);
  const startedAt = useQuizStore((s) => s.startedAt);
  const record = useQuizStore((s) => s.record);
  const next = useQuizStore((s) => s.next);
  const previous = useQuizStore((s) => s.previous);
  const finish = useQuizStore((s) => s.finish);

  const total = set.questions.length;
  const question = set.questions[Math.min(index, total - 1)]!;
  const recorded = answers[question.id];

  const [value, setValue] = useState<string[] | null>(null);
  const [locked, setLocked] = useState(false);
  const [questionStart, setQuestionStart] = useState(() => Date.now());
  const [exitOpen, setExitOpen] = useState(false);

  // Re-entering a question shows its recorded result rather than a blank card.
  useEffect(() => {
    setValue(recorded?.value ?? null);
    setLocked(Boolean(recorded));
    setQuestionStart(Date.now());
  }, [question.id, recorded]);

  const playable = isPlayable(question);
  const canCheck = !locked && playable && value !== null && value.length > 0 && value[0] !== "";
  const isLast = index >= total - 1;

  const commit = useCallback(
    (skipped: boolean) => {
      record({
        questionId: question.id,
        value: skipped ? null : value,
        correct: skipped ? false : isCorrect(question, value),
        skipped,
        elapsedMs: Date.now() - questionStart,
      });
      setLocked(true);
    },
    [question, record, value, questionStart],
  );

  const advance = useCallback(() => {
    if (isLast) {
      finish();
      onFinish();
      return;
    }
    // Clear local selection before the next question renders so reused option IDs
    // (e.g. "a", "b") never appear selected on the following question.
    setValue(null);
    setLocked(false);
    next();
  }, [finish, isLast, next, onFinish]);

  // 1-9 pick an option, Enter checks or advances.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        if (event.key === "Enter" && canCheck) commit(false);
        return;
      }
      if (event.key === "Enter") {
        if (locked) advance();
        else if (canCheck) commit(false);
        return;
      }
      if (locked || !/^[1-9]$/.test(event.key)) return;
      const slot = Number(event.key) - 1;
      const options =
        question.type === "single" || question.type === "multiple" || question.type === "image"
          ? question.options.map((o) => o.id)
          : question.type === "boolean"
            ? ["true", "false"]
            : [];
      const picked = options[slot];
      if (!picked) return;
      event.preventDefault();
      setValue((current) =>
        question.type === "multiple"
          ? (current ?? []).includes(picked)
            ? (current ?? []).filter((x) => x !== picked)
            : [...(current ?? []), picked]
          : [picked],
      );
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, canCheck, commit, locked, question]);

  const feedback = useMemo(() => {
    if (!locked) return null;
    if (recorded?.skipped) return { tone: "skipped" as const, title: "Skipped" };
    return isCorrect(question, value)
      ? { tone: "correct" as const, title: "Correct" }
      : { tone: "wrong" as const, title: "Not quite" };
  }, [locked, question, recorded?.skipped, value]);

  return (
    <QuizLayout
      width="wide"
      header={
        <QuizHeader
          title={set.title}
          modeLabel={MODE_LABEL[mode]}
          index={index}
          total={total}
          startedAt={startedAt}
          onExit={() => setExitOpen(true)}
        />
      }
    >
      <div className={cn("pt-6", sidebar && "grid gap-6 lg:grid-cols-[1fr_18rem]")}>
        <div>
          <QuestionRenderer
            key={question.id}
            question={question}
            value={value}
            locked={locked}
            onSelect={(nextValue) => {
              if (!locked) setValue(nextValue);
            }}
          />

          {feedback ? (
            <div
              aria-live="polite"
              className={cn(
                "mt-4 rounded-2xl border p-4",
                feedback.tone === "correct" &&
                  "border-[oklch(0.72_0.13_150/0.5)] bg-[oklch(0.72_0.13_150/0.1)]",
                feedback.tone === "wrong" &&
                  "border-[oklch(0.66_0.18_20/0.5)] bg-[oklch(0.66_0.18_20/0.1)]",
                feedback.tone === "skipped" && "border-bronze/20 bg-[oklch(0.185_0.008_62)]",
              )}
            >
              <p className="text-[0.85rem] font-semibold text-foreground">{feedback.title}</p>
              <p className="mt-1 text-[0.8rem] text-foreground/60">
                Answer:{" "}
                <span className="text-bronze-glow">{correctLabels(question).join(", ")}</span>
              </p>
              {question.explanation ? (
                <p className="mt-2 text-[0.8rem] leading-relaxed text-foreground/55">
                  {question.explanation}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <GeoButton
              variant="dark"
              size="md"
              onClick={previous}
              disabled={index === 0}
              aria-label="Previous question"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              Back
            </GeoButton>

            {!locked ? (
              <>
                <GeoButton
                  variant="solid"
                  size="md"
                  onClick={() => commit(false)}
                  disabled={!canCheck}
                >
                  <Check className="h-4 w-4" strokeWidth={2.1} aria-hidden />
                  Check answer
                </GeoButton>
                <GeoButton variant="ghost" size="md" onClick={() => commit(true)}>
                  <SkipForward className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                  Skip
                </GeoButton>
              </>
            ) : (
              <GeoButton variant="solid" size="md" onClick={advance}>
                {isLast ? (
                  <>
                    <Flag className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Finish quiz
                  </>
                ) : (
                  <>
                    Next question
                    <ArrowRight className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                  </>
                )}
              </GeoButton>
            )}

            <p className="ml-auto hidden text-[0.72rem] text-foreground/50 sm:block">
              Keys 1–9 select · Enter confirms
            </p>
          </div>
        </div>

        {sidebar ? <aside className="space-y-4">{sidebar}</aside> : null}
      </div>

      <ExitDialog open={exitOpen} onOpenChange={setExitOpen} onConfirm={onExit} />
    </QuizLayout>
  );
}
