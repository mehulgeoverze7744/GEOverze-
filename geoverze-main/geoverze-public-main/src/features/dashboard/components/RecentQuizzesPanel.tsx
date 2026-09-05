import { Link } from "@tanstack/react-router";
import { History } from "lucide-react";

import { QUIZ_HISTORY } from "@/features/dashboard/data/dashboard";
import { cn } from "@/lib/utils";

function scoreTone(score: number, total: number) {
  const pct = (score / total) * 100;
  if (score === total) return "perfect";
  if (pct >= 85) return "strong";
  return "normal";
}

const TONE_CLASS = {
  perfect: "border-bronze/50 bg-bronze/15 text-bronze-glow",
  strong: "border-bronze/35 bg-bronze/10 text-bronze",
  normal: "border-bronze/18 bg-charcoal/45 text-foreground/65",
} as const;

/** Game-style recent quiz history list. */
export function RecentQuizzesPanel({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="recent-quizzes-heading"
    >
      <div className="flex shrink-0 items-center justify-between gap-4">
        <h2 id="recent-quizzes-heading" className="dashboard-section-label flex items-center gap-2">
          <History className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
          Recent quizzes
        </h2>
        <Link
          to="/quiz-history-and-rewards"
          search={{ tab: "history" }}
          className="text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90 transition-colors hover:text-bronze"
        >
          All
        </Link>
      </div>

      <ol className="mt-6 flex flex-1 list-none flex-col justify-between gap-1">
        {QUIZ_HISTORY.map((entry) => {
          const tone = scoreTone(entry.score, entry.total);
          const Icon = entry.icon;

          return (
            <li key={entry.id}>
              <Link
                to="/play"
                className="dashboard-history-row group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition-colors motion-fast hover:border-bronze/20 hover:bg-bronze/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45 lg:px-2.5"
              >
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-bronze/20 bg-bronze/8 text-bronze"
                  aria-hidden="true"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.4} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm leading-snug text-foreground/90">
                      {entry.title}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[0.62rem] font-medium tabular-nums",
                        TONE_CLASS[tone],
                      )}
                    >
                      {entry.score}/{entry.total}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[0.68rem] text-foreground/50">
                    Solo · {entry.when}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
