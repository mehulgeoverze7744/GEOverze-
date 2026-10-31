import { memo, useMemo } from "react";

import { AnimatedSection, SectionContainer } from "@/components/shared";

import { merchProductById } from "../../data/geostoreMerch";
import { GeostoreMerchCard } from "./GeostoreMerchCard";
import { GeostoreShowcaseIntro } from "./GeostoreShowcaseIntro";
import { GeostoreViewAllCard } from "./GeostoreViewAllCard";

import "./geostore-showcase.css";

/** Homepage Gstore merchandise showcase — static frontend only. */
export const GeostoreShowcase = memo(function GeostoreShowcase() {
  const bornToRoam = useMemo(() => merchProductById("tshirt-born-to-roam"), []);
  const knowTheCapital = useMemo(() => merchProductById("tshirt-know-the-capital"), []);
  const viewAllShirt = useMemo(() => merchProductById("tshirt-recalculating"), []);

  const featured = [bornToRoam, knowTheCapital].filter(
    (product): product is NonNullable<typeof product> => Boolean(product),
  );

  return (
    <section id="geostore-merch" className="geostore-showcase relative">
      <SectionContainer size="wide" className="relative">
        <GeostoreShowcaseIntro />

        <ul className="geostore-showcase__row" aria-label="Featured T-shirts">
          {featured.map((product, index) => (
            <li key={product.id} className="min-w-0">
              <AnimatedSection delay={80 + index * 40} className="h-full">
                <GeostoreMerchCard product={product} />
              </AnimatedSection>
            </li>
          ))}
          {viewAllShirt ? (
            <li className="min-w-0">
              <AnimatedSection delay={160} className="h-full">
                <GeostoreViewAllCard
                  slug="tshirts"
                  label="View All T-Shirts"
                  image={viewAllShirt.image}
                  imageAlt={viewAllShirt.alt}
                />
              </AnimatedSection>
            </li>
          ) : null}
        </ul>
      </SectionContainer>
    </section>
  );
});
