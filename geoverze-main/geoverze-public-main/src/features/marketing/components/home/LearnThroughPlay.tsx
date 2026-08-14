import { memo } from "react";

import { AnimatedSection, GlassCard, SectionContainer } from "@/components/shared";
import { learnConcepts } from "../../data/home";

/** Section 3 — Learn Through Play. */
export const LearnThroughPlay = memo(function LearnThroughPlay() {
  return (
    <section className="py-[var(--space-section-sm)] md:py-[var(--space-section)]">
      <SectionContainer size="wide">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <AnimatedSection>
            <p className="eyebrow">Learn through play</p>
            <h2 className="mt-4 font-light leading-[1.08] tracking-tight text-foreground text-[clamp(1.8rem,3.6vw,2.8rem)]">
              Understanding earned by exploring, not memorising
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-foreground/55 md:text-base">
              GEOverze asks you to participate. You place, compare, recognise and decide — and the
              knowledge stays because you used it rather than repeated it.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/50">
              The world is the lesson. Everything else is simply how you move through it.
            </p>
          </AnimatedSection>

          <div className="grid gap-5 sm:grid-cols-2">
            {learnConcepts.map((concept, i) => (
              <AnimatedSection key={concept.title} delay={i * 90}>
                <GlassCard interactive className="h-full p-6">
                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 text-bronze"
                  >
                    <concept.icon className="h-4.5 w-4.5" strokeWidth={1.4} />
                  </span>
                  <h3 className="mt-5 text-base font-medium tracking-tight text-foreground">
                    {concept.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                    {concept.description}
                  </p>
                </GlassCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
});
