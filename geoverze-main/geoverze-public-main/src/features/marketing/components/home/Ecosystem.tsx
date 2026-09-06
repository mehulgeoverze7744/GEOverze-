import { Link } from "@tanstack/react-router";
import { memo } from "react";

import { AnimatedSection, GlassCard, SectionContainer } from "@/components/shared";
import { ecosystem } from "../../data/home";
import { SectionIntro } from "./SectionIntro";

import "./ecosystem.css";

function EcosystemCardIcon({ icon: Icon }: { icon: (typeof ecosystem)[number]["icon"] }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 text-bronze"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.4} />
    </span>
  );
}

function EcosystemCardCopy({ node }: { node: (typeof ecosystem)[number] }) {
  return (
    <>
      <h3 className="mt-2 text-sm font-medium leading-snug tracking-tight text-foreground">
        {node.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-snug text-foreground/55">
        {node.description}
      </p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[0.55rem] uppercase tracking-[0.24em] text-bronze/90">
        Enter <span aria-hidden>→</span>
      </span>
    </>
  );
}

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

        <div className="ecosystem-grid mt-10 grid gap-4 md:mt-14 md:gap-5">
          {ecosystem.map((node, i) => (
            <AnimatedSection key={node.title} delay={i * 80} className="min-w-0">
              <GlassCard className="ecosystem-card group h-full overflow-hidden p-0">
                <Link to={node.to} className="flex h-full min-h-0 flex-col">
                  {node.imageSrc ? (
                    <>
                      <div className="ecosystem-card__media relative min-h-0 overflow-hidden">
                        <img
                          src={node.imageSrc}
                          alt=""
                          aria-hidden
                          loading="lazy"
                          decoding="async"
                          className="ecosystem-card__img absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-charcoal/50 to-transparent"
                        />
                      </div>
                      <div className="ecosystem-card__body flex min-h-0 flex-col px-3.5 pb-3.5 pt-3">
                        <EcosystemCardIcon icon={node.icon} />
                        <EcosystemCardCopy node={node} />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col px-3.5 pb-3.5 pt-3">
                      <EcosystemCardIcon icon={node.icon} />
                      <EcosystemCardCopy node={node} />
                    </div>
                  )}
                </Link>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
});
