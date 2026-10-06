import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { cn } from "@/lib/utils";

import { useQuizProgressStats } from "../hooks/useQuizProgressStats";

const METRICS = [
  { id: "played", label: "Games played", valueKey: "gamesPlayed", emoji: "⚡" },
  { id: "wins", label: "Wins", valueKey: "wins", emoji: "🏆" },
  { id: "accuracy", label: "Accuracy", valueKey: "accuracy", suffix: "%", emoji: "🎯" },
  { id: "streak", label: "Current streak", valueKey: "currentStreak", emoji: "🔥" },
] as const;

/** Compact live quiz snapshot from quiz_attempts and user_progression. */
export function QuizProgressCard({ className }: { className?: string }) {
  const { stats, loading, error } = useQuizProgressStats();

  return (
    <section
      className={cn("dashboard-quiz-progress", className)}
      aria-labelledby="quiz-progress-heading"
    >
      <h2 id="quiz-progress-heading" className="dashboard-section-label">
        Quiz progress
      </h2>
      <p className="dashboard-quiz-progress__lede">From your live expedition record.</p>

      {error ? (
        <p className="dashboard-quiz-progress__status">Could not load your quiz progress.</p>
      ) : (
        <dl className="dashboard-quiz-progress__list">
          {METRICS.map((stat) => (
            <div key={stat.id} className="dashboard-quiz-progress__row">
              <dt className="dashboard-quiz-progress__label">
                <span className="dashboard-quiz-progress__emoji" aria-hidden="true">
                  {stat.emoji}
                </span>
                {stat.label}
              </dt>
              <dd className="dashboard-quiz-progress__value">
                {loading ? (
                  <span className="dashboard-quiz-progress__pending">—</span>
                ) : (
                  <>
                    <AnimatedCounter value={stats[stat.valueKey]} />
                    {"suffix" in stat ? (
                      <span className="dashboard-quiz-progress__suffix">{stat.suffix}</span>
                    ) : null}
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
