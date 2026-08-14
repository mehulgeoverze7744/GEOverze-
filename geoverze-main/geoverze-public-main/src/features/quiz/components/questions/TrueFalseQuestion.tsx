import { AnswerCard } from "../AnswerCard";
import { optionState, type QuestionViewProps } from "../questionView";
import type { QuizQuestion } from "../../data/types";

type Q = Extract<QuizQuestion, { type: "boolean" }>;

/** True / false. Two large targets, graded instantly. */
export function TrueFalseQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  const correctIds = [String(question.answer)];

  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="True or false">
      {(["true", "false"] as const).map((id, i) => (
        <AnswerCard
          key={id}
          label={id === "true" ? "True" : "False"}
          shortcut={String(i + 1)}
          disabled={locked}
          state={optionState({ id, value, locked, correctIds })}
          onClick={() => onSelect([id])}
        />
      ))}
    </div>
  );
}
