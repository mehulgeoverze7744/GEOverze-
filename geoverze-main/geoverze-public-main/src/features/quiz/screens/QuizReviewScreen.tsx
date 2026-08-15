import { Link, useSearch } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";

import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";
import { useQuizStore } from "@/stores/quizStore";
import { QuizLayout } from "../components/QuizLayout";
import { ReviewCard } from "../components/ReviewCard";
import { useQuizSet } from "../hooks/useQuizSet";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "wrong", label: "Missed" },
  { id: "correct", label: "Correct" },
  { id: "skipped", label: "Skipped" },
] as const;

/** Route screen for /play/quiz/review — question-by-question breakdown. */
export function QuizReviewScreen() {
  const { quiz } = useSearch({ from: "/play/quiz/review" });
  const answers = useQuizStore((s) => s.answers);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const { set, loading, error } = useQuizSet(quiz);
  const hasRun = Object.keys(answers).length > 0;

  const rows = useMemo(
    () =>
      set
        ? set.questions
            .map((question, i) => ({ question, answer: answers[question.id], number: i + 1 }))
            .filter(({ answer }) => {
              if (filter === "all") return true;
              if (filter === "skipped") return !answer || answer.skipped;
              if (filter === "correct") return Boolean(answer?.correct);
              return Boolean(answer) && !answer!.skipped && !answer!.correct;
            })
        : [],
    [answers, filter, set],
  );

  if (loading) {
    return (
      <QuizLayout width="default" className="pt-10">
        <div className="flex items-center justify-center py-16">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent text-bronze"
            aria-label="Loading…"
          />
        </div>
      </QuizLayout>
    );
  }

  if (error || !set) {
    return (
      <QuizLayout width="default" className="pt-10">
        <div className="game-surface rounded-2xl p-6 text-center">
          <p className="text-[0.9rem] text-foreground/60">
            {error ?? "Could not load quiz. Please try again."}
          </p>
          <GeoButton variant="dark" size="md" asChild className="mt-4">
            <Link to="/play">Back to hub</Link>
          </GeoButton>
        </div>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout width="default" className="pt-10">
      <GeoButton variant="ghost" size="sm" asChild>
        <Link to="/play/quiz/result" search={{ quiz: set.id }}>
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Back to result
        </Link>
      </GeoButton>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
        Review — {set.title}
      </h1>
      <p className="mt-2 text-[0.88rem] text-foreground/55">
        {hasRun
          ? "Every question with your answer, the correct answer and the explanation."
          : "This run has ended. Play the set again to review your answers."}
      </p>

      {hasRun ? (
        <>
          <div
            className="mt-5 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter reviewed questions"
          >
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "min-h-11 rounded-xl border px-4 text-[0.78rem] font-medium transition-all motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 active:scale-[0.97]",
                  filter === option.id
                    ? "border-bronze bg-bronze/18 text-bronze-glow"
                    : "border-bronze/14 bg-[oklch(0.185_0.008_62)] text-foreground/65 hover:border-bronze/45",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {rows.length === 0 ? (
              <p className="game-surface rounded-2xl p-6 text-center text-[0.85rem] text-foreground/50">
                Nothing in this group.
              </p>
            ) : (
              rows.map(({ question, answer, number }) => (
                <ReviewCard key={question.id} question={question} answer={answer} number={number} />
              ))
            )}
          </div>
        </>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <GeoButton variant="solid" size="md" asChild>
            <Link to="/play/quiz" search={{ quiz: set.id }}>
              Open lobby
            </Link>
          </GeoButton>
          <GeoButton variant="dark" size="md" asChild>
            <Link to="/play">Back to hub</Link>
          </GeoButton>
        </div>
      )}
    </QuizLayout>
  );
}
