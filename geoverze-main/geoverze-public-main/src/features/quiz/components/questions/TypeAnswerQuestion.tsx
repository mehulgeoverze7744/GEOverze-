import { Check, CornerDownLeft, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { isCorrect } from "../../lib/session";
import type { QuizQuestion } from "../../data/types";
import type { QuestionViewProps } from "../questionView";

type Q = Extract<QuizQuestion, { type: "typed" }>;

/** Free-text answer with forgiving matching (case, spacing, punctuation). */
export function TypeAnswerQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  const ref = useRef<HTMLInputElement>(null);
  const text = value?.[0] ?? "";
  const graded = locked ? isCorrect(question, value) : null;

  useEffect(() => {
    if (!locked) ref.current?.focus();
  }, [locked, question.id]);

  return (
    <div>
      <label htmlFor={`typed-${question.id}`} className="sr-only">
        Your answer
      </label>
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors motion-snap",
          graded === true
            ? "border-[oklch(0.72_0.13_150/0.7)] bg-[oklch(0.72_0.13_150/0.14)]"
            : graded === false
              ? "border-[oklch(0.66_0.18_20/0.7)] bg-[oklch(0.66_0.18_20/0.14)]"
              : "border-bronze/20 bg-[oklch(0.185_0.008_62)] focus-within:border-bronze/60",
        )}
      >
        <input
          id={`typed-${question.id}`}
          ref={ref}
          type="text"
          value={text}
          disabled={locked}
          autoComplete="off"
          placeholder={question.placeholder ?? "Type your answer"}
          onChange={(e) => onSelect([e.target.value])}
          className="min-h-11 w-full bg-transparent text-[1rem] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-80"
        />
        {graded === true ? (
          <Check className="h-5 w-5 shrink-0 text-[oklch(0.86_0.12_150)]" aria-hidden />
        ) : graded === false ? (
          <X className="h-5 w-5 shrink-0 text-[oklch(0.84_0.15_25)]" aria-hidden />
        ) : (
          <CornerDownLeft className="h-4 w-4 shrink-0 text-foreground/50" aria-hidden />
        )}
      </div>
      {!locked ? (
        <p className="mt-2 text-[0.75rem] text-foreground/50">
          Spelling is forgiving — press Enter or use Check answer to submit.
        </p>
      ) : null}
    </div>
  );
}
