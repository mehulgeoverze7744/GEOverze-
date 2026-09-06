import { memo } from "react";

import { SectionContainer } from "@/components/shared";

import { WhyGeoverzeCarousel } from "./WhyGeoverzeCarousel";
import { WhyGeoverzeIntro } from "./WhyGeoverzeIntro";

import "./why-geoverze-section.css";

/** Section 1 — Why GEOverze. */
export const WhyGeoverze = memo(function WhyGeoverze() {
  return (
    <section className="why-geoverze-section">
      <SectionContainer size="wide">
        <WhyGeoverzeIntro />
        <WhyGeoverzeCarousel />
      </SectionContainer>
    </section>
  );
});
