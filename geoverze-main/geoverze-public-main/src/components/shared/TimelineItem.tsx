import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Single entry on a vertical bronze timeline (quiz history, activity feeds). */
export function TimelineItem({
  icon: Icon,
  title,
  meta,
  children,
  last = false,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  meta?: string;
  children?: ReactNode;
  /** Hides the connecting rail on the final item. */
  last?: boolean;
  className?: string;
}) {
  return (
    <li className={cn("relative flex gap-4 pb-6 last:pb-0", className)}>
      {!last ? (
        <span
          aria-hidden="true"
          className="absolute left-[0.9375rem] top-9 bottom-0 w-px bg-gradient-to-b from-bronze/30 to-transparent"
        />
      ) : null}
      <span className="relative z-10 mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-bronze/25 bg-charcoal/70 text-bronze">
        {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-sm font-light text-foreground/85">{title}</p>
          {meta ? <p className="text-[0.68rem] tracking-wide text-foreground/50">{meta}</p> : null}
        </div>
        {children ? <div className="mt-2 text-xs text-foreground/50">{children}</div> : null}
      </div>
    </li>
  );
}
