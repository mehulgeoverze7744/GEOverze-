import { Sparkles } from "lucide-react";

import { UPCOMING_EVENTS } from "@/features/dashboard/data/dashboard";
import { cn } from "@/lib/utils";

/** Vertical timeline of upcoming GEOverze events. */
export function UpcomingEventsPanel({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="upcoming-events-heading"
    >
      <h2
        id="upcoming-events-heading"
        className="dashboard-section-label flex items-center gap-2"
      >
        <Sparkles className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
        Upcoming in GEOverze
      </h2>

      <ol className="dashboard-timeline mt-6 list-none space-y-0">
        {UPCOMING_EVENTS.map((event, index) => {
          const Icon = event.icon;
          const isLast = index === UPCOMING_EVENTS.length - 1;

          return (
            <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span
                  className="absolute left-[17px] top-9 bottom-0 w-px bg-bronze/15"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className="relative z-[1] inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 text-bronze"
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" strokeWidth={1.4} />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm text-foreground/90">{event.title}</p>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-bronze/85">
                  {event.when}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-foreground/50">
                  {event.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
