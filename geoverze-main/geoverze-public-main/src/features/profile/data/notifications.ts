/**
 * Example notices used while there is no backend.
 *
 * Offsets are relative to "now" so the notification center always shows a
 * believable today / yesterday / earlier grouping.
 */
import type { Notification, NotificationKind } from "@/stores/notificationsStore";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type Seed = {
  kind: NotificationKind;
  title: string;
  body: string;
  /** Milliseconds before now. */
  age: number;
  read?: boolean;
};

const SEEDS: readonly Seed[] = [
  {
    kind: "success",
    title: "Welcome to GEOverze",
    body: "Your explorer profile is live. Start with a daily expedition to set your baseline.",
    age: 12 * MINUTE,
  },
  {
    kind: "info",
    title: "New quiz available: Flags of Oceania",
    body: "Fourteen flags, sudden-death scoring. Added to Let's Play this morning.",
    age: 3 * HOUR,
  },
  {
    kind: "info",
    title: "Weekly progress ready",
    body: "You answered 214 questions at 87% accuracy — your best week so far.",
    age: 20 * HOUR,
  },
  {
    kind: "info",
    title: "Creator update",
    body: "The Atlas of Rivers collection gained six new plates from the GEOverze studio.",
    age: 1 * DAY + 4 * HOUR,
    read: true,
  },
  {
    kind: "warning",
    title: "System notification",
    body: "Scheduled maintenance this Sunday, 02:00–02:30 UTC. Progress is never affected.",
    age: 2 * DAY,
    read: true,
  },
  {
    kind: "success",
    title: "Support replied to your message",
    body: "Ticket #GV-2481 about atlas downloads has been answered by the support team.",
    age: 4 * DAY,
    read: true,
  },
] as const;

export function notificationSeeds(): Omit<Notification, "id">[] {
  const now = Date.now();
  return SEEDS.map((seed) => ({
    kind: seed.kind,
    title: seed.title,
    body: seed.body,
    createdAt: now - seed.age,
    ...(seed.read ? { readAt: now - seed.age + 5 * MINUTE } : {}),
  }));
}

/** "Today" / "Yesterday" / "12 March" bucket label for a notification. */
export function dayLabel(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (timestamp >= startOfToday) return "Today";
  if (timestamp >= startOfToday - DAY) return "Yesterday";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

/** Compact "3h ago" style label. */
export function relativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < HOUR) return `${Math.max(1, Math.round(diff / MINUTE))}m ago`;
  if (diff < DAY) return `${Math.round(diff / HOUR)}h ago`;
  return `${Math.round(diff / DAY)}d ago`;
}
