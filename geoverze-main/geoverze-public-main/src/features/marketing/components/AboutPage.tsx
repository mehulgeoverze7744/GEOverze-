import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  FeatureCard,
  GlassCard,
  PageHeader,
  SectionContainer,
} from "@/components/shared";
import { principles } from "../data/about";

/** About page. */
export function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="About"
        title="A universe built to make Earth legible"
        description="GEOverze turns geography into something you move through: cast in bronze, lit like a film set and structured like a serious reference."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "About" }]}
      />

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="wide">
          <div className="grid gap-5 md:grid-cols-3">
            {principles.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <FeatureCard {...item} />
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-14">
            <GlassCard strong className="p-10 md:p-14">
              <p className="eyebrow">Where we are</p>
              <h2 className="mt-5 max-w-2xl font-light leading-[1.1] tracking-tight text-foreground text-[clamp(1.5rem,3vw,2.3rem)]">
                Phase one is the foundation: the design system, the shell and the map of everything
                still to build.
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/55 md:text-base">
                The quiz engine, tournaments, live trivia, achievements, payments and creator tools
                are all planned modules. They will arrive inside this same universe rather than
                beside it.
              </p>
            </GlassCard>
          </AnimatedSection>
        </SectionContainer>
      </section>
    </PageShell>
  );
}
