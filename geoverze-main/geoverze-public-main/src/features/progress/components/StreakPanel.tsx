import { Flame, Trophy } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import { STREAK, WEEKDAYS } from "@/features/profile/data/stats";
import { cn } from "@/lib/utils";

/**
 * Streak readout: current and best streak, weekly dots and a monthly grid.
 * Reused by the dashboard, the profile and the progress page.
 */
export function StreakPanel({ compact = false }: { compact?: boolean }) {
  const weekPct = Math.min(100, Math.round((STREAK.daysThisWeek / STREAK.weeklyGoal) * 100));
  const monthPct = Math.round((STREAK.monthDone / STREAK.monthTotal) * 100);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-4">
          <span
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-bronze/45 bg-bronze/12 text-bronze"
            aria-hidden="true"
          >
            <Flame className="h-5 w-5 animate-pulse motion-reduce:animate-none" strokeWidth={1.6} />
          </span>
          <span>
            <span className="block text-2xl font-light leading-none text-gradient-bronze">
              <AnimatedCounter value={STREAK.current} />
            </span>
            <span className="mt-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-foreground/50">
              day streak
            </span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-bronze/20 bg-charcoal/50 text-bronze/90"
            aria-hidden="true"
          >
            <Trophy className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <span>
            <span className="block text-2xl font-light leading-none text-foreground/80">
              <AnimatedCounter value={STREAK.longest} />
            </span>
            <span className="mt-1.5 block text-[0.6rem] uppercase tracking-[0.22em] text-foreground/50">
              best streak
            </span>
          </span>
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-foreground/50">This week</p>
          <p className="text-xs text-foreground/50">
            {STREAK.daysThisWeek} of {STREAK.weeklyGoal} day goal
          </p>
        </div>
        <div className="mt-3 flex gap-1.5">
          {STREAK.week.map((done, index) => (
            <span
              key={index}
              className={cn(
                "inline-flex h-8 flex-1 items-center justify-center rounded-lg border text-[0.6rem] transition-colors motion-fast",
                done
                  ? "border-bronze/50 bg-bronze/15 text-bronze"
                  : "border-bronze/12 text-foreground/50",
              )}
              aria-hidden="true"
            >
              {WEEKDAYS[index]}
            </span>
          ))}
        </div>
        <ProgressBarFill
          className="mt-4"
          size="sm"
          value={weekPct}
          label="Weekly streak goal"
          valueText={`${STREAK.daysThisWeek} of ${STREAK.weeklyGoal} days`}
        />
      </div>

      {compact ? null : (
        <div className="mt-7">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-foreground/50">
              This month
            </p>
            <p className="text-xs text-foreground/50">
              {STREAK.monthDone} of {STREAK.monthTotal} days
            </p>
          </div>
          <div className="mt-3 grid grid-cols-10 gap-1.5" aria-hidden="true">
            {Array.from({ length: STREAK.monthTotal }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-6 rounded-md border",
                  index < STREAK.monthDone
                    ? "border-bronze/45 bg-bronze/12"
                    : "border-bronze/10 bg-charcoal/40",
                )}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-foreground/50">
            {monthPct}% of this month completed on schedule.
          </p>
        </div>
      )}
    </div>
  );
}
