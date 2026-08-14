import { memo } from "react";

import { AnimatedSection, GlassCard, SectionContainer } from "@/components/shared";

/** Section 7 — Community & Vision. */
export const CommunityVision = memo(function CommunityVision() {
  return (
    <section className="py-[var(--space-section-sm)] md:py-[var(--space-section)]">
      <SectionContainer size="default">
        <AnimatedSection>
          <GlassCard strong className="px-8 py-14 text-center md:px-16 md:py-20">
            <p className="eyebrow">Community &amp; vision</p>
            <p className="mx-auto mt-6 max-w-3xl font-light leading-[1.18] tracking-tight text-foreground text-[clamp(1.6rem,3.4vw,2.6rem)]">
              Building the world&rsquo;s most engaging geography learning community.
            </p>
            <p className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-foreground/50 md:text-base">
              GEOverze exists for the curious — for anyone who has traced a coastline on a map and
              wanted to know more. Our mission is to connect exploration, education and community so
              that learning about Earth feels like travelling it.
            </p>
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
});
