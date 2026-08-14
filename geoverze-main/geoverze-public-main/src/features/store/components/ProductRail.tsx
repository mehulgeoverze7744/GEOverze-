import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AnimatedSection } from "@/components/shared";

/** Section rail: title, optional "see all" link, and a responsive card grid. */
export function ProductRail({
  title,
  description,
  to,
  linkLabel = "See all",
  children,
  columns = 4,
}: {
  title: string;
  description?: string;
  to?: "/geostore/browse" | "/geostore/rewards" | "/geostore/offers" | "/geostore/orders";
  linkLabel?: string;
  children: ReactNode;
  columns?: 3 | 4;
}) {
  return (
    <AnimatedSection className="mt-[var(--space-section-sm)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-light tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-foreground/50">
              {description}
            </p>
          ) : null}
        </div>
        {to ? (
          <Link
            to={to}
            className="inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-bronze transition-colors motion-fast hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      <div
        className={
          columns === 3
            ? "mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            : "mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {children}
      </div>
    </AnimatedSection>
  );
}
