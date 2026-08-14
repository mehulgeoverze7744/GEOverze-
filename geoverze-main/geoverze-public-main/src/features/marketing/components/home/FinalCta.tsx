import { Link } from "@tanstack/react-router";
import { memo } from "react";

import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";

/** Final call to action. */
export const FinalCta = memo(function FinalCta() {
  return (
    <section className="relative py-[var(--space-section-sm)] md:py-[var(--space-section)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,var(--bloom-bronze),transparent_70%)]"
      />
      <SectionContainer size="narrow" className="relative text-center">
        <AnimatedSection>
          <p className="eyebrow">Begin the journey</p>
          <h2 className="mt-5 font-light leading-[1.05] tracking-tight text-foreground text-[clamp(2rem,4.6vw,3.4rem)]">
            Ready to Begin Your Journey?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-foreground/55 md:text-base">
            Step into GEOverze and start discovering Earth the way it deserves to be explored.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <GeoButton asChild variant="primary" size="lg">
              <Link to="/play">
                Start Exploring
                <span aria-hidden>→</span>
              </Link>
            </GeoButton>
            <GeoButton asChild variant="secondary" size="lg">
              <Link to="/geolibrary">Browse GEOlibrary</Link>
            </GeoButton>
          </div>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
});
