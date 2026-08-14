import { users as baseUsers } from "@/lib/mock-data";
import type {
  CreatorStatus,
  Membership,
  PlatformUser,
  UserAchievement,
  UserBookmark,
  UserLoginEvent,
  UserPurchase,
  UserQuizAttempt,
  UserReportRecord,
} from "@/features/users/types";
import type { Status } from "@/types";

/** Deterministic pseudo-random so SSR and client render identically. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const pick = <T>(rand: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rand() * arr.length)] as T;

const NOW = Date.UTC(2026, 7, 6);

function isoDaysAgo(days: number, hourSeed = 9) {
  return new Date(NOW - days * 86400000 + hourSeed * 3600000).toISOString();
}

const memberships: Membership[] = ["Free", "Free", "Plus", "Premium", "Premium", "Elite"];
const creatorStatuses: CreatorStatus[] = [
  "None",
  "None",
  "None",
  "Applied",
  "Approved",
  "Rejected",
];
const achievementNames = [
  "Atlas Initiate",
  "Border Runner",
  "Cartographer",
  "Streak Keeper",
  "Globe Trotter",
  "Summit Seeker",
  "Ocean Voyager",
  "Capital Collector",
];
const quizTitles = [
  "World Capitals — Level 3",
  "Tectonic Plates — Level 2",
  "River Systems — Level 4",
  "Climate Zones — Level 1",
  "Ocean Currents — Level 5",
  "Mountain Ranges — Level 2",
];
const storeItems = [
  "Premium Monthly",
  "Credit Pack 500",
  "Elite Annual",
  "Map Skin — Aurora",
  "Hint Bundle",
  "Creator Toolkit",
];
const devices = [
  "Chrome / macOS",
  "Safari / iOS",
  "Chrome / Windows",
  "Firefox / Linux",
  "GEOverze Android",
];
const cities = ["Mumbai", "Berlin", "São Paulo", "Tokyo", "Lagos", "Madrid", "Toronto", "Austin"];
const reportReasons = [
  "Inappropriate quiz content",
  "Spam in community feed",
  "Harassment in comments",
  "Copyright complaint",
  "Cheating suspicion",
];
const rarities = ["Common", "Rare", "Epic", "Legendary"] as const;

function buildAchievements(rand: () => number): UserAchievement[] {
  return Array.from({ length: Math.floor(rand() * 6) }, (_, i) => ({
    id: `ach_${i}`,
    name: pick(rand, achievementNames),
    description: "Earned through sustained play across GEOverze challenges.",
    earnedAt: isoDaysAgo(Math.floor(rand() * 300)),
    rarity: pick(rand, rarities),
  }));
}

function buildQuizActivity(rand: () => number): UserQuizAttempt[] {
  return Array.from({ length: Math.floor(rand() * 7) }, (_, i) => ({
    id: `att_${i}`,
    quiz: pick(rand, quizTitles),
    score: Math.floor(rand() * 100),
    accuracy: Math.floor(rand() * 60) + 40,
    playedAt: isoDaysAgo(Math.floor(rand() * 30)),
  }));
}

function buildPurchases(rand: () => number): UserPurchase[] {
  return Array.from({ length: Math.floor(rand() * 5) }, (_, i) => ({
    id: `pur_${i}`,
    item: pick(rand, storeItems),
    amount: Math.floor(rand() * 90) + 5,
    currency: "USD",
    status: pick(rand, ["paid", "paid", "refunded", "failed"]) as Status,
    purchasedAt: isoDaysAgo(Math.floor(rand() * 240)),
  }));
}

function buildReports(rand: () => number): UserReportRecord[] {
  return Array.from({ length: Math.floor(rand() * 3) }, (_, i) => ({
    id: `rep_${i}`,
    reason: pick(rand, reportReasons),
    direction: pick(rand, ["Filed", "Received"] as const),
    status: pick(rand, ["open", "resolved", "pending"]) as Status,
    createdAt: isoDaysAgo(Math.floor(rand() * 120)),
  }));
}

function buildBookmarks(rand: () => number): UserBookmark[] {
  return Array.from({ length: Math.floor(rand() * 6) }, (_, i) => ({
    id: `bkm_${i}`,
    title: pick(rand, [
      ...quizTitles,
      "Field guide: Reading topographic maps",
      "Why deserts migrate",
    ]),
    type: pick(rand, ["Quiz", "Article", "Question"] as const),
    savedAt: isoDaysAgo(Math.floor(rand() * 150)),
  }));
}

function buildLoginHistory(rand: () => number): UserLoginEvent[] {
  return Array.from({ length: Math.floor(rand() * 5) + 2 }, (_, i) => ({
    id: `log_${i}`,
    device: pick(rand, devices),
    location: `${pick(rand, cities)}`,
    ip: `${Math.floor(rand() * 200) + 20}.${Math.floor(rand() * 250)}.${Math.floor(rand() * 250)}.${Math.floor(rand() * 250)}`,
    result: rand() > 0.15 ? "Success" : "Failed",
    at: isoDaysAgo(i * 2 + Math.floor(rand() * 2), 7 + i),
  }));
}

function slugify(name: string, index: number) {
  return `${name.toLowerCase().replace(/[^a-z]+/g, "")}${(index * 7) % 97}`;
}

export const platformUsers: PlatformUser[] = baseUsers.map((user, index) => {
  const rand = rng(index + 4241);
  const membership = pick(rand, memberships);
  const creatorStatus: CreatorStatus =
    user.role === "Creator" ? "Approved" : pick(rand, creatorStatuses);
  const lastActiveDays = Math.floor(rand() ** 3 * 45);
  const registeredDays = Math.max(lastActiveDays, Math.floor(rand() ** 2 * 700));

  return {
    ...user,
    username: slugify(user.name, index + 1),
    displayName: user.name,
    avatarSeed: user.id,
    membership,
    level: Math.floor(rand() * 60) + 1,
    xp: Math.floor(rand() * 180000),
    currentStreak: Math.floor(rand() * 90),
    creatorStatus,
    ageVerified: rand() > 0.28,
    registeredAt: isoDaysAgo(registeredDays),
    lastActiveAt: isoDaysAgo(lastActiveDays, 11),
    achievements: buildAchievements(rand),
    quizActivity: buildQuizActivity(rand),
    purchases: buildPurchases(rand),
    reports: buildReports(rand),
    bookmarks: buildBookmarks(rand),
    loginHistory: buildLoginHistory(rand),
    creator:
      creatorStatus === "Approved"
        ? {
            handle: `@${slugify(user.name, index + 3)}`,
            tier: pick(rand, ["Bronze", "Silver", "Gold", "Partner"]),
            publishedQuizzes: Math.floor(rand() * 90),
            followers: Math.floor(rand() * 65000),
            lifetimeRevenue: Math.floor(rand() * 38000),
            appliedAt: isoDaysAgo(registeredDays - 30),
          }
        : undefined,
  } satisfies PlatformUser;
});

export const userCountries = [...new Set(platformUsers.map((u) => u.country))].sort();
export const userRoles = [...new Set(platformUsers.map((u) => u.role))].sort();

export function daysSince(iso: string) {
  return Math.floor((NOW - new Date(iso).getTime()) / 86400000);
}

export const userStats = {
  total: platformUsers.length,
  activeToday: platformUsers.filter((u) => daysSince(u.lastActiveAt) < 1).length,
  newThisWeek: platformUsers.filter((u) => daysSince(u.registeredAt) <= 7).length,
  premium: platformUsers.filter((u) => u.membership === "Premium" || u.membership === "Elite")
    .length,
  creators: platformUsers.filter((u) => u.creatorStatus === "Approved").length,
  suspended: platformUsers.filter((u) => u.status === "suspended").length,
  pendingVerification: platformUsers.filter((u) => !u.ageVerified).length,
};
