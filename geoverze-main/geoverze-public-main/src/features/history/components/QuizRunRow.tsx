import { cn } from "@/lib/utils";

import {
  MODE_LABEL,
  RESULT_LABEL,
  formatClock,
  formatDate,
  formatDuration,
  type QuizRun,
} from "../data/history";

const RESULT_STYLE: Record<QuizRun["result"], string> = {
  win: "border-bronze/55 bg-bronze/15 text-bronze-glow",
  loss: "border-bronze/15 bg-charcoal/50 text-foreground/50",
  complete: "border-bronze/25 bg-charcoal/40 text-foreground/65",
};

/**
 * One quiz run. Aligned table row from `lg` up, stacked card below —
 * same markup, so there is only one source of truth per field.
 */
export function QuizRunRow({ run }: { run: QuizRun }) {
  const pct = Math.round((run.score / run.total) * 100);

  return (
    <li className="px-6 py-5 transition-colors motion-fast hover:bg-bronze/4 lg:grid lg:grid-cols-[2.2fr_1fr_0.8fr_1.2fr_0.9fr_0.9fr_0.7fr] lg:items-center lg:gap-4">
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground/85">{run.title}</p>
        <p className="mt-1 text-xs text-foreground/50 lg:hidden">
          {MODE_LABEL[run.mode]} · {formatDate(run.playedAt)} · {formatClock(run.playedAt)}
        </p>
      </div>

      <p className="hidden text-xs text-foreground/55 lg:block">{MODE_LABEL[run.mode]}</p>

      <p className="mt-3 text-xs text-foreground/70 lg:mt-0">
        <span className="text-gradient-bronze">
          {run.score}/{run.total}
        </span>
        <span className="ml-2 text-foreground/50">{pct}%</span>
      </p>

      <p className="hidden text-xs text-foreground/50 lg:block">{formatDate(run.playedAt)}</p>
      <p className="hidden text-xs text-foreground/50 lg:block">{formatDuration(run.duration)}</p>

      <div className="mt-3 flex items-center gap-3 lg:mt-0 lg:block">
        <span
          className={cn(
            "inline-flex rounded-full border px-3 py-1 text-[0.58rem] uppercase tracking-[0.18em]",
            RESULT_STYLE[run.result],
          )}
        >
          {RESULT_LABEL[run.result]}
        </span>
        <span className="text-xs text-foreground/50 lg:hidden">
          {formatDuration(run.duration)} · {run.credits} credit{run.credits === 1 ? "" : "s"}
        </span>
      </div>

      <p className="hidden text-right text-xs lg:block">
        {run.credits > 0 ? (
          <span className="text-gradient-bronze">+{run.credits}</span>
        ) : (
          <span className="text-foreground/50">—</span>
        )}
      </p>
    </li>
  );
}
