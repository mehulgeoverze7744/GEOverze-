import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, ImageIcon, MapPin, XCircle } from "lucide-react";

import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { QuestionRecord } from "@/features/questions/types";
import { cn } from "@/lib/utils";

export interface QuizPlayerPreviewProps {
  questions: QuestionRecord[];
  /** Shown above the player, e.g. the quiz title. */
  heading?: string | undefined;
  className?: string | undefined;
}

/**
 * Interactive player-style preview. Pure UI — no scoring is persisted.
 * Used by the quiz builder, the quiz detail page and the question bank.
 */
export function QuizPlayerPreview({ questions, heading, className }: QuizPlayerPreviewProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [questions]);

  useEffect(() => {
    setSelected(null);
    setTyped("");
    setRevealed(false);
  }, [index, questions]);

  if (questions.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border bg-card", className)}>
        <EmptyState
          title="Nothing to preview yet"
          description="Add questions to this quiz to see the player experience."
        />
      </div>
    );
  }

  const question = questions[Math.min(index, questions.length - 1)] as QuestionRecord;
  const total = questions.length;
  const hasOptions = question.options.length > 0;
  const correctOption = question.options.find((option) => option.correct);
  const answered = hasOptions ? selected !== null : typed.trim().length > 0;
  const isCorrect = hasOptions
    ? selected === correctOption?.id
    : typed.trim().toLowerCase() === question.answerText.trim().toLowerCase();

  return (
    <section
      className={cn("rounded-lg border border-border bg-card p-4", className)}
      aria-label="Quiz preview"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {heading ?? "Player preview"}
          </p>
          <p className="text-xs tabular text-muted-foreground">
            Question {index + 1} of {total} · {question.type}
          </p>
        </div>
        <DifficultyBadge level={question.difficulty} />
      </div>

      <Progress value={((index + 1) / total) * 100} className="mt-3 h-1.5" />

      {question.requiresMedia && (
        <div className="mt-4 flex h-32 items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
          {question.type === "Map Based" ? (
            <MapPin className="size-4" aria-hidden="true" />
          ) : (
            <ImageIcon className="size-4" aria-hidden="true" />
          )}
          {question.mediaLabel || "Media placeholder"}
        </div>
      )}

      <h3 className="mt-4 text-base font-medium text-foreground">{question.prompt}</h3>

      {hasOptions ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => {
            const chosen = selected === option.id;
            const showState = revealed && (option.correct || chosen);
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setSelected(option.id)}
                  aria-pressed={chosen}
                  className={cn(
                    "focus-visible:ring-ring/50 flex w-full items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:outline-none",
                    chosen && "border-primary/50 bg-primary/5",
                    showState &&
                      (option.correct
                        ? "border-success/50 bg-success/10"
                        : "border-destructive/50 bg-destructive/10"),
                  )}
                >
                  <span>{option.text}</span>
                  {showState &&
                    (option.correct ? (
                      <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                    ) : (
                      <XCircle className="size-4 text-destructive" aria-hidden="true" />
                    ))}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3">
          <label htmlFor="preview-answer" className="sr-only">
            Your answer
          </label>
          <Input
            id="preview-answer"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder="Type your answer…"
          />
        </div>
      )}

      {revealed && (
        <div
          className={cn(
            "mt-3 rounded-md border px-3 py-2 text-sm",
            isCorrect
              ? "border-success/40 bg-success/10 text-success"
              : "border-warning/40 bg-warning/10 text-warning",
          )}
          role="status"
        >
          <p className="font-medium">{isCorrect ? "Correct" : "Not quite"}</p>
          <p className="mt-0.5 text-foreground">
            Answer: {correctOption?.text ?? question.answerText ?? "—"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{question.explanation}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <Button size="sm" disabled={!answered || revealed} onClick={() => setRevealed(true)}>
          Check answer
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={index >= total - 1}
          onClick={() => setIndex((prev) => Math.min(total - 1, prev + 1))}
          className="ml-auto"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
