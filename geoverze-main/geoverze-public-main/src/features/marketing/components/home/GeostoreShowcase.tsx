import { Link } from "@tanstack/react-router";
import { memo, useMemo, useState } from "react";

import { AnimatedSection, FilterChips, GeoButton, SectionContainer } from "@/components/shared";

import {
  filterMerchProducts,
  geostoreMerchProducts,
  merchFilterOptions,
  type MerchFilterId,
} from "../../data/geostoreMerch";
import { GeostoreMerchCard } from "./GeostoreMerchCard";
import { SectionIntro } from "./SectionIntro";

/** Homepage GEOstore merchandise showcase — static frontend only. */
export const GeostoreShowcase = memo(function GeostoreShowcase() {
  const [filter, setFilter] = useState<MerchFilterId>("all");

  const visible = useMemo(() => filterMerchProducts(geostoreMerchProducts, filter), [filter]);

  return (
    <section
      id="geostore-merch"
      className="relative py-[var(--space-section-sm)] md:py-[var(--space-section)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--bloom-bronze),transparent_68%)]"
      />

      <SectionContainer size="wide" className="relative">
        <SectionIntro
          eyebrow="GEOstore"
          title="Wear your coordinates."
          copy="Geography looks better when you wear it."
        />

        <AnimatedSection className="mt-10 md:mt-12" delay={60}>
          <FilterChips
            label="Collection"
            options={merchFilterOptions}
            value={filter}
            onChange={setFilter}
          />
        </AnimatedSection>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-14" aria-live="polite">
          {visible.map((product, index) => (
            <li key={product.id} className="min-w-0">
              <AnimatedSection delay={80 + index * 40}>
                <GeostoreMerchCard product={product} />
              </AnimatedSection>
            </li>
          ))}
        </ul>

        <AnimatedSection className="mt-14 text-center md:mt-16" delay={120}>
          <GeoButton asChild variant="secondary" size="lg">
            <Link to="/geostore">Explore GEOstore</Link>
          </GeoButton>
        </AnimatedSection>
      </SectionContainer>
    </section>
  );
});
