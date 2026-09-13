import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StoreSummaryCardProps = {
  label: string;
  value: ReactNode;
  footer?: ReactNode;
  icon: LucideIcon;
  /** Stronger bronze accent — used for Credit Balance. */
  featured?: boolean;
};

/** Premium GEOstore stat tile shared by Credit Balance, Catalogue and Free Shipping. */
export function StoreSummaryCard({
  label,
  value,
  footer,
  icon: Icon,
  featured = false,
}: StoreSummaryCardProps) {
  return (
    <div
      className={cn(
        "group relative flex h-full min-h-[9.5rem] flex-col overflow-hidden rounded-2xl border p-6 transition-all motion-base hover:-translate-y-0.5 hover:shadow-[var(--glow-bronze)] motion-reduce:hover:translate-y-0",
        featured
          ? "border-bronze/35 bg-charcoal/60 hover:border-bronze/50"
          : "border-bronze/18 bg-charcoal/48 hover:border-bronze/38",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-70 transition-opacity motion-base group-hover:opacity-100",
          featured
            ? "bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.09_65/0.14),transparent_58%)]"
            : "bg-[radial-gradient(circle_at_top_left,oklch(0.72_0.07_65/0.08),transparent_55%)]",
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bronze/35 to-transparent"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-foreground/55">
          {label}
        </p>
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors motion-base",
            featured
              ? "border-bronze/40 bg-bronze/12 text-bronze-glow group-hover:border-bronze/55 group-hover:bg-bronze/16"
              : "border-bronze/22 bg-bronze/8 text-bronze/90 group-hover:border-bronze/40 group-hover:text-bronze-glow",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden />
        </span>
      </div>

      <p
        className={cn(
          "relative mt-4 text-3xl font-light tracking-tight md:text-[2rem]",
          featured ? "text-bronze-glow" : "text-foreground",
        )}
      >
        {value}
      </p>

      {footer ? <div className="relative mt-auto pt-4">{footer}</div> : null}
    </div>
  );
}
