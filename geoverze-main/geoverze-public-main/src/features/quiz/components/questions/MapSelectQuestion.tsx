import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { coverArt, patternLayer, patternSize } from "@/features/play/lib/coverArt";
import type { QuizQuestion } from "../../data/types";
import type { QuestionViewProps } from "../questionView";

type Q = Extract<QuizQuestion, { type: "map" }>;

/**
 * Map selection: pin one of several hotspots on a stylised board.
 *
 * The board is procedural, so no map tiles are loaded. Every pin is a real
 * button, so the whole question is keyboard and screen-reader navigable.
 */
export function MapSelectQuestion({ question, value, locked, onSelect }: QuestionViewProps<Q>) {
  const cover = coverArt(question.boardArt);
  const selected = value?.[0];

  return (
    <div>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-bronze/15"
        style={{ backgroundImage: `linear-gradient(150deg, ${cover.from}, ${cover.to})` }}
      >
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: patternLayer(cover.pattern),
            backgroundSize: patternSize(cover.pattern),
          }}
        />
        <div className="absolute inset-0" role="group" aria-label="Map locations">
          {question.regions.map((region) => {
            const isSelected = selected === region.id;
            const isAnswer = region.id === question.answerId;
            const tone = !locked
              ? isSelected
                ? "border-bronze bg-bronze/40 text-bronze-glow"
                : "border-bronze/40 bg-[oklch(0.12_0.006_60/0.75)] text-foreground/70 hover:border-bronze hover:bg-bronze/25"
              : isAnswer
                ? "border-[oklch(0.72_0.13_150/0.85)] bg-[oklch(0.72_0.13_150/0.35)] text-[oklch(0.92_0.1_150)]"
                : isSelected
                  ? "border-[oklch(0.66_0.18_20/0.85)] bg-[oklch(0.66_0.18_20/0.32)] text-[oklch(0.88_0.14_25)]"
                  : "border-bronze/20 bg-[oklch(0.12_0.006_60/0.6)] text-foreground/50";

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
                  "absolute inline-flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-all motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/70 active:scale-95",
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
                ? "border-[oklch(0.72_0.13_150/0.6)] text-[oklch(0.86_0.12_150)]"
                : selected === region.id
                  ? "border-bronze/60 text-bronze-glow"
                  : "border-bronze/12 text-foreground/50",
            )}
          >
            {region.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
