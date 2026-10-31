import { ClientOnly, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

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

/** Fades a panel in over [a,b] and out over [c,d]. */
function band(p: number, a: number, b: number, c: number, d: number) {
  return Math.min(clamp01((p - a) / (b - a)), 1 - clamp01((p - c) / (d - c)));
}

/**
 * Scroll-pinned hero: the globe emerges on the left, dominates the frame and
 * parks on the right while three copy panels hand off to each other.
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
  const exitStart = compact ? 0.02 : 0.04;
  const exitSpan = compact ? 0.22 : 0.32;
  const exit = clamp01((p - exitStart) / exitSpan);
  const t = exit * exit * (3 - 2 * exit);

  if (rewards) {
    const restScale = compact ? 0.7 : 1;
    const x = t * (compact ? 20 : 84);
    const y = t * (compact ? -64 : -148);
    const scale = restScale * (1 - t * (compact ? 0.1 : 0.14));
    const opacity = 1 - t;
    rewards.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    rewards.style.opacity = String(opacity);
    rewards.style.filter = t > 0.04 ? `blur(${(t * 4.5).toFixed(2)}px)` : "blur(0.01px)";
    rewards.style.pointerEvents = opacity > 0.22 ? "auto" : "none";
    rewards.setAttribute("aria-hidden", opacity < 0.15 ? "true" : "false");
    const shell = rewards.querySelector<HTMLElement>(".rewards-card__shell");
    if (shell) shell.style.pointerEvents = opacity > 0.22 ? "auto" : "none";
  }

  if (globe) {
    const appearStart = compact ? 0.04 : 0.08;
    const appearSpan = compact ? 0.24 : 0.3;
    const g = clamp01((p - appearStart) / appearSpan);
    const ge = g * g * (3 - 2 * g);
    globe.style.opacity = String(ge);
    globe.style.pointerEvents = ge > 0.35 ? "auto" : "none";
  }
}

export function HomeHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const panel1 = useRef<HTMLDivElement>(null);
  const panel2 = useRef<HTMLDivElement>(null);
  const panel3 = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const rewardsRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    setWebgl(hasWebGLSupport());
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

    const a = 1 - clamp01((p - 0.2) / 0.14);
    const b = band(p, 0.42, 0.52, 0.6, 0.7);
    const c = band(p, 0.78, 0.9, 1.2, 1.4);

    set(panel1.current, a, (1 - a) * 26);
    set(panel2.current, b, (1 - b) * 26);
    set(panel3.current, c, (1 - c) * 26);

    if (cueRef.current) cueRef.current.style.opacity = String(clamp01(1 - p / 0.12));

    applyRewardsGlobeScroll(p, rewardsRef.current, globeRef.current);
  });

  useEffect(() => {
    applyRewardsGlobeScroll(progress.current, rewardsRef.current, globeRef.current);
  });

  return (
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
        className="home-hero-intro pointer-events-none absolute left-5 right-5 top-[calc(var(--nav-height)+0.85rem)] z-10 min-w-0 will-change-transform md:inset-x-auto md:left-12 md:right-auto md:bottom-auto md:max-w-[34rem] md:top-[calc(var(--nav-height)+1.75rem)]"
      >
        <p className="eyebrow">Know Earth</p>
        <h1 className="mt-4 max-w-full break-words font-semibold leading-[1.06] tracking-tight text-foreground text-[clamp(1.9rem,8.2vw,2.45rem)] md:mt-6 md:text-[clamp(2.15rem,5.2vw,4.25rem)] md:leading-[1.03]">
          Discover Earth
          <br />
          Like Never Before
        </h1>
        <p className="mt-5 max-w-lg text-[0.9rem] font-light leading-[1.65] text-foreground/65 md:mt-7 md:text-base md:leading-[1.7]">
          Explore countries, flags, capitals, maps, cultures, landmarks and geography through
          beautifully designed interactive experiences, quizzes, challenges and a global community.
        </p>
        <div className="home-hero-intro-ctas pointer-events-auto mt-6 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap md:mt-7">
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

      <div
        ref={panel2}
        className="pointer-events-none absolute inset-x-6 bottom-24 opacity-0 will-change-transform max-md:hidden md:inset-x-auto md:left-12 md:top-1/2 md:bottom-auto md:max-w-[30rem] md:-translate-y-1/2"
      >
        <p className="eyebrow">One planet, endless ground to cover</p>
        <h2 className="mt-4 font-light leading-[1.05] tracking-tight text-foreground text-[clamp(1.7rem,3.6vw,2.9rem)]">
          A world made to be explored, not memorised.
        </h2>
      </div>

      <div
        ref={panel3}
        className="pointer-events-none absolute inset-x-6 bottom-20 opacity-0 will-change-transform max-md:hidden md:inset-x-auto md:left-12 md:top-1/2 md:bottom-auto md:max-w-[28rem] md:-translate-y-1/2"
      >
        <p className="eyebrow">Begin the journey</p>
        <h2 className="mt-4 font-light leading-[1.05] tracking-tight text-foreground text-[clamp(1.7rem,3.4vw,2.7rem)]">
          Your expedition starts here
        </h2>
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

      <div
        ref={cueRef}
        aria-hidden
        className="home-hero-scroll-cue pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 max-md:hidden"
      >
        <span className="home-hero-scroll-cue__text">Scroll the experience</span>
        <ChevronDown className="home-hero-scroll-cue__arrow" strokeWidth={1.75} aria-hidden />
      </div>
    </section>
  );
}
