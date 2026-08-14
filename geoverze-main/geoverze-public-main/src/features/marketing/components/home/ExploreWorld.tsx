import { memo } from "react";

import { AnimatedSection, GlassCard, SectionContainer } from "@/components/shared";
import { exploreCategories } from "../../data/home";
import { SectionIntro } from "./SectionIntro";

/** Section 2 — Explore the World. */
export const ExploreWorld = memo(function ExploreWorld() {
  return (
    <section className="py-[var(--space-section-sm)] md:py-[var(--space-section)]">
      <SectionContainer size="wide">
        <SectionIntro
          eyebrow="Explore the world"
          title="Every layer of the planet, in one place"
          copy="From borders and capitals to ranges, rivers, oceans and cultures — GEOverze covers the full breadth of geography, each theme treated as its own expedition."
        />

        <div className="mt-10 grid md:mt-14 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {exploreCategories.map((category, i) => (
            <AnimatedSection key={category.label} delay={i * 50}>
              <GlassCard interactive className="h-full p-5">
                <category.icon aria-hidden className="h-5 w-5 text-bronze" strokeWidth={1.4} />
                <p className="mt-5 text-sm font-medium tracking-tight text-foreground">
                  {category.label}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/50">{category.note}</p>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
});
