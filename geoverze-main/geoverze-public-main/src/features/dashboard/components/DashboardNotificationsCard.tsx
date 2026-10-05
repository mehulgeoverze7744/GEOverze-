import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { useNotificationsStore } from "@/stores/notificationsStore";
import { cn } from "@/lib/utils";

/** Surfaces existing notification store items — does not seed examples. */
export function DashboardNotificationsCard({ className }: { className?: string }) {
  const items = useNotificationsStore((s) => s.items);
  const latest = [...items].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

  return (
    <section
      className={cn("dashboard-dock-card", className)}
      aria-labelledby="dashboard-notifications-heading"
    >
      <div className="dashboard-dock-head">
        <h2
          id="dashboard-notifications-heading"
          className="dashboard-section-label dashboard-dock-title"
        >
          <span className="dashboard-dock-emoji" aria-hidden="true">
            🔔
          </span>
          Notifications
        </h2>
        <Link to="/notifications" className="dashboard-dock-all">
          All
          <ChevronRight className="h-3 w-3" strokeWidth={1.8} aria-hidden="true" />
        </Link>
      </div>

      {latest.length === 0 ? (
        <div className="dashboard-dock-empty">
          <p>No account notices yet. New rewards and expedition alerts will land here.</p>
        </div>
      ) : (
        <ul className="dashboard-dock-notes space-y-3">
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
