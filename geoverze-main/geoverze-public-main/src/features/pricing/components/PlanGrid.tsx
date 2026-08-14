import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";

import type { BillingCycle } from "../data/plans";
import { pricingPlans } from "../data/plans";
import { PlanCard } from "./PlanCard";

/** Three-tier membership grid. */
export function PlanGrid({ cycle }: { cycle: BillingCycle }) {
  return (
    <section aria-labelledby="tiers-heading" className="pb-[var(--space-section-sm)]">
      <SectionContainer size="wide">
        <h2 id="tiers-heading" className="sr-only">
          Membership tiers
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan, i) => (
            <AnimatedSection key={plan.id} delay={i * 90} className="h-full">
              <PlanCard plan={plan} cycle={cycle} />
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
