import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FeatureCard } from "@/components/shared/FeatureCard";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";

import { membershipBenefits } from "../data/benefits";

/** Membership benefits grid. */
export function BenefitGrid() {
  return (
    <section aria-labelledby="benefits-heading" className="pb-[var(--space-section-sm)]">
      <SectionContainer size="wide">
        <SectionHeading
          eyebrow="Benefits"
          title="What membership actually gives you"
          description="Seven things that change the moment you upgrade."
          className="mb-12"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {membershipBenefits.map((benefit, i) => (
            <AnimatedSection key={benefit.title} delay={i * 70} className="h-full">
              <FeatureCard
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
              />
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
