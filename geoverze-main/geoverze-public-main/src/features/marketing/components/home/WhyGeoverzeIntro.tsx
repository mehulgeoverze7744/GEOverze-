import { memo } from "react";

import { AnimatedSection } from "@/components/shared";

/** Editorial intro block scoped to the WHY GVRZE section. */
export const WhyGeoverzeIntro = memo(function WhyGeoverzeIntro() {
  return (
    <AnimatedSection className="why-geoverze-intro">
      <p className="why-geoverze-intro__eyebrow">Why GVRZE</p>
      <h2 className="why-geoverze-intro__heading">
        A single universe where the world is{" "}
        <span className="why-geoverze-intro__emphasis">worth exploring</span>
      </h2>
    </AnimatedSection>
  );
});
