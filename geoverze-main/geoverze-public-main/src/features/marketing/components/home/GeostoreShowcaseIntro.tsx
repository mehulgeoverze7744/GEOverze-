import { memo } from "react";

import { AnimatedSection } from "@/components/shared";

/** Homepage merch section title — headline only. */
export const GeostoreShowcaseIntro = memo(function GeostoreShowcaseIntro() {
  return (
    <AnimatedSection className="geostore-showcase-intro">
      <h2 className="geostore-showcase-intro__heading">Wear Your Co&#8209;ordinates</h2>
    </AnimatedSection>
  );
});
