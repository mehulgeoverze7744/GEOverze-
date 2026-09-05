import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { RECOMMENDED_QUIZZES } from "@/features/dashboard/data/dashboard";
import { RECOMMENDED_IMAGES } from "@/features/dashboard/lib/dashboardAssets";
import { cn } from "@/lib/utils";

/** Cinematic recommendation cards for the dashboard. */
export function RecommendedQuizzesPanel({ className }: { className?: string }) {
  return (
    <section
      className={cn("space-y-6", className)}
      aria-labelledby="recommended-quizzes-heading"
    >
      <h2
        id="recommended-quizzes-heading"
        className="dashboard-section-label flex items-center gap-2"
      >
        <Sparkles className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
        Recommended for you
      </h2>

      <ul className="grid gap-4 sm:grid-cols-3">
        {RECOMMENDED_QUIZZES.map((item) => {
          const image = RECOMMENDED_IMAGES[item.id];
          const Icon = item.icon;

          return (
            <li key={item.id}>
              <Link
                to="/play"
                className="dashboard-rec-card group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-2xl border border-bronze/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
              >
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-[800ms] ease-[var(--ease-cinematic)] group-hover:scale-[1.03] motion-reduce:transform-none"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/20" />
                </div>

                <div className="relative z-[1] mt-auto flex flex-1 flex-col p-5">
                  <Icon
                    className="h-4 w-4 text-bronze/90"
                    strokeWidth={1.4}
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-sm font-light leading-snug text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-foreground/50">
                    {item.reason}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-bronze/90">
                      {item.level}
                    </span>
                    <span className="text-[0.6rem] uppercase tracking-[0.18em] text-foreground/45 transition-colors group-hover:text-bronze">
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
