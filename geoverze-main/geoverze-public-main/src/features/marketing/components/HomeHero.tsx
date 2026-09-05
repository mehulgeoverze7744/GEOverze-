import { ClientOnly, Link } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

import { useScrollProgress } from "@/components/geoverze/useScrollProgress";
import { skyLayer } from "@/components/layout/skyLayer";
import { BrandMark, GeoButton, Modal } from "@/components/shared";
import { hasWebGLSupport } from "@/lib/webgl";

/** The 3D scene is the only heavy chunk in the app and stays lazily loaded. */
const GlobeScene = lazy(() => import("@/components/geoverze/GlobeScene"));

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Fades a panel in over [a,b] and out over [c,d]. */
function band(p: number, a: number, b: number, c: number, d: number) {
  return Math.min(clamp01((p - a) / (b - a)), 1 - clamp01((p - c) / (d - c)));
}

/**
 * Scroll-pinned hero: the bronze globe emerges from the emblem, dominates the
 * frame and parks on the right while three copy panels hand off to each other.
 *
 * All scroll-driven work is written imperatively to the DOM from a single rAF
 * flush — the component itself never re-renders while scrolling.
 */
export function HomeHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const panel1 = useRef<HTMLDivElement>(null);
  const panel2 = useRef<HTMLDivElement>(null);
  const panel3 = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const [webgl, setWebgl] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const webglRef = useRef(true);

  // Without WebGL there is no globe to hand off to, so the emblem stays put.
  useEffect(() => {
    const supported = hasWebGLSupport();
    webglRef.current = supported;
    setWebgl(supported);
  }, []);

  const progress = useScrollProgress(sectionRef, (p) => {
    const sky = skyLayer.current;
    if (sky) {
      // very slow parallax: it breathes rather than travels
      sky.style.transform = `translate3d(0, ${(-p * 2.5).toFixed(3)}%, 0) scale(${(1.04 + p * 0.03).toFixed(4)})`;
    }

    const el = emblemRef.current;
    if (el && webglRef.current) {
      const t = clamp01((p - 0.05) / 0.25);
      el.style.opacity = String(1 - t * 0.85);
      el.style.transform = `scale(${1 - t * 0.62})`;
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
    <section ref={sectionRef} className="relative h-dvh w-full overflow-hidden">
      {/* soft bronze bloom behind the globe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--bloom-bronze),transparent_70%)]"
      />

      {/* Hero emblem the globe emerges from */}
      <div
        ref={emblemRef}
        aria-hidden
        className="pointer-events-none absolute left-6 top-[92px] z-10 h-[104px] w-[104px] origin-top-left will-change-transform md:left-12 md:top-[108px] md:h-[150px] md:w-[150px]"
      >
        <BrandMark size="fill" sheen={false} className="h-full w-full" />
      </div>

      {webgl ? (
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <GlobeScene progress={progress} />
          </Suspense>
        </ClientOnly>
      ) : null}

      {/* Scroll-synced copy */}
      <div
        ref={panel1}
        className="pointer-events-none absolute inset-x-6 bottom-24 will-change-transform md:inset-x-auto md:left-12 md:bottom-auto md:max-w-[34rem] md:top-[calc(108px+150px+1.5rem)]"
      >
        <p className="eyebrow">Know Earth</p>
        <h1 className="mt-4 font-light leading-[0.98] tracking-tight text-foreground text-[clamp(2.2rem,5.4vw,4.4rem)]">
          Discover Earth
          <br />
          Like Never Before
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-foreground/60 md:text-base">
          Explore countries, flags, capitals, maps, cultures, landmarks and geography through
          beautifully designed interactive experiences, quizzes, challenges and a global community.
        </p>
      </div>

      <div
        ref={panel2}
        className="pointer-events-none absolute inset-x-6 bottom-24 opacity-0 will-change-transform md:inset-x-auto md:left-12 md:top-1/2 md:bottom-auto md:max-w-[30rem] md:-translate-y-1/2"
      >
        <p className="eyebrow">One planet, endless ground to cover</p>
        <h2 className="mt-4 font-light leading-[1.05] tracking-tight text-foreground text-[clamp(1.7rem,3.6vw,2.9rem)]">
          A world made to be explored, not memorised.
        </h2>
      </div>

      <div
        ref={panel3}
        className="pointer-events-none absolute inset-x-6 bottom-20 opacity-0 will-change-transform md:inset-x-auto md:left-12 md:top-1/2 md:bottom-auto md:max-w-[28rem] md:-translate-y-1/2"
      >
        <p className="eyebrow">Begin the journey</p>
        <h2 className="mt-4 font-light leading-[1.05] tracking-tight text-foreground text-[clamp(1.7rem,3.4vw,2.7rem)]">
          Your expedition starts here
        </h2>
        <div className="mt-7 flex flex-wrap gap-3">
          <GeoButton
            asChild
            variant="solid"
            size="lg"
            className="min-w-40 px-10 font-bold uppercase tracking-[0.2em]"
          >
            <Link to="/play" className="flex flex-col items-center leading-none font-cta text-[1.37rem]">
              <span>LET'S PLAY</span>
            </Link>
          </GeoButton>
          <GeoButton
            variant="solid"
            size="lg"
            onClick={() => setDemoOpen(true)}
            className="min-w-40 px-10 font-bold uppercase tracking-[0.2em]"
          >
            <span className="font-cta text-[0.7rem]">Watch Demo</span>
          </GeoButton>
        </div>
      </div>

      <Modal
        open={demoOpen}
        onOpenChange={setDemoOpen}
        title="Demo coming soon"
        description="A guided tour of the GEOverze experience is being produced."
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
        className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.62rem] uppercase tracking-[0.4em] text-foreground/50"
      >
        Scroll
      </div>
    </section>
  );
}
