import { Link } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

/** Closing band — one confident invitation, plus the honest billing note. */
export function PricingCta() {
  return (
    <section className="pb-[var(--space-section)]">
      <SectionContainer>
        <AnimatedSection>
          <GlassCard strong className="p-10 text-center md:p-16">
            <p className="eyebrow">Know Earth</p>
            <h2 className="mx-auto mt-6 max-w-xl font-light leading-[1.08] tracking-tight text-foreground text-[clamp(1.6rem,3.2vw,2.5rem)]">
              Start free. Upgrade when the planet gets interesting.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-foreground/55">
              Nothing is billable while GEOverze is in development — plans describe intent, not a
              live checkout. Your account, credits and progress carry into launch.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <GeoButton asChild variant="primary" size="lg">
                <Link to="/auth/signup">Create account</Link>
              </GeoButton>
              <GeoButton asChild variant="secondary" size="lg">
                <Link to="/pricing/compare">Compare plans</Link>
              </GeoButton>
            </div>
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
