/**
 * Featured + discovery quiz catalog. Placeholder content, no engine attached.
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

export const QUIZZES: readonly Quiz[] = [
  {
    id: "q-atlas-sprint",
    title: "Atlas Sprint",
    categoryId: "countries",
    creator: "GEOverze Studio",
    art: "countries",
    difficulty: "Medium",
    questions: 30,
    minutes: 7,
    players: 184_200,
    rating: 4.8,
    popularity: 99,
    ageDays: 12,
    progress: 40,
  },
  {
    id: "q-capital-cities",
    title: "Capital Confusion",
    categoryId: "capitals",
    creator: "Mira Osei",
    art: "capitals",
    difficulty: "Hard",
    questions: 25,
    minutes: 6,
    players: 96_400,
    rating: 4.6,
    popularity: 91,
    ageDays: 30,
  },
  {
    id: "q-flag-blitz",
    title: "Flag Blitz",
    categoryId: "flags",
    creator: "GEOverze Studio",
    art: "flags",
    difficulty: "Easy",
    questions: 50,
    minutes: 5,
    players: 241_800,
    rating: 4.9,
    popularity: 100,
    ageDays: 45,
    progress: 65,
  },
  {
    id: "q-pin-the-place",
    title: "Pin the Place",
    categoryId: "maps",
    creator: "Cartography Club",
    art: "maps",
    difficulty: "Expert",
    questions: 20,
    minutes: 9,
    players: 42_100,
    rating: 4.7,
    popularity: 84,
    ageDays: 4,
  },
  {
    id: "q-monuments",
    title: "Monuments & Marvels",
    categoryId: "landmarks",
    creator: "Leo Marchetti",
    art: "landmarks",
    difficulty: "Medium",
    questions: 28,
    minutes: 7,
    players: 73_900,
    rating: 4.5,
    popularity: 82,
    ageDays: 9,
  },
  {
    id: "q-summit",
    title: "Summit Seven",
    categoryId: "mountains",
    creator: "Alpine Guild",
    art: "mountains",
    difficulty: "Hard",
    questions: 21,
    minutes: 6,
    players: 31_600,
    rating: 4.4,
    popularity: 71,
    ageDays: 2,
  },
  {
    id: "q-riverrun",
    title: "River Run",
    categoryId: "rivers",
    creator: "GEOverze Studio",
    art: "rivers",
    difficulty: "Medium",
    questions: 24,
    minutes: 6,
    players: 28_400,
    rating: 4.3,
    popularity: 66,
    ageDays: 18,
  },
  {
    id: "q-deep-blue",
    title: "Deep Blue",
    categoryId: "oceans",
    creator: "Nadia Ivers",
    art: "oceans",
    difficulty: "Hard",
    questions: 22,
    minutes: 6,
    players: 19_700,
    rating: 4.6,
    popularity: 64,
    ageDays: 1,
  },
  {
    id: "q-festival",
    title: "Festival Circuit",
    categoryId: "culture",
    creator: "Culture Desk",
    art: "culture",
    difficulty: "Easy",
    questions: 32,
    minutes: 8,
    players: 58_300,
    rating: 4.5,
    popularity: 78,
    ageDays: 22,
  },
  {
    id: "q-grand-tour",
    title: "The Grand Tour",
    categoryId: "mixed",
    creator: "GEOverze Studio",
    art: "mixed",
    difficulty: "Expert",
    questions: 60,
    minutes: 14,
    players: 121_500,
    rating: 4.9,
    popularity: 95,
    ageDays: 6,
    progress: 15,
  },
  {
    id: "q-wildlands",
    title: "Wildlands",
    categoryId: "nature",
    creator: "Field Notes",
    art: "nature",
    difficulty: "Easy",
    questions: 30,
    minutes: 7,
    players: 47_200,
    rating: 4.4,
    popularity: 74,
    ageDays: 3,
  },
  {
    id: "q-protected",
    title: "Protected Wonders",
    categoryId: "unesco",
    creator: "Heritage Society",
    art: "unesco",
    difficulty: "Hard",
    questions: 26,
    minutes: 9,
    players: 22_900,
    rating: 4.7,
    popularity: 69,
    ageDays: 5,
  },
  {
    id: "q-extremes",
    title: "Planet Extremes",
    categoryId: "records",
    creator: "GEOverze Studio",
    art: "records",
    difficulty: "Expert",
    questions: 25,
    minutes: 8,
    players: 88_700,
    rating: 4.8,
    popularity: 87,
    ageDays: 15,
  },
  {
    id: "q-timeline",
    title: "Redrawn Borders",
    categoryId: "history",
    creator: "Archive Room",
    art: "history",
    difficulty: "Hard",
    questions: 28,
    minutes: 9,
    players: 35_800,
    rating: 4.5,
    popularity: 72,
    ageDays: 28,
  },
];

const byId = new Map(QUIZZES.map((q) => [q.id, q]));

export function pick(ids: readonly string[]): Quiz[] {
  return ids.map((id) => byId.get(id)).filter((q): q is Quiz => Boolean(q));
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
