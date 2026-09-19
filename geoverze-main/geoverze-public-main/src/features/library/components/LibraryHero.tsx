import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Library } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionContainer } from "@/components/shared";

type LibraryHeroProps = {
  bookmarkCount: number;
};

/** GEOlibrary cinematic atlas hero — map/compass/books background. */
export function LibraryHero({ bookmarkCount }: LibraryHeroProps) {
  return (
    <header
      className="geolibrary-hero"
      style={{ backgroundImage: "url('/assets/geolibrary/hero-atlas.jpg')" }}
    >
      {/* Cinematic gradient overlay — darker left for text, image visible right */}
      <div className="geolibrary-hero__overlay" aria-hidden />

      {/* Subtle cartographic grid */}
      <div className="geolibrary-hero__grid" aria-hidden />

      <SectionContainer className="relative z-10 flex h-full flex-col justify-end pb-14 pt-[calc(var(--nav-height)+3.5rem)] sm:pb-16 sm:pt-[calc(var(--nav-height)+4rem)]">
        <p className="geolibrary-hero__eyebrow">GEOlibrary</p>

        <h1 className="geolibrary-hero__title">
          Know Earth.
          <br />
          One entry at a time.
        </h1>

        <p className="geolibrary-hero__dek">
          Explore the places, people and natural wonders
          <br className="hidden sm:block" />
          that make our world extraordinary.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Primary CTA */}
          <Link
            to="/geolibrary/browse"
            className="geolibrary-hero__cta-primary"
          >
            Browse Everything
            <ArrowRight className="ml-2 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
          </Link>

          {/* Secondary actions */}
          <Link to="/geolibrary/collections" className="geolibrary-hero__cta-secondary">
            <Library className="mr-1.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden />
            Collections
          </Link>
          <Link to="/geolibrary/bookmarks" className="geolibrary-hero__cta-secondary">
            <BookOpen className="mr-1.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden />
            Saved
            {bookmarkCount > 0 ? (
              <span className={cn("ml-1 opacity-70")}>({bookmarkCount})</span>
            ) : null}
          </Link>
        </div>
      </SectionContainer>

      {/* Bottom fade into starfield */}
      <div className="geolibrary-hero__fade" aria-hidden />
    </header>
  );
}
