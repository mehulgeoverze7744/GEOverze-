import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { QUICK_ACTIONS } from "@/features/dashboard/data/dashboard";
import { cn } from "@/lib/utils";

/** Quick navigation grid with distinct visual treatment per action. */
export function QuickActionsGrid({ className }: { className?: string }) {
  return (
    <section className={cn("space-y-8", className)} aria-labelledby="quick-actions-heading">
      <div>
        <p className="dashboard-section-label">Quick actions</p>
        <h2
          id="quick-actions-heading"
          className="mt-2 text-[clamp(1.25rem,2.4vw,1.65rem)] font-light tracking-tight text-foreground"
        >
          Where do you want to go?
        </h2>
        <p className="mt-2 max-w-xl text-sm text-foreground/50">
          Six doors into the platform. Modules still in construction say so on arrival.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action, index) => (
          <AnimatedSection key={action.id} delay={index * 60}>
            <Link
              to={action.to}
              className="dashboard-quick-action group block h-full rounded-2xl border border-bronze/14 bg-charcoal/30 p-6 transition-all motion-base hover:-translate-y-0.5 hover:border-bronze/30 hover:bg-charcoal/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45 motion-reduce:transform-none"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bronze/25 bg-bronze/8 text-bronze transition-colors group-hover:border-bronze/40 group-hover:bg-bronze/12">
                  <action.icon className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
                </span>
                {action.badge ? <AnimatedBadge>{action.badge}</AnimatedBadge> : null}
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-foreground/85">
                {action.label}
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-bronze/90 transition-transform motion-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </p>
              <p className="mt-2 text-xs leading-relaxed text-foreground/50">
                {action.description}
              </p>
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
