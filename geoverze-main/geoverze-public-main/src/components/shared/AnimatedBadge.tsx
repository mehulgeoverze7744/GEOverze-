import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Bronze pill used for statuses, phase labels and "new" markers.
 * `pulse` adds a slow breathing dot — reserved for live/announcement states.
 */
export function AnimatedBadge({
  children,
  icon: Icon,
  pulse = false,
  className,
}: {
  children: ReactNode;
  icon?: LucideIcon;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "brand-sheen inline-flex items-center gap-2 rounded-full border border-bronze/30 bg-bronze/10 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-bronze",
        className,
      )}
    >
      {pulse ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bronze/70 motion-reduce:animate-none" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-bronze" />
        </span>
      ) : null}
      {Icon ? <Icon className="h-3 w-3" strokeWidth={1.6} /> : null}
      {children}
    </span>
  );
}
