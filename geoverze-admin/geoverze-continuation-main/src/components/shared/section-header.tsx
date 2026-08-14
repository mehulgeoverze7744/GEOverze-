import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
  /** Renders the heading at the requested level for correct document outline. */
  as?: "h2" | "h3" | undefined;
  className?: string | undefined;
}

export function SectionHeader({
  title,
  description,
  actions,
  as: Heading = "h2",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <Heading className="truncate text-sm font-semibold tracking-tight text-foreground">
          {title}
        </Heading>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
