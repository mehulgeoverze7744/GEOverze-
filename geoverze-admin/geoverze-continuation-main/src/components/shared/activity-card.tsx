import type { ReactNode } from "react";

import { Widget, type WidgetState } from "@/components/shared/widget";

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  meta?: string | undefined;
}

export interface ActivityCardProps {
  events: ActivityEvent[];
  title?: string | undefined;
  description?: string | undefined;
  state?: WidgetState | undefined;
  action?: ReactNode | undefined;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
}

export function ActivityCard({
  events,
  title = "Recent activity",
  description,
  state,
  action,
  onRetry,
  className,
}: ActivityCardProps) {
  const resolved: WidgetState = state ?? (events.length === 0 ? "empty" : "ready");

  return (
    <Widget
      title={title}
      description={description}
      state={resolved}
      action={action}
      onRetry={onRetry}
      className={className}
      emptyTitle="No activity yet"
      emptyDescription="Administrative actions across the platform will show up here."
    >
      <ol className="space-y-3.5">
        {events.map((event) => (
          <li key={event.id} className="relative flex gap-3 pl-4">
            <span
              className="absolute top-1.5 left-0 size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">
                <span className="font-medium">{event.actor}</span> {event.action}{" "}
                <span className="text-muted-foreground">{event.target}</span>
              </p>
              <p className="text-xs text-muted-foreground tabular">
                {event.time}
                {event.meta ? ` · ${event.meta}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Widget>
  );
}
