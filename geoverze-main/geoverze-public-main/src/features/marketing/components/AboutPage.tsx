import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  FeatureCard,
  PageHeader,
  SectionContainer,
} from "@/components/shared";
import { InfoPageShell } from "@/features/legal/components/InfoPageShell";

import { principles } from "../data/about";

/** About page. */
export function AboutPage() {
  return (
    <InfoPageShell>
      <PageShell>
        <PageHeader
          eyebrow="About Us"
          title="A universe built to make Earth legible"
          description="GVRZE turns geography into something you move through: cast in bronze, lit like a film set and structured like a serious reference."
          breadcrumb={[{ label: "Home", to: "/" }, { label: "About Us" }]}
        />

        <section className="pb-[var(--space-section-sm)]">
          <SectionContainer size="wide">
            <div className="gvrze-info-principles grid gap-5 md:grid-cols-3">
              {principles.map((item, i) => (
                <AnimatedSection key={item.title} delay={i * 100}>
                  <FeatureCard {...item} />
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="mt-14">
              <div className="gvrze-info-note rounded-[1.25rem] p-10 md:p-14">
                <p className="eyebrow">Where we are</p>
                <h2 className="mt-5 max-w-2xl leading-[1.15] tracking-tight">
                  Phase one is the foundation: the design system, the shell and the map of everything
                  still to build.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-relaxed">
                  The quiz engine, tournaments, live trivia, achievements, payments and creator tools
                  are all planned modules. They will arrive inside this same universe rather than
                  beside it.
                </p>
              </div>
            </AnimatedSection>
          </SectionContainer>
        </section>
      </PageShell>
    </InfoPageShell>
  );
}
