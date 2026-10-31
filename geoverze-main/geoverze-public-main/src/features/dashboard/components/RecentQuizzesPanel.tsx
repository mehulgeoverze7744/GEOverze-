import { Link } from "@tanstack/react-router";
import { History } from "lucide-react";

import { cn } from "@/lib/utils";

import { useDashboardQuizAttempts } from "../hooks/useDashboardQuizAttempts";
import { formatDashboardWhen, formatPlayMode } from "../lib/dashboardFormat";

function scoreTone(score: number, total: number) {
  if (total <= 0) return "normal";
  const pct = (score / total) * 100;
  if (score === total) return "perfect";
  if (pct >= 85) return "strong";
  return "normal";
}

const TONE_CLASS = {
  perfect: "dashboard-history-row__score--perfect",
  strong: "dashboard-history-row__score--strong",
  normal: "dashboard-history-row__score--normal",
} as const;

/** Recent attempts from quiz_attempts — empty until the explorer has played. */
export function RecentQuizzesPanel({ className }: { className?: string }) {
  const { attempts, loading } = useDashboardQuizAttempts();

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

      {loading ? (
        <p className="mt-6 text-sm text-foreground/50">Loading your latest runs…</p>
      ) : attempts.length === 0 ? (
        <div className="mt-6 flex flex-1 flex-col justify-center">
          <p className="text-sm text-foreground/80">No quizzes played yet.</p>
          <p className="mt-2 text-[0.75rem] leading-relaxed text-foreground/50">
            Start an expedition to build your quiz history.
          </p>
        </div>
      ) : (
        <ol className="dashboard-history-list mt-6 flex flex-1 list-none flex-col justify-between gap-2">
          {attempts.map((entry) => {
            const tone = scoreTone(entry.score, entry.total);

            return (
              <li key={entry.id}>
                <Link
                  to="/play/quiz"
                  search={{ quiz: entry.quizId }}
                  className="dashboard-history-row group"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="dashboard-history-row__title">
                        {entry.title}
                      </span>
                      <span className={cn("dashboard-history-row__score", TONE_CLASS[tone])}>
                        {entry.score}/{entry.total}
                      </span>
                    </span>
                    <span className="dashboard-history-row__meta">
                      {formatPlayMode(entry.mode)} · {formatDashboardWhen(entry.completedAt)}
                      {entry.creditsEarned > 0 ? ` · +${entry.creditsEarned} credits` : ""}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
