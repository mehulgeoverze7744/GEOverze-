import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";

import { upgradeStory } from "../data/story";

/** Storytelling band — one idea per row, alternating rhythm. */
export function WhyUpgrade() {
  return (
    <section aria-labelledby="why-heading" className="pb-[var(--space-section-sm)]">
      <SectionContainer>
        <SectionHeading
          eyebrow="Why upgrade"
          title="Five reasons explorers stay"
          description="Membership is not a feature list. It is a different relationship with the planet."
          className="mb-14"
        />

        <div className="space-y-5">
          {upgradeStory.map((beat, i) => (
            <AnimatedSection key={beat.id} delay={i * 60}>
              <GlassCard
                interactive
                className={cn(
                  "grid gap-8 p-8 md:grid-cols-[auto_1fr] md:p-10",
                  i % 2 ? "md:grid-cols-[1fr_auto]" : "",
                )}
              >
                <div className={cn("min-w-0", i % 2 ? "md:order-2" : "")}>
                  <p className="eyebrow">{beat.eyebrow}</p>
                  <h3 className="mt-4 font-light tracking-tight text-foreground text-[clamp(1.2rem,2vw,1.6rem)]">
                    {beat.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/55">
                    {beat.description}
                  </p>
                </div>
                <ul
                  className={cn(
                    "flex flex-wrap content-start gap-2 md:w-56",
                    i % 2 ? "md:order-1" : "",
                  )}
                >
                  {beat.points.map((point) => (
                    <li
                      key={point}
                      className="rounded-full border border-bronze/20 bg-bronze/5 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
