import { Link } from "@tanstack/react-router";
import { Bell, BellRing } from "lucide-react";

import { GeoDropdown } from "@/components/shared/GeoDropdown";
import { useNotificationsStore } from "@/stores/notificationsStore";

/**
 * Notification surface. It reads the real store so the moment features start
 * pushing notices, this lights up with no further wiring.
 */
export function NotificationBell() {
  const items = useNotificationsStore((s) => s.items);
  const markAll = useNotificationsStore((s) => s.clear);
  const unread = items.filter((item) => !item.readAt).length;

  return (
    <GeoDropdown
      label="Notifications"
      trigger={
        <button
          type="button"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-bronze/25 text-bronze/90 transition-colors motion-fast hover:border-bronze/50 hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        >
          {unread ? (
            <BellRing className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Bell className="h-4 w-4" strokeWidth={1.5} />
          )}
          {unread ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[0.55rem] font-medium text-charcoal">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      }
      className="min-w-[19rem]"
    >
      {items.length === 0 ? (
        <div className="px-3 py-6 text-center">
          <p className="text-sm text-foreground/55">You're all caught up</p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/50">
            Season results, rewards and store activity will appear here.
          </p>
        </div>
      ) : (
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {items.slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-xl px-3 py-2.5">
              <p className="text-sm text-foreground/80">{item.title}</p>
              {item.body ? (
                <p className="mt-1 text-xs leading-relaxed text-foreground/50">{item.body}</p>
              ) : null}
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between gap-2 border-t border-bronze/12 pt-2">
            <Link
              to="/notifications"
              className="rounded-xl px-3 py-2 text-[0.62rem] uppercase tracking-[0.24em] text-bronze/90 transition-colors hover:text-bronze"
            >
              View all
            </Link>
            <button
              type="button"
              onClick={markAll}
              className="rounded-xl px-3 py-2 text-[0.62rem] uppercase tracking-[0.24em] text-foreground/50 transition-colors hover:text-foreground/70"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </GeoDropdown>
  );
}
