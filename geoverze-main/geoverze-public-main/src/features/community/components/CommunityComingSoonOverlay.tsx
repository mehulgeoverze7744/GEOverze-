import { useEffect, useRef } from "react";
import { BookOpen, Flag, Globe, Users } from "lucide-react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Globe, label: "Discuss" },
  { icon: Users, label: "Connect" },
  { icon: BookOpen, label: "Learn" },
  { icon: Flag, label: "Explore" },
] as const;

function CompassStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={cn("h-3 w-3 shrink-0 text-bronze-glow", className)}
    >
      <path
        d="M8 1.5 9.1 6.9 14.5 8 9.1 9.1 8 14.5 6.9 9.1 1.5 8 6.9 6.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Full-viewport preview lock for Community. Captures pointer input while
 * forwarding wheel/touch scroll to the document so the underlying UI stays
 * scrollable but non-interactive.
 */
export function CommunityComingSoonOverlay() {
  const layerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      window.scrollBy({ top: event.deltaY, left: event.deltaX });
      event.preventDefault();
    };

    let touchStartY = 0;

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - y;
      touchStartY = y;
      window.scrollBy({ top: delta });
      event.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      role="region"
      aria-label="Community coming soon"
      className={cn(
        "pointer-events-auto fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden px-5 pb-[6vh] pt-[8vh] sm:px-6",
        !reducedMotion && "animate-in fade-in duration-700",
      )}
    >
      {/* Cinematic vertical gradient — transparent top → deep-space bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 backdrop-blur-[2px]"
        style={{
          background: `
            linear-gradient(
              to bottom,
              oklch(0.06 0.004 60 / 0) 0%,
              oklch(0.06 0.004 60 / 0.08) 12%,
              oklch(0.06 0.004 60 / 0.22) 28%,
              oklch(0.06 0.004 60 / 0.48) 48%,
              oklch(0.06 0.004 60 / 0.68) 65%,
              oklch(0.06 0.004 60 / 0.82) 78%,
              oklch(0.06 0.004 60 / 0.92) 90%,
              oklch(0.04 0.003 60 / 0.97) 100%
            )
          `,
        }}
      />

      {/* Bronze atmospheric glow + soft vignette */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 community-lock-glow motion-reduce:animate-none",
        )}
        style={{
          background: `
            radial-gradient(
              ellipse 70% 55% at 50% 44%,
              color-mix(in oklab, var(--bronze) 18%, transparent) 0%,
              color-mix(in oklab, var(--bronze) 8%, transparent) 35%,
              transparent 68%
            ),
            radial-gradient(
              ellipse 120% 80% at 50% 100%,
              oklch(0.04 0.003 60 / 0.55) 0%,
              transparent 55%
            )
          `,
        }}
      />

      {/* Frosted glass sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--charcoal) 25%, transparent) 45%, color-mix(in oklab, var(--charcoal) 55%, transparent) 100%)",
        }}
      />

      {/* Center composition */}
      <div
        className={cn(
          "pointer-events-none relative z-10 flex w-full max-w-3xl flex-col items-center text-center",
          !reducedMotion && "animate-in fade-in slide-in-from-bottom-3 duration-1000 fill-mode-both",
        )}
      >
        <div
          aria-hidden
          className="h-[5.5rem] w-[5.5rem] shrink-0 sm:h-[6.5rem] sm:w-[6.5rem] md:h-[7.25rem] md:w-[7.25rem]"
        />

        <p className="mt-7 text-[0.58rem] uppercase tracking-[0.42em] text-foreground/75 sm:text-[0.62rem] sm:tracking-[0.48em]">
          GEOverze Community
        </p>

        <h1
          className={cn(
            "mt-4 font-bold uppercase leading-[0.95] tracking-[0.12em] text-gradient-bronze",
            "text-[clamp(2.75rem,11vw,5.75rem)]",
            "[text-shadow:0_0_48px_color-mix(in_oklab,var(--bronze-glow)_42%,transparent),0_4px_28px_rgba(0,0,0,0.55),0_1px_0_color-mix(in_oklab,var(--bronze-glow)_25%,transparent)]",
            !reducedMotion && "community-lock-heading motion-reduce:animate-none",
          )}
        >
          Coming Soon
        </h1>

        <div className="mt-6 space-y-1 text-[0.9rem] leading-relaxed text-foreground/72 sm:text-base">
          <p>The GEOverze community is taking shape.</p>
          <p>Stay tuned.</p>
        </div>

        {/* Bronze divider with compass star */}
        <div
          aria-hidden
          className="mt-8 flex w-full max-w-md items-center gap-3 px-4 sm:max-w-lg"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-bronze/45 to-bronze/55" />
          <CompassStar />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-bronze/45 to-bronze/55" />
        </div>

        {/* Feature labels — decorative only */}
        <div className="mt-8 hidden items-center justify-center sm:flex">
          {FEATURES.map((feature, index) => (
            <div key={feature.label} className="flex items-center">
              {index > 0 ? (
                <div aria-hidden className="mx-4 h-9 w-px bg-bronze/20 md:mx-5" />
              ) : null}
              <div className="flex min-w-[5.5rem] flex-col items-center gap-2 px-2">
                <feature.icon
                  aria-hidden
                  className="h-[1.05rem] w-[1.05rem] text-bronze/85"
                  strokeWidth={1.5}
                />
                <span className="text-[0.62rem] uppercase tracking-[0.32em] text-bronze/80">
                  {feature.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:hidden">
          {FEATURES.map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-2">
              <feature.icon
                aria-hidden
                className="h-4 w-4 text-bronze/85"
                strokeWidth={1.5}
              />
              <span className="text-[0.58rem] uppercase tracking-[0.28em] text-bronze/80">
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-md text-[0.58rem] uppercase tracking-[0.38em] text-foreground/42 sm:mt-12 sm:text-[0.62rem] sm:tracking-[0.44em]">
          Same Planet. Brighter Minds.
        </p>
      </div>
    </div>
  );
}
