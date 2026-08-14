import { Link } from "@tanstack/react-router";
import { memo } from "react";

import { AnimatedSection, GlassCard, SectionContainer } from "@/components/shared";
import { ecosystem } from "../../data/home";
import { SectionIntro } from "./SectionIntro";

/** Section 5 — GEOverze Ecosystem. */
export const Ecosystem = memo(function Ecosystem() {
  return (
    <section className="relative py-[var(--space-section-sm)] md:py-[var(--space-section)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--bloom-bronze),transparent_65%)]"
      />
      <SectionContainer size="wide" className="relative">
        <SectionIntro
          eyebrow="The ecosystem"
          title="One universe, many interconnected rooms"
          copy="Each area of GEOverze feeds the others: what you explore becomes what you play, what you play becomes what you collect and where you stand."
        />

        <div className="mt-10 grid md:mt-14 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ecosystem.map((node, i) => (
            <AnimatedSection key={node.title} delay={i * 80}>
              <GlassCard interactive className="h-full p-0">
                <Link to={node.to} className="block h-full rounded-2xl p-7">
                  <span
                    aria-hidden
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 text-bronze"
                  >
                    <node.icon className="h-5 w-5" strokeWidth={1.4} />
                  </span>
                  <h3 className="mt-6 text-base font-medium tracking-tight text-foreground">
                    {node.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                    {node.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.28em] text-bronze/90">
                    Enter <span aria-hidden>→</span>
                  </span>
                </Link>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
});
