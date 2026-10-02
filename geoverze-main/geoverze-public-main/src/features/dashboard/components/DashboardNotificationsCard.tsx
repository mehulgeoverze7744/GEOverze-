import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { useNotificationsStore } from "@/stores/notificationsStore";
import { cn } from "@/lib/utils";

/** Surfaces existing notification store items — does not seed examples. */
export function DashboardNotificationsCard({ className }: { className?: string }) {
  const items = useNotificationsStore((s) => s.items);
  const latest = [...items].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-2xl border border-bronze/16 bg-charcoal/30 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="dashboard-notifications-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="dashboard-notifications-heading"
          className="dashboard-section-label flex items-center gap-2"
        >
          <Bell className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
          Notifications
        </h2>
        <Link
          to="/notifications"
          className="text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90 transition-colors hover:text-bronze"
        >
          All
        </Link>
      </div>

      {latest.length === 0 ? (
        <p className="mt-5 flex-1 text-sm leading-relaxed text-foreground/50">
          No account notices yet. New rewards and expedition alerts will land here.
        </p>
      ) : (
        <ul className="mt-5 flex-1 space-y-3">
          {latest.map((item) => (
            <li key={item.id} className="min-w-0">
              <p className="truncate text-sm text-foreground/85">{item.title}</p>
              {item.body ? (
                <p className="mt-0.5 line-clamp-2 text-[0.68rem] text-foreground/45">{item.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
