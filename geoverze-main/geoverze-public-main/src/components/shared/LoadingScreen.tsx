import { cn } from "@/lib/utils";

/**
 * Full-screen planetary loading screen.
 *
 * The GVRZE wordmark sits at the centre; a small realistic planet orbits it
 * along a subtle elliptical path using SVG animateMotion (pure CSS/SVG, zero
 * extra dependencies). The SVG is rendered first in DOM order so it stacks
 * behind the wordmark — the planet briefly disappears behind the letters at
 * the front of the orbit, reinforcing the 3-D depth illusion.
 *
 * Used as `defaultPendingComponent` by the TanStack Router (router.tsx).
 */
export function LoadingScreen({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "gvrze-ldr-root flex min-h-screen w-full items-center justify-center bg-white",
        className,
      )}
    >
      {/* ─── keyframe definitions (scoped via class prefix) ─────────────────── */}
      <style>{`
        @keyframes gvrze-ldr-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .gvrze-ldr-root {
          animation: gvrze-ldr-fadein 0.55s ease both;
        }
        /* Respect user reduced-motion preference */
        @media (prefers-reduced-motion: reduce) {
          .gvrze-ldr-root  { animation: none !important; }
          .gvrze-ldr-orbit { display: none !important; }
        }
      `}</style>

      {/* ─── centred layout container ────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center">

        {/*
         * ── Orbital SVG ─────────────────────────────────────────────────────
         * Rendered BEFORE the wordmark img in the DOM, so it naturally stacks
         * behind it (same stacking context, earlier source-order = lower paint).
         * The planet briefly passing behind the letters gives convincing depth.
         */}
        <svg
          viewBox="0 0 260 108"
          width="260"
          height="108"
          aria-hidden="true"
          className="gvrze-ldr-orbit pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/*
             * Four stacked radial-gradients simulate a realistic lit sphere:
             *   g1  base colour — ocean-blue sphere, lit from top-left
             *   g2  atmospheric rim — faint blue halo at the edge
             *   g3  shadow overlay — darkens the bottom-right quarter
             *   g4  specular highlight — tiny catchlight top-left
             */}
            <radialGradient id="gvrze-ldr-g1" cx="38%" cy="30%" r="68%">
              <stop offset="0%"   stopColor="#d8eef8" />
              <stop offset="20%"  stopColor="#8ec8e8" />
              <stop offset="48%"  stopColor="#4292b8" />
              <stop offset="78%"  stopColor="#1a5070" />
              <stop offset="100%" stopColor="#081c2a" />
            </radialGradient>

            <radialGradient id="gvrze-ldr-g2" cx="50%" cy="50%" r="50%">
              <stop offset="70%"  stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(80,180,255,0.17)" />
            </radialGradient>

            <radialGradient id="gvrze-ldr-g3" cx="68%" cy="70%" r="50%">
              <stop offset="0%"   stopColor="rgba(4,12,24,0.38)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <radialGradient id="gvrze-ldr-g4" cx="28%" cy="22%" r="26%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.54)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Orbital ellipse — the visible track (barely-there light grey) */}
          <ellipse
            id="gvrze-ldr-path"
            cx="130" cy="54"
            rx="118" ry="37"
            fill="none"
            stroke="rgba(0,0,0,0.065)"
            strokeWidth="0.75"
          />

          {/*
           * Planet — four circles share the same animateMotion so they move
           * as a single unit along the ellipse. calcMode="linear" gives a
           * constant angular speed; rotate="0" keeps the sphere upright.
           */}
          <g>
            <animateMotion
              dur="5.5s"
              repeatCount="indefinite"
              calcMode="linear"
              rotate="0"
            >
              <mpath href="#gvrze-ldr-path" />
            </animateMotion>

            {/* base sphere */}
            <circle r="8.5" fill="url(#gvrze-ldr-g1)" />
            {/* atmospheric rim */}
            <circle r="8.5" fill="url(#gvrze-ldr-g2)" />
            {/* terminator shadow */}
            <circle r="8.5" fill="url(#gvrze-ldr-g3)" />
            {/* specular highlight */}
            <circle r="8.5" fill="url(#gvrze-ldr-g4)" />
          </g>
        </svg>

        {/*
         * ── GVRZE wordmark ──────────────────────────────────────────────────
         * Stacks IN FRONT of the SVG by virtue of later DOM order.
         * Uses the same PNG asset as the Gstore storefront nav so it is
         * always identical to the rest of the site — not a recreation.
         */}
        <img
          src="/assets/gvrze-storefront/gvrze-logo.png"
          alt="GVRZE"
          width={581}
          height={85}
          draggable={false}
          className="relative block select-none"
          style={{ width: 174, height: "auto" }}
        />
      </div>
    </div>
  );
}
