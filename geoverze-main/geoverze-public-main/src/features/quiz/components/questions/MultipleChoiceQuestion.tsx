import { AnswerCard } from "../AnswerCard";
import { choiceShortcut, optionState, type QuestionViewProps } from "../questionView";
import type { QuizQuestion } from "../../data/types";

type Q = Extract<QuizQuestion, { type: "multiple" }>;

/** Several correct answers — the player confirms the set before it is graded. */
export function MultipleChoiceQuestion({
  question,
  value,
  locked,
  onSelect,
}: QuestionViewProps<Q>) {
  const picked = value ?? [];

  const toggle = (id: string) =>
    onSelect(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);

  return (
    <div>
      <p className="mb-3 text-[0.75rem] uppercase tracking-[0.18em] text-bronze/90">
        Select all that apply
      </p>
      <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Answer options">
        {question.options.map((option, i) => (
          <AnswerCard
            key={option.id}
            label={option.label}
            shortcut={choiceShortcut(i)}
            disabled={locked}
            state={optionState({ id: option.id, value, locked, correctIds: question.answerIds })}
            onClick={() => toggle(option.id)}
          />
        ))}
      </div>
      {!locked ? (
        <p className="mt-3 text-[0.75rem] text-foreground/50">
          {picked.length === 0
            ? "Nothing selected yet."
            : `${picked.length} selected — check your answer when you're ready.`}
        </p>
      ) : null}
    </div>
  );
}
