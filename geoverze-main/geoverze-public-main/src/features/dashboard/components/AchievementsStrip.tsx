import { Link } from "@tanstack/react-router";
import { Award } from "lucide-react";

import {
  ACHIEVEMENTS,
  type Achievement,
  type AchievementStatus,
} from "@/features/profile/data/achievements";
import { cn } from "@/lib/utils";

/** Dashboard preview cap — full catalogue on Quiz History & Rewards. */
export const DASHBOARD_ACHIEVEMENT_LIMIT = 8;

const STATUS_RANK: Record<AchievementStatus, number> = {
  progress: 0,
  unlocked: 1,
  locked: 2,
};

const STATUS_STYLE = {
  unlocked: "border-bronze/45 bg-bronze/12 text-bronze shadow-[0_0_20px_rgba(180,140,80,0.1)]",
  progress: "border-bronze/25 bg-charcoal/50 text-bronze/90",
  locked: "border-bronze/10 bg-charcoal/30 text-foreground/35",
} as const;

/** Prioritize in-progress, then unlocked, then locked — preserve catalogue order within each group. */
export function dashboardAchievementPreview(limit = DASHBOARD_ACHIEVEMENT_LIMIT): Achievement[] {
  return [...ACHIEVEMENTS]
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        STATUS_RANK[a.item.status] - STATUS_RANK[b.item.status] || a.index - b.index,
    )
    .slice(0, limit)
    .map(({ item }) => item);
}

/** Extended achievements grid for the dashboard progression module. */
export function AchievementsStrip({ className }: { className?: string }) {
  const preview = dashboardAchievementPreview();
  const hasMore = ACHIEVEMENTS.length > preview.length;

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="achievements-strip-heading"
    >
      <div className="flex shrink-0 items-center justify-between gap-4">
        <h2
          id="achievements-strip-heading"
          className="dashboard-section-label flex items-center gap-2"
        >
          <Award className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
          Achievements
        </h2>
        <Link
          to="/quiz-history-and-rewards"
          search={{ tab: "achievements" }}
          className="text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90 transition-colors hover:text-bronze"
        >
          View all
          {hasMore ? (
            <span className="sr-only">{` — ${ACHIEVEMENTS.length} total achievements`}</span>
          ) : null}
        </Link>
      </div>

      <ul className="dashboard-achievements-grid mt-6 grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4 lg:content-start">
        {preview.map((item) => {
          const Icon = item.icon;
          const isLocked = item.status === "locked";

          return (
            <li key={item.id}>
              <Link
                to="/quiz-history-and-rewards"
                search={{ tab: "achievements" }}
                className={cn(
                  "dashboard-achievement group flex h-full flex-col rounded-2xl border p-4 transition-all motion-base hover:-translate-y-0.5 hover:border-bronze/35 motion-reduce:transform-none",
                  STATUS_STYLE[item.status],
                  isLocked && "opacity-70",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl border",
                    item.status === "unlocked"
                      ? "border-bronze/40 bg-bronze/15"
                      : "border-bronze/15 bg-charcoal/40",
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.4} />
                </span>
                <p className="mt-4 text-xs font-medium text-foreground/90">{item.name}</p>
                <p className="mt-1 line-clamp-2 flex-1 text-[0.65rem] leading-relaxed text-foreground/50">
                  {item.description}
                </p>
                <p className="mt-3 text-[0.58rem] uppercase tracking-[0.16em] text-foreground/45">
                  {item.status === "unlocked"
                    ? item.earnedOn ?? "Unlocked"
                    : item.status === "progress"
                      ? item.detail
                      : "Locked"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
