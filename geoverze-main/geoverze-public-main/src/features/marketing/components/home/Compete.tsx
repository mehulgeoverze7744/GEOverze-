import { memo } from "react";

import { AnimatedSection, GlassCard, SectionContainer } from "@/components/shared";
import { competeItems } from "../../data/home";
import { SectionIntro } from "./SectionIntro";

/** Section 4 — Compete (presented as platform vision, not shipped features). */
export const Compete = memo(function Compete() {
  return (
    <section className="py-[var(--space-section-sm)] md:py-[var(--space-section)]">
      <SectionContainer size="wide">
        <SectionIntro
          eyebrow="Compete"
          title="A world worth measuring yourself against"
          copy="Competition in GEOverze is designed to sharpen curiosity. These experiences are part of the platform vision and arrive as the universe expands."
        />

        <div className="mt-10 grid md:mt-14 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {competeItems.map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 80}>
              <GlassCard interactive className="h-full p-7">
                <div className="flex items-start justify-between gap-4">
                  <span
                    aria-hidden
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 text-bronze"
                  >
                    <item.icon className="h-5 w-5" strokeWidth={1.4} />
                  </span>
                  <span className="rounded-full border border-bronze/25 px-3 py-1 text-[0.55rem] uppercase tracking-[0.24em] text-bronze/90">
                    Roadmap
                  </span>
                </div>
                <h3 className="mt-6 text-base font-medium tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                  {item.description}
                </p>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
});
