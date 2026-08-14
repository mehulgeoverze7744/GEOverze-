import { cn } from "@/lib/utils";

import type { PollOption } from "../data/posts";
import { compactCount } from "../lib/format";

/**
 * Poll with live-looking results. Voting is local UI state held in the
 * community store; percentages recompute from the placeholder tallies.
 */
export function PollBlock({
  question,
  options,
  closesIn,
  choice,
  onVote,
}: {
  question: string;
  options: readonly PollOption[];
  closesIn: string;
  choice?: string;
  onVote: (optionId: string) => void;
}) {
  const base = options.reduce((n, o) => n + o.votes, 0);
  const total = base + (choice ? 1 : 0);

  return (
    <div className="mt-4 rounded-xl border border-bronze/15 bg-charcoal/50 p-5">
      <p className="text-[0.6rem] uppercase tracking-[0.22em] text-foreground/50">Poll</p>
      <p className="mt-1.5 text-sm font-medium text-foreground">{question}</p>

      <ul className="mt-4 space-y-2">
        {options.map((option) => {
          const votes = option.votes + (choice === option.id ? 1 : 0);
          const pct = total === 0 ? 0 : Math.round((votes / total) * 100);
          const picked = choice === option.id;

          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onVote(option.id)}
                aria-pressed={picked}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg border px-4 py-2.5 text-left transition-[border-color,transform] motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 active:scale-[0.99]",
                  picked ? "border-bronze/55" : "border-bronze/15 hover:border-bronze/40",
                )}
              >
                {choice ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 transition-[width] motion-base motion-reduce:transition-none",
                      picked ? "bg-bronze/22" : "bg-bronze/8",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                ) : null}
                <span className="relative flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-foreground/85">
                    {option.label}
                  </span>
                  {choice ? (
                    <span className="shrink-0 text-xs tabular-nums text-bronze-glow">{pct}%</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[0.65rem] text-foreground/50">
        {compactCount(total)} votes · closes in {closesIn}
        {choice ? " · you voted" : ""}
      </p>
    </div>
  );
}
