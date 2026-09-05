import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { GeoButton } from "@/components/shared/GeoButton";
import { SectionContainer } from "@/components/shared/SectionContainer";

import { rewardSteps } from "../data/rewards";
import { PricingSectionHeader } from "./PricingSectionHeader";
import "../styles/pricing-editorial.css";

/** Credits journey — horizontal timeline on desktop, vertical on mobile. */
export function RewardsExplainer() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = section.querySelectorAll<HTMLElement>(".pricing-rewards-reveal");

    if (reduced) {
      items.forEach((item) => {
        item.dataset.shown = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.shown = "true";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "-6% 0px", threshold: 0.15 },
    );

    items.forEach((item, index) => {
      item.dataset.shown = "false";
      item.style.transitionDelay = `${index * 60}ms`;
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="rewards-heading"
      className="pricing-rewards-section"
    >
      <SectionContainer size="wide">
        <PricingSectionHeader
          id="rewards-heading"
          eyebrow="Rewards"
          title="How credits work"
          description="One currency across the platform. You earn it by exploring and spend it in the GEOstore."
          action={
            <GeoButton asChild variant="ghost" size="sm">
              <Link to="/geostore">Visit the GEOstore</Link>
            </GeoButton>
          }
        />

        <ol className="pricing-rewards-timeline">
          {rewardSteps.map((step, index) => (
            <li
              key={step.title}
              className="pricing-rewards-step pricing-rewards-reveal"
              data-shown="false"
            >
              <span className="pricing-rewards-marker" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="pricing-rewards-step-title">{step.title}</h3>
                <p className="pricing-rewards-step-body">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionContainer>
    </section>
  );
}
