import { AnswerCard } from "../AnswerCard";
import { ProceduralPlate } from "../QuestionMediaView";
import { choiceShortcut, optionState, type QuestionViewProps } from "../questionView";
import type { QuizQuestion } from "../../data/types";

type Q = Extract<QuizQuestion, { type: "image" }>;

/** Pick the right picture. Tiles carry procedural art or a flag glyph. */
export function ImageSelectQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="group" aria-label="Image options">
      {question.options.map((option, i) => (
        <AnswerCard
          key={option.id}
          layout="tile"
          label={option.label}
          shortcut={choiceShortcut(i)}
          disabled={locked}
          state={optionState({ id: option.id, value, locked, correctIds: [question.answerId] })}
          onClick={() => onSelect([option.id])}
          media={
            option.glyph ? (
              <span
                className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-bronze/15 bg-[oklch(0.13_0.006_60)] text-[2.6rem] leading-none"
                role="img"
                aria-label={`Flag option ${i + 1}`}
              >
                {option.glyph}
              </span>
            ) : (
              <ProceduralPlate art={option.art ?? option.id} className="aspect-[4/3] rounded-xl" />
            )
          }
        />
      ))}
    </div>
  );
}
