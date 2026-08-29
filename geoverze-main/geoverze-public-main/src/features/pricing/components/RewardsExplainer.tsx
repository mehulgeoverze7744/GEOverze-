import { Link } from "@tanstack/react-router";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";

import { rewardSteps } from "../data/rewards";

/** Credits, rewards, bonuses and offers explained. */
export function RewardsExplainer() {
  return (
    <section aria-labelledby="rewards-heading" className="pb-[var(--space-section-sm)]">
      <SectionContainer size="wide">
        <SectionHeading
          eyebrow="Rewards"
          title="How credits work"
          description="One currency across the platform. You earn it by exploring and spend it in the GEOstore."
          className="mb-12"
          action={
            <GeoButton asChild variant="ghost" size="sm">
              <Link to="/geostore">Visit the GEOstore</Link>
            </GeoButton>
          }
        />
        <div className="grid gap-px overflow-hidden rounded-2xl border border-bronze/15 md:grid-cols-2 lg:grid-cols-4">
          {rewardSteps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 70} className="h-full">
              <GlassCard className="h-full rounded-none border-0 p-8">
                <span
                  aria-hidden
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bronze/25 bg-bronze/10 text-bronze"
                >
                  <step.icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <p className="mt-6 text-[0.6rem] uppercase tracking-[0.28em] text-bronze/90">
                  Step {i + 1}
                </p>
                <h3 className="mt-3 text-base font-medium tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                  {step.description}
                </p>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
