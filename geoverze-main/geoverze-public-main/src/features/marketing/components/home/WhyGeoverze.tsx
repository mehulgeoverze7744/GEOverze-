import { memo } from "react";

import { AnimatedSection, FeatureCard, SectionContainer } from "@/components/shared";
import { whyPillars } from "../../data/home";
import { SectionIntro } from "./SectionIntro";

/** Section 1 — Why GEOverze. */
export const WhyGeoverze = memo(function WhyGeoverze() {
  return (
    <section className="py-[var(--space-section-sm)] md:py-[var(--space-section)]">
      <SectionContainer size="wide">
        <SectionIntro
          eyebrow="Why GEOverze"
          title="A single universe where the world is worth exploring"
          copy="GEOverze brings together everything that makes geography compelling — learning, discovery, exploration, interactive quizzes, friendly competition and community — inside one cinematic experience."
        />

        <div className="mt-10 grid md:mt-14 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {whyPillars.map((pillar, i) => (
            <AnimatedSection key={pillar.title} delay={i * 80}>
              <FeatureCard {...pillar} />
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
});
