import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Solid game-lobby card. Deliberately not glass: opaque fill, clean hairline
 * border, soft shadow, fast hover lift with a bronze accent edge.
 */
export function GameCard({
  className,
  children,
  interactive = true,
  raised = false,
  ...props
}: ComponentProps<"div"> & { children?: ReactNode; interactive?: boolean; raised?: boolean }) {
  return (
    <div
      className={cn(
        raised ? "game-surface-raised" : "game-surface",
        "overflow-hidden rounded-2xl",
        interactive && "game-lift",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
