import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { QUIZ_HISTORY } from "@/features/dashboard/data/dashboard";
import { FEATURED_EXPEDITION_IMAGE } from "@/features/dashboard/lib/dashboardAssets";
import { cn } from "@/lib/utils";

/** Featured continue-play card built from the most recent quiz history entry. */
export function FeaturedExpedition({ className }: { className?: string }) {
  const featured = QUIZ_HISTORY[0];
  if (!featured) return null;

  const scorePct = Math.round((featured.score / featured.total) * 100);
  const isPerfect = featured.score === featured.total;

  return (
    <section
      className={cn(
        "dashboard-featured group relative overflow-hidden rounded-2xl border border-bronze/20",
        className,
      )}
      aria-labelledby="featured-expedition-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={FEATURED_EXPEDITION_IMAGE}
          alt=""
          className="h-full w-full object-cover transition-transform duration-[800ms] ease-[var(--ease-cinematic)] group-hover:scale-[1.02] motion-reduce:transform-none"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
      </div>

      <div className="relative z-[1] flex min-h-[220px] flex-col justify-end p-6 sm:min-h-[260px] sm:p-8">
        <p className="dashboard-section-label">Today&apos;s expedition</p>
        <h2
          id="featured-expedition-heading"
          className="mt-2 max-w-md text-[clamp(1.4rem,2.8vw,2rem)] font-light tracking-tight text-foreground"
        >
          {featured.title}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
              isPerfect
                ? "border-bronze/50 bg-bronze/15 text-bronze-glow"
                : scorePct >= 85
                  ? "border-bronze/35 bg-bronze/10 text-bronze"
                  : "border-bronze/20 bg-charcoal/50 text-foreground/70",
            )}
          >
            {featured.score} / {featured.total} correct
            {isPerfect ? " · Perfect" : null}
          </span>
          <span className="text-xs text-foreground/50">Solo · {featured.when}</span>
        </div>

        <GeoButton asChild variant="primary" className="mt-6 w-fit">
          <Link to="/play">
            Continue expedition
            <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </GeoButton>
      </div>
    </section>
  );
}
