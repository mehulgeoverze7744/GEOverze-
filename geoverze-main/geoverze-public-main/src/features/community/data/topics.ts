/**
 * Topics, the daily geography topic, and community challenge/event data.
 * Illustrative placeholder content.
 */

export type Topic = {
  slug: string;
  label: string;
  blurb: string;
  posts: number;
  /** Percentage change in activity this week. */
  trend: number;
};

export const TOPICS: readonly Topic[] = [
  {
    slug: "rivers",
    label: "Rivers & lakes",
    blurb: "Basins, deltas and drainage arguments.",
    posts: 1_284,
    trend: 32,
  },
  {
    slug: "borders",
    label: "Borders",
    blurb: "Where lines are drawn and why they moved.",
    posts: 964,
    trend: 18,
  },
  {
    slug: "capitals",
    label: "Capitals",
    blurb: "Sprint strategies and the hard ones.",
    posts: 2_141,
    trend: 11,
  },
  {
    slug: "flags",
    label: "Flags",
    blurb: "Vexillology for the competitive.",
    posts: 1_702,
    trend: -4,
  },
  {
    slug: "volcanoes",
    label: "Volcanoes",
    blurb: "Active ranges, eruptions, field photos.",
    posts: 512,
    trend: 46,
  },
  {
    slug: "cartography",
    label: "Cartography",
    blurb: "Projection wars and map history.",
    posts: 688,
    trend: 9,
  },
  {
    slug: "study",
    label: "Study methods",
    blurb: "How explorers actually learn faster.",
    posts: 1_044,
    trend: 24,
  },
  {
    slug: "oceania",
    label: "Oceania",
    blurb: "Islands, atolls and the underrated continent.",
    posts: 336,
    trend: 15,
  },
];

export function topicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

/** Today's geography topic — a single prompt the whole community answers. */
export const DAILY_TOPIC = {
  date: "2026-08-06",
  title: "Which river has shaped its country's identity the most?",
  prompt: "One river, one reason. Bonus credit for naming a city that would not exist without it.",
  topic: "rivers",
  responses: 418,
} as const;

export type CommunityCommunity = {
  slug: string;
  name: string;
  blurb: string;
  members: number;
  focus: string;
};

/** Suggested communities — discovery placeholders, not yet joinable. */
export const SUGGESTED_COMMUNITIES: readonly CommunityCommunity[] = [
  {
    slug: "river-society",
    name: "The River Society",
    blurb: "Drainage basins, deltas and hydrology deep dives.",
    members: 8_420,
    focus: "Rivers",
  },
  {
    slug: "flag-guild",
    name: "Flag Guild",
    blurb: "Vexillology, redesigns and flag sprint records.",
    members: 12_180,
    focus: "Flags",
  },
  {
    slug: "border-archive",
    name: "Border Archive",
    blurb: "Historical cartography and treaty lines.",
    members: 5_640,
    focus: "History",
  },
  {
    slug: "sprint-club",
    name: "Sprint Club",
    blurb: "Timed rounds, leaderboards and daily drills.",
    members: 15_900,
    focus: "Competitive",
  },
];
