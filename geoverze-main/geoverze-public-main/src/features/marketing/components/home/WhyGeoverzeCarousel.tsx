import { memo, useEffect, useState } from "react";

import type { HomeFeature } from "../../data/home";
import { whyCarouselCards } from "../../data/home";

import "./why-geoverze-carousel.css";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function CarouselCard({ pillar }: { pillar: HomeFeature }) {
  const Icon = pillar.icon;

  return (
    <article
      className="why-carousel-card group"
      tabIndex={0}
      aria-label={`${pillar.title}: ${pillar.description}`}
    >
      {pillar.imageSrc ? (
        <img
          src={pillar.imageSrc}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="why-carousel-card__img motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : null}
      <div aria-hidden className="why-carousel-card__overlay" />
      <div className="why-carousel-card__body">
        <span aria-hidden className="why-carousel-card__icon">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.4} />
        </span>
        <h3 className="text-sm font-medium tracking-tight text-foreground">{pillar.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-foreground/60">
          {pillar.description}
        </p>
      </div>
    </article>
  );
}

/** Infinite right→left marquee for WHY GEOVERZE feature pillars. */
export const WhyGeoverzeCarousel = memo(function WhyGeoverzeCarousel() {
  const reducedMotion = usePrefersReducedMotion();
  const track = reducedMotion ? whyCarouselCards : [...whyCarouselCards, ...whyCarouselCards];

  return (
    <div className="why-carousel-viewport" aria-label="Why GEOverze features">
      <div className="why-carousel-track" role="list">
        {track.map((pillar, index) => (
          <div key={`${pillar.title}-${index}`} role="listitem">
            <CarouselCard pillar={pillar} />
          </div>
        ))}
      </div>
    </div>
  );
});
