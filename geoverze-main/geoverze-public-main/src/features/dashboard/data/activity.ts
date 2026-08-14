/**
 * Unified recent-activity feed.
 *
 * Placeholder entries mixing quiz runs, achievements, credit awards and
 * bookmarks — the shape a single `activity` view will return later.
 */
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Award, BookMarked, Coins, Flag, Landmark, Map, Swords, Target } from "lucide-react";

import type { ActivityTone } from "@/components/shared/ActivityFeedItem";

export type ActivityEntry = {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  when: string;
  tone: ActivityTone;
  to?: NonNullable<LinkProps["to"]>;
};

export const RECENT_ACTIVITY: readonly ActivityEntry[] = [
  {
    id: "a1",
    icon: Landmark,
    title: "Capitals of Asia",
    detail: "Solo · scored 18 of 20",
    when: "2h ago",
    tone: "quiz",
    to: "/quiz-history",
  },
  {
    id: "a2",
    icon: Award,
    title: "Badge unlocked: Capital Genius",
    detail: "Answered 100 capital questions correctly",
    when: "2h ago",
    tone: "achievement",
    to: "/achievements",
  },
  {
    id: "a3",
    icon: Swords,
    title: "Duel won vs. Meridian",
    detail: "PvP · 11 of 12 correct",
    when: "4h ago",
    tone: "quiz",
    to: "/quiz-history",
  },
  {
    id: "a4",
    icon: Coins,
    title: "1 credit earned",
    detail: "Duel victory · balance 63 this month",
    when: "4h ago",
    tone: "credits",
    to: "/play/credit-history",
  },
  {
    id: "a5",
    icon: BookMarked,
    title: "Saved: How the Himalayas keep growing",
    detail: "GEOlibrary · 9 min read",
    when: "Yesterday",
    tone: "bookmark",
    to: "/bookmarks",
  },
  {
    id: "a6",
    icon: Target,
    title: "Daily challenge complete",
    detail: "4 of 5 · streak extended to 12 days",
    when: "Yesterday",
    tone: "quiz",
    to: "/play/daily-challenges",
  },
  {
    id: "a7",
    icon: Flag,
    title: "Flags of South America",
    detail: "Multiplayer · perfect 12 of 12",
    when: "2 days ago",
    tone: "quiz",
    to: "/quiz-history",
  },
  {
    id: "a8",
    icon: Map,
    title: "Saved: The straightest borders on Earth",
    detail: "GEOlibrary · 7 min read",
    when: "3 days ago",
    tone: "bookmark",
    to: "/bookmarks",
  },
] as const;
