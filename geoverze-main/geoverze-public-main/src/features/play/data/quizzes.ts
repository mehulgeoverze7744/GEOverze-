/**
 * Play Hub quiz types and editorial discovery metadata.
 *
 * Runtime catalogue discovery comes from Supabase via fetchPublishedQuizzes().
 * This module retains types and curated id lists only — not a live quiz list.
 */
import type { Difficulty } from "./categories";

export type Quiz = {
  id: string;
  title: string;
  categoryId: string;
  creator: string;
  art: string;
  difficulty: Difficulty;
  questions: number;
  minutes: number;
  players: number;
  rating: number;
  popularity: number;
  /** Days since publish — drives the "Newest" sort. */
  ageDays: number;
  /** 0-100, only present for in-progress runs. */
  progress?: number;
};

/** Resolve editorial id lists against a live published catalogue. */
export function pick(ids: readonly string[], catalog: readonly Quiz[]): Quiz[] {
  const byId = new Map(catalog.map((quiz) => [quiz.id, quiz]));
  return ids.map((id) => byId.get(id)).filter((quiz): quiz is Quiz => Boolean(quiz));
}

export const FEATURED_QUIZ_IDS = [
  "q-flag-blitz",
  "q-atlas-sprint",
  "q-grand-tour",
  "q-pin-the-place",
  "q-extremes",
  "q-monuments",
  "q-deep-blue",
] as const;

export type DiscoveryRail = {
  id: string;
  title: string;
  description: string;
  quizIds: readonly string[];
};

export const DISCOVERY_RAILS: readonly DiscoveryRail[] = [
  {
    id: "trending",
    title: "Trending now",
    description: "What the community is playing this week.",
    quizIds: ["q-flag-blitz", "q-grand-tour", "q-extremes", "q-atlas-sprint", "q-pin-the-place"],
  },
  {
    id: "most-played",
    title: "Most played",
    description: "The all-time favourites.",
    quizIds: ["q-flag-blitz", "q-atlas-sprint", "q-grand-tour", "q-capital-cities", "q-extremes"],
  },
  {
    id: "new",
    title: "New arrivals",
    description: "Fresh sets, straight from the studio and the community.",
    quizIds: ["q-deep-blue", "q-summit", "q-wildlands", "q-pin-the-place", "q-protected"],
  },
  {
    id: "recommended",
    title: "Recommended for you",
    description: "Matched to your interests and current level.",
    quizIds: ["q-monuments", "q-festival", "q-riverrun", "q-timeline", "q-wildlands"],
  },
  {
    id: "recent",
    title: "Recently played",
    description: "Jump back into something familiar.",
    quizIds: ["q-capital-cities", "q-monuments", "q-riverrun", "q-festival"],
  },
];

export const CONTINUE_QUIZ_IDS = ["q-flag-blitz", "q-atlas-sprint", "q-grand-tour"] as const;
