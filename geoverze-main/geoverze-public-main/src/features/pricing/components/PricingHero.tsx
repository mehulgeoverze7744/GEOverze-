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
    <header className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]">
      <SectionContainer size="wide">
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Pricing" }]} className="mb-10" />
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <AnimatedSection>
            <p className="eyebrow">Membership</p>
            <h1 className="mt-5 max-w-xl font-light leading-[1.02] tracking-tight text-foreground text-[clamp(2.4rem,5.4vw,4.2rem)]">
              Choose your journey
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-relaxed text-foreground/60 md:text-base">
              Unlock the complete GEOverze experience — unlimited play, the full library, live
              competition and the Creator Studio.
            </p>
            <BillingToggle cycle={cycle} onChange={onCycleChange} className="mt-10" />
          </AnimatedSection>

          <AnimatedSection delay={120} className="flex justify-center lg:justify-end">
            <OrbitalMark />
          </AnimatedSection>
        </div>
      </SectionContainer>
    </header>
  );
}
