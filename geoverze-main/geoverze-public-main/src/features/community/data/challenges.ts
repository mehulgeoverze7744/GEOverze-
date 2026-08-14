/**
 * Community challenges, events and tournament placeholders.
 */

export type ChallengeStatus = "live" | "upcoming" | "future";

export type CommunityChallenge = {
  slug: string;
  name: string;
  blurb: string;
  category: string;
  status: ChallengeStatus;
  /** Human-readable window, e.g. "Ends in 2 days". */
  window: string;
  participants: number;
  rewardXp: number;
  rewardCredits: number;
  difficulty: "casual" | "standard" | "hard";
};

export const COMMUNITY_CHALLENGES: readonly CommunityChallenge[] = [
  {
    slug: "country-challenge",
    name: "Country Challenge",
    blurb: "Place forty countries on the map without a single miss.",
    category: "Countries",
    status: "live",
    window: "Ends in 2 days",
    participants: 6_482,
    rewardXp: 900,
    rewardCredits: 40,
    difficulty: "standard",
  },
  {
    slug: "flag-challenge",
    name: "Flag Challenge",
    blurb: "One hundred flags, three lives, no hints.",
    category: "Flags",
    status: "live",
    window: "Ends in 5 days",
    participants: 9_104,
    rewardXp: 1_200,
    rewardCredits: 60,
    difficulty: "hard",
  },
  {
    slug: "capital-sprint",
    name: "Capital Sprint",
    blurb: "Twenty-five capitals, ten seconds each. Pure reflex.",
    category: "Capitals",
    status: "live",
    window: "Resets daily",
    participants: 14_760,
    rewardXp: 400,
    rewardCredits: 15,
    difficulty: "casual",
  },
  {
    slug: "weekend-event",
    name: "Weekend Expedition",
    blurb: "A themed set that only runs Saturday and Sunday. This week: island nations.",
    category: "Seasonal",
    status: "upcoming",
    window: "Starts Saturday",
    participants: 3_290,
    rewardXp: 1_500,
    rewardCredits: 75,
    difficulty: "standard",
  },
  {
    slug: "monthly-explorer",
    name: "Monthly Explorer",
    blurb: "Accumulate the most accurate rounds across the month to take the title.",
    category: "Ladder",
    status: "live",
    window: "25 days remaining",
    participants: 21_540,
    rewardXp: 4_000,
    rewardCredits: 250,
    difficulty: "hard",
  },
];

/** Tournament formats being designed — deliberately marked as future. */
export const FUTURE_TOURNAMENTS: readonly { name: string; blurb: string }[] = [
  {
    name: "Continental Cup",
    blurb: "Bracketed knockout rounds by continent, seeded on monthly accuracy.",
  },
  {
    name: "Guild Wars",
    blurb: "Community versus community, scored on aggregate XP over a fortnight.",
  },
  { name: "World Series", blurb: "An annual invitational for the top one hundred explorers." },
];
