import { Crosshair, Flame, Swords, Zap } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { useCreditHistory } from "@/features/progression/hooks/useCreditHistory";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { cn } from "@/lib/utils";

/** Compact live quiz snapshot from user_progression and credit ledger. */
export function QuizProgressCard({ className }: { className?: string }) {
  const player = useProgressionStore(selectPlayer);
  const { entries } = useCreditHistory();

  const wins = entries.filter(
    (entry) =>
      (entry.entryType === "earn_pvp" || entry.entryType === "earn_multiplayer") &&
      entry.signedAmount > 0 &&
      (entry.entryType === "earn_pvp" || /1st/i.test(entry.headline)),
  ).length;

  const stats = [
    { id: "played", label: "Games played", value: player.totalQuizzes, icon: Zap },
    { id: "wins", label: "Wins", value: wins, icon: Swords },
    { id: "accuracy", label: "Accuracy", value: player.accuracy, suffix: "%", icon: Crosshair },
    { id: "streak", label: "Current streak", value: player.currentStreak, icon: Flame },
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

      <dl className="mt-5 grid flex-1 grid-cols-2 gap-3">
        {stats.map((stat) => {
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
                <AnimatedCounter value={stat.value} />
                {"suffix" in stat ? (
                  <span className="ml-0.5 text-sm text-foreground/50">{stat.suffix}</span>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
