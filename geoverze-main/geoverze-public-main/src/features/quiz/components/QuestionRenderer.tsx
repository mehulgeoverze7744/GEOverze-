import { lazy, Suspense } from "react";

import { SkeletonBlock } from "@/components/shared";
import { QUESTION_TYPE_LABEL, type QuizQuestion } from "../data/types";
import { MultipleChoiceQuestion } from "./questions/MultipleChoiceQuestion";
import { PlaceholderQuestion } from "./questions/PlaceholderQuestion";
import { SingleChoiceQuestion } from "./questions/SingleChoiceQuestion";
import { TrueFalseQuestion } from "./questions/TrueFalseQuestion";
import { TypeAnswerQuestion } from "./questions/TypeAnswerQuestion";
import { QuestionMediaView } from "./QuestionMediaView";
import type { QuestionViewProps } from "./questionView";

/** Heavier renderers load only when a question needs them. */
const ImageSelectQuestion = lazy(() =>
  import("./questions/ImageSelectQuestion").then((m) => ({ default: m.ImageSelectQuestion })),
);
const MapSelectQuestion = lazy(() =>
  import("./questions/MapSelectQuestion").then((m) => ({ default: m.MapSelectQuestion })),
);

/**
 * The single switch in the engine.
 *
 * Screens hand a question here and never care what subject or format it is.
 * A new quiz type = one new variant in `data/types.ts` plus one case below.
 */
export function QuestionRenderer({ question, value, locked, onSelect }: QuestionViewProps) {
  return (
    <div className="game-surface rounded-2xl p-5 sm:p-7">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-bronze/90">
        {QUESTION_TYPE_LABEL[question.type]}
      </p>
      <h1 className="mt-3 text-[1.35rem] font-semibold leading-snug tracking-tight text-foreground sm:text-[1.6rem]">
        {question.prompt}
      </h1>

      {question.media ? (
        <div className="mt-5">
          <QuestionMediaView media={question.media} />
        </div>
      ) : null}

      <div className="mt-6">
        <Suspense fallback={<SkeletonBlock className="h-40 w-full rounded-2xl" />}>
          {question.type === "single" ? (
            <SingleChoiceQuestion
              question={question}
              value={value}
              locked={locked}
              onSelect={onSelect}
            />
          ) : question.type === "multiple" ? (
            <MultipleChoiceQuestion
              question={question}
              value={value}
              locked={locked}
              onSelect={onSelect}
            />
          ) : question.type === "boolean" ? (
            <TrueFalseQuestion
              question={question}
              value={value}
              locked={locked}
              onSelect={onSelect}
            />
          ) : question.type === "image" ? (
            <ImageSelectQuestion
              question={question}
              value={value}
              locked={locked}
              onSelect={onSelect}
            />
          ) : question.type === "map" ? (
            <MapSelectQuestion
              question={question}
              value={value}
              locked={locked}
              onSelect={onSelect}
            />
          ) : question.type === "typed" ? (
            <TypeAnswerQuestion
              question={question}
              value={value}
              locked={locked}
              onSelect={onSelect}
            />
          ) : (
            <PlaceholderQuestion question={question} />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export type { QuizQuestion };
