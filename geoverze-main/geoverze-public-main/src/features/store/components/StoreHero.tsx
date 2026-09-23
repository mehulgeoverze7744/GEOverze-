import { Link } from "@tanstack/react-router";
import { ArrowRight, Coins, Gift, Library, Truck } from "lucide-react";

import { SectionContainer } from "@/components/shared";
import heroAvif from "@/assets/geostore/geostore-hero.avif";
import heroJpg from "@/assets/geostore/geostore-hero.jpg";
import heroWebp from "@/assets/geostore/geostore-hero.webp";

import { StoreSummaryCard } from "./StoreSummaryCard";
import type { ReactNode } from "react";

type StoreHeroProps = {
  balanceDisplay: string;
  creditHistoryLink: ReactNode;
  catalogueCount: number;
  categoryCount: number;
  freeShippingThreshold: string;
};

/** GEOstore cinematic hero — merchandise photography backdrop, editorial layout. */
export function StoreHero({
  balanceDisplay,
  creditHistoryLink,
  catalogueCount,
  categoryCount,
  freeShippingThreshold,
}: StoreHeroProps) {
  return (
    <header className="geostore-hero">
      <div className="geostore-hero__bg" aria-hidden>
        <picture>
          <source srcSet={heroAvif} type="image/avif" />
          <source srcSet={heroWebp} type="image/webp" />
          <img
            src={heroJpg}
            alt=""
            width={1280}
            height={720}
            fetchPriority="high"
            decoding="async"
            className="geostore-hero__bg-image"
          />
        </picture>
      </div>

      {/* Cinematic left-to-right gradient overlay */}
      <div className="geostore-hero__overlay" aria-hidden />

      {/* Content */}
      <SectionContainer
        size="wide"
        className="geostore-hero__content relative z-10 flex min-h-0 flex-1 flex-col justify-start pb-16 pt-[calc(var(--nav-height)+2.75rem)] sm:pb-20 sm:pt-[calc(var(--nav-height)+3.25rem)]"
      >
        {/* Eyebrow stays pinned; copy group moves independently */}
        <p className="geostore-hero__eyebrow">GEOstore</p>

        <div className="geostore-hero__copy">
          <div className="max-w-xl">
            <h1 className="geostore-hero__title">
              More than <span className="geostore-hero__title-accent">merch</span>
            </h1>

            <p className="geostore-hero__dek">Gear for curious minds.</p>

            <div className="mt-7 flex flex-wrap items-center gap-4 sm:gap-5">
              <Link to="/geostore/browse" className="geostore-hero__cta-primary">
                Browse the catalogue
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
              </Link>
              <Link to="/geostore/rewards" className="geostore-hero__cta-secondary">
                <Gift className="mr-1.5 h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden />
                Spend credits
              </Link>
            </div>
          </div>

          <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-2 sm:max-w-2xl sm:grid-cols-3 sm:gap-2.5">
            <StoreSummaryCard
              compact
              featured
              icon={Coins}
              label="Credit balance"
              value={balanceDisplay}
              footer={creditHistoryLink}
            />
            <StoreSummaryCard
              compact
              icon={Library}
              label="Catalogue"
              value={catalogueCount}
              footer={
                <p className="text-[0.55rem] text-foreground/45">{categoryCount} categories</p>
              }
            />
            <StoreSummaryCard
              compact
              icon={Truck}
              label="Free shipping"
              value={freeShippingThreshold}
              footer={<p className="text-[0.55rem] text-foreground/45">On physical orders above</p>}
            />
          </div>
        </div>
      </SectionContainer>

      <div className="geostore-hero__fade" aria-hidden />
    </header>
  );
}
