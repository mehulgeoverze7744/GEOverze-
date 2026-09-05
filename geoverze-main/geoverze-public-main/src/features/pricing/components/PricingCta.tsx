import { Link } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { SectionContainer } from "@/components/shared/SectionContainer";

import "../styles/pricing-editorial.css";

/** Cinematic closing invitation — no card chrome. */
export function PricingCta() {
  return (
    <section className="pricing-cta-section" aria-labelledby="pricing-cta-heading">
      <div className="pricing-cta-glow" aria-hidden="true" />
      <div className="pricing-cta-horizon" aria-hidden="true" />
      <SectionContainer>
        <AnimatedSection>
          <div className="pricing-cta-inner">
            <p className="pricing-section-eyebrow">Know Earth</p>
            <h2 id="pricing-cta-heading" className="pricing-cta-title">
              Start free. Upgrade when the planet gets interesting.
            </h2>
            <p className="pricing-cta-note">
              Nothing is billable while GEOverze is in development — plans describe intent, not a
              live checkout. Your account, credits and progress carry into launch.
            </p>
            <div className="pricing-cta-actions">
              <GeoButton asChild variant="primary" size="lg">
                <Link to="/auth/signup">Create account</Link>
              </GeoButton>
              <GeoButton asChild variant="secondary" size="lg">
                <Link to="/pricing/compare">Compare plans</Link>
              </GeoButton>
            </div>
          </div>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
