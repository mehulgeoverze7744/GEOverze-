import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import spaceAsset from "@/assets/deep-space.jpg";
import { skyLayer } from "./skyLayer";

/**
 * Shared, app-wide starfield. Rendered once by the root layout so every route
 * feels like a different room inside the same universe.
 */

export function UniverseBackground({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    skyLayer.current = node;
    return () => {
      if (skyLayer.current === node) skyLayer.current = null;
    };
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background",
        className,
      )}
    >
      <div
        ref={ref}
        className="absolute inset-0 scale-[1.04] bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: `url(${spaceAsset})`,
          filter: "brightness(0.62) saturate(0.5) contrast(1.06)",
        }}
      />
      {/* dark overlay so the sky never competes with foreground content */}
      <div className="absolute inset-0 bg-background/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0_0_0/0)_0%,oklch(0_0_0/0.35)_70%,oklch(0_0_0/0.6)_100%)]" />
      {/* film grain */}
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
