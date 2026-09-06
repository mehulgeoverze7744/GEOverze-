import { memo } from "react";

import { AnimatedSection } from "@/components/shared";

/** Editorial intro block scoped to the Home page GEOstore section. */
export const GeostoreShowcaseIntro = memo(function GeostoreShowcaseIntro() {
  return (
    <AnimatedSection className="geostore-showcase-intro">
      <p className="geostore-showcase-intro__eyebrow">GEOstore</p>
      <h2 className="geostore-showcase-intro__heading">Wear your coordinates.</h2>
      <p className="geostore-showcase-intro__copy text-foreground/50">Geography, worn well.</p>
    </AnimatedSection>
  );
});
