import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

import type { BillingCycle } from "../data/plans";
import { BillingToggle } from "./BillingToggle";
import { OrbitalMark } from "./OrbitalMark";

/** Pricing hero: quiet, spacious, one focal point. */
export function PricingHero({
  cycle,
  onCycleChange,
}: {
  cycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
}) {
  return (
    <header className="pricing-hero pt-[calc(var(--nav-height)+1.25rem)] pb-6 md:pb-8">
      <SectionContainer size="wide" className="min-w-0">
        <Breadcrumb
          items={[{ label: "Home", to: "/" }, { label: "Pricing" }]}
          className="mb-5 md:mb-6"
        />
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <AnimatedSection>
            <p className="eyebrow">Membership</p>
            <h1 className="mt-3 max-w-xl font-light leading-[1.02] tracking-tight text-foreground text-[clamp(2.2rem,5vw,3.75rem)]">
              Choose your journey
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/60 md:mt-5 md:text-base">
              Unlock the complete GEOverze experience — unlimited play, the full library, live
              competition and the Creator Studio.
            </p>
            <BillingToggle cycle={cycle} onChange={onCycleChange} className="mt-6 md:mt-7" />
          </AnimatedSection>

          <AnimatedSection delay={120} className="flex justify-center lg:justify-end">
            <OrbitalMark />
          </AnimatedSection>
        </div>
      </SectionContainer>
    </header>
  );
}
