import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { memo } from "react";

import { SectionContainer } from "@/components/shared";
import { StorefrontCategoryCards } from "@/features/store/storefront/StorefrontCategoryCards";

import { GeostoreShowcaseIntro } from "./GeostoreShowcaseIntro";

import "./geostore-showcase.css";

/** Homepage Gstore section — product row with Explore Gstore below. */
export const GeostoreShowcase = memo(function GeostoreShowcase() {
  return (
    <section id="geostore-merch" className="geostore-showcase relative">
      <SectionContainer size="wide" className="geostore-showcase__heading-wrap">
        <GeostoreShowcaseIntro />
      </SectionContainer>

      <SectionContainer size="wide" className="geostore-showcase__products">
        <StorefrontCategoryCards className="geostore-showcase__categories" />
      </SectionContainer>

      <div className="geostore-showcase__cta-wrap">
        <Link to="/geostore" className="geostore-showcase__cta">
          <span>Explore Gstore</span>
          <ArrowRight className="geostore-showcase__cta-arrow" strokeWidth={2.2} aria-hidden />
        </Link>
      </div>
    </section>
  );
});
