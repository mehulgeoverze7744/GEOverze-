import { AnswerCard } from "../AnswerCard";
import { FlagTile } from "../QuizImage";
import { choiceShortcut, optionState, type QuestionViewProps } from "../questionView";
import type { QuizQuestion } from "../../data/types";

type Q = Extract<QuizQuestion, { type: "image" }>;

/** Pick the right picture — real flags when a glyph, ISO or country label is present. */
export function ImageSelectQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="group" aria-label="Image options">
      {question.options.map((option, i) => (
        <AnswerCard
          key={option.id}
          layout="tile"
          label=""
          ariaLabel={`Flag option ${i + 1}`}
          shortcut={choiceShortcut(i)}
          disabled={locked}
          state={optionState({ id: option.id, value, locked, correctIds: [question.answerId] })}
          onClick={() => onSelect([option.id])}
          media={
            <FlagTile glyph={option.glyph} art={option.art} label={option.label} />
          }
        />
      ))}
    </div>
  );
}
