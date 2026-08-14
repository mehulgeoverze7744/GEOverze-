import { memo } from "react";

import { AnimatedSection, SectionContainer } from "@/components/shared";
import { valueProps } from "../../data/home";
import { SectionIntro } from "./SectionIntro";

/** Section 6 — Why choose GEOverze. */
export const WhyChoose = memo(function WhyChoose() {
  return (
    <section className="py-[var(--space-section-sm)] md:py-[var(--space-section)]">
      <SectionContainer size="wide">
        <SectionIntro eyebrow="Why choose GEOverze" title="Built to be remembered" align="center" />

        <div className="mt-10 grid md:mt-14 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {valueProps.map((value, i) => (
            <AnimatedSection key={value.title} delay={i * 70}>
              <div className="border-t border-bronze/20 pt-6">
                <p className="text-[0.62rem] uppercase tracking-[0.3em] text-bronze/90">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-base font-medium tracking-tight text-foreground">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/50">
                  {value.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
});
