import { Check, MinusCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { MetaChip } from "@/features/play/components/Badges";
import { QUESTION_TYPE_LABEL, type QuizQuestion } from "../data/types";
import { correctLabels, labelsFor } from "../lib/session";
import type { RunAnswer } from "@/stores/quizStore";

/** One reviewed question: what was asked, what you said, what was right. */
export function ReviewCard({
  question,
  answer,
  number,
}: {
  question: QuizQuestion;
  answer: RunAnswer | undefined;
  number: number;
}) {
  const state = !answer || answer.skipped ? "skipped" : answer.correct ? "correct" : "wrong";
  const Icon = state === "correct" ? Check : state === "wrong" ? X : MinusCircle;
  const yours = answer && !answer.skipped ? labelsFor(question, answer.value) : [];

  return (
    <article
      className={cn(
        "game-surface rounded-2xl border-l-2 p-5",
        state === "correct" && "border-l-[oklch(0.72_0.13_150/0.8)]",
        state === "wrong" && "border-l-[oklch(0.66_0.18_20/0.8)]",
        state === "skipped" && "border-l-bronze/40",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            state === "correct" &&
              "border-[oklch(0.72_0.13_150/0.5)] bg-[oklch(0.72_0.13_150/0.14)] text-[oklch(0.86_0.12_150)]",
            state === "wrong" &&
              "border-[oklch(0.66_0.18_20/0.5)] bg-[oklch(0.66_0.18_20/0.14)] text-[oklch(0.84_0.15_25)]",
            state === "skipped" && "border-bronze/25 bg-bronze/10 text-bronze-glow",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              Q{number}
            </span>
            <MetaChip>{QUESTION_TYPE_LABEL[question.type]}</MetaChip>
          </div>
          <h3 className="mt-2 text-[0.95rem] font-semibold leading-snug text-foreground">
            {question.prompt}
          </h3>

          <dl className="mt-3 grid gap-2 text-[0.82rem] sm:grid-cols-2">
            <div>
              <dt className="text-foreground/50">Your answer</dt>
              <dd
                className={cn(
                  "mt-0.5 font-medium",
                  state === "correct" ? "text-[oklch(0.86_0.12_150)]" : "text-foreground/70",
                )}
              >
                {yours.length > 0 ? yours.join(", ") : "No answer"}
              </dd>
            </div>
            <div>
              <dt className="text-foreground/50">Correct answer</dt>
              <dd className="mt-0.5 font-medium text-bronze-glow">
                {correctLabels(question).join(", ")}
              </dd>
            </div>
          </dl>

          {question.explanation ? (
            <p className="mt-3 text-[0.82rem] leading-relaxed text-foreground/55">
              {question.explanation}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
