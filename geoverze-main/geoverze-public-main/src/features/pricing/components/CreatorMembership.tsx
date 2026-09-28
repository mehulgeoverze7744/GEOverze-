import { ArrowRight, Lock } from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { SectionContainer } from "@/components/shared/SectionContainer";

import { creatorPerks } from "../data/rewards";
import { CreatorStudioPreview } from "./CreatorStudioPreview";
import { PricingSectionHeader } from "./PricingSectionHeader";
import "../styles/pricing-editorial.css";

/** Creator membership — locked until Creator Studio ships. */
export function CreatorMembership() {
  return (
    <section
      aria-labelledby="creator-heading"
      aria-describedby="creator-soon-label"
      aria-disabled="true"
      className="pricing-creator-section pricing-creator-section--soon"
    >
      <SectionContainer size="wide">
        <AnimatedSection>
          <div className="pricing-creator-showcase">
            <div className="pricing-creator-hero">
              <div className="pricing-creator-copy">
                <div className="pricing-creator-locked-surface">
                  <PricingSectionHeader
                    id="creator-heading"
                    eyebrow="Creator membership"
                    title="Built for the people who make the questions"
                    className="pricing-section-header--compact"
                  />
                  <p className="pricing-creator-lead">
                    Advance opens the Creator Studio — a professional workspace, not a posting box.
                    Publish into the same surfaces explorers already use, and see exactly how your
                    work performs.
                  </p>
                </div>
                <div className="pricing-creator-cta">
                  <GeoButton
                    variant="primary"
                    disabled
                    className="pricing-creator-cta-button cursor-not-allowed disabled:opacity-90"
                    aria-label="Open Creator Studio — coming soon"
                  >
                    <Lock
                      className="pricing-creator-cta-icon"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    Open Creator Studio
                  </GeoButton>
                  <p id="creator-soon-label" className="pricing-creator-soon">
                    Coming soon
                  </p>
                </div>
              </div>

              <AnimatedSection delay={120} className="pricing-creator-preview-wrap">
                <CreatorStudioPreview view="dashboard" />
              </AnimatedSection>
            </div>

            <div
              className="pricing-creator-features"
              role="list"
              aria-label="Creator membership features"
            >
              {creatorPerks.map((perk, index) => (
                <div key={perk.title} role="listitem" className="pricing-creator-feature">
                  <span className="pricing-creator-feature-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="pricing-creator-feature-body">
                    <span className="pricing-creator-feature-title">{perk.title}</span>
                    <span className="pricing-creator-feature-description">{perk.description}</span>
                  </span>
                  <ArrowRight
                    className="pricing-creator-feature-arrow"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
