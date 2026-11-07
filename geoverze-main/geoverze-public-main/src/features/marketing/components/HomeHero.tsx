import { ClientOnly, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { Suspense, lazy, useEffect, useRef, useState, type KeyboardEvent } from "react";

import { useScrollProgress } from "@/components/geoverze/useScrollProgress";
import "./home-hero.css";
import { skyLayer } from "@/components/layout/skyLayer";
import { GeoButton, Modal } from "@/components/shared";
import { RewardsCard } from "@/features/marketing/components/hero/RewardsCard";
import { hasWebGLSupport } from "@/lib/webgl";

/** The 3D scene is the only heavy chunk in the app and stays lazily loaded. */
const GlobeScene = lazy(() => import("@/components/geoverze/GlobeScene"));

const SHOW_HOME_REWARDS_CARD = true;

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** ScrollTrigger progress where “Your expedition starts here” is fully in. */
const EXPEDITION_PROGRESS = 0.82;
const JOURNEY_MS = 5600;

function cinematicEase(t: number) {
  const easeIn = 0.2;
  const easeOut = 0.22;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t < easeIn) {
    const u = t / easeIn;
    return 0.14 * (u * u * (3 - 2 * u));
  }
  if (t > 1 - easeOut) {
    const u = (t - (1 - easeOut)) / easeOut;
    return 0.86 + 0.14 * (u * u * (3 - 2 * u));
  }
  return 0.14 + ((t - easeIn) / (1 - easeIn - easeOut)) * 0.72;
}

function pinMetrics(hero: HTMLElement) {
  const parent = hero.parentElement;
  const pinned =
    parent &&
    (parent.classList.contains("pin-spacer") || parent.hasAttribute("data-pin-spacer"));
  if (pinned && parent) {
    return {
      start: parent.getBoundingClientRect().top + window.scrollY,
      distance: Math.max(0, parent.offsetHeight - hero.offsetHeight),
    };
  }
  return {
    start: hero.getBoundingClientRect().top + window.scrollY,
    distance: window.innerHeight * 1.7,
  };
}

type GlobeJourney = { raf: number; stop: () => void };

let activeJourney: GlobeJourney | null = null;

function stopGlobeJourney() {
  if (!activeJourney) return;
  cancelAnimationFrame(activeJourney.raf);
  activeJourney.stop();
  activeJourney = null;
}

function playGlobeJourney(hero: HTMLElement) {
  const { start, distance } = pinMetrics(hero);
  const targetY = Math.round(start + distance * EXPEDITION_PROGRESS);
  const fromY = window.scrollY;
  const delta = targetY - fromY;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  stopGlobeJourney();

  if (Math.abs(delta) < 4 || reduced) {
    window.scrollTo({ top: targetY, behavior: "auto" });
    return;
  }

  const fullSpan = Math.max(distance * EXPEDITION_PROGRESS, 1);
  const duration = Math.round(Math.max(2400, JOURNEY_MS * Math.min(1, Math.abs(delta) / fullSpan)));
  const started = performance.now();

  const onUserInterrupt = () => stopGlobeJourney();
  const onKeyInterrupt = (event: globalThis.KeyboardEvent) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "PageDown" ||
      event.key === "PageUp" ||
      event.key === "Home" ||
      event.key === "End" ||
      event.key === " "
    ) {
      stopGlobeJourney();
    }
  };

  const stop = () => {
    window.removeEventListener("wheel", onUserInterrupt);
    window.removeEventListener("touchmove", onUserInterrupt);
    window.removeEventListener("keydown", onKeyInterrupt);
  };

  window.addEventListener("wheel", onUserInterrupt, { passive: true });
  window.addEventListener("touchmove", onUserInterrupt, { passive: true });
  window.addEventListener("keydown", onKeyInterrupt);

  const tick = (now: number) => {
    if (!activeJourney) return;
    const t = Math.min(1, (now - started) / duration);
    window.scrollTo(0, fromY + delta * cinematicEase(t));
    if (t < 1) {
      activeJourney.raf = requestAnimationFrame(tick);
      return;
    }
    stopGlobeJourney();
  };

  activeJourney = { raf: requestAnimationFrame(tick), stop };
}

/** Fades a panel in over [a,b] and out over [c,d]. */
function band(p: number, a: number, b: number, c: number, d: number) {
  return Math.min(clamp01((p - a) / (b - a)), 1 - clamp01((p - c) / (d - c)));
}

/**
 * Scroll-pinned hero: the globe emerges on the left, dominates the frame and
 * parks on the right while the remaining copy panels hand off.
 *
 * All scroll-driven work is written imperatively to the DOM from a single rAF
 * flush — the component itself never re-renders while scrolling.
 */
function applyRewardsGlobeScroll(
  p: number,
  rewards: HTMLElement | null,
  globe: HTMLElement | null,
) {
  const compact = window.matchMedia("(max-width: 1023px)").matches;
  // On phones (≤767px) the card is in-flow at full scale (position:relative).
  // restScale=1.0 so it renders at 100% — the CSS flex layout handles sizing.
  // On tablets (768–1023px) keep the original 0.7 scale for the absolute card.
  const isMobilePhone = window.matchMedia("(max-width: 767px)").matches;
  const exitStart = compact ? 0.01 : 0.02;
  const exitSpan = compact ? 0.16 : 0.2;
  const exit = clamp01((p - exitStart) / exitSpan);
  const t = exit * exit * (3 - 2 * exit);

  if (rewards) {
    const restScale = isMobilePhone ? 1.0 : compact ? 0.7 : 1.0;
    const x = t * (compact ? 20 : 84);
    const y = t * (compact ? -64 : -148);
    const scale = restScale * (1 - t * (compact ? 0.1 : 0.14));
    const opacity = 1 - t;
    const restY = compact ? "0px" : "-50%";
    rewards.style.transform = `translate3d(${x.toFixed(2)}px, calc(${restY} + ${y.toFixed(2)}px), 0) scale(${scale.toFixed(4)})`;
    rewards.style.opacity = String(opacity);
    rewards.style.filter = t > 0.04 ? `blur(${(t * 4.5).toFixed(2)}px)` : "blur(0.01px)";
    rewards.style.pointerEvents = opacity > 0.22 ? "auto" : "none";
    rewards.setAttribute("aria-hidden", opacity < 0.15 ? "true" : "false");
    const shell = rewards.querySelector<HTMLElement>(".rewards-card__shell");
    if (shell) shell.style.pointerEvents = opacity > 0.22 ? "auto" : "none";
  }

  if (globe) {
    const appearStart = compact ? 0.02 : 0.03;
    const appearSpan = compact ? 0.16 : 0.2;
    const g = clamp01((p - appearStart) / appearSpan);
    const ge = g * g * (3 - 2 * g);
    globe.style.opacity = String(ge);
    globe.style.pointerEvents = ge > 0.35 ? "auto" : "none";
  }
}

export function HomeHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const panel1 = useRef<HTMLDivElement>(null);
  const panel3 = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLButtonElement>(null);
  const rewardsRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    setWebgl(hasWebGLSupport());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const progress = useScrollProgress(sectionRef, (p) => {
    const sky = skyLayer.current;
    if (sky) {
      // very slow parallax: it breathes rather than travels
      sky.style.transform = `translate3d(0, ${(-p * 2.5).toFixed(3)}%, 0) scale(${(1.04 + p * 0.03).toFixed(4)})`;
    }

    const set = (node: HTMLDivElement | null, value: number, shift: number) => {
      if (!node) return;
      node.style.opacity = String(clamp01(value));
      node.style.transform = `translate3d(0, ${shift}px, 0)`;
      node.style.pointerEvents = value > 0.6 ? "auto" : "none";
    };

    const a = 1 - clamp01((p - 0.12) / 0.12);
    const c = band(p, 0.62, 0.74, 1.2, 1.4);

    set(panel1.current, a, (1 - a) * 26);
    set(panel3.current, c, (1 - c) * 26);

    if (cueRef.current) {
      const opacity = clamp01(1 - p / 0.08);
      cueRef.current.style.opacity = String(opacity);
      cueRef.current.style.pointerEvents = opacity > 0.2 ? "auto" : "none";
      cueRef.current.tabIndex = opacity > 0.2 ? 0 : -1;
      cueRef.current.setAttribute("aria-hidden", opacity < 0.15 ? "true" : "false");
    }

    applyRewardsGlobeScroll(p, rewardsRef.current, globeRef.current);
  });

  useEffect(() => {
    applyRewardsGlobeScroll(progress.current, rewardsRef.current, globeRef.current);
  });

  useEffect(() => () => stopGlobeJourney(), []);

  const handleScrollTheExperience = () => {
    const hero = sectionRef.current;
    if (hero) playGlobeJourney(hero);
  };

  const handleScrollCueKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleScrollTheExperience();
  };

  const scrollCueContent = (
    <>
      <span className="home-hero-scroll-cue__text">Scroll the experience</span>
      <ChevronDown className="home-hero-scroll-cue__arrow" strokeWidth={1.75} aria-hidden />
    </>
  );

  const afterGlobeCtas = (
    <div className="home-hero-after-globe">
      <GeoButton
        asChild
        variant="solid"
        size="lg"
        className="home-hero-cta home-hero-after-globe__primary w-full px-8 font-bold uppercase tracking-[0.2em]"
      >
        <Link
          to="/play"
          className="flex flex-col items-center leading-none font-cta text-[1.37rem]"
        >
          <span>LET'S PLAY</span>
        </Link>
      </GeoButton>
      <GeoButton
        asChild
        variant="solid"
        size="lg"
        className="home-hero-cta home-hero-after-globe__primary w-full px-8 font-bold uppercase tracking-[0.2em]"
      >
        <Link
          to="/geostore"
          className="flex flex-col items-center leading-none font-cta text-[1.37rem]"
        >
          <span>GSTORE</span>
        </Link>
      </GeoButton>
      <GeoButton
        variant="solid"
        size="lg"
        onClick={() => setDemoOpen(true)}
        className="home-hero-cta home-hero-after-globe__secondary font-bold uppercase tracking-[0.2em]"
      >
        <span className="font-cta">WATCH DEMO</span>
      </GeoButton>
    </div>
  );

  return (
    <>
    <section ref={sectionRef} id="home-hero" className="relative h-dvh w-full overflow-hidden">
      {/* soft bronze bloom behind the globe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--bloom-bronze),transparent_70%)]"
      />

      {webgl ? (
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <div ref={globeRef} className="home-hero-globe">
              <GlobeScene progress={progress} />
            </div>
          </Suspense>
        </ClientOnly>
      ) : null}

      {/* Scroll-synced copy — visible on mobile; desktop placement unchanged. */}
      <div
        ref={panel1}
        className="home-hero-intro pointer-events-none absolute left-5 right-5 z-10 min-w-0 will-change-transform md:inset-x-auto md:left-12 md:right-auto md:max-w-[34rem]"
      >
        <p className="eyebrow">Know Earth</p>
        <h1 className="mt-4 max-w-full break-words font-semibold leading-[1.06] tracking-tight text-foreground text-[clamp(1.9rem,8.2vw,2.45rem)] md:mt-6 md:text-[clamp(2.15rem,5.2vw,4.25rem)] md:leading-[1.03]">
          Discover Earth
          <br />
          Like Never Before
        </h1>
        <p className="mt-5 max-w-lg text-[0.9rem] font-light leading-[1.65] text-foreground/65 md:mt-7 md:text-base md:leading-[1.7]">
          Explore. Play. Create. Earn. From thrilling geography challenges to exclusive fashion
          rewards and creative experiences, your world of discovery starts here.
        </p>
        <div className="home-hero-intro-ctas pointer-events-auto mt-6 hidden w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap md:mt-7 md:flex">
          <GeoButton
            asChild
            variant="solid"
            size="lg"
            className="home-hero-cta w-full px-8 font-bold uppercase tracking-[0.2em] sm:w-auto sm:min-w-36 sm:px-10"
          >
            <Link
              to="/play"
              className="flex flex-col items-center leading-none font-cta text-[1.37rem]"
            >
              <span>LET'S PLAY</span>
            </Link>
          </GeoButton>
          <GeoButton
            asChild
            variant="solid"
            size="lg"
            className="home-hero-cta w-full px-8 font-bold uppercase tracking-[0.2em] sm:w-auto sm:min-w-36 sm:px-10"
          >
            <Link
              to="/geostore"
              className="flex flex-col items-center leading-none font-cta text-[1.37rem]"
            >
              <span>Gstore</span>
            </Link>
          </GeoButton>
        </div>
      </div>

      {SHOW_HOME_REWARDS_CARD ? (
        <div ref={rewardsRef} className="rewards-card-motion">
          <RewardsCard />
        </div>
      ) : null}

      {isPhone ? null : (
        <button
          type="button"
          ref={cueRef}
          className="home-hero-scroll-cue absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
          aria-label="Scroll the experience"
          onClick={handleScrollTheExperience}
          onKeyDown={handleScrollCueKeyDown}
        >
          {scrollCueContent}
        </button>
      )}

      {/* Phone-only CTA column. Must live inside #home-hero so the GSAP pin-spacer
          (end +=170%) is not an empty gap between the globe and the buttons. */}
      {afterGlobeCtas}

      <div
        ref={panel3}
        className="home-hero-expedition pointer-events-none absolute inset-x-6 bottom-20 opacity-0 will-change-transform md:inset-x-auto md:left-12 md:top-1/2 md:bottom-auto md:max-w-[28rem] md:-translate-y-1/2"
      >
        <p className="eyebrow">Begin the journey</p>
        <h2 className="mt-4 font-light leading-[1.05] tracking-tight text-foreground text-[clamp(1.7rem,3.4vw,2.7rem)]">
          Your expedition starts here
        </h2>
        {/* Desktop/tablet only — phones already have LET'S PLAY / GSTORE / WATCH DEMO
            in afterGlobeCtas. Rendering these again overlays the globe as duplicates. */}
        {!isPhone ? (
          <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
            <GeoButton
              asChild
              variant="solid"
              size="lg"
              className="home-hero-cta w-full px-8 font-bold uppercase tracking-[0.2em] sm:w-auto sm:min-w-36 sm:px-10"
            >
              <Link
                to="/play"
                className="flex flex-col items-center leading-none font-cta text-[1.37rem]"
              >
                <span>LET'S PLAY</span>
              </Link>
            </GeoButton>
            <GeoButton
              variant="solid"
              size="lg"
              onClick={() => setDemoOpen(true)}
              className="home-hero-cta w-full px-8 font-bold uppercase tracking-[0.2em] sm:w-auto sm:min-w-36 sm:px-10"
            >
              <span className="font-cta text-[0.7rem]">Watch Demo</span>
            </GeoButton>
          </div>
        ) : null}
      </div>

      <Modal
        open={demoOpen}
        onOpenChange={setDemoOpen}
        title="Demo coming soon"
        description="A guided tour of the GVRZE experience is being produced."
      >
        <div className="mt-2 flex aspect-video items-center justify-center rounded-xl border border-neutral-400/30 bg-neutral-900/5">
          <p className="text-[0.62rem] uppercase tracking-[0.32em] text-neutral-800">
            Preview in production
          </p>
        </div>
      </Modal>

    </section>
    </>
  );
}
