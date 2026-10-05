import { Crosshair, Flame, Swords, Zap } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { cn } from "@/lib/utils";

import { useQuizProgressStats } from "../hooks/useQuizProgressStats";

/** Compact live quiz snapshot from quiz_attempts and user_progression. */
export function QuizProgressCard({ className }: { className?: string }) {
  const { stats, loading, error } = useQuizProgressStats();

  const metrics = [
    { id: "played", label: "Games played", value: stats.gamesPlayed, icon: Zap },
    { id: "wins", label: "Wins", value: stats.wins, icon: Swords },
    { id: "accuracy", label: "Accuracy", value: stats.accuracy, suffix: "%", icon: Crosshair },
    { id: "streak", label: "Current streak", value: stats.currentStreak, icon: Flame },
  ] as const;

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="quiz-progress-heading"
    >
      <h2 id="quiz-progress-heading" className="dashboard-section-label">
        Quiz progress
      </h2>
      <p className="mt-2 text-sm text-foreground/50">From your live expedition record.</p>

      {error ? (
        <p className="mt-5 text-sm text-foreground/50">Could not load your quiz progress.</p>
      ) : (
        <dl className="mt-5 grid flex-1 grid-cols-2 gap-3">
          {metrics.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="rounded-xl border border-bronze/12 bg-charcoal/35 px-3 py-3"
              >
                <dt className="flex items-center gap-1.5 text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                  <Icon className="h-3 w-3 text-bronze/80" strokeWidth={1.5} aria-hidden="true" />
                  {stat.label}
                </dt>
                <dd className="mt-2 text-xl font-light tracking-tight text-foreground">
                  {loading ? (
                    <span className="text-foreground/40">—</span>
                  ) : (
                    <>
                      <AnimatedCounter value={stat.value} />
                      {"suffix" in stat ? (
                        <span className="ml-0.5 text-sm text-foreground/50">{stat.suffix}</span>
                      ) : null}
                    </>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}
