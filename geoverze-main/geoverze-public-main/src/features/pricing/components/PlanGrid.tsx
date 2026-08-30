import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

import type { BillingCycle, PricingPlan } from "../data/plans";
import { PlanCard } from "./PlanCard";

/** Four-tier membership grid driven by the server catalog. */
export function PlanGrid({
  cycle,
  plans,
  loading = false,
  error = null,
}: {
  cycle: BillingCycle;
  plans: PricingPlan[];
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <section aria-labelledby="tiers-heading" className="pb-[var(--space-section-sm)]">
      <SectionContainer size="wide">
        <h2 id="tiers-heading" className="sr-only">
          Membership tiers
        </h2>

        {error ? (
          <GlassCard className="p-8 text-center text-sm text-foreground/60">
            Membership plans could not be loaded. {error}
          </GlassCard>
        ) : null}

        {!error && loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <GlassCard key={i} className="h-[28rem] animate-pulse p-8" aria-hidden />
            ))}
          </div>
        ) : null}

        {!error && !loading && plans.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, i) => (
              <AnimatedSection key={plan.id} delay={i * 90} className="h-full">
                <PlanCard plan={plan} cycle={cycle} />
              </AnimatedSection>
            ))}
          </div>
        ) : null}
      </SectionContainer>
    </section>
  );
}
