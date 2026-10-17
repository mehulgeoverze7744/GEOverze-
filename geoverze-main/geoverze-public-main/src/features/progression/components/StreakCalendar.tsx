import { Check, Flame, X } from "lucide-react";

import { GameCard } from "@/features/play/components/GameCard";
import { cn } from "@/lib/utils";
import type { StreakWeekDay } from "../lib/streakStats";

const STATE_STYLE: Record<string, string> = {
  done: "border-bronze/55 bg-gradient-bronze text-background",
  missed: "border-bronze/15 bg-[oklch(0.2_0.008_60)] text-foreground/50",
  today: "border-bronze/70 bg-bronze/18 text-bronze-glow shadow-[var(--glow-bronze)]",
  upcoming: "border-bronze/12 bg-[oklch(0.185_0.008_62)] text-foreground/50",
};

/** Mon–Sun streak calendar with a weekly goal readout. */
export function StreakCalendar({
  week,
  weeklyGoal,
  daysThisWeek,
  weekPercent,
  loading = false,
}: {
  week: readonly StreakWeekDay[];
  weeklyGoal: number;
  daysThisWeek: number;
  weekPercent: number;
  loading?: boolean;
}) {
  return (
    <GameCard interactive={false} raised>
      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
            <Flame className="h-4 w-4 text-bronze/90" strokeWidth={2} aria-hidden="true" />
            This week
          </h3>
          <p className="text-xs text-foreground/50">
            {loading
              ? "Loading weekly activity"
              : `${daysThisWeek} of ${weeklyGoal} day goal (${weekPercent}%)`}
          </p>
        </div>

        <ul className="mt-6 grid grid-cols-7 gap-2">
          {week.map((day) => (
            <li key={day.day} className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center rounded-xl border",
                  loading ? STATE_STYLE.upcoming : STATE_STYLE[day.state],
                )}
                aria-hidden="true"
              >
                {!loading && day.state === "done" ? (
                  <Check className="h-4 w-4" strokeWidth={2.6} />
                ) : !loading && day.state === "missed" ? (
                  <X className="h-4 w-4" strokeWidth={2.4} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.14em] text-foreground/50">
                {day.day}
                <span className="sr-only"> — {day.state}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </GameCard>
  );
}
