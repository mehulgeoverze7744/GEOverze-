import { type LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WidgetState } from "@/components/shared/widget";

export interface StatCardProps {
  label: string;
  value?: string | number | undefined;
  delta?: number | undefined;
  hint?: string | undefined;
  icon?: LucideIcon | undefined;
  state?: WidgetState | undefined;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  state = "ready",
  onClick,
  className,
}: StatCardProps) {
  const flat = delta === undefined || delta === 0;
  const positive = (delta ?? 0) > 0;
  const TrendIcon = flat ? Minus : positive ? TrendingUp : TrendingDown;

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      </div>

      {state === "loading" ? (
        <div className="mt-2 space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      ) : state === "error" ? (
        <>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-muted-foreground">—</p>
          <p className="mt-1 text-xs text-destructive">Failed to load</p>
        </>
      ) : state === "empty" || value === undefined ? (
        <>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-muted-foreground">—</p>
          <p className="mt-1 text-xs text-muted-foreground">No data yet</p>
        </>
      ) : (
        <>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight tabular text-foreground">
            {value}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs">
            {delta !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium tabular",
                  flat ? "text-muted-foreground" : positive ? "text-success" : "text-destructive",
                )}
              >
                <TrendIcon className="size-3" aria-hidden="true" />
                {positive ? "+" : ""}
                {delta}%
              </span>
            )}
            {hint && <span className="truncate text-muted-foreground">{hint}</span>}
          </div>
        </>
      )}
    </>
  );

  const classes = cn(
    "rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-border-strong",
    onClick &&
      "focus-visible:ring-ring/50 cursor-pointer focus-visible:ring-2 focus-visible:outline-none",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} aria-busy={state === "loading"}>
        {body}
      </button>
    );
  }

  return (
    <article className={classes} aria-busy={state === "loading"}>
      {body}
    </article>
  );
}
