import { Flame, Trophy } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import { STREAK, WEEKDAYS } from "@/features/profile/data/stats";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { cn } from "@/lib/utils";

/** Monday-based index for the current calendar day (0 = Mon … 6 = Sun). */
function currentWeekdayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

function safeCount(value: number | undefined) {
  return Number.isFinite(value) ? Math.max(0, value as number) : 0;
}

/** Compact one-line streak tracker. */
export function StreakTracker({ className }: { className?: string }) {
  const player = useProgressionStore(selectPlayer);
  const currentStreak = safeCount(player.currentStreak);
  const bestStreak = safeCount(player.longestStreak);
  const daysThisWeek = safeCount(STREAK.daysThisWeek);
  const weeklyGoal = Math.max(1, safeCount(STREAK.weeklyGoal));
  const weekPct = Math.min(100, Math.round((daysThisWeek / weeklyGoal) * 100));
  const todayIndex = currentWeekdayIndex();

  return (
    <section
      className={cn("dashboard-streak", className)}
      aria-labelledby="dashboard-streak-heading"
    >
      <header className="dashboard-streak-header">
        <Flame className="dashboard-streak-header-icon" strokeWidth={1.5} aria-hidden="true" />
        <h2 id="dashboard-streak-heading" className="dashboard-streak-title">
          Streak tracker
        </h2>
      </header>

      <span className="dashboard-streak-divider" aria-hidden="true" />

      <div className="dashboard-streak-stat">
        <span className="dashboard-streak-stat-icon dashboard-streak-stat-icon--active" aria-hidden="true">
          <Flame className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
        <span className="dashboard-streak-stat-body">
          <span className="dashboard-streak-stat-value text-gradient-bronze">
            <AnimatedCounter value={currentStreak} />
          </span>
          <span className="dashboard-streak-stat-label">Day streak</span>
        </span>
      </div>

      <span className="dashboard-streak-divider" aria-hidden="true" />

      <div className="dashboard-streak-stat">
        <span className="dashboard-streak-stat-icon dashboard-streak-stat-icon--muted" aria-hidden="true">
          <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
        <span className="dashboard-streak-stat-body">
          <span className="dashboard-streak-stat-value dashboard-streak-stat-value--muted">
            <AnimatedCounter value={bestStreak} />
          </span>
          <span className="dashboard-streak-stat-label">Best streak</span>
        </span>
      </div>

      <span className="dashboard-streak-divider" aria-hidden="true" />

      <div className="dashboard-streak-week">
        <p className="dashboard-streak-week-label">This week</p>
        <div className="dashboard-streak-days" role="list" aria-label="Weekly activity">
          {STREAK.week.map((done, index) => {
            const isToday = index === todayIndex;
            const state = done
              ? isToday
                ? "current-done"
                : "done"
              : isToday
                ? "current"
                : "upcoming";

            return (
              <span
                key={`${WEEKDAYS[index]}-${index}`}
                role="listitem"
                className={cn("dashboard-streak-day", `dashboard-streak-day--${state}`)}
                aria-label={`${WEEKDAYS[index]}: ${
                  done ? (isToday ? "completed today" : "completed") : isToday ? "today" : "upcoming"
                }`}
              >
                {WEEKDAYS[index]}
              </span>
            );
          })}
        </div>
      </div>

      <span className="dashboard-streak-divider" aria-hidden="true" />

      <div className="dashboard-streak-meter">
        <p className="dashboard-streak-meter-label">
          <span className="text-bronze-glow">{daysThisWeek}</span>
          <span className="text-foreground/35"> / </span>
          <span>{weeklyGoal}</span>
          <span className="ml-1 text-foreground/45">days</span>
        </p>
        <ProgressBarFill
          className="dashboard-streak-progress"
          size="sm"
          value={weekPct}
          label="Weekly streak goal"
          valueText={`${daysThisWeek} of ${weeklyGoal} days`}
        />
      </div>
    </section>
  );
}
