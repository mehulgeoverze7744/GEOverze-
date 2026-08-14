import { Link } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  ComingSoon,
  FeatureCard,
  GeoButton,
  PageHeader,
  SectionContainer,
} from "@/components/shared";
import { storeRoadmap, storeShelves } from "../data/shelves";

/** GEOstore module landing page. */
export function StorePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="GEOstore"
        title="Where progress becomes collection"
        description="Everything earned or bought stays inside the same material language — bronze, glass and dark metal."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "GEOstore" }]}
      >
        <GeoButton asChild variant="secondary" size="lg">
          <Link to="/pricing">Compare plans</Link>
        </GeoButton>
      </PageHeader>

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="wide">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {storeShelves.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 90}>
                <FeatureCard {...item} />
              </AnimatedSection>
            ))}
          </div>
        </SectionContainer>
      </section>

      <ComingSoon
        title="The store opens once payments land"
        description="Catalogue, cart, checkout and the credits ledger are scheduled for a later phase. No items are purchasable yet."
        highlights={storeRoadmap}
      />
    </PageShell>
  );
}
