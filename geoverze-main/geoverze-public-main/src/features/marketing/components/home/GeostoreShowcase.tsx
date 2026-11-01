import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { memo } from "react";

import { SectionContainer } from "@/components/shared";
import { StorefrontCategoryCards } from "@/features/store/storefront/StorefrontCategoryCards";

import { GeostoreShowcaseIntro } from "./GeostoreShowcaseIntro";

import "./geostore-showcase.css";

/** Homepage Gstore section — blurred storefront entrance with a sharp CTA. */
export const GeostoreShowcase = memo(function GeostoreShowcase() {
  return (
    <section id="geostore-merch" className="geostore-showcase relative">
      <div className="geostore-showcase__scene" aria-hidden="true" inert>
        <SectionContainer size="wide" className="relative">
          <GeostoreShowcaseIntro />
          <StorefrontCategoryCards className="geostore-showcase__categories" />
        </SectionContainer>
      </div>

      <div className="geostore-showcase__frost" aria-hidden="true" />

      <div className="geostore-showcase__cta-layer">
        <Link to="/geostore" className="geostore-showcase__cta">
          <span>Explore Gstore</span>
          <ArrowRight className="geostore-showcase__cta-arrow" strokeWidth={2.2} aria-hidden />
        </Link>
      </div>
    </section>
  );
});
