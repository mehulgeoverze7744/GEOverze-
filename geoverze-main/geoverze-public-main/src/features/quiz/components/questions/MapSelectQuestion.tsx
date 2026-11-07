import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { mapBoardSrc } from "../../lib/mapBoards";
import type { QuizQuestion } from "../../data/types";
import type { QuestionViewProps } from "../questionView";

type Q = Extract<QuizQuestion, { type: "map" }>;

/**
 * Map selection: pin one of several hotspots on a real regional map.
 */
export function MapSelectQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  const selected = value?.[0];
  const src = mapBoardSrc(question.boardArt);

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#e8eef5]">
        <img
          src={src}
          alt="Map board"
          className="absolute inset-0 h-full w-full object-contain p-2"
          draggable={false}
        />
        <div className="absolute inset-0" role="group" aria-label="Map locations">
          {question.regions.map((region) => {
            const isSelected = selected === region.id;
            const isAnswer = region.id === question.answerId;
            const tone = !locked
              ? isSelected
                ? "border-[#2b74c4] bg-[#2b74c4] text-white"
                : "border-white bg-white/90 text-[#1e4d86] hover:bg-[#2b74c4] hover:text-white"
              : isAnswer
                ? "border-emerald-600 bg-emerald-500 text-white"
                : isSelected
                  ? "border-rose-600 bg-rose-500 text-white"
                  : "border-white/70 bg-white/70 text-[#64748B]";

            return (
              <button
                key={region.id}
                type="button"
                disabled={locked}
                onClick={() => onSelect([region.id])}
                aria-label={region.label}
                aria-pressed={isSelected}
                style={{ left: `${region.x}%`, top: `${region.y}%` }}
                className={cn(
                  "absolute inline-flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-md transition-all motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b74c4]/70 active:scale-95",
                  tone,
                )}
              >
                <MapPin className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {question.regions.map((region) => (
          <li
            key={region.id}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[0.72rem] font-medium",
              locked && region.id === question.answerId
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : selected === region.id
                  ? "border-[#2b74c4] bg-[#2b74c4]/10 text-[#1e4d86]"
                  : "border-[#E2E8F0] text-[#64748B]",
            )}
          >
            {region.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
