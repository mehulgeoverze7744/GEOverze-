import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { StudioPanel } from "./StudioPanel";
import { Sparkline } from "./Sparkline";
import type { SeriesPoint } from "../data/types";

/** Single metric tile: value, delta, optional sparkline. */
export function MetricTile({
  label,
  value,
  deltaPercent,
  series,
  hint,
  className,
}: {
  label: string;
  value: string;
  deltaPercent?: number;
  series?: SeriesPoint[];
  hint?: string;
  className?: string;
}) {
  const up = (deltaPercent ?? 0) >= 0;

  return (
    <StudioPanel className={cn("flex flex-col justify-between", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-foreground/50">{label}</p>
        {deltaPercent !== undefined ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-medium",
              up
                ? "bg-[oklch(0.72_0.13_150/0.14)] text-[oklch(0.86_0.12_150)]"
                : "bg-[oklch(0.66_0.18_20/0.14)] text-[oklch(0.84_0.15_25)]",
            )}
          >
            {up ? (
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.2} aria-hidden />
            ) : (
              <ArrowDownRight className="h-3 w-3" strokeWidth={2.2} aria-hidden />
            )}
            {Math.abs(deltaPercent).toFixed(1)}%
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-[1.7rem] font-semibold leading-none tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[0.75rem] text-foreground/50">{hint}</p> : null}
      {series ? <Sparkline points={series} className="mt-4" /> : null}
    </StudioPanel>
  );
}
