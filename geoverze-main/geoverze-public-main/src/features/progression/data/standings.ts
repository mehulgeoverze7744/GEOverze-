/** Leaderboard placeholder standings and tab model. */
export type LeaderboardScope = "global" | "friends" | "country" | "weekly" | "monthly" | "all-time";

export type StandingRow = {
  rank: number;
  username: string;
  avatarId: string;
  country: string;
  flag: string;
  level: number;
  xp: number;
  streak: number;
  accuracy: number;
  you?: boolean;
};

export const LEADERBOARD_TABS: readonly { id: LeaderboardScope; label: string }[] = [
  { id: "global", label: "Global" },
  { id: "friends", label: "Friends" },
  { id: "country", label: "Country" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "all-time", label: "All Time" },
] as const;

const BASE: StandingRow[] = [
  {
    rank: 1,
    username: "meridian_kai",
    avatarId: "meridian",
    country: "Japan",
    flag: "🇯🇵",
    level: 42,
    xp: 128_400,
    streak: 96,
    accuracy: 96.2,
  },
  {
    rank: 2,
    username: "atlas_emma",
    avatarId: "atlas",
    country: "Sweden",
    flag: "🇸🇪",
    level: 39,
    xp: 119_050,
    streak: 61,
    accuracy: 94.8,
  },
  {
    rank: 3,
    username: "noor.maps",
    avatarId: "compass",
    country: "Morocco",
    flag: "🇲🇦",
    level: 37,
    xp: 111_700,
    streak: 44,
    accuracy: 93.9,
  },
  {
    rank: 4,
    username: "delta_ravi",
    avatarId: "delta",
    country: "India",
    flag: "🇮🇳",
    level: 34,
    xp: 98_320,
    streak: 38,
    accuracy: 92.4,
  },
  {
    rank: 5,
    username: "summit_lena",
    avatarId: "summit",
    country: "Germany",
    flag: "🇩🇪",
    level: 31,
    xp: 90_180,
    streak: 27,
    accuracy: 91.7,
  },
  {
    rank: 6,
    username: "voyager_ana",
    avatarId: "voyager",
    country: "Brazil",
    flag: "🇧🇷",
    level: 29,
    xp: 84_940,
    streak: 22,
    accuracy: 90.5,
  },
  {
    rank: 7,
    username: "orbit_tom",
    avatarId: "orbit",
    country: "Canada",
    flag: "🇨🇦",
    level: 26,
    xp: 74_600,
    streak: 19,
    accuracy: 89.6,
  },
  {
    rank: 8,
    username: "equator_zoe",
    avatarId: "equator",
    country: "Kenya",
    flag: "🇰🇪",
    level: 22,
    xp: 61_240,
    streak: 15,
    accuracy: 88.8,
  },
  {
    rank: 9,
    username: "you",
    avatarId: "meridian",
    country: "Explorer",
    flag: "🌍",
    level: 14,
    xp: 18_420,
    streak: 12,
    accuracy: 87.4,
    you: true,
  },
  {
    rank: 10,
    username: "compass_ivo",
    avatarId: "compass",
    country: "Portugal",
    flag: "🇵🇹",
    level: 13,
    xp: 17_880,
    streak: 9,
    accuracy: 86.1,
  },
];

/** Deterministic per-scope shuffle so each tab reads differently. */
export function standingsFor(scope: LeaderboardScope): StandingRow[] {
  if (scope === "global" || scope === "all-time") return BASE;
  if (scope === "friends") {
    return BASE.filter((row) => row.you || row.rank % 2 === 0).map((row, i) => ({
      ...row,
      rank: i + 1,
    }));
  }
  if (scope === "country") {
    return BASE.filter((row) => row.you || row.rank % 3 === 0).map((row, i) => ({
      ...row,
      rank: i + 1,
    }));
  }
  const divisor = scope === "weekly" ? 14 : 4;
  return [...BASE]
    .map((row) => ({ ...row, xp: Math.round(row.xp / divisor) }))
    .sort((a, b) => b.xp - a.xp)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}
