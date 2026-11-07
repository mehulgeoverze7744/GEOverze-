import { lazy, Suspense } from "react";

import { SkeletonBlock } from "@/components/shared";
import { QUESTION_TYPE_LABEL, type QuizQuestion } from "../data/types";
import { MultipleChoiceQuestion } from "./questions/MultipleChoiceQuestion";
import { SingleChoiceQuestion } from "./questions/SingleChoiceQuestion";
import { TrueFalseQuestion } from "./questions/TrueFalseQuestion";
import { TypeAnswerQuestion } from "./questions/TypeAnswerQuestion";
import { QuestionMediaView } from "./QuestionMediaView";
import type { QuestionViewProps } from "./questionView";

const ImageSelectQuestion = lazy(() =>
  import("./questions/ImageSelectQuestion").then((m) => ({ default: m.ImageSelectQuestion })),
);
const MapSelectQuestion = lazy(() =>
  import("./questions/MapSelectQuestion").then((m) => ({ default: m.MapSelectQuestion })),
);
const OrderQuestion = lazy(() =>
  import("./questions/OrderQuestion").then((m) => ({ default: m.OrderQuestion })),
);
const DragDropQuestion = lazy(() =>
  import("./questions/DragDropQuestion").then((m) => ({ default: m.DragDropQuestion })),
);

/**
 * The single switch in the engine.
 *
 * Screens hand a question here and never care what subject or format it is.
 */
export function QuestionRenderer({ question, value, locked, onSelect }: QuestionViewProps) {
  return (
    <div className="rounded-[1.75rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_40px_-28px_rgb(15_23_42_/_0.45)] sm:p-8">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2b74c4]">
        {QUESTION_TYPE_LABEL[question.type]}
      </p>
      <h1 className="mt-3 text-[1.4rem] font-semibold leading-snug tracking-tight text-[#111827] sm:text-[1.75rem]">
        {question.prompt}
      </h1>

      {question.media ? (
        <div className="mt-6">
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
          ) : question.type === "order" ? (
            <OrderQuestion question={question} value={value} locked={locked} onSelect={onSelect} />
          ) : (
            <DragDropQuestion question={question} value={value} locked={locked} onSelect={onSelect} />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export type { QuizQuestion };
