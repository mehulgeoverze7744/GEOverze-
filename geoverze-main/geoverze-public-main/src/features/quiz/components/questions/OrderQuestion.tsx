import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { useEffect, useMemo } from "react";

import { cn } from "@/lib/utils";
import type { QuizQuestion } from "../../data/types";
import type { QuestionViewProps } from "../questionView";

type Q = Extract<QuizQuestion, { type: "order" }>;

function shuffle<T>(items: T[], salt: string): T[] {
  const copy = [...items];
  let seed = 0;
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
 * Chronological / ranked order. Cards start shuffled; the stored answer is the
 * original `items` sequence. Players tap Move up / Move down — no drag required.
 */
export function OrderQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  const initial = useMemo(() => {
    const shuffled = shuffle(question.items, question.id);
    const same = shuffled.every((item, index) => item === question.items[index]);
    return same ? [...shuffled].reverse() : shuffled;
  }, [question.id, question.items]);

  const order = value && value.length === question.items.length ? value : initial;

  useEffect(() => {
    if (!locked && (value == null || value.length === 0)) {
      onSelect(initial);
    }
    // Seed the shuffled order once per question. Parent onSelect is not stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, locked]);

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= order.length) return;
    const copy = [...order];
    const current = copy[index]!;
    copy[index] = copy[next]!;
    copy[next] = current;
    onSelect(copy);
  };

  return (
    <div>
      <p className="mb-3 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-[#2b74c4]">
        Oldest to newest — rearrange the timeline
      </p>
      <ol className="flex flex-col gap-2" aria-label="Timeline order">
        {order.map((item, index) => {
          const correctSpot = locked && item === question.items[index];
          const wrongSpot = locked && item !== question.items[index];
          return (
            <li
              key={`${item}-${index}`}
              className={cn(
                "flex items-center gap-3 rounded-2xl border bg-white px-3 py-3",
                !locked && "border-[#E2E8F0]",
                correctSpot && "border-emerald-300 bg-emerald-50",
                wrongSpot && "border-rose-200 bg-rose-50",
              )}
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[0.78rem] font-semibold text-[#334155]">
                {index + 1}
              </span>
              <GripVertical className="hidden h-4 w-4 shrink-0 text-[#CBD5E1] sm:block" aria-hidden />
              <span className="flex-1 text-[0.95rem] font-medium leading-snug text-[#111827]">{item}</span>
              {!locked ? (
                <span className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${item} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#334155] disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${item} down`}
                    disabled={index === order.length - 1}
                    onClick={() => move(index, 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#334155] disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
