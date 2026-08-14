import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionContainer } from "@/components/shared/SectionContainer";

import { creatorPerks } from "../data/rewards";

/** Why creators take the Advance tier. */
export function CreatorMembership() {
  return (
    <section aria-labelledby="creator-heading" className="pb-[var(--space-section-sm)]">
      <SectionContainer size="wide">
        <AnimatedSection>
          <GlassCard strong className="overflow-hidden p-9 md:p-14">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="min-w-0">
                <p className="eyebrow">Creator membership</p>
                <h2
                  id="creator-heading"
                  className="mt-5 max-w-md font-light leading-[1.08] tracking-tight text-foreground text-[clamp(1.6rem,3vw,2.4rem)]"
                >
                  Built for the people who make the questions
                </h2>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-foreground/55">
                  Advance opens the Creator Studio — a professional workspace, not a posting box.
                  Publish into the same surfaces explorers already use, and see exactly how your
                  work performs.
                </p>
                <GeoButton asChild variant="primary" className="mt-10">
                  <Link to="/studio">
                    Open Creator Studio
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                </GeoButton>
              </div>

              <ul className="grid gap-px self-start overflow-hidden rounded-xl border border-bronze/15 sm:grid-cols-2">
                {creatorPerks.map((perk) => (
                  <li key={perk.title} className="bg-bronze/[0.03] p-6">
                    <h3 className="text-sm font-medium tracking-tight text-foreground">
                      {perk.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/50">
                      {perk.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
