import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Glassmorphic surface used for every panel across the platform. */
export function GlassCard({
  className,
  children,
  strong = false,
  interactive = false,
  ...props
}: ComponentProps<"div"> & {
  children?: ReactNode;
  strong?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        strong ? "glass-panel-strong" : "glass-panel",
        "rounded-2xl surface-gradient",
        interactive &&
          "transition-all motion-base hover:-translate-y-1 hover:border-bronze/40 hover:shadow-[var(--glow-bronze)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
