import { memo } from "react";

import { BrandMark } from "@/components/shared/BrandMark";

/**
 * Animated hero illustration placeholder: concentric bronze orbits drifting at
 * different speeds around the emblem. CSS + SVG only — the 3D globe stays on Home.
 */
export const OrbitalMark = memo(function OrbitalMark() {
  return (
    <div
      aria-hidden
      className="relative flex aspect-square w-full max-w-[26rem] items-center justify-center"
    >
      <div
        className="absolute inset-0 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--bronze) 16%, transparent) 0%, transparent 62%)",
        }}
      />

      {[
        { inset: "6%", duration: "48s", dash: "2 10", opacity: 0.5 },
        { inset: "18%", duration: "34s", dash: "1 14", opacity: 0.4 },
        { inset: "30%", duration: "26s", dash: "3 8", opacity: 0.32 },
      ].map((ring, i) => (
        <svg
          key={ring.inset}
          viewBox="0 0 100 100"
          className="absolute animate-spin motion-reduce:animate-none"
          style={{
            inset: ring.inset,
            animationDuration: ring.duration,
            animationTimingFunction: "linear",
            animationDirection: i % 2 ? "reverse" : "normal",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="var(--bronze)"
            strokeWidth="0.4"
            strokeDasharray={ring.dash}
            opacity={ring.opacity}
          />
        </svg>
      ))}

      <div
        className="absolute rounded-full border border-bronze/25"
        style={{ inset: "40%", boxShadow: "var(--glow-bronze)" }}
      />

      <span className="relative flex aspect-square w-[76%] items-center justify-center">
        <BrandMark size="fill" />
      </span>
    </div>
  );
});
