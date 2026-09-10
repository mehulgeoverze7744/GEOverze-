import { memo } from "react";

import { BrandMark } from "@/components/shared/BrandMark";

/**
 * Hero illustration: emblem with a single bronze orbit ring.
 * CSS + SVG only — the 3D globe stays on Home.
 */
export const OrbitalMark = memo(function OrbitalMark() {
  return (
    <div
      aria-hidden
      className="relative flex aspect-square w-full max-w-[22rem] items-center justify-center md:max-w-[24rem]"
    >
      <div
        className="absolute inset-0 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--bronze) 16%, transparent) 0%, transparent 62%)",
        }}
      />

      <svg
        viewBox="0 0 100 100"
        className="absolute inset-[8%] animate-spin motion-reduce:animate-none"
        style={{ animationDuration: "42s", animationTimingFunction: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="var(--bronze)"
          strokeWidth="0.45"
          strokeDasharray="2 10"
          opacity={0.42}
        />
      </svg>

      <div
        className="absolute rounded-full border border-bronze/30"
        style={{ inset: "18%", boxShadow: "var(--glow-bronze)" }}
      />

      <span className="relative flex aspect-square w-[72%] items-center justify-center">
        <BrandMark size="fill" />
      </span>
    </div>
  );
});
