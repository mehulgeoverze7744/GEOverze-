import { Flame, Trophy } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import { useStreakStats } from "@/features/progression/hooks/useStreakStats";
import { WEEKDAYS } from "@/features/profile/data/stats";
import { cn } from "@/lib/utils";

function safeCount(value: number | undefined) {
  return Number.isFinite(value) ? Math.max(0, value as number) : 0;
}

/** Compact one-line streak tracker. */
export function StreakTracker({ className }: { className?: string }) {
  const { stats, loading } = useStreakStats();
  const currentStreak = safeCount(stats.current);
  const bestStreak = safeCount(stats.longest);
  const daysThisWeek = safeCount(stats.daysThisWeek);
  const weeklyGoal = Math.max(1, safeCount(stats.weeklyGoal));
  const weekPct = loading ? 0 : stats.weekPercent;

  return (
    <section
      className={cn("dashboard-streak", className)}
      aria-labelledby="dashboard-streak-heading"
    >
      {/* Decorative "caught fire" perimeter — purely visual, hidden from AT. */}
      <span className="dashboard-streak-fire" aria-hidden="true">
        <span className="dashboard-streak-fire-glow" />
        <span className="dashboard-streak-flames dashboard-streak-flames--top">
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
        </span>
        <span className="dashboard-streak-flames dashboard-streak-flames--bottom">
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
          <span className="dashboard-streak-flame" />
        </span>
        <span className="dashboard-streak-embers">
          <span className="dashboard-streak-ember" />
          <span className="dashboard-streak-ember" />
          <span className="dashboard-streak-ember" />
          <span className="dashboard-streak-ember" />
          <span className="dashboard-streak-ember" />
        </span>
        <span className="dashboard-streak-shimmer" />
      </span>

      <header className="dashboard-streak-header">
        <Flame className="dashboard-streak-header-icon" strokeWidth={1.5} aria-hidden="true" />
        <h2 id="dashboard-streak-heading" className="dashboard-streak-title">
          Streak tracker
        </h2>
      </header>

      <span className="dashboard-streak-divider" aria-hidden="true" />

      <div className="dashboard-streak-stat">
        <span
          className="dashboard-streak-stat-icon dashboard-streak-stat-icon--active"
          aria-hidden="true"
        >
          <Flame className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
        <span className="dashboard-streak-stat-body">
          <span className="dashboard-streak-stat-value">
            {loading ? "—" : <AnimatedCounter value={currentStreak} />}
          </span>
          <span className="dashboard-streak-stat-label">Day streak</span>
        </span>
      </div>

      <span className="dashboard-streak-divider" aria-hidden="true" />

      <div className="dashboard-streak-stat">
        <span
          className="dashboard-streak-stat-icon dashboard-streak-stat-icon--muted"
          aria-hidden="true"
        >
          <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
        <span className="dashboard-streak-stat-body">
          <span className="dashboard-streak-stat-value dashboard-streak-stat-value--muted">
            {loading ? "—" : <AnimatedCounter value={bestStreak} />}
          </span>
          <span className="dashboard-streak-stat-label">Best streak</span>
        </span>
      </div>

      <span className="dashboard-streak-divider" aria-hidden="true" />

      <div className="dashboard-streak-week">
        <p className="dashboard-streak-week-label">This week</p>
        <div className="dashboard-streak-days" role="list" aria-label="Weekly activity">
          {stats.week.map((day, index) => {
            const done = day.done;
            const isToday = day.isToday;
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
                  done
                    ? isToday
                      ? "completed today"
                      : "completed"
                    : isToday
                      ? "today"
                      : "upcoming"
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
          <span>{loading ? "—" : daysThisWeek}</span>
          <span> / </span>
          <span>{weeklyGoal}</span>
          <span className="ml-1">days</span>
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
