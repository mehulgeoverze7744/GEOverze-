/**
 * Suggestion rails: featured explorers, suggested people, suggested creators,
 * friend requests, and the leaderboard snapshot. All placeholder.
 */

import { MEMBERS, type Member } from "./members";

const byHandle = (handle: string): Member => {
  const found = MEMBERS.find((m) => m.handle === handle);
  if (!found) throw new Error(`Unknown member: ${handle}`);
  return found;
};

/** Featured explorers on Community Home. */
export const FEATURED_EXPLORERS: readonly Member[] = [
  byHandle("lucasferreira"),
  byHandle("priyanair"),
  byHandle("yukitanaka"),
  byHandle("hannawinter"),
];

/** People to follow. */
export const SUGGESTED_PEOPLE: readonly { member: Member; reason: string }[] = [
  { member: byHandle("meiling"), reason: "Plays the same capitals sets as you" },
  { member: byHandle("sofiarossi"), reason: "21 mutual explorers" },
  { member: byHandle("noahclarke"), reason: "Top of the Oceania ladder" },
  { member: byHandle("tomasnovak"), reason: "Active in Rivers & lakes" },
  { member: byHandle("ainaraiz"), reason: "New this month" },
];

export const SUGGESTED_CREATORS: readonly { member: Member; reason: string }[] = [
  { member: byHandle("hannawinter"), reason: "Border Stories · weekly" },
  { member: byHandle("lucasferreira"), reason: "Amazon basin long-form" },
  { member: byHandle("priyanair"), reason: "Monsoon geography series" },
];

export type FriendRequest = { member: Member; mutuals: number; sentAt: string };

export const FRIEND_REQUESTS: readonly FriendRequest[] = [
  { member: byHandle("kwamemensah"), mutuals: 3, sentAt: "2026-08-06T03:02:00Z" },
  { member: byHandle("ainaraiz"), mutuals: 7, sentAt: "2026-08-05T18:40:00Z" },
  { member: byHandle("tomasnovak"), mutuals: 11, sentAt: "2026-08-04T21:16:00Z" },
];

/** Explorers you already play with. */
export const FRIENDS: readonly Member[] = [
  byHandle("priyanair"),
  byHandle("meiling"),
  byHandle("sofiarossi"),
  byHandle("jonasberg"),
  byHandle("yukitanaka"),
  byHandle("noahclarke"),
  byHandle("lucasferreira"),
];

export type RecentlyPlayed = { member: Member; quiz: string; result: string; when: string };

export const RECENTLY_PLAYED: readonly RecentlyPlayed[] = [
  {
    member: byHandle("priyanair"),
    quiz: "Capital Sprint — Asia",
    result: "Lost 22 – 24",
    when: "2 hours ago",
  },
  {
    member: byHandle("jonasberg"),
    quiz: "Rivers of Europe",
    result: "Won 18 – 14",
    when: "Yesterday",
  },
  {
    member: byHandle("sofiarossi"),
    quiz: "Flags of the World",
    result: "Won 27 – 25",
    when: "2 days ago",
  },
  {
    member: byHandle("yukitanaka"),
    quiz: "Volcanoes & Ranges",
    result: "Lost 16 – 20",
    when: "4 days ago",
  },
];

export type SnapshotBoard = "xp" | "credits" | "streak" | "explorers";

export const SNAPSHOT_LABEL: Record<SnapshotBoard, string> = {
  xp: "Top XP",
  credits: "Top credits",
  streak: "Top win streak",
  explorers: "Top explorers",
};

/** Mini leaderboard rows per board, already ordered. */
export const LEADERBOARD_SNAPSHOT: Record<
  SnapshotBoard,
  readonly { member: Member; value: string }[]
> = {
  xp: [
    { member: byHandle("lucasferreira"), value: "62,140 XP" },
    { member: byHandle("priyanair"), value: "55,300 XP" },
    { member: byHandle("amaraokoye"), value: "48,920 XP" },
    { member: byHandle("hannawinter"), value: "44,800 XP" },
    { member: byHandle("yukitanaka"), value: "39,600 XP" },
  ],
  credits: [
    { member: byHandle("lucasferreira"), value: "1,180 cr" },
    { member: byHandle("priyanair"), value: "890 cr" },
    { member: byHandle("hannawinter"), value: "720 cr" },
    { member: byHandle("amaraokoye"), value: "640 cr" },
    { member: byHandle("yukitanaka"), value: "560 cr" },
  ],
  streak: [
    { member: byHandle("lucasferreira"), value: "88 days" },
    { member: byHandle("priyanair"), value: "63 days" },
    { member: byHandle("yukitanaka"), value: "51 days" },
    { member: byHandle("amaraokoye"), value: "42 days" },
    { member: byHandle("hannawinter"), value: "35 days" },
  ],
  explorers: [
    { member: byHandle("lucasferreira"), value: "94% accuracy" },
    { member: byHandle("priyanair"), value: "93% accuracy" },
    { member: byHandle("yukitanaka"), value: "92% accuracy" },
    { member: byHandle("amaraokoye"), value: "91% accuracy" },
    { member: byHandle("hannawinter"), value: "90% accuracy" },
  ],
};

export type RecentAchievement = { member: Member; achievement: string; when: string };

export const RECENT_ACHIEVEMENTS: readonly RecentAchievement[] = [
  { member: byHandle("lucasferreira"), achievement: "Century Streak", when: "11 hours ago" },
  { member: byHandle("amaraokoye"), achievement: "Sahel Specialist", when: "2 days ago" },
  { member: byHandle("noahclarke"), achievement: "Atoll Authority", when: "3 days ago" },
  { member: byHandle("meiling"), achievement: "Flag Sprinter", when: "5 days ago" },
];
