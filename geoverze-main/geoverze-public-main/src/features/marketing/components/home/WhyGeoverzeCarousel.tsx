import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

import { cn } from "@/lib/utils";

import type { HomeFeature } from "../../data/home";
import { whyCarouselCards } from "../../data/home";

import "./why-geoverze-carousel.css";

const SETS = 3;
const LOOP_SECONDS = 36;
const INTERACT_RESUME_MS = 1600;
const FALLBACK_IMAGE = "/assets/home/ecosystem/fallback.jpg";

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

function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.dataset['fallback'] === "1") {
    img.style.display = "none";
    img.parentElement?.classList.add("is-fallback");
    return;
  }
  img.dataset['fallback'] = "1";
  img.src = FALLBACK_IMAGE;
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
          height={540}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="why-carousel-card__img"
          style={page.imagePosition ? { objectPosition: page.imagePosition } : undefined}
          onError={handleImageError}
        />
        <div className="why-carousel-card__overlay" aria-hidden />
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

function layoutCards(viewport: HTMLElement) {
  const vw = viewport.clientWidth;
  let visible = 1.32;
  let gap = 16;
  if (vw >= 480) {
    visible = 1.55;
    gap = 16;
  }
  if (vw >= 640) {
    visible = 1.95;
    gap = 18;
  }
  if (vw >= 768) {
    visible = 2.4;
    gap = 18;
  }
  if (vw >= 1024) {
    visible = 3.15;
    gap = 20;
  }
  if (vw >= 1280) {
    visible = 3.45;
    gap = 20;
  }
  if (vw >= 1536) {
    visible = 3.85;
    gap = 22;
  }
  if (vw >= 1920) {
    visible = 4.35;
    gap = 24;
  }

  const cardWidth = Math.max(220, (vw - gap * (visible - 1)) / visible);
  viewport.style.setProperty("--why-card-width", `${cardWidth}px`);
  viewport.style.setProperty("--why-card-gap", `${gap}px`);
}

function setWidth(track: HTMLElement) {
  const items = track.querySelectorAll<HTMLElement>(".why-carousel-item");
  const count = whyCarouselCards.length;
  if (items.length < count * 2) return track.scrollWidth / Math.max(SETS, 1);
  return items[count]!.offsetLeft - items[0]!.offsetLeft;
}

/** Horizontal landscape carousel with seamless right-to-left autoplay. */
export const WhyGeoverzeCarousel = memo(function WhyGeoverzeCarousel() {
  const reducedMotion = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loopRef = useRef(0);
  const primedRef = useRef(false);
  const hoveringRef = useRef(false);
  const focusingRef = useRef(false);
  const interactingRef = useRef(false);
  const pausedRef = useRef(false);
  const resumeTimer = useRef(0);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startOffset: 0,
  });
  const [dragging, setDragging] = useState(false);

  const trackItems = useMemo(
    () => (reducedMotion ? whyCarouselCards : Array.from({ length: SETS }, () => whyCarouselCards).flat()),
    [reducedMotion],
  );

  const applyTransform = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
  }, []);

  const wrapOffset = useCallback(() => {
    const span = loopRef.current;
    if (span <= 0) return;
    const max = span * (SETS - 1);
    while (offsetRef.current >= max) offsetRef.current -= span;
    while (offsetRef.current < span) offsetRef.current += span;
  }, []);

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

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const measure = () => {
      layoutCards(viewport);
      if (reducedMotion) return;
      const span = setWidth(track);
      if (span <= 0) return;
      loopRef.current = span;
      if (!primedRef.current) {
        offsetRef.current = span;
        primedRef.current = true;
      }
      wrapOffset();
      applyTransform();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);

    return () => {
      observer.disconnect();
    };
  }, [applyTransform, reducedMotion, wrapOffset]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion) return;

    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(48, now - last);
      last = now;

      if (!pausedRef.current && loopRef.current > 0) {
        offsetRef.current += (loopRef.current / LOOP_SECONDS / 1000) * dt;
        wrapOffset();
      } else {
        wrapOffset();
      }

      applyTransform();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resumeTimer.current);
    };
  }, [applyTransform, reducedMotion, refreshPaused, wrapOffset]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    pauseForInteraction();
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startOffset: offsetRef.current,
    };
    refreshPaused();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > 6) drag.moved = true;
    offsetRef.current = drag.startOffset - dx;
    wrapOffset();
    applyTransform();
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
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

  const pauseHover = () => {
    hoveringRef.current = true;
    refreshPaused();
  };

  const resumeHover = () => {
    hoveringRef.current = false;
    refreshPaused();
  };

  return (
    <div className={cn("why-carousel", reducedMotion && "is-reduced")}>
      <div
        ref={viewportRef}
        className={cn("why-carousel-scroller", dragging && "is-dragging", !reducedMotion && "is-autoplay")}
        role="list"
        aria-label="GVRZE pages"
        aria-roledescription="carousel"
        onPointerEnter={pauseHover}
        onPointerLeave={resumeHover}
        onFocusCapture={() => {
          focusingRef.current = true;
          refreshPaused();
        }}
        onBlurCapture={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && event.currentTarget.contains(next)) return;
          focusingRef.current = false;
          refreshPaused();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={trackRef} className="why-carousel-track">
          {trackItems.map((page, index) => {
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
    </div>
  );
});

