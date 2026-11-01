import { memo } from "react";

import { SectionContainer } from "@/components/shared";
import { StorefrontCategoryCards } from "@/features/store/storefront/StorefrontCategoryCards";

import { GeostoreShowcaseIntro } from "./GeostoreShowcaseIntro";

import "./geostore-showcase.css";

/** Homepage Gstore section — category tiles reused from the storefront. */
export const GeostoreShowcase = memo(function GeostoreShowcase() {
  return (
    <section id="geostore-merch" className="geostore-showcase relative">
      <SectionContainer size="wide" className="relative">
        <GeostoreShowcaseIntro />
        <StorefrontCategoryCards className="geostore-showcase__categories" />
      </SectionContainer>
    </section>
  );
});
