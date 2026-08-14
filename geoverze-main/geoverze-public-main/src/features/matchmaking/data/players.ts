/**
 * Matchmaking + lobby placeholder participants.
 *
 * Shapes mirror the future realtime room payload: a player list with identity,
 * rank and ready state. Nothing here is live — no sockets, no matching logic.
 */

export type Membership = "explorer" | "pro" | "advance";

export type MatchPlayer = {
  id: string;
  username: string;
  art: string;
  level: number;
  rankTitle: string;
  country: string;
  flag: string;
  membership: Membership;
  winRate: number;
  you?: boolean;
};

export const MEMBERSHIP_LABEL: Record<Membership, string> = {
  explorer: "Explorer",
  pro: "Pro",
  advance: "Advance",
};

export const YOU: MatchPlayer = {
  id: "you",
  username: "you",
  art: "solo",
  level: 14,
  rankTitle: "Cartographer",
  country: "Explorer",
  flag: "🌍",
  membership: "pro",
  winRate: 61,
  you: true,
};

export const MATCH_POOL: readonly MatchPlayer[] = [
  {
    id: "p-meridian",
    username: "meridian_kai",
    art: "maps",
    level: 42,
    rankTitle: "Geodesist",
    country: "Japan",
    flag: "🇯🇵",
    membership: "advance",
    winRate: 78,
  },
  {
    id: "p-atlas",
    username: "atlas_emma",
    art: "countries",
    level: 39,
    rankTitle: "Navigator",
    country: "Sweden",
    flag: "🇸🇪",
    membership: "pro",
    winRate: 72,
  },
  {
    id: "p-noor",
    username: "noor.maps",
    art: "capitals",
    level: 37,
    rankTitle: "Navigator",
    country: "Morocco",
    flag: "🇲🇦",
    membership: "pro",
    winRate: 69,
  },
  {
    id: "p-ravi",
    username: "delta_ravi",
    art: "physical",
    level: 34,
    rankTitle: "Surveyor",
    country: "India",
    flag: "🇮🇳",
    membership: "explorer",
    winRate: 64,
  },
  {
    id: "p-lena",
    username: "summit_lena",
    art: "nature",
    level: 31,
    rankTitle: "Surveyor",
    country: "Germany",
    flag: "🇩🇪",
    membership: "pro",
    winRate: 58,
  },
  {
    id: "p-ana",
    username: "voyager_ana",
    art: "culture",
    level: 29,
    rankTitle: "Pathfinder",
    country: "Brazil",
    flag: "🇧🇷",
    membership: "explorer",
    winRate: 55,
  },
];

/** Rotating copy for the searching state. Cosmetic only. */
export const SEARCH_MESSAGES: readonly string[] = [
  "Scanning the globe for an opponent…",
  "Matching your level and accuracy…",
  "Balancing question categories…",
  "Reserving a room on the nearest node…",
  "Almost there — locking the board…",
];

/** Rules recited in the lobby before a run. */
export const LOBBY_RULES: readonly string[] = [
  "Every player sees the same question at the same moment.",
  "Faster correct answers score more points.",
  "One skip per round, no penalty.",
  "Leaving early counts as a loss once ranking goes live.",
];
