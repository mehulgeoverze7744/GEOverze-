import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Lifecycle state every dashboard widget understands. */
export type WidgetState = "loading" | "ready" | "empty" | "error";

export interface WidgetProps {
  title?: string | undefined;
  description?: string | undefined;
  /** Rendered at the top-right of the widget header. */
  action?: ReactNode | undefined;
  state?: WidgetState | undefined;
  /** Minimum body height so state swaps don't shift layout. */
  bodyMinHeight?: number | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  errorTitle?: string | undefined;
  errorDescription?: string | undefined;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
  contentClassName?: string | undefined;
  /** Removes the default body padding (tables, lists render edge-to-edge). */
  flush?: boolean | undefined;
  children?: ReactNode | undefined;
}

export function Widget({
  title,
  description,
  action,
  state = "ready",
  bodyMinHeight,
  emptyTitle = "Nothing to show yet",
  emptyDescription = "Data will appear here once activity is recorded.",
  errorTitle = "Couldn't load this widget",
  errorDescription = "Something went wrong while fetching data.",
  onRetry,
  className,
  contentClassName,
  flush,
  children,
}: WidgetProps) {
  return (
    <section
      aria-busy={state === "loading"}
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card transition-colors",
        className,
      )}
    >
      {(title || action) && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>}
            {description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div className="flex shrink-0 items-center gap-1.5">{action}</div>}
        </div>
      )}

      <div
        className={cn("flex-1", !flush && "p-4", contentClassName)}
        style={bodyMinHeight ? { minHeight: bodyMinHeight } : undefined}
      >
        {state === "loading" && <WidgetSkeleton />}

        {state === "empty" && (
          <WidgetMessage
            icon={<Inbox className="size-4 text-muted-foreground" aria-hidden="true" />}
            title={emptyTitle}
            description={emptyDescription}
          />
        )}

        {state === "error" && (
          <WidgetMessage
            tone="danger"
            icon={<AlertTriangle className="size-4 text-destructive" aria-hidden="true" />}
            title={errorTitle}
            description={errorDescription}
            action={
              onRetry ? (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              ) : undefined
            }
          />
        )}

        {state === "ready" && children}
      </div>
    </section>
  );
}

export function WidgetSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" role="status" aria-label="Loading">
      <Skeleton className="h-3.5 w-1/3" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

function WidgetMessage({
  icon,
  title,
  description,
  action,
  tone = "muted",
}: {
  icon: ReactNode;
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
  tone?: "muted" | "danger";
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 py-6 text-center">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-md border",
          tone === "danger" ? "border-destructive/40 bg-destructive/10" : "border-border bg-muted",
        )}
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-xs text-xs text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
