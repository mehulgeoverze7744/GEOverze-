import { Link } from "@tanstack/react-router";
import { ArrowRight, Gift } from "lucide-react";

import { SectionContainer } from "@/components/shared";

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
      {/* Background: merchandise category image */}
      <div className="geostore-hero__bg" aria-hidden>
        <img
          src="/assets/store/categories/caps.jpg"
          alt=""
          aria-hidden
          fetchPriority="high"
          decoding="async"
          className="geostore-hero__bg-img"
        />
      </div>

      {/* Cinematic left-to-right gradient overlay */}
      <div className="geostore-hero__overlay" aria-hidden />

      {/* Content */}
      <SectionContainer
        size="wide"
        className="relative z-10 flex h-full flex-col justify-between pb-10 pt-[calc(var(--nav-height)+2.75rem)] sm:pb-12 sm:pt-[calc(var(--nav-height)+3.25rem)]"
      >
        {/* Eyebrow */}
        <p className="geostore-hero__eyebrow">GEOstore</p>

        {/* Heading + CTA block */}
        <div className="mt-auto max-w-xl">
          <h1 className="geostore-hero__title">
            More than
            <br />
            <span className="geostore-hero__title-accent">merch</span>
          </h1>

          <p className="geostore-hero__dek">Gear for curious minds.</p>

          <div className="mt-7 flex flex-wrap items-center gap-4 sm:gap-5">
            <Link to="/geostore/browse" className="geostore-hero__cta-primary">
              Browse the catalogue
              <ArrowRight className="ml-2 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
            </Link>
            <Link to="/geostore/rewards" className="geostore-hero__cta-secondary">
              <Gift
                className="mr-1.5 h-4 w-4 shrink-0"
                strokeWidth={1.6}
                aria-hidden
              />
              Spend credits
            </Link>
          </div>
        </div>

        {/* Compact summary cards */}
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          <StoreSummaryCard
            compact
            featured
            label="Credit balance"
            value={balanceDisplay}
            footer={creditHistoryLink}
          />
          <StoreSummaryCard
            compact
            label="Catalogue"
            value={catalogueCount}
            footer={
              <p className="text-[0.6rem] text-foreground/45">{categoryCount} categories</p>
            }
          />
          <StoreSummaryCard
            compact
            label="Free shipping"
            value={freeShippingThreshold}
            footer={<p className="text-[0.6rem] text-foreground/45">On physical orders above</p>}
          />
        </div>
      </SectionContainer>

      {/* Bottom fade to page background */}
      <div className="geostore-hero__fade" aria-hidden />
    </header>
  );
}
