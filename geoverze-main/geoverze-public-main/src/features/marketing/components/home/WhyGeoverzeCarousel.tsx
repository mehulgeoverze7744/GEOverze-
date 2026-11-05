import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

import type { HomeFeature } from "../../data/home";
import { whyCarouselCards } from "../../data/home";

import "./why-geoverze-carousel.css";

const AUTOPLAY_PX_PER_SEC = 34;
const INTERACT_RESUME_MS = 1600;

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

function CarouselCard({
  page,
  eager,
  clone,
  onNavigate,
}: {
  page: HomeFeature;
  eager: boolean;
  clone?: boolean;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      to={page.to}
      className="why-carousel-card"
      aria-label={clone ? undefined : `${page.title}: ${page.description}`}
      aria-hidden={clone || undefined}
      tabIndex={clone ? -1 : undefined}
      onClick={onNavigate}
    >
      <div className="why-carousel-card__media">
        <img
          src={page.imageSrc}
          alt={clone ? "" : page.imageAlt}
          width={960}
          height={396}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="why-carousel-card__img"
        />
      </div>
      <div className="why-carousel-card__body">
        <div className="why-carousel-card__copy">
          <h3>{page.title}</h3>
          <p>{page.description}</p>
        </div>
        <span className="why-carousel-card__go" aria-hidden>
          <ArrowUpRight strokeWidth={1.75} />
        </span>
      </div>
    </Link>
  );
}

function loopWidth(scroller: HTMLElement) {
  const items = scroller.querySelectorAll<HTMLElement>(".why-carousel-item");
  const count = whyCarouselCards.length;
  if (items.length < count * 2) return scroller.scrollWidth / 2;
  return items[count].offsetLeft - items[0].offsetLeft;
}

function cardStep(scroller: HTMLElement) {
  const card = scroller.querySelector<HTMLElement>(".why-carousel-card");
  const styles = getComputedStyle(scroller);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 20;
  return card ? card.getBoundingClientRect().width + gap : scroller.clientWidth * 0.8;
}

function wrapScroll(scroller: HTMLElement) {
  const half = loopWidth(scroller);
  if (half <= 0) return;
  if (scroller.scrollLeft >= half) scroller.scrollLeft -= half;
  else if (scroller.scrollLeft < 0) scroller.scrollLeft += half;
}

/** Horizontal landscape carousel with seamless right-to-left autoplay. */
export const WhyGeoverzeCarousel = memo(function WhyGeoverzeCarousel() {
  const reducedMotion = usePrefersReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScroll: 0,
  });
  const hoveringRef = useRef(false);
  const focusingRef = useRef(false);
  const interactingRef = useRef(false);
  const pausedRef = useRef(false);
  const programmaticRef = useRef(false);
  const resumeTimer = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const refreshPaused = useCallback(() => {
    pausedRef.current =
      reducedMotion ||
      hoveringRef.current ||
      focusingRef.current ||
      interactingRef.current ||
      dragRef.current.active;
  }, [reducedMotion]);

  const pauseForInteraction = useCallback(() => {
    interactingRef.current = true;
    pausedRef.current = true;
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      interactingRef.current = false;
      refreshPaused();
    }, INTERACT_RESUME_MS);
  }, [refreshPaused]);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (!reducedMotion) {
      setCanPrev(true);
      setCanNext(true);
      return;
    }
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, [reducedMotion]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateScrollState();
    const onScroll = () => {
      if (!reducedMotion && !programmaticRef.current) wrapScroll(el);
      updateScrollState();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [reducedMotion, updateScrollState]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || reducedMotion) return;

    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(48, now - last);
      last = now;

      if (!pausedRef.current) {
        el.scrollLeft += (AUTOPLAY_PX_PER_SEC * dt) / 1000;
        wrapScroll(el);
      }

      frame = requestAnimationFrame(tick);
    };

    pausedRef.current = false;
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resumeTimer.current);
    };
  }, [reducedMotion]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = cardStep(el);
    pauseForInteraction();
    programmaticRef.current = true;

    if (!reducedMotion && dir < 0 && el.scrollLeft < step + 8) {
      el.scrollLeft += loopWidth(el);
    }

    el.scrollBy({ left: dir * step, behavior: reducedMotion ? "auto" : "smooth" });
    window.setTimeout(() => {
      if (!reducedMotion) wrapScroll(el);
      programmaticRef.current = false;
    }, 520);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    pauseForInteraction();
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: el.scrollLeft,
    };
    refreshPaused();
    el.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = scrollerRef.current;
    if (!drag.active || !el) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > 6) drag.moved = true;
    el.scrollLeft = drag.startScroll - dx;
    wrapScroll(el);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (dragRef.current.active && el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
    dragRef.current.active = false;
    setDragging(false);
    pauseForInteraction();
    window.setTimeout(() => {
      dragRef.current.moved = false;
    }, 0);
  };

  const onCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (dragRef.current.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const track = reducedMotion ? whyCarouselCards : [...whyCarouselCards, ...whyCarouselCards];

  return (
    <div
      className="why-carousel"
      onMouseEnter={() => {
        hoveringRef.current = true;
        refreshPaused();
      }}
      onMouseLeave={() => {
        hoveringRef.current = false;
        refreshPaused();
      }}
      onFocusCapture={(event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || target.closest(".why-carousel__btn")) return;
        focusingRef.current = true;
        refreshPaused();
      }}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        focusingRef.current = false;
        refreshPaused();
      }}
    >
      <div className="why-carousel__controls">
        <button
          type="button"
          className="why-carousel__btn"
          aria-label="Previous pages"
          disabled={reducedMotion && !canPrev}
          onClick={() => scrollByCard(-1)}
        >
          <ChevronLeft strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className="why-carousel__btn"
          aria-label="Next pages"
          disabled={reducedMotion && !canNext}
          onClick={() => scrollByCard(1)}
        >
          <ChevronRight strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "why-carousel-scroller",
          dragging && "is-dragging",
          !reducedMotion && "is-autoplay",
        )}
        role="list"
        aria-label="GVRZE pages"
        aria-roledescription="carousel"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {track.map((page, index) => {
          const clone = !reducedMotion && index >= whyCarouselCards.length;
          return (
            <div
              key={`${page.to}-${index}`}
              className="why-carousel-item"
              role={clone ? "presentation" : "listitem"}
              aria-hidden={clone || undefined}
            >
              <CarouselCard
                page={page}
                eager={!clone && index < 2}
                clone={clone}
                onNavigate={onCardClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
