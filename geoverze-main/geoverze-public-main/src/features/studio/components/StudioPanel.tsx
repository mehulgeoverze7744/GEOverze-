import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Studio work surface. Quieter than the game cards and lighter on glass:
 * this is professional software, so the panel reads as a document, not a prize.
 */
export function StudioPanel({
  className,
  children,
  padded = true,
  ...props
}: ComponentProps<"div"> & { children?: ReactNode; padded?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#e2e8f0] bg-white shadow-[0_10px_28px_-22px_rgb(17_24_39_/_0.28)]",
        padded && "p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Panel header with an optional action slot. */
export function StudioPanelHeader({
  title,
  hint,
  action,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-[0.95rem] font-semibold tracking-tight text-foreground">{title}</h2>
        {hint ? <p className="mt-1 text-[0.78rem] text-foreground/50">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
