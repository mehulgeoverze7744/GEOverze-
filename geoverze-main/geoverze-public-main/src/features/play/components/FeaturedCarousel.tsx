import { ChevronLeft, ChevronRight, Play, Star, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { FeaturedHeroSlide } from "../data/featuredHero";
import { DifficultyBadge, MetaChip } from "./Badges";
import { CoverArt } from "./CoverArt";

/** Catalog quiz slides that keep title and badges only in the Let's Play hero. */
const HERO_SLIDES_WITHOUT_META = new Set(["q-flag-blitz", "q-pin-the-place"]);

const FILTERS = [
  { id: "featured", label: "Featured" },
  { id: "popular", label: "Popular" },
] as const;

type CarouselFilter = (typeof FILTERS)[number]["id"];

/**
 * Featured carousel. One large slide at a time, auto-advancing until the user
 * interacts, with filter tabs, dot controls and banner arrows.
 */
export function FeaturedCarousel({
  slides,
  popularSlides = [],
  onPlay,
}: {
  slides: FeaturedHeroSlide[];
  popularSlides?: FeaturedHeroSlide[];
  onPlay: (slide: FeaturedHeroSlide) => void;
}) {
  const [filter, setFilter] = useState<CarouselFilter>("featured");
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const timer = useRef<number | null>(null);

  const activeSlides = filter === "popular" && popularSlides.length > 0 ? popularSlides : slides;

  useEffect(() => {
    setIndex((current) => (activeSlides.length === 0 ? 0 : current % activeSlides.length));
  }, [activeSlides.length]);

  useEffect(() => {
    if (!auto || activeSlides.length < 2) return;
    timer.current = window.setInterval(
      () => setIndex((i) => (i + 1) % activeSlides.length),
      6000,
    );
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [auto, activeSlides.length]);

  const active = activeSlides[index];
  if (!active) return null;

  const go = (i: number) => {
    setAuto(false);
    setIndex((i + activeSlides.length) % activeSlides.length);
  };

  const step = (delta: number) => {
    setAuto(false);
    setIndex((current) => {
      const count = activeSlides.length;
      if (count === 0) return 0;
      return (current + delta + count) % count;
    });
  };

  const selectFilter = (next: CarouselFilter) => {
    setAuto(false);
    setFilter(next);
    setIndex(0);
  };

  const hasMeta =
    !HERO_SLIDES_WITHOUT_META.has(active.id) &&
    (Boolean(active.creator) ||
      active.players != null ||
      active.rating != null ||
      (active.questions != null && active.minutes != null));

  return (
    <div
      className="featured-carousel group/card game-surface overflow-hidden rounded-2xl"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        }
      }}
    >
      <div className="featured-carousel-filters" role="tablist" aria-label="Banner categories">
        {FILTERS.map((option) => {
          const selected = option.id === filter;
          const disabled = option.id === "popular" && popularSlides.length === 0;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={disabled}
              onClick={() => selectFilter(option.id)}
              className={cn("featured-carousel-filter", selected && "is-active")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <CoverArt
          key={`${filter}-${active.id}`}
          art={active.art}
          ratio="wide"
          className="featured-carousel-media h-[15rem] md:h-[19rem]"
          fit="cover"
          imageSrc={active.imageSrc}
          imageAlt={active.imageAlt}
          {...(active.objectPosition ? { objectPosition: active.objectPosition } : {})}
        />
        <div className="featured-carousel-scrim absolute inset-0" />
        {activeSlides.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() => step(-1)}
              className="featured-carousel-arrow featured-carousel-arrow--prev"
            >
              <ChevronLeft strokeWidth={2.2} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => step(1)}
              className="featured-carousel-arrow featured-carousel-arrow--next"
            >
              <ChevronRight strokeWidth={2.2} aria-hidden />
            </button>
          </>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <MetaChip tone="bronze">{filter === "popular" ? "Popular" : "Featured"}</MetaChip>
            {active.difficulty ? <DifficultyBadge level={active.difficulty} /> : null}
          </div>
          <h2 className="featured-carousel-title mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            {active.title}
          </h2>
          {hasMeta ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.75rem] text-white/80">
              {active.creator ? <span>by {active.creator}</span> : null}
              {active.players != null ? (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-white/90" strokeWidth={1.8} />
                  {active.players.toLocaleString()} players
                </span>
              ) : null}
              {active.rating != null ? (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-white" strokeWidth={1.8} fill="currentColor" />
                  {active.rating.toFixed(1)}
                </span>
              ) : null}
              {active.questions != null && active.minutes != null ? (
                <span>
                  {active.questions} questions · ~{active.minutes} min
                </span>
              ) : null}
            </div>
          ) : null}
          <GeoButton
            variant="solid"
            size="lg"
            className={hasMeta ? "mt-5" : "mt-4"}
            onClick={() => onPlay(active)}
          >
            <Play className="h-4 w-4" strokeWidth={2.4} />
            Play now
          </GeoButton>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 px-6 py-4">
        {activeSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show ${slide.title}`}
            aria-current={i === index ? true : undefined}
            className={cn(
              "h-1.5 rounded-full transition-all motion-snap",
              i === index
                ? "w-8 bg-gradient-bronze"
                : "w-3 bg-[oklch(0.3_0.01_60)] hover:bg-bronze/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
