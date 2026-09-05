import { useEffect, useRef } from "react";

import { SectionContainer } from "@/components/shared/SectionContainer";

import { upgradeStory } from "../data/story";
import { useUpgradeRosterParallax } from "../lib/useUpgradeRosterParallax";
import { UpgradeRosterCard } from "./UpgradeRosterCard";
import "../styles/why-upgrade.css";

/** Asymmetric scroll-parallax roster — five reasons explorers stay. */
export function WhyUpgrade() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useUpgradeRosterParallax(sectionRef, cardRefs);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slots = section.querySelectorAll<HTMLElement>(".upgrade-roster-slot");

    if (reduced) {
      slots.forEach((slot) => {
        slot.dataset.revealed = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const slot = entry.target as HTMLElement;
          slot.dataset.revealed = "true";
          observer.unobserve(slot);
        });
      },
      { rootMargin: "-8% 0px -8% 0px", threshold: 0.12 },
    );

    slots.forEach((slot, index) => {
      slot.dataset.revealed = "false";
      slot.style.transitionDelay = `${index * 100}ms`;
      observer.observe(slot);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="why-heading"
      className="upgrade-roster-section"
    >
      <SectionContainer>
        <header className="upgrade-roster-header">
          <p className="eyebrow">Why upgrade</p>
          <h2 id="why-heading" className="font-light tracking-tight text-foreground">
            Five reasons explorers stay
          </h2>
          <p>
            Membership is not a feature list. It is a different relationship with the planet.
          </p>
        </header>

        <div className="upgrade-roster-stage">
          <div className="upgrade-roster-atmosphere" aria-hidden="true" />
          <div className="upgrade-roster-orbit" aria-hidden="true">
            <span className="upgrade-roster-orbit-ring upgrade-roster-orbit-ring--a" />
            <span className="upgrade-roster-orbit-ring upgrade-roster-orbit-ring--b" />
            <span className="upgrade-roster-orbit-ring upgrade-roster-orbit-ring--c" />
          </div>
          <div className="upgrade-roster-grid">
            {upgradeStory.map((beat, index) => (
              <div
                key={beat.id}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className="upgrade-roster-slot"
                data-revealed="false"
              >
                <UpgradeRosterCard beat={beat} index={index} />
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
