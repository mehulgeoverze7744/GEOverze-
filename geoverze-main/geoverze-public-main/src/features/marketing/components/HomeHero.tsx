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

/**
 * Temporary homepage hide. RewardsCard and its styles stay in the tree;
 * set this to true to show the card again.
 */
const SHOW_HOME_REWARDS_CARD = false;

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
export function HomeHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const panel1 = useRef<HTMLDivElement>(null);
  const panel2 = useRef<HTMLDivElement>(null);
  const panel3 = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
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
            <GlobeScene progress={progress} />
          </Suspense>
        </ClientOnly>
      ) : null}

      {SHOW_HOME_REWARDS_CARD ? <RewardsCard scrollProgress={progress} /> : null}

      {/* Scroll-synced copy */}
      <div
        ref={panel1}
        className="pointer-events-none absolute inset-x-6 bottom-24 will-change-transform max-md:hidden md:inset-x-auto md:left-12 md:bottom-auto md:max-w-[34rem] md:top-[calc(var(--nav-height)+1.75rem)]"
      >
        <p className="eyebrow">Know Earth</p>
        <h1 className="mt-6 font-semibold leading-[1.03] tracking-tight text-foreground text-[clamp(2.15rem,5.2vw,4.25rem)]">
          Discover Earth
          <br />
          Like Never Before
        </h1>
        <p className="mt-7 max-w-lg text-[0.9375rem] font-light leading-[1.7] text-foreground/65 md:text-base">
          Explore countries, flags, capitals, maps, cultures, landmarks and geography through
          beautifully designed interactive experiences, quizzes, challenges and a global community.
        </p>
      </div>

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
        <div className="mt-2 flex aspect-video items-center justify-center rounded-xl border border-bronze/20 bg-bronze/5">
          <p className="text-[0.62rem] uppercase tracking-[0.32em] text-bronze/90">
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
