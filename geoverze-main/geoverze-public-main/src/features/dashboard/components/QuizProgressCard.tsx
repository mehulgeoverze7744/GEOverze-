import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import { cn } from "@/lib/utils";

import { useQuizProgressStats } from "../hooks/useQuizProgressStats";

type RowId = "played" | "wins" | "accuracy" | "streak";

const ROWS: readonly { id: RowId; label: string; emoji: string }[] = [
  { id: "played", label: "Games played", emoji: "⚡" },
  { id: "wins", label: "Wins", emoji: "🏆" },
  { id: "accuracy", label: "Accuracy", emoji: "🎯" },
  { id: "streak", label: "Current streak", emoji: "🔥" },
];

/** Next "round" milestone strictly above `value` (e.g. 12 wins at a 25-step → 25). */
function nextRoundMilestone(value: number, step: number): number {
  if (!Number.isFinite(value) || value < 0) return step;
  return Math.max(step, Math.ceil((value + 1) / step) * step);
}

/** Compact live quiz snapshot from quiz_attempts and user_progression. */
export function QuizProgressCard({ className }: { className?: string }) {
  const { stats, loading, error } = useQuizProgressStats();

  const gamesMilestone = nextRoundMilestone(stats.gamesPlayed, 50);
  const gamesPct = Math.min(100, Math.round((stats.gamesPlayed / gamesMilestone) * 100));
  const gamesRemaining = Math.max(0, gamesMilestone - stats.gamesPlayed);

  const winsMilestone = nextRoundMilestone(stats.wins, 25);
  const winsPct = Math.min(100, Math.round((stats.wins / winsMilestone) * 100));
  const winsRemaining = Math.max(0, winsMilestone - stats.wins);

  const accuracyPct = Math.min(100, Math.max(0, stats.accuracy));

  const values: Record<RowId, number> = {
    played: stats.gamesPlayed,
    wins: stats.wins,
    accuracy: stats.accuracy,
    streak: stats.currentStreak,
  };

  return (
    <section
      className={cn("dashboard-quiz-progress", className)}
      aria-labelledby="quiz-progress-heading"
    >
      <div className="dashboard-quiz-progress__head">
        <div className="min-w-0">
          <h2 id="quiz-progress-heading" className="dashboard-section-label">
            Quiz progress
          </h2>
          <p className="dashboard-quiz-progress__lede">From your live expedition record.</p>
        </div>
        <span className="dashboard-quiz-progress__status-pill">
          <span className="dashboard-quiz-progress__status-dot" aria-hidden="true" />
          Expedition active
        </span>
      </div>

      {error ? (
        <p className="dashboard-quiz-progress__status">Could not load your quiz progress.</p>
      ) : (
        <dl className="dashboard-quiz-progress__list">
          {ROWS.map((row) => {
            const value = values[row.id];

            return (
              <div key={row.id} className="dashboard-quiz-progress__row">
                <div className="dashboard-quiz-progress__row-top">
                  <dt className="dashboard-quiz-progress__label">
                    <span className="dashboard-quiz-progress__emoji" aria-hidden="true">
                      {row.emoji}
                    </span>
                    {row.label}
                  </dt>
                  <dd className="dashboard-quiz-progress__value">
                    {loading ? (
                      <span className="dashboard-quiz-progress__pending">—</span>
                    ) : (
                      <>
                        <AnimatedCounter value={value} />
                        {row.id === "accuracy" ? (
                          <span className="dashboard-quiz-progress__suffix">%</span>
                        ) : null}
                        {row.id === "streak" ? (
                          <span className="dashboard-quiz-progress__suffix">
                            {value === 1 ? "day" : "days"}
                          </span>
                        ) : null}
                      </>
                    )}
                  </dd>
                </div>

                {!loading && row.id === "played" ? (
                  <div className="dashboard-quiz-progress__row-bar">
                    <ProgressBarFill
                      size="sm"
                      value={gamesPct}
                      label="Games played progress"
                      valueText={`${stats.gamesPlayed} of ${gamesMilestone} games`}
                    />
                    <p className="dashboard-quiz-progress__row-caption">
                      {gamesRemaining} more to {gamesMilestone}
                    </p>
                  </div>
                ) : null}

                {!loading && row.id === "wins" ? (
                  <div className="dashboard-quiz-progress__row-bar">
                    <ProgressBarFill
                      size="sm"
                      value={winsPct}
                      label="Wins progress"
                      valueText={`${stats.wins} of ${winsMilestone} wins`}
                    />
                    <p className="dashboard-quiz-progress__row-caption">
                      {winsRemaining} more to {winsMilestone}
                    </p>
                  </div>
                ) : null}

                {!loading && row.id === "accuracy" ? (
                  <div className="dashboard-quiz-progress__row-bar">
                    <ProgressBarFill
                      size="sm"
                      value={accuracyPct}
                      label="Accuracy"
                      valueText={`${stats.accuracy}%`}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}
