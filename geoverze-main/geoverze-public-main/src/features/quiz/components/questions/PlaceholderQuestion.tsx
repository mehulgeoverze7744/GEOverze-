import { Construction } from "lucide-react";

import { QUESTION_TYPE_LABEL, type QuizQuestion } from "../../data/types";

type Q = Extract<QuizQuestion, { type: "order" | "dragdrop" }>;

/**
 * Reserved question types.
 *
 * The type is registered in the model so content can be authored now; the
 * interaction ships with the sequencing / drag-and-drop engine. Skipping is the
 * only action, so a run never blocks.
 */
export function PlaceholderQuestion({ question }: { question: Q }) {
  const items =
    question.type === "order" ? question.items : [...question.items, ...question.targets];

  return (
    <div className="game-surface-raised rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bronze/30 bg-bronze/10 text-bronze-glow">
          <Construction className="h-5 w-5" strokeWidth={1.7} aria-hidden />
        </span>
        <div>
          <p className="text-[0.85rem] font-semibold text-foreground/85">
            {QUESTION_TYPE_LABEL[question.type]} — coming soon
          </p>
          <p className="text-[0.75rem] text-foreground/50">
            This question type is reserved. Skip ahead; it counts as unanswered.
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-bronze/12 bg-[oklch(0.16_0.006_60)] px-3 py-2 text-[0.78rem] text-foreground/50"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
