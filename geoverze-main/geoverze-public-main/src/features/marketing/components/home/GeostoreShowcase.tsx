import { Link } from "@tanstack/react-router";
import { memo, useMemo } from "react";

import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";

import { merchProductsForStoreCategory } from "../../data/geostoreMerch";
import { GeostoreMerchCard } from "./GeostoreMerchCard";
import { GeostoreShowcaseIntro } from "./GeostoreShowcaseIntro";
import { GeostoreViewAllCard } from "./GeostoreViewAllCard";

import "./geostore-showcase.css";

/** Homepage GEOstore merchandise showcase — static frontend only. */
export const GeostoreShowcase = memo(function GeostoreShowcase() {
  const tshirtProducts = useMemo(() => merchProductsForStoreCategory("tshirts"), []);
  const hoodieProducts = useMemo(() => merchProductsForStoreCategory("hoodies"), []);
  const tshirts = useMemo(() => tshirtProducts.slice(0, 2), [tshirtProducts]);
  const hoodies = useMemo(() => hoodieProducts.slice(0, 2), [hoodieProducts]);
  const tshirtViewAll = tshirtProducts[2];
  const hoodieViewAll = hoodieProducts[2];

  return (
    <section id="geostore-merch" className="geostore-showcase relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--bloom-bronze),transparent_68%)]"
      />

      <SectionContainer size="wide" className="relative">
        <GeostoreShowcaseIntro />

        <ul
          className="geostore-showcase__row grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Featured T-shirts"
        >
          {tshirts.map((product, index) => (
            <li key={product.id} className="min-w-0">
              <AnimatedSection delay={80 + index * 40}>
                <GeostoreMerchCard product={product} />
              </AnimatedSection>
            </li>
          ))}
          <li className="min-w-0 sm:col-span-2 lg:col-span-1">
            <AnimatedSection delay={160}>
              <GeostoreViewAllCard
                slug="tshirts"
                categoryLabel="T-SHIRT"
                label="VIEW ALL T-SHIRTS"
                image={tshirtViewAll.image}
                imageAlt={tshirtViewAll.alt}
              />
            </AnimatedSection>
          </li>
        </ul>

        <ul
          className="geostore-showcase__row geostore-showcase__row--hoodies grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Featured hoodies"
        >
          {hoodies.map((product, index) => (
            <li key={product.id} className="min-w-0">
              <AnimatedSection delay={200 + index * 40}>
                <GeostoreMerchCard product={product} />
              </AnimatedSection>
            </li>
          ))}
          <li className="min-w-0 sm:col-span-2 lg:col-span-1">
            <AnimatedSection delay={280}>
              <GeostoreViewAllCard
                slug="hoodies"
                categoryLabel="HOODIE"
                label="VIEW ALL HOODIES"
                image={hoodieViewAll.image}
                imageAlt={hoodieViewAll.alt}
              />
            </AnimatedSection>
          </li>
        </ul>

        <AnimatedSection className="geostore-showcase__cta text-center" delay={120}>
          <GeoButton asChild variant="secondary" size="lg">
            <Link to="/geostore">Explore GEOstore</Link>
          </GeoButton>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
});
