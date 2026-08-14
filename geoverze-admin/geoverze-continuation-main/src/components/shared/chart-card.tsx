import { BarChart3 } from "lucide-react";
import type { ReactNode } from "react";

import { Widget, type WidgetState } from "@/components/shared/widget";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  description?: string | undefined;
  /** Normalized 0-100 series for the built-in placeholder visualization. */
  series?: number[] | undefined;
  labels?: string[] | undefined;
  height?: number | undefined;
  state?: WidgetState | undefined;
  action?: ReactNode | undefined;
  footnote?: string | undefined;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
  /** Render a real chart instead of the placeholder bars. */
  children?: ReactNode | undefined;
}

const defaultSeries = [38, 52, 44, 61, 55, 72, 66, 80, 74, 88, 82, 95];

export function ChartCard({
  title,
  description,
  series = defaultSeries,
  labels,
  height = 200,
  state = "ready",
  action,
  footnote = "Placeholder visualization — wired to live data after backend integration.",
  onRetry,
  className,
  children,
}: ChartCardProps) {
  return (
    <Widget
      title={title}
      description={description}
      state={state}
      onRetry={onRetry}
      bodyMinHeight={height + 40}
      className={className}
      action={action ?? <BarChart3 className="size-4 text-muted-foreground" aria-hidden="true" />}
    >
      {children ?? (
        <>
          <div
            className="flex items-end gap-1.5"
            style={{ height }}
            role="img"
            aria-label={`${title} chart`}
          >
            {series.map((value, index) => (
              <div key={index} className="flex h-full flex-1 flex-col justify-end gap-1.5">
                <div
                  className="rounded-t-sm bg-primary/25 transition-colors hover:bg-primary/45"
                  style={{ height: `${value}%` }}
                />
                {labels?.[index] && (
                  <span className="truncate text-center text-[10px] text-muted-foreground">
                    {labels[index]}
                  </span>
                )}
              </div>
            ))}
          </div>
          {footnote && <p className={cn("mt-3 text-xs text-muted-foreground")}>{footnote}</p>}
        </>
      )}
    </Widget>
  );
}
