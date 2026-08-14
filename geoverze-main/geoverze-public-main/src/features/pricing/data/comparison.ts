import type { TierId } from "./plans";

export type ComparisonValue = boolean | string;

export type ComparisonRow = {
  feature: string;
  detail: string;
  values: Record<TierId, ComparisonValue>;
};

export type ComparisonGroup = {
  title: string;
  rows: ComparisonRow[];
};

export const comparisonGroups: ComparisonGroup[] = [
  {
    title: "Playing",
    rows: [
      {
        feature: "Quiz limits",
        detail: "How many rounds you can play each day.",
        values: { explorer: "3 per day", pro: "Unlimited", advance: "Unlimited" },
      },
      {
        feature: "PvP access",
        detail: "One-on-one duels against other explorers.",
        values: { explorer: false, pro: true, advance: true },
      },
      {
        feature: "Multiplayer access",
        detail: "Live rooms, tournaments and group trivia.",
        values: { explorer: false, pro: true, advance: true },
      },
      {
        feature: "Exclusive content",
        detail: "Seasonal atlases and member-only question packs.",
        values: { explorer: false, pro: "Member packs", advance: "Everything, first" },
      },
    ],
  },
  {
    title: "Learning",
    rows: [
      {
        feature: "GEOlibrary benefits",
        detail: "Reading, bookmarking and deep-dive collections.",
        values: {
          explorer: "Browse and read",
          pro: "Full library and collections",
          advance: "Full library and collections",
        },
      },
      {
        feature: "Future AI features",
        detail: "AI coach, adaptive practice and explanations on demand.",
        values: { explorer: false, pro: "On release", advance: "Early access" },
      },
    ],
  },
  {
    title: "Progress and rewards",
    rows: [
      {
        feature: "Rewards",
        detail: "Badges, seasonal trophies and reward drops.",
        values: { explorer: "Standard", pro: "Premium tier", advance: "Premium tier" },
      },
      {
        feature: "Credits benefits",
        detail: "Credit earn rate used across the GEOstore.",
        values: { explorer: "1×", pro: "1.5×", advance: "2×" },
      },
    ],
  },
  {
    title: "Creating and support",
    rows: [
      {
        feature: "Creator Studio",
        detail: "Build quizzes, publish articles, track performance.",
        values: { explorer: false, pro: "Read-only preview", advance: true },
      },
      {
        feature: "Priority support",
        detail: "How quickly the team gets back to you.",
        values: { explorer: "Community", pro: "48 hours", advance: "Priority queue" },
      },
    ],
  },
];

export const comparisonRows: ComparisonRow[] = comparisonGroups.flatMap((g) => g.rows);
