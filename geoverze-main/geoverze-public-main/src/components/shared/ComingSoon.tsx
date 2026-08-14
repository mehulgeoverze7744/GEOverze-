import { Sparkles } from "lucide-react";

import { AnimatedSection } from "./AnimatedSection";
import { GlassCard } from "./GlassCard";
import { SectionContainer } from "./SectionContainer";

/**
 * Elegant placeholder for modules that ship in a later phase.
 * `highlights` describes what is being built, not fake data.
 */
export function ComingSoon({
  label = "In development",
  title,
  description,
  highlights = [],
}: {
  label?: string;
  title: string;
  description: string;
  highlights?: { title: string; description: string }[];
}) {
  return (
    <section className="pb-[var(--space-section)]">
      <SectionContainer>
        <AnimatedSection>
          <GlassCard strong className="overflow-hidden p-10 md:p-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-bronze/30 bg-bronze/10 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-bronze">
              <Sparkles className="h-3 w-3" strokeWidth={1.6} />
              {label}
            </span>
            <h2 className="mt-7 max-w-2xl font-light leading-[1.08] tracking-tight text-foreground text-[clamp(1.6rem,3.2vw,2.5rem)]">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/55 md:text-base">
              {description}
            </p>

            {highlights.length > 0 ? (
              <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-bronze/15 md:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.title} className="bg-charcoal/40 p-6 backdrop-blur-sm">
                    <p className="text-[0.68rem] uppercase tracking-[0.26em] text-bronze/90">
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/50">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
