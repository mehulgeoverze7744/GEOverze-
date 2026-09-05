import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { SectionContainer } from "@/components/shared/SectionContainer";

import { creatorPerks } from "../data/rewards";
import {
  CreatorStudioPreview,
  type CreatorPreviewView,
} from "./CreatorStudioPreview";
import { PricingSectionHeader } from "./PricingSectionHeader";
import "../styles/pricing-editorial.css";

const FEATURE_VIEWS: CreatorPreviewView[] = [
  "dashboard",
  "analytics",
  "publishing",
  "monetization",
  "review",
];

/** Creator membership — premium product showcase with interactive preview. */
export function CreatorMembership() {
  const [activeFeature, setActiveFeature] = useState(0);

  const onFeatureEnter = useCallback((index: number) => {
    setActiveFeature(index);
  }, []);

  return (
    <section aria-labelledby="creator-heading" className="pricing-creator-section">
      <SectionContainer size="wide">
        <AnimatedSection>
          <div className="pricing-creator-showcase">
            <div className="pricing-creator-hero">
              <div className="pricing-creator-copy">
                <PricingSectionHeader
                  id="creator-heading"
                  eyebrow="Creator membership"
                  title="Built for the people who make the questions"
                  className="pricing-section-header--compact"
                />
                <p className="pricing-creator-lead">
                  Advance opens the Creator Studio — a professional workspace, not a posting box.
                  Publish into the same surfaces explorers already use, and see exactly how your work
                  performs.
                </p>
                <div className="pricing-creator-cta">
                  <GeoButton asChild variant="primary" className="pricing-creator-cta-button">
                    <Link to="/studio">
                      Open Creator Studio
                      <ArrowUpRight className="pricing-creator-cta-icon" strokeWidth={1.6} aria-hidden="true" />
                    </Link>
                  </GeoButton>
                </div>
              </div>

              <AnimatedSection delay={120} className="pricing-creator-preview-wrap">
                <CreatorStudioPreview view={FEATURE_VIEWS[activeFeature] ?? "dashboard"} />
              </AnimatedSection>
            </div>

            <div
              className="pricing-creator-features"
              role="tablist"
              aria-label="Creator membership features"
            >
              {creatorPerks.map((perk, index) => {
                const active = index === activeFeature;
                return (
                  <button
                    key={perk.title}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    data-active={active}
                    className="pricing-creator-feature"
                    onMouseEnter={() => onFeatureEnter(index)}
                    onFocus={() => onFeatureEnter(index)}
                    onClick={() => setActiveFeature(index)}
                  >
                    <span className="pricing-creator-feature-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="pricing-creator-feature-body">
                      <span className="pricing-creator-feature-title">{perk.title}</span>
                      <span className="pricing-creator-feature-description">{perk.description}</span>
                    </span>
                    <ArrowRight className="pricing-creator-feature-arrow" strokeWidth={1.6} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
}
