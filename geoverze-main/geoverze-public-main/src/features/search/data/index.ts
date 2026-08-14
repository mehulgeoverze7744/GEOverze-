/**
 * Placeholder global search index.
 *
 * One typed record per searchable entity so the overlay can rank results
 * client-side. A Supabase full-text query later replaces `searchAll` only.
 */
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { BookOpen, MessageSquare, ShoppingBag, Sparkles, Users, Zap } from "lucide-react";

export type SearchGroupId = "quizzes" | "articles" | "creators" | "posts" | "store";

export type SearchGroup = {
  id: SearchGroupId;
  label: string;
  icon: LucideIcon;
};

export const SEARCH_GROUPS: readonly SearchGroup[] = [
  { id: "quizzes", label: "Quizzes", icon: Zap },
  { id: "articles", label: "Articles", icon: BookOpen },
  { id: "creators", label: "Creators", icon: Users },
  { id: "posts", label: "Community", icon: MessageSquare },
  { id: "store", label: "GEOstore", icon: ShoppingBag },
] as const;

export type SearchRecord = {
  id: string;
  group: SearchGroupId;
  title: string;
  meta: string;
  keywords: readonly string[];
  to: NonNullable<LinkProps["to"]>;
};

export const SEARCH_INDEX: readonly SearchRecord[] = [
  {
    id: "s-q1",
    group: "quizzes",
    title: "Capitals of Asia",
    meta: "20 questions · Intermediate",
    keywords: ["capital", "asia", "cities"],
    to: "/play",
  },
  {
    id: "s-q2",
    group: "quizzes",
    title: "Flags of South America",
    meta: "12 questions · Beginner",
    keywords: ["flag", "south america", "colours"],
    to: "/play",
  },
  {
    id: "s-q3",
    group: "quizzes",
    title: "Rivers & basins",
    meta: "20 questions · Advanced",
    keywords: ["river", "basin", "water", "physical"],
    to: "/play",
  },
  {
    id: "s-q4",
    group: "quizzes",
    title: "Landmarks of the world",
    meta: "20 questions · Intermediate",
    keywords: ["landmark", "monument", "ruins"],
    to: "/play",
  },
  {
    id: "s-q5",
    group: "quizzes",
    title: "Daily challenge",
    meta: "5 questions · Resets at midnight",
    keywords: ["daily", "challenge", "streak"],
    to: "/play",
  },

  {
    id: "s-a1",
    group: "articles",
    title: "The Sahel, explained",
    meta: "GEOlibrary · 8 min read",
    keywords: ["sahel", "africa", "climate"],
    to: "/geolibrary",
  },
  {
    id: "s-a2",
    group: "articles",
    title: "How the Himalayas keep growing",
    meta: "GEOlibrary · 9 min read",
    keywords: ["himalaya", "mountain", "tectonics"],
    to: "/geolibrary",
  },
  {
    id: "s-a3",
    group: "articles",
    title: "Why some countries have two capitals",
    meta: "GEOlibrary · 6 min read",
    keywords: ["capital", "government", "politics"],
    to: "/geolibrary",
  },
  {
    id: "s-a4",
    group: "articles",
    title: "The straightest borders on Earth",
    meta: "GEOlibrary · 7 min read",
    keywords: ["border", "line", "colonial"],
    to: "/geolibrary",
  },

  {
    id: "s-c1",
    group: "creators",
    title: "Atlas Studio",
    meta: "Creator · 24 plates",
    keywords: ["atlas", "studio", "maps"],
    to: "/geolibrary",
  },
  {
    id: "s-c2",
    group: "creators",
    title: "Meridian",
    meta: "Creator · Quiz author",
    keywords: ["meridian", "quiz", "author"],
    to: "/leaderboard",
  },
  {
    id: "s-c3",
    group: "creators",
    title: "Cartography Guild",
    meta: "Creator collective",
    keywords: ["cartography", "guild", "community"],
    to: "/geolibrary",
  },

  {
    id: "s-p1",
    group: "posts",
    title: "Best route to memorise African capitals?",
    meta: "Community · 34 replies",
    keywords: ["africa", "capital", "memorise", "tips"],
    to: "/leaderboard",
  },
  {
    id: "s-p2",
    group: "posts",
    title: "Season 2 standings thread",
    meta: "Community · 112 replies",
    keywords: ["season", "standings", "leaderboard"],
    to: "/leaderboard",
  },
  {
    id: "s-p3",
    group: "posts",
    title: "Show your streak",
    meta: "Community · 58 replies",
    keywords: ["streak", "daily", "showcase"],
    to: "/leaderboard",
  },

  {
    id: "s-s1",
    group: "store",
    title: "Bronze relief atlas",
    meta: "GEOstore · Plate",
    keywords: ["bronze", "atlas", "relief", "print"],
    to: "/geostore",
  },
  {
    id: "s-s2",
    group: "store",
    title: "Season pass",
    meta: "GEOstore · Subscription",
    keywords: ["season", "pass", "subscription"],
    to: "/geostore",
  },
  {
    id: "s-s3",
    group: "store",
    title: "Explorer notebook",
    meta: "GEOstore · Merch",
    keywords: ["notebook", "merch", "paper"],
    to: "/geostore",
  },
] as const;

export type SearchHit = SearchRecord & { score: number };

/** Simple prefix + keyword ranking over the placeholder index. */
export function searchAll(query: string, limit = 12): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const record of SEARCH_INDEX) {
    const title = record.title.toLowerCase();
    let score = 0;
    if (title.startsWith(q)) score = 100;
    else if (title.includes(q)) score = 70;
    else if (record.keywords.some((k) => k.includes(q))) score = 40;
    else if (record.meta.toLowerCase().includes(q)) score = 20;
    if (score > 0) hits.push({ ...record, score });
  }

  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

/** Groups hits in the canonical group order for rendering. */
export function groupHits(hits: readonly SearchHit[]) {
  return SEARCH_GROUPS.map((group) => ({
    group,
    hits: hits.filter((hit) => hit.group === group.id),
  })).filter((entry) => entry.hits.length > 0);
}

export const SEARCH_SUGGESTIONS: readonly {
  label: string;
  to: NonNullable<LinkProps["to"]>;
  icon: LucideIcon;
}[] = [
  { label: "Browse the GEOlibrary", to: "/geolibrary", icon: BookOpen },
  { label: "Start a session in Let's Play", to: "/play", icon: Zap },
  { label: "See what's new in GEOstore", to: "/geostore", icon: Sparkles },
] as const;
