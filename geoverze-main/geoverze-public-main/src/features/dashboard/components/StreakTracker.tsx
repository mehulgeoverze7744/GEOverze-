import { Flame, Trophy } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import { STREAK, WEEKDAYS } from "@/features/profile/data/stats";
import { cn } from "@/lib/utils";

/** Monday-based index for the current calendar day (0 = Mon … 6 = Sun). */
function currentWeekdayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

/** Compact streak tracker with weekly mission dots. */
export function StreakTracker({ className }: { className?: string }) {
  const weekPct = Math.min(100, Math.round((STREAK.daysThisWeek / STREAK.weeklyGoal) * 100));

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

      <div className="dashboard-streak-stats">
        <div className="dashboard-streak-stat dashboard-streak-stat--active">
          <span className="dashboard-streak-stat-icon" aria-hidden="true">
            <Flame className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <span className="dashboard-streak-stat-body">
            <span className="dashboard-streak-stat-value text-gradient-bronze">
              <AnimatedCounter value={STREAK.current} />
            </span>
            <span className="dashboard-streak-stat-label">Day streak</span>
          </span>
        </div>

        <span className="dashboard-streak-stat-divider" aria-hidden="true" />

        <div className="dashboard-streak-stat dashboard-streak-stat--best">
          <span className="dashboard-streak-stat-icon dashboard-streak-stat-icon--muted" aria-hidden="true">
            <Trophy className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <span className="dashboard-streak-stat-body">
            <span className="dashboard-streak-stat-value dashboard-streak-stat-value--muted">
              <AnimatedCounter value={STREAK.longest} />
            </span>
            <span className="dashboard-streak-stat-label">Best streak</span>
          </span>
        </div>
      </div>

      <WeeklyMission weekPct={weekPct} />
    </section>
  );
}

/** Seven-day mission tracker beneath the streak readout. */
export function WeeklyMission({
  className,
  weekPct,
}: {
  className?: string;
  weekPct: number;
}) {
  const todayIndex = currentWeekdayIndex();

  return (
    <div className={cn("dashboard-streak-weekly", className)}>
      <div className="dashboard-streak-weekly-header">
        <p className="dashboard-streak-weekly-label">This week</p>
        <p className="dashboard-streak-weekly-goal">
          <span className="text-bronze-glow">{STREAK.daysThisWeek}</span>
          <span className="text-foreground/35"> / </span>
          <span>{STREAK.weeklyGoal}</span>
          <span className="ml-1.5 text-foreground/45">days</span>
        </p>
      </div>

      <div className="dashboard-streak-days" role="list" aria-label="Weekly activity">
        {STREAK.week.map((done, index) => {
          const isToday = index === todayIndex;
          const state = done ? (isToday ? "current-done" : "done") : isToday ? "current" : "upcoming";

          return (
            <span
              key={index}
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

      <ProgressBarFill
        className="dashboard-streak-progress"
        size="sm"
        value={weekPct}
        label="Weekly streak goal"
        valueText={`${STREAK.daysThisWeek} of ${STREAK.weeklyGoal} days`}
      />
    </div>
  );
}
