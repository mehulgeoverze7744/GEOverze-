/**
 * Dashboard content model.
 *
 * Every number is placeholder data until the quiz engine and backend exist —
 * widgets that describe unbuilt modules say so instead of faking activity.
 */
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  BookOpen,
  CalendarClock,
  Compass,
  Flag,
  Landmark,
  Map,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export type QuickAction = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  to: NonNullable<LinkProps["to"]>;
  /** Shown as a small bronze pill in the card corner. */
  badge?: string;
};

export const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: "play",
    label: "Play Quiz",
    description: "Jump into an expedition tuned to your level.",
    icon: Zap,
    to: "/play",
    badge: "Popular",
  },
  {
    id: "library",
    label: "Browse GEOlibrary",
    description: "Long-form geography, maps and atlas plates.",
    icon: BookOpen,
    to: "/geolibrary",
  },
  {
    id: "store",
    label: "Visit GEOstore",
    description: "Atlases, finishes and season passes.",
    icon: ShoppingBag,
    to: "/geostore",
  },
  {
    id: "daily",
    label: "Daily Challenge",
    description: "Five questions, one shot, resets at midnight.",
    icon: Target,
    to: "/play",
    badge: "New today",
  },
  {
    id: "community",
    label: "Community",
    description: "Standings, seasons and fellow explorers.",
    icon: Users,
    to: "/leaderboard",
  },
  {
    id: "bookmarks",
    label: "Bookmarks",
    description: "Everything you saved for later.",
    icon: BookMarked,
    to: "/bookmarks",
  },
] as const;

export const MOTIVATIONS: readonly string[] = [
  "Every border has a story. Learn one today.",
  "The map rewards the curious — go one country further.",
  "Small daily expeditions beat one long journey.",
  "Know Earth. Think Global. Start with a single question.",
  "Twelve days in a row. The planet is getting smaller.",
] as const;

export type QuizHistoryEntry = {
  id: string;
  title: string;
  score: number;
  total: number;
  when: string;
  icon: LucideIcon;
};

export const QUIZ_HISTORY: readonly QuizHistoryEntry[] = [
  { id: "h1", title: "Capitals of Asia", score: 18, total: 20, when: "2h ago", icon: Landmark },
  {
    id: "h2",
    title: "Flags of South America",
    score: 12,
    total: 12,
    when: "Yesterday",
    icon: Flag,
  },
  { id: "h3", title: "Rivers & basins", score: 15, total: 20, when: "2 days ago", icon: Map },
  { id: "h4", title: "Daily challenge", score: 4, total: 5, when: "3 days ago", icon: Target },
] as const;

export type ProgressTrack = {
  id: string;
  label: string;
  /** 0–100. */
  value: number;
  detail: string;
};

export const LEARNING_PROGRESS: readonly ProgressTrack[] = [
  { id: "countries", label: "Countries", value: 72, detail: "141 of 195" },
  { id: "capitals", label: "Capitals", value: 54, detail: "105 of 195" },
  { id: "flags", label: "Flags", value: 48, detail: "94 of 195" },
  { id: "physical", label: "Physical geography", value: 31, detail: "Beginner tier" },
] as const;

export type CategoryShare = { id: string; label: string; share: number; icon: LucideIcon };

export const FAVORITE_CATEGORIES: readonly CategoryShare[] = [
  { id: "capitals", label: "Capitals", share: 34, icon: Landmark },
  { id: "flags", label: "Flags", share: 27, icon: Flag },
  { id: "maps", label: "Maps", share: 21, icon: Map },
  { id: "nature", label: "Nature", share: 18, icon: Compass },
] as const;

export type LinkedItem = {
  id: string;
  title: string;
  meta: string;
  to: NonNullable<LinkProps["to"]>;
  /** GEOlibrary article slug — thumbnail resolved via articleCardImageSrc. */
  articleSlug?: string;
};

export const RECENTLY_VIEWED: readonly LinkedItem[] = [
  {
    id: "r1",
    title: "The Sahel, explained",
    meta: "GEOlibrary · 8 min",
    to: "/geolibrary",
    articleSlug: "the-sahel-explained",
  },
  { id: "r2", title: "Bronze relief atlas", meta: "GEOstore · Plate", to: "/geostore" },
  { id: "r3", title: "Capitals sprint: Africa", meta: "Let's Play · Quiz", to: "/play" },
] as const;

export const SAVED_ARTICLES: readonly LinkedItem[] = [
  {
    id: "s1",
    title: "How the Himalayas keep growing",
    meta: "9 min read",
    to: "/bookmarks",
    articleSlug: "how-the-himalayas-keep-growing",
  },
  {
    id: "s2",
    title: "Why some countries have two capitals",
    meta: "6 min read",
    to: "/bookmarks",
    articleSlug: "why-some-countries-have-two-capitals",
  },
  {
    id: "s3",
    title: "The straightest borders on Earth",
    meta: "7 min read",
    to: "/bookmarks",
    articleSlug: "the-straightest-borders-on-earth",
  },
] as const;

export type Recommendation = {
  id: string;
  title: string;
  reason: string;
  level: string;
  icon: LucideIcon;
};

export const RECOMMENDED_QUIZZES: readonly Recommendation[] = [
  {
    id: "rec1",
    title: "Capitals of Central Europe",
    reason: "Because capitals are your strongest category",
    level: "Intermediate",
    icon: Landmark,
  },
  {
    id: "rec2",
    title: "Island nations of the Pacific",
    reason: "New ground — you've explored 12 of 24",
    level: "Advanced",
    icon: Compass,
  },
  {
    id: "rec3",
    title: "Flags with animals",
    reason: "Light round to protect your streak",
    level: "Beginner",
    icon: Flag,
  },
] as const;

export const SUBSCRIPTION = {
  plan: "Explorer",
  status: "Free tier",
  renewal: "No billing on the free tier",
  perks: ["Daily challenge", "Core quiz library", "Progress tracking"],
} as const;

export const CREDITS = {
  balance: 1240,
  monthlyEarned: 320,
  nextReward: "Season pass at 2,000",
} as const;

export type UpcomingEvent = {
  id: string;
  title: string;
  when: string;
  description: string;
  icon: LucideIcon;
};

export const UPCOMING_EVENTS: readonly UpcomingEvent[] = [
  {
    id: "e1",
    title: "Season 2 opens",
    when: "In 6 days",
    description: "Fresh standings, new seasonal atlas rewards.",
    icon: Trophy,
  },
  {
    id: "e2",
    title: "World Geography Week",
    when: "In 3 weeks",
    description: "Daily themed expeditions across all seven continents.",
    icon: CalendarClock,
  },
  {
    id: "e3",
    title: "Creator collection drop",
    when: "Next month",
    description: "Community-made plates arrive in the GEOstore.",
    icon: Sparkles,
  },
] as const;

/** Time-of-day greeting for the dashboard header. */
export function greetingFor(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "Still exploring";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Stable motivation for the current day so it doesn't flicker on re-render. */
export function motivationFor(date = new Date()) {
  const index = Math.floor(date.getTime() / 86_400_000) % MOTIVATIONS.length;
  return MOTIVATIONS[index] ?? MOTIVATIONS[0]!;
}
