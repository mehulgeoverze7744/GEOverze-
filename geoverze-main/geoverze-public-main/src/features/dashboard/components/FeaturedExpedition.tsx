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
        "dashboard-featured overflow-hidden rounded-2xl border border-bronze/20 bg-background",
        className,
      )}
      aria-labelledby="featured-expedition-heading"
    >
      <div className="relative aspect-[21/9] overflow-hidden bg-[oklch(0.12_0.006_62)]">
        <img
          src={FEATURED_EXPEDITION_IMAGE}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex flex-col p-6 sm:p-8">
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
