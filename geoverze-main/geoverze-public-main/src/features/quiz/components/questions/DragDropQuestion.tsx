import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { QuizQuestion } from "../../data/types";
import type { QuestionViewProps } from "../questionView";

type Q = Extract<QuizQuestion, { type: "dragdrop" }>;

function shuffle<T>(items: T[], salt: string): T[] {
  const copy = [...items];
  let seed = 7;
  for (let i = 0; i < salt.length; i += 1) seed = (seed * 33 + salt.charCodeAt(i)) >>> 0;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const current = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = current;
  }
  return copy;
}

/**
 * Match each item to a target. Tap a chip, then a slot — works on touch
 * without HTML5 drag-and-drop.
 */
export function DragDropQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  const [held, setHeld] = useState<string | null>(null);
  const targetOrder = useMemo(
    () => shuffle(question.targets, `${question.id}:t`),
    [question.id, question.targets],
  );

  const assigned = value && value.length === question.items.length ? value : question.items.map(() => "");

  const unused = question.items.filter((item) => !assigned.includes(item));

  const place = (target: string) => {
    if (locked) return;
    const targetIndex = question.targets.indexOf(target);
    if (targetIndex < 0) return;
    const next = [...assigned];
    if (held) {
      const previousIndex = next.indexOf(held);
      if (previousIndex >= 0) next[previousIndex] = "";
      next[targetIndex] = held;
      setHeld(null);
      onSelect(next);
      return;
    }
    next[targetIndex] = "";
    onSelect(next);
  };

  const pick = (item: string) => {
    if (locked) return;
    setHeld((current) => (current === item ? null : item));
  };

  return (
    <div>
      <p className="mb-3 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-[#2b74c4]">
        Match each item to its place
      </p>

      {!locked && unused.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Unplaced items">
          {unused.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => pick(item)}
              aria-pressed={held === item}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.88rem] font-medium",
                held === item
                  ? "border-[#2b74c4] bg-[#2b74c4]/10 text-[#1e4d86]"
                  : "border-[#E2E8F0] bg-white text-[#111827]",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {targetOrder.map((target) => {
          const targetIndex = question.targets.indexOf(target);
          const placed = assigned[targetIndex] ?? "";
          const expected = question.items[targetIndex] ?? "";
          const correct = locked && placed === expected;
          const wrong = locked && placed !== expected;
          return (
            <li key={target}>
              <button
                type="button"
                disabled={locked}
                onClick={() => (placed && !held ? pick(placed) : place(target))}
                className={cn(
                  "flex w-full min-h-[3.5rem] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left",
                  !locked && "border-[#E2E8F0] bg-[#F8FAFC]",
                  correct && "border-emerald-300 bg-emerald-50",
                  wrong && "border-rose-200 bg-rose-50",
                )}
              >
                <span className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                  {target}
                </span>
                <span
                  className={cn(
                    "min-w-[8rem] rounded-full border px-3 py-1.5 text-center text-[0.9rem] font-medium",
                    placed
                      ? "border-[#2b74c4]/30 bg-white text-[#111827]"
                      : "border-dashed border-[#CBD5E1] text-[#94A3B8]",
                  )}
                >
                  {placed || (held ? "Drop here" : "Tap to place")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
