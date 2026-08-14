/**
 * Community members.
 *
 * Illustrative placeholder people. Shapes match what a future backend will
 * return, so wiring a real API means replacing this module only.
 */

export type MembershipTier = "explorer" | "navigator" | "cartographer" | "creator";

export type Member = {
  handle: string;
  name: string;
  /** Country name shown next to the handle. */
  country: string;
  flag: string;
  tier: MembershipTier;
  verified: boolean;
  bio: string;
  level: number;
  levelTitle: string;
  xp: number;
  credits: number;
  streak: number;
  accuracy: number;
  quizzes: number;
  followers: number;
  following: number;
  mutuals: number;
  /** Placeholder presence — no realtime layer exists yet. */
  online: boolean;
  achievements: readonly string[];
  joined: string;
};

export const TIER_LABEL: Record<MembershipTier, string> = {
  explorer: "Explorer",
  navigator: "Navigator",
  cartographer: "Cartographer",
  creator: "Creator",
};

export const MEMBERS: readonly Member[] = [
  {
    handle: "amaraokoye",
    name: "Amara Okoye",
    country: "Nigeria",
    flag: "🇳🇬",
    tier: "cartographer",
    verified: true,
    bio: "Mapping West African river systems one quiz at a time.",
    level: 27,
    levelTitle: "Cartographer",
    xp: 48_920,
    credits: 640,
    streak: 42,
    accuracy: 91,
    quizzes: 618,
    followers: 4_820,
    following: 212,
    mutuals: 12,
    online: true,
    achievements: ["Sahel Specialist", "42-day streak", "Capitals Perfectionist"],
    joined: "2024-03-11",
  },
  {
    handle: "lucasferreira",
    name: "Lucas Ferreira",
    country: "Brazil",
    flag: "🇧🇷",
    tier: "creator",
    verified: true,
    bio: "Writes about the Amazon basin. Long-form geography, weekly.",
    level: 31,
    levelTitle: "Continental Guide",
    xp: 62_140,
    credits: 1_180,
    streak: 88,
    accuracy: 94,
    quizzes: 902,
    followers: 12_400,
    following: 96,
    mutuals: 8,
    online: true,
    achievements: ["Top Creator", "South America Master", "Century Streak"],
    joined: "2023-11-02",
  },
  {
    handle: "meiling",
    name: "Mei Ling Chen",
    country: "Taiwan",
    flag: "🇹🇼",
    tier: "navigator",
    verified: false,
    bio: "Flags, capitals, and the occasional tectonic tangent.",
    level: 22,
    levelTitle: "Navigator",
    xp: 33_500,
    credits: 410,
    streak: 19,
    accuracy: 88,
    quizzes: 402,
    followers: 1_940,
    following: 305,
    mutuals: 21,
    online: false,
    achievements: ["Flag Sprinter", "Asia Explorer"],
    joined: "2024-07-19",
  },
  {
    handle: "jonasberg",
    name: "Jonas Berg",
    country: "Norway",
    flag: "🇳🇴",
    tier: "explorer",
    verified: false,
    bio: "Fjords, glaciers and cold-weather trivia.",
    level: 12,
    levelTitle: "Explorer",
    xp: 12_060,
    credits: 180,
    streak: 6,
    accuracy: 79,
    quizzes: 141,
    followers: 320,
    following: 188,
    mutuals: 4,
    online: true,
    achievements: ["Nordic Nerd"],
    joined: "2025-02-08",
  },
  {
    handle: "priyanair",
    name: "Priya Nair",
    country: "India",
    flag: "🇮🇳",
    tier: "cartographer",
    verified: true,
    bio: "Monsoon geography, mountain passes, and Capital Sprint records.",
    level: 29,
    levelTitle: "Cartographer",
    xp: 55_300,
    credits: 890,
    streak: 63,
    accuracy: 93,
    quizzes: 741,
    followers: 6_710,
    following: 141,
    mutuals: 17,
    online: false,
    achievements: ["Capital Sprint Champion", "Himalaya Hiker", "Perfect Week"],
    joined: "2024-01-27",
  },
  {
    handle: "sofiarossi",
    name: "Sofia Rossi",
    country: "Italy",
    flag: "🇮🇹",
    tier: "navigator",
    verified: false,
    bio: "Mediterranean coastlines and very competitive about Europe rounds.",
    level: 19,
    levelTitle: "Navigator",
    xp: 27_400,
    credits: 300,
    streak: 24,
    accuracy: 86,
    quizzes: 355,
    followers: 1_120,
    following: 244,
    mutuals: 9,
    online: true,
    achievements: ["Europe Ace", "Coastline Collector"],
    joined: "2024-09-14",
  },
  {
    handle: "kwamemensah",
    name: "Kwame Mensah",
    country: "Ghana",
    flag: "🇬🇭",
    tier: "explorer",
    verified: false,
    bio: "Learning the world in 15 minutes a day.",
    level: 9,
    levelTitle: "Explorer",
    xp: 7_240,
    credits: 95,
    streak: 11,
    accuracy: 74,
    quizzes: 86,
    followers: 148,
    following: 96,
    mutuals: 3,
    online: false,
    achievements: ["First Hundred"],
    joined: "2025-05-30",
  },
  {
    handle: "hannawinter",
    name: "Hanna Winter",
    country: "Germany",
    flag: "🇩🇪",
    tier: "creator",
    verified: true,
    bio: "Cartography history and border stories. New piece every Thursday.",
    level: 26,
    levelTitle: "Cartographer",
    xp: 44_800,
    credits: 720,
    streak: 35,
    accuracy: 90,
    quizzes: 508,
    followers: 8_960,
    following: 74,
    mutuals: 6,
    online: true,
    achievements: ["Archivist", "Border Historian", "Top Creator"],
    joined: "2023-12-15",
  },
  {
    handle: "tomasnovak",
    name: "Tomás Novák",
    country: "Czechia",
    flag: "🇨🇿",
    tier: "navigator",
    verified: false,
    bio: "Central European rivers, mostly for fun.",
    level: 17,
    levelTitle: "Navigator",
    xp: 21_900,
    credits: 260,
    streak: 8,
    accuracy: 83,
    quizzes: 274,
    followers: 640,
    following: 152,
    mutuals: 11,
    online: false,
    achievements: ["River Reader"],
    joined: "2024-11-04",
  },
  {
    handle: "ainaraiz",
    name: "Ainara Ruiz",
    country: "Spain",
    flag: "🇪🇸",
    tier: "explorer",
    verified: false,
    bio: "Weekend explorer. Flags are my weakness.",
    level: 14,
    levelTitle: "Explorer",
    xp: 15_800,
    credits: 210,
    streak: 15,
    accuracy: 81,
    quizzes: 198,
    followers: 410,
    following: 233,
    mutuals: 7,
    online: true,
    achievements: ["Weekend Warrior"],
    joined: "2025-01-21",
  },
  {
    handle: "yukitanaka",
    name: "Yuki Tanaka",
    country: "Japan",
    flag: "🇯🇵",
    tier: "cartographer",
    verified: true,
    bio: "Island chains, volcanoes, and precise map pins.",
    level: 24,
    levelTitle: "Cartographer",
    xp: 39_600,
    credits: 560,
    streak: 51,
    accuracy: 92,
    quizzes: 587,
    followers: 3_480,
    following: 118,
    mutuals: 14,
    online: false,
    achievements: ["Volcano Voyager", "Island Hopper", "Pin Perfect"],
    joined: "2024-04-08",
  },
  {
    handle: "noahclarke",
    name: "Noah Clarke",
    country: "Australia",
    flag: "🇦🇺",
    tier: "navigator",
    verified: false,
    bio: "Oceania advocate. Ask me about atolls.",
    level: 20,
    levelTitle: "Navigator",
    xp: 29_100,
    credits: 340,
    streak: 27,
    accuracy: 85,
    quizzes: 361,
    followers: 990,
    following: 176,
    mutuals: 5,
    online: true,
    achievements: ["Oceania Expert", "Atoll Authority"],
    joined: "2024-08-02",
  },
];

const BY_HANDLE = new Map(MEMBERS.map((m) => [m.handle, m]));

export function memberByHandle(handle: string): Member | undefined {
  return BY_HANDLE.get(handle);
}

/** The signed-in explorer, for composer and "you" affordances. */
export const CURRENT_HANDLE = "amaraokoye";

/** Deterministic avatar gradient stops derived from the handle. */
export function avatarTint(handle: string): { from: string; to: string } {
  let hash = 0;
  for (let i = 0; i < handle.length; i += 1) hash = (hash * 31 + handle.charCodeAt(i)) % 360;
  return {
    from: `oklch(0.62 0.09 ${hash})`,
    to: `oklch(0.38 0.06 ${(hash + 48) % 360})`,
  };
}
