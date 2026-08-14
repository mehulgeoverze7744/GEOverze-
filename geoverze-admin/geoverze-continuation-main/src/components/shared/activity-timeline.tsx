interface TimelineEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export function ActivityTimeline({
  events,
  title = "Recent activity",
}: {
  events: TimelineEvent[];
  title?: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <ol className="mt-4 space-y-4">
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
              <p className="text-xs text-muted-foreground tabular">{event.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
