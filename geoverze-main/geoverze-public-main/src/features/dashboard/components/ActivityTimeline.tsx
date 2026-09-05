import { Link } from "@tanstack/react-router";

import { GeoButton } from "@/components/shared/GeoButton";
import { RECENT_ACTIVITY } from "@/features/dashboard/data/activity";
import { cn } from "@/lib/utils";

const TONE_DOT = {
  quiz: "bg-bronze shadow-[0_0_8px_rgba(180,140,80,0.45)]",
  achievement: "bg-bronze-glow shadow-[0_0_10px_rgba(200,160,90,0.5)]",
  credits: "bg-bronze/80",
  bookmark: "bg-foreground/35",
} as const;

/** Explorer journey timeline for recent activity. */
export function ActivityTimeline({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm sm:p-8",
        className,
      )}
      aria-labelledby="activity-timeline-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dashboard-section-label">Recent activity</p>
          <h2
            id="activity-timeline-heading"
            className="mt-2 text-[clamp(1.25rem,2.4vw,1.65rem)] font-light tracking-tight text-foreground"
          >
            Your exploration log
          </h2>
          <p className="mt-2 max-w-xl text-sm text-foreground/50">
            Quizzes, badges, credits and saves in one timeline. Placeholder entries until
            sessions are recorded.
          </p>
        </div>
      </div>

      <ol className="dashboard-timeline mt-8 list-none">
        {RECENT_ACTIVITY.map((entry, index) => {
          const Icon = entry.icon;
          const isLast = index === RECENT_ACTIVITY.length - 1;
          const showTodayLabel = index === 0;

          return (
            <li key={entry.id} className="relative">
              {showTodayLabel ? (
                <p className="mb-4 text-[0.62rem] uppercase tracking-[0.22em] text-foreground/45">
                  Today
                </p>
              ) : null}

              <div className="relative flex gap-4 pb-7">
                {!isLast ? (
                  <span
                    className="absolute left-[11px] top-6 bottom-0 w-px bg-bronze/12"
                    aria-hidden="true"
                  />
                ) : null}

                <span className="relative z-[1] mt-1.5 shrink-0" aria-hidden="true">
                  <span
                    className={cn("block h-2.5 w-2.5 rounded-full", TONE_DOT[entry.tone])}
                  />
                </span>

                {entry.to ? (
                  <Link
                    to={entry.to}
                    {...(entry.search ? { search: entry.search } : {})}
                    className="group min-w-0 flex-1 rounded-xl border border-transparent px-3 py-2 transition-colors motion-fast hover:border-bronze/18 hover:bg-bronze/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
                  >
                    <TimelineRow icon={Icon} entry={entry} />
                  </Link>
                ) : (
                  <div className="min-w-0 flex-1 px-3 py-2">
                    <TimelineRow icon={Icon} entry={entry} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-2 border-t border-bronze/10 pt-5">
        <GeoButton asChild variant="ghost" size="sm">
          <Link to="/quiz-history-and-rewards" search={{ tab: "history" }}>
            See full quiz history
          </Link>
        </GeoButton>
      </div>
    </section>
  );
}

function TimelineRow({
  icon: Icon,
  entry,
}: {
  icon: (typeof RECENT_ACTIVITY)[number]["icon"];
  entry: (typeof RECENT_ACTIVITY)[number];
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bronze/20 bg-bronze/8 text-bronze"
            aria-hidden="true"
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-foreground/90">{entry.title}</span>
            <span className="mt-1 block text-xs text-foreground/50">{entry.detail}</span>
          </span>
        </div>
        <span className="shrink-0 text-[0.58rem] uppercase tracking-[0.18em] text-foreground/45">
          {entry.when}
        </span>
      </div>
    </>
  );
}
