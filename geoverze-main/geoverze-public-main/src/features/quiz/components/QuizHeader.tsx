import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";
import { Timer } from "./Timer";

const exitButtonClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-bronze/20 bg-[oklch(0.185_0.008_62)] text-foreground/70 transition-colors motion-snap hover:border-bronze/50 hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50";

/** Sticky top bar for the play screen: progress, position, clock and exit. */
export function QuizHeader({
  title,
  index,
  total,
  startedAt,
  onExit,
  modeLabel,
  className,
}: {
  title: string;
  index: number;
  total: number;
  startedAt: number | null;
  onExit: () => void;
  modeLabel?: string;
  className?: string;
}) {
  const questionLabel = (
    <>
      Question {Math.min(index + 1, total)}{" "}
      <span className="text-foreground/50">of {total}</span>
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-[var(--nav-height)] z-30 border-b border-bronze/12 bg-[oklch(0.09_0.005_60/0.94)] backdrop-blur-sm",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-3 sm:px-6 md:px-10">
        {/* Narrow viewports: two-row layout so progress, timer, and exit never compete. */}
        <div className="flex flex-col gap-2 md:hidden">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="min-w-0 truncate text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-bronze/90">
              {modeLabel ? `${modeLabel} · ` : ""}
              {title}
            </p>
            <button type="button" onClick={onExit} aria-label="Exit quiz" className={exitButtonClass}>
              <X className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden />
            </button>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="shrink-0 text-[0.8rem] font-semibold text-foreground">{questionLabel}</p>
            <Timer startedAt={startedAt} className="shrink-0" />
          </div>
        </div>

        {/* Tablet/desktop: single premium row when width allows. */}
        <div className="hidden min-w-0 items-center gap-3 md:flex">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-bronze/90">
              {modeLabel ? `${modeLabel} · ` : ""}
              {title}
            </p>
            <p className="mt-0.5 text-[0.8rem] font-semibold text-foreground">{questionLabel}</p>
          </div>
          <Timer startedAt={startedAt} className="shrink-0" />
          <button type="button" onClick={onExit} aria-label="Exit quiz" className={exitButtonClass}>
            <X className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden />
          </button>
        </div>

        <ProgressBar className="mt-3" value={index} total={total} />
      </div>
    </header>
  );
}
