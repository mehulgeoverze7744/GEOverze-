import { AnswerCard } from "../AnswerCard";
import { choiceShortcut, optionState, type QuestionViewProps } from "../questionView";
import type { QuizQuestion } from "../../data/types";

type Q = Extract<QuizQuestion, { type: "single" }>;

/** One correct answer out of several. Locks and grades on the first tap. */
export function SingleChoiceQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Answer options">
      {question.options.map((option, i) => (
        <AnswerCard
          key={option.id}
          label={option.label}
          shortcut={choiceShortcut(i)}
          disabled={locked}
          state={optionState({
            id: option.id,
            value,
            locked,
            correctIds: [question.answerId],
          })}
          onClick={() => onSelect([option.id])}
        />
      ))}
    </div>
  );
}
