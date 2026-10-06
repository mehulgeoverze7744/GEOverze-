import { Bell, Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { dayLabel, notificationSeeds, relativeTime } from "@/features/profile/data/notifications";
import { cn } from "@/lib/utils";
import {
  selectUnreadCount,
  useNotificationsStore,
  type Notification,
} from "@/stores/notificationsStore";

import "../styles/notifications.css";

function emojiFor(item: Notification) {
  const title = item.title.toLowerCase();
  if (title.includes("welcome")) return "🎉";
  if (title.includes("new quiz") || title.includes("flags of oceania")) return "🌍";
  if (title.includes("weekly progress") || title.includes("progress ready")) return "🎯";
  if (title.includes("creator")) return "🚀";
  if (title.includes("system")) return "⚠️";
  if (title.includes("support")) return "💬";
  if (item.kind === "warning" || item.kind === "error") return "⚠️";
  if (item.kind === "success") return "🎉";
  return "🌍";
}

/** Notification centre grouped by day, with read/dismiss controls. */
export function NotificationsPage() {
  const items = useNotificationsStore((s) => s.items);
  const seed = useNotificationsStore((s) => s.seed);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const dismiss = useNotificationsStore((s) => s.dismiss);
  const clear = useNotificationsStore((s) => s.clear);
  const unread = useNotificationsStore(selectUnreadCount);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    seed(notificationSeeds());
  }, [seed]);

  const groups = useMemo(() => {
    const visible = (filter === "unread" ? items.filter((item) => !item.readAt) : items)
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt);
    const buckets = new Map<string, Notification[]>();
    for (const item of visible) {
      const key = dayLabel(item.createdAt);
      const bucket = buckets.get(key);
      if (bucket) bucket.push(item);
      else buckets.set(key, [item]);
    }
    return [...buckets.entries()];
  }, [items, filter]);

  return (
    <PageShell>
      <SectionContainer className="nc">
        <header className="nc-header">
          <div className="nc-header-row">
            <h1 className="nc-kicker">Notifications</h1>
            {unread > 0 ? <p className="nc-unread-count">{unread} unread</p> : null}
          </div>
          <p className="nc-title">Everything worth knowing</p>
          <p className="nc-lede">
            Achievements, expeditions, community activity and system notices.
          </p>
        </header>

        <div className="nc-toolbar">
          <div className="nc-segment" role="group" aria-label="Filter notifications">
            {(["all", "unread"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
                className={cn("nc-segment-btn", filter === option && "is-active")}
              >
                {option === "all" ? "All" : "Unread"}
                {option === "unread" && unread > 0 ? (
                  <span className="nc-segment-count">{unread}</span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="nc-actions">
            <button
              type="button"
              className="nc-action"
              onClick={markAllRead}
              disabled={unread === 0}
            >
              <Check strokeWidth={1.75} aria-hidden="true" />
              Mark All Read
            </button>
            <button
              type="button"
              className="nc-action"
              onClick={clear}
              disabled={items.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="nc-empty">
            <span className="nc-empty-icon" aria-hidden="true">
              <Bell strokeWidth={1.5} />
            </span>
            <h2>{filter === "unread" ? "Nothing unread" : "No notifications"}</h2>
            <p>
              When achievements unlock, quizzes launch or the platform has news, it appears here.
            </p>
          </div>
        ) : (
          <div className="nc-feed">
            {groups.map(([label, bucket]) => (
              <section key={label} aria-label={label}>
                <h2 className="nc-group-label">{label}</h2>
                <ul className="nc-list">
                  {bucket.map((item) => {
                    const unreadItem = !item.readAt;
                    return (
                      <li key={item.id}>
                        <article className={cn("nc-card", unreadItem && "nc-card--unread")}>
                          <span className="nc-icon" aria-hidden="true">
                            {emojiFor(item)}
                          </span>
                          <div className="nc-body">
                            <div className="nc-topline">
                              <p className="nc-name">{item.title}</p>
                              <time
                                className="nc-time"
                                dateTime={new Date(item.createdAt).toISOString()}
                              >
                                {relativeTime(item.createdAt).replace(" ago", "")}
                              </time>
                            </div>
                            {item.body ? <p className="nc-copy">{item.body}</p> : null}
                            {unreadItem ? (
                              <div className="nc-meta">
                                <span className="nc-new">New</span>
                                <button
                                  type="button"
                                  className="nc-read"
                                  onClick={() => markRead(item.id)}
                                >
                                  Mark as read
                                </button>
                              </div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className="nc-dismiss"
                            onClick={() => dismiss(item.id)}
                            aria-label={`Dismiss notification: ${item.title}`}
                          >
                            <X strokeWidth={1.6} aria-hidden="true" />
                          </button>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </SectionContainer>
    </PageShell>
  );
}
