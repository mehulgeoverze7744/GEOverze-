import { Play, Star, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { FeaturedHeroSlide } from "../data/featuredHero";
import { DifficultyBadge, MetaChip } from "./Badges";
import { CoverArt } from "./CoverArt";

/**
 * Featured carousel. One large slide at a time, auto-advancing until the user
 * interacts, with dot controls and keyboard-reachable arrows.
 */
export function FeaturedCarousel({
  slides,
  onPlay,
}: {
  slides: FeaturedHeroSlide[];
  onPlay: (slide: FeaturedHeroSlide) => void;
}) {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setIndex((current) => (slides.length === 0 ? 0 : current % slides.length));
  }, [slides.length]);

  useEffect(() => {
    if (!auto || slides.length < 2) return;
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [auto, slides.length]);

  const active = slides[index];
  if (!active) return null;

  const go = (i: number) => {
    setAuto(false);
    setIndex((i + slides.length) % slides.length);
  };

  const hasMeta =
    Boolean(active.creator) ||
    active.players != null ||
    active.rating != null ||
    (active.questions != null && active.minutes != null);

  return (
    <div className="group/card game-surface overflow-hidden rounded-2xl">
      <div className="relative">
        <CoverArt
          key={active.id}
          art={active.art}
          ratio="wide"
          className="h-[15rem] md:h-[19rem]"
          fit="cover"
          imageSrc={active.imageSrc}
          imageAlt={active.imageAlt}
          {...(active.objectPosition ? { objectPosition: active.objectPosition } : {})}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.006_60)] via-[oklch(0.12_0.006_60/0.55)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <MetaChip tone="bronze">Featured</MetaChip>
            {active.difficulty ? <DifficultyBadge level={active.difficulty} /> : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {active.title}
          </h2>
          {hasMeta ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.75rem] text-foreground/60">
              {active.creator ? <span>by {active.creator}</span> : null}
              {active.players != null ? (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.8} />
                  {active.players.toLocaleString()} players
                </span>
              ) : null}
              {active.rating != null ? (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} fill="currentColor" />
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
          <GeoButton variant="solid" size="lg" className="mt-5" onClick={() => onPlay(active)}>
            <Play className="h-4 w-4" strokeWidth={2.4} />
            Play now
          </GeoButton>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 px-6 py-4">
        {slides.map((slide, i) => (
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
