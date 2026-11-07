import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { skyLayer } from "./skyLayer";

/**
 * Shared page backdrop layer.
 *
 * The old starfield photograph is retired. This node is a light plate by
 * default so the first paint matches the GVRZE theme. Individual routes may
 * still paint a legitimate section image onto the inner layer (Let's Play,
 * Library) without flashing galaxy art first.
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
      id="geoverze-universe-background"
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f5f6f8]",
        className,
      )}
    >
      <div
        ref={ref}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      />
    </div>
  );
}
