import { AlertTriangle, Bell, CheckCheck, CircleCheck, Info, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EmptyState } from "@/components/shared/EmptyState";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { dayLabel, notificationSeeds, relativeTime } from "@/features/profile/data/notifications";
import { cn } from "@/lib/utils";
import {
  selectUnreadCount,
  useNotificationsStore,
  type Notification,
  type NotificationKind,
} from "@/stores/notificationsStore";

const ICONS: Record<NotificationKind, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: AlertTriangle,
  error: AlertTriangle,
};

const TONES: Record<NotificationKind, string> = {
  info: "border-bronze/25 text-bronze/90",
  success: "border-bronze/45 text-bronze",
  warning: "border-amber-400/30 text-amber-300/80",
  error: "border-destructive/35 text-destructive",
};

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
      <PageHeader
        eyebrow="Notifications"
        title="Everything worth knowing"
        description="Achievements, new expeditions, community activity and system notices, newest first."
      />
      <SectionContainer>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2.5" role="group" aria-label="Filter notifications">
            {(["all", "unread"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs capitalize transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45",
                  filter === option
                    ? "border-bronze/55 bg-bronze/12 text-foreground"
                    : "border-bronze/15 text-foreground/50 hover:border-bronze/35 hover:text-foreground/80",
                )}
              >
                {option}
                {option === "unread" && unread > 0 ? (
                  <span className="ml-2 text-bronze">{unread}</span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <GeoButton variant="ghost" onClick={markAllRead} disabled={unread === 0}>
              <CheckCheck className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Mark all read
            </GeoButton>
            <GeoButton variant="ghost" onClick={clear} disabled={items.length === 0}>
              Clear all
            </GeoButton>
          </div>
        </div>

        {groups.length === 0 ? (
          <AnimatedSection className="mt-8">
            <EmptyState
              icon={Bell}
              title={filter === "unread" ? "Nothing unread" : "No notifications"}
              description="When achievements unlock, quizzes launch or the platform has news, it appears here."
            />
          </AnimatedSection>
        ) : (
          <div className="mt-8 space-y-9">
            {groups.map(([label, bucket]) => (
              <section key={label} aria-label={label}>
                <h2 className="eyebrow">{label}</h2>
                <ul className="mt-4 space-y-3">
                  {bucket.map((item, index) => {
                    const Icon = ICONS[item.kind];
                    return (
                      <li key={item.id}>
                        <AnimatedSection delay={index * 40}>
                          <GlassCard
                            className={cn(
                              "flex gap-4 p-5",
                              !item.readAt && "border-bronze/30 bg-bronze/[0.04]",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                                TONES[item.kind],
                              )}
                              aria-hidden="true"
                            >
                              <Icon className="h-4 w-4" strokeWidth={1.4} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <p className="text-sm text-foreground/85">
                                  {item.title}
                                  {!item.readAt ? (
                                    <span className="ml-2 align-middle text-[0.6rem] uppercase tracking-[0.2em] text-bronze/90">
                                      new
                                    </span>
                                  ) : null}
                                </p>
                                <span className="text-[0.65rem] text-foreground/50">
                                  {relativeTime(item.createdAt)}
                                </span>
                              </div>
                              {item.body ? (
                                <p className="mt-2 text-xs leading-relaxed text-foreground/50">
                                  {item.body}
                                </p>
                              ) : null}
                              {!item.readAt ? (
                                <button
                                  type="button"
                                  onClick={() => markRead(item.id)}
                                  className="mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-bronze/90 transition-colors hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
                                >
                                  Mark as read
                                </button>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => dismiss(item.id)}
                              aria-label={`Dismiss notification: ${item.title}`}
                              className="h-8 w-8 shrink-0 rounded-lg text-foreground/50 transition-colors hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
                            >
                              <X
                                className="mx-auto h-3.5 w-3.5"
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                            </button>
                          </GlassCard>
                        </AnimatedSection>
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
