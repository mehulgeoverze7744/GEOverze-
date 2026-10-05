import { Link } from "@tanstack/react-router";
import { Award } from "lucide-react";

import { useCreditProductAchievements } from "../hooks/useCreditProductAchievements";
import { cn } from "@/lib/utils";

import { CreditProductAchievementCard } from "./CreditProductAchievementCard";

/** Dashboard preview cap — full history on Quiz History & Rewards. */
export const DASHBOARD_ACHIEVEMENT_LIMIT = 8;

/** GeoCredit product achievements for the dashboard progression module. */
export function AchievementsStrip({ className }: { className?: string }) {
  const { achievements, loading, error } = useCreditProductAchievements();
  const preview = achievements.slice(0, DASHBOARD_ACHIEVEMENT_LIMIT);
  const showViewAll = achievements.length > 0;

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
        {showViewAll ? (
          <Link
            to="/quiz-history-and-rewards"
            search={{ tab: "achievements" }}
            className="text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90 transition-colors hover:text-bronze"
          >
            View all
            <span className="sr-only">{` — ${achievements.length} GeoCredit achievements`}</span>
          </Link>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-6 text-xs text-foreground/45">Loading achievements…</p>
      ) : error ? (
        <p className="mt-6 text-xs text-foreground/45">Unable to load achievements.</p>
      ) : preview.length === 0 ? (
        <div className="mt-6 flex flex-1 flex-col justify-center">
          <p className="text-sm text-foreground/80">No GeoCredit achievements yet.</p>
          <p className="mt-2 text-[0.75rem] leading-relaxed text-foreground/50">
            Acquire a GEOverze product with GeoCredits to earn your first achievement.
          </p>
        </div>
      ) : (
        <ul className="dashboard-achievements-grid mt-6 grid flex-1 grid-cols-2 gap-3 lg:grid-cols-4 lg:content-start">
          {preview.map((item) => (
            <li key={item.id}>
              <CreditProductAchievementCard achievement={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
