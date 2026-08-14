import type {
  CreatorAchievement,
  CreatorActivity,
  CreatorNote,
  CreatorQuiz,
  CreatorQuizStatus,
  CreatorRecord,
  CreatorTier,
  CreatorWarning,
  RevenuePoint,
  VerificationEvent,
  VerificationState,
} from "@/features/creators/types";
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

export function daysSince(iso: string) {
  return Math.max(0, Math.floor((NOW - new Date(iso).getTime()) / 86400000));
}

const firstNames = [
  "Amara",
  "Noel",
  "Ingrid",
  "Tomas",
  "Yuki",
  "Rafael",
  "Lena",
  "Idris",
  "Mira",
  "Kofi",
  "Sofia",
  "Hugo",
  "Nadia",
  "Pablo",
  "Ayla",
  "Dmitri",
  "Chiara",
  "Owen",
  "Zara",
  "Felix",
];
const lastNames = [
  "Okafor",
  "Berg",
  "Halvorsen",
  "Duarte",
  "Tanaka",
  "Costa",
  "Meyer",
  "Rahman",
  "Petrova",
  "Mensah",
  "Rossi",
  "Lindqvist",
  "Haddad",
  "Navarro",
  "Demir",
  "Ivanov",
  "Bianchi",
  "Clarke",
];
export const creatorCountries = [
  "Norway",
  "Germany",
  "Japan",
  "Brazil",
  "Nigeria",
  "Spain",
  "India",
  "Canada",
  "Australia",
  "Portugal",
  "Sweden",
  "Kenya",
];
export const creatorTiers: CreatorTier[] = ["Bronze", "Silver", "Gold", "Partner"];
export const verificationStates: VerificationState[] = [
  "Pending",
  "Verified",
  "Rejected",
  "Suspended",
];

const categories = [
  "Capitals",
  "Physical Geography",
  "Flags",
  "Climate",
  "Oceans",
  "Borders",
  "Landmarks",
];
const quizNouns = [
  "World Capitals",
  "Tectonic Plates",
  "River Systems",
  "Climate Zones",
  "Ocean Currents",
  "Mountain Ranges",
  "Island Nations",
  "Desert Belts",
  "Flag Sprint",
  "Border Puzzle",
];
const achievementNames = [
  "First Publish",
  "1k Plays",
  "Community Favourite",
  "Streak Author",
  "Top Rated",
  "Atlas Architect",
  "Verified Voice",
];
const warningReasons = [
  "Duplicate quiz content",
  "Inaccurate map data",
  "Late response to moderation",
  "Copyrighted imagery",
];
const moderators = ["M. Alvarez", "J. Kim", "S. Patel", "R. Novak"];
const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

function buildQuizzes(rand: () => number, index: number, count: number): CreatorQuiz[] {
  return Array.from({ length: count }, (_, q) => {
    const status = pick<CreatorQuizStatus>(rand, [
      "published",
      "published",
      "published",
      "draft",
      "archived",
    ]);
    const plays =
      status === "published" ? Math.floor(rand() * 48000) + 320 : Math.floor(rand() * 400);
    return {
      id: `QZ-${String(index).padStart(3, "0")}-${String(q + 1).padStart(2, "0")}`,
      title: `${pick(rand, quizNouns)} — Level ${Math.floor(rand() * 5) + 1}`,
      category: pick(rand, categories),
      status,
      plays,
      averageScore: Math.floor(rand() * 38) + 58,
      completionRate: Math.floor(rand() * 40) + 56,
      rating: Math.round((rand() * 2 + 3) * 10) / 10,
      updatedAt: isoDaysAgo(Math.floor(rand() * 180) + 1, q),
    } satisfies CreatorQuiz;
  });
}

function buildTimeline(
  rand: () => number,
  index: number,
  verification: VerificationState,
  joinDate: string,
): VerificationEvent[] {
  const events: VerificationEvent[] = [
    {
      id: `VT-${index}-1`,
      state: "Applied",
      actor: "Creator",
      note: "Submitted creator application with portfolio.",
      at: joinDate,
    },
    {
      id: `VT-${index}-2`,
      state: "Pending",
      actor: pick(rand, moderators),
      note: "Application entered the verification queue.",
      at: isoDaysAgo(daysSince(joinDate) - 2, 11),
    },
  ];
  if (verification !== "Pending") {
    events.push({
      id: `VT-${index}-3`,
      state: verification,
      actor: pick(rand, moderators),
      note:
        verification === "Verified"
          ? "Identity and content quality checks passed."
          : verification === "Rejected"
            ? "Portfolio did not meet quality guidelines."
            : "Account suspended pending policy review.",
      at: isoDaysAgo(Math.floor(rand() * 60) + 3, 15),
    });
  }
  return events;
}

function buildCreator(index: number): CreatorRecord {
  const rand = rng(index * 7919 + 13);
  const first = pick(rand, firstNames);
  const last = pick(rand, lastNames);
  const displayName = `${first} ${last}`;
  const username = `${first.toLowerCase()}.${last.toLowerCase()}${index}`;
  const verification = pick(rand, [
    "Verified",
    "Verified",
    "Verified",
    "Pending",
    "Pending",
    "Rejected",
    "Suspended",
  ] as const);
  const status: Status =
    verification === "Suspended" ? "suspended" : verification === "Pending" ? "pending" : "active";
  const joinedDays = Math.floor(rand() * 900) + 20;
  const joinDate = isoDaysAgo(joinedDays, 10);
  const quizzes = buildQuizzes(rand, index, Math.floor(rand() * 8) + 3);
  const published = quizzes.filter((q) => q.status === "published");
  const totalPlays = quizzes.reduce((sum, q) => sum + q.plays, 0);
  const lastActiveDays = Math.floor(rand() * 90);

  const activity: CreatorActivity[] = Array.from({ length: 6 }, (_, a) => ({
    id: `CA-${index}-${a}`,
    actor: displayName,
    action: pick(rand, [
      "published",
      "updated",
      "archived",
      "received a report on",
      "responded to feedback on",
    ]),
    target: pick(rand, quizzes).title,
    time: isoDaysAgo(a * 3 + 1, 8),
  }));

  const achievements: CreatorAchievement[] = Array.from(
    { length: Math.floor(rand() * 4) + 1 },
    (_, a) => ({
      id: `CACH-${index}-${a}`,
      name: pick(rand, achievementNames),
      description: "Milestone unlocked through creator activity.",
      earnedAt: isoDaysAgo(Math.floor(rand() * 400) + 5, 12),
    }),
  );

  const warningCount = verification === "Suspended" ? 2 : rand() > 0.75 ? 1 : 0;
  const warnings: CreatorWarning[] = Array.from({ length: warningCount }, (_, w) => ({
    id: `CW-${index}-${w}`,
    reason: pick(rand, warningReasons),
    severity: pick(rand, ["Low", "Medium", "High", "Critical"] as const),
    issuedBy: pick(rand, moderators),
    issuedAt: isoDaysAgo(Math.floor(rand() * 200) + 4, 16),
  }));

  const notes: CreatorNote[] = Array.from({ length: Math.floor(rand() * 3) }, (_, n) => ({
    id: `CN-${index}-${n}`,
    author: pick(rand, moderators),
    body: pick(rand, [
      "Consistently high quality submissions — good partner candidate.",
      "Asked for help with the quiz editor; follow up next month.",
      "Payout details verified with finance.",
      "Requested tier upgrade review.",
    ]),
    createdAt: isoDaysAgo(Math.floor(rand() * 150) + 2, 13),
  }));

  const revenue = Math.floor(rand() * 42000) + 400;
  const revenueSeries: RevenuePoint[] = months.map((month, m) => ({
    month,
    amount: Math.floor((revenue / 12) * (0.5 + rand() + m * 0.05)),
  }));

  return {
    id: `CR-${String(1000 + index)}`,
    displayName,
    username,
    email: `${username}@geoverze.io`,
    country: pick(rand, creatorCountries),
    tier: pick(rand, creatorTiers),
    verification,
    status,
    activityState: lastActiveDays <= 30 ? "Active" : "Inactive",
    totalQuizzes: quizzes.length,
    publishedQuizzes: published.length,
    draftQuizzes: quizzes.filter((q) => q.status === "draft").length,
    followers: Math.floor(rand() * 180000) + 120,
    totalPlays,
    revenue,
    rating: Math.round((rand() * 1.6 + 3.3) * 10) / 10,
    joinDate,
    lastActiveAt: isoDaysAgo(lastActiveDays, 14),
    bio: "Geography creator building map-first quizzes for the GEOverze community.",
    website: `https://${username.replace(/\./g, "-")}.geo.site`,
    quizzes,
    activity,
    achievements,
    warnings,
    notes,
    verificationTimeline: buildTimeline(rand, index, verification, joinDate),
    revenueSeries,
    playsSeries: months.map((_, m) => Math.floor(40 + rand() * 55 + m * 1.5)),
  };
}

const records: CreatorRecord[] = Array.from({ length: 48 }, (_, i) => buildCreator(i + 1));

/**
 * Mock service layer. Replace the bodies with Lovable Cloud queries when the
 * backend is connected — call sites already treat these as the data source.
 */
export function getCreators(): CreatorRecord[] {
  return records;
}

export function getCreatorById(id: string): CreatorRecord | undefined {
  return records.find((creator) => creator.id === id);
}

export const creatorRecords = records;

export interface CreatorStatsSummary {
  total: number;
  verified: number;
  pending: number;
  active: number;
  inactive: number;
  publishedQuizzes: number;
  averageRating: number;
  monthlyGrowth: number;
}

export function summarizeCreators(list: CreatorRecord[]): CreatorStatsSummary {
  const total = list.length;
  const verified = list.filter((c) => c.verification === "Verified").length;
  const pending = list.filter((c) => c.verification === "Pending").length;
  const active = list.filter((c) => c.activityState === "Active" && c.status === "active").length;
  const publishedQuizzes = list.reduce((sum, c) => sum + c.publishedQuizzes, 0);
  const averageRating = total
    ? Math.round((list.reduce((sum, c) => sum + c.rating, 0) / total) * 10) / 10
    : 0;
  const joinedLast30 = list.filter((c) => daysSince(c.joinDate) <= 30).length;
  return {
    total,
    verified,
    pending,
    active,
    inactive: total - active,
    publishedQuizzes,
    averageRating,
    monthlyGrowth: total ? Math.round((joinedLast30 / total) * 1000) / 10 : 0,
  };
}

/** Normalized 0-100 signup trend for the growth chart. */
export function creatorGrowthSeries(list: CreatorRecord[]): number[] {
  const buckets = Array.from({ length: 12 }, () => 0);
  for (const creator of list) {
    const monthsAgo = Math.min(11, Math.floor(daysSince(creator.joinDate) / 30));
    buckets[11 - monthsAgo] = (buckets[11 - monthsAgo] ?? 0) + 1;
  }
  const max = Math.max(1, ...buckets);
  return buckets.map((value) => Math.round((value / max) * 100));
}

export function creatorTierSeries(list: CreatorRecord[]): { labels: string[]; series: number[] } {
  const counts = creatorTiers.map((tier) => list.filter((c) => c.tier === tier).length);
  const max = Math.max(1, ...counts);
  return {
    labels: creatorTiers.map((tier, i) => `${tier} (${counts[i]})`),
    series: counts.map((value) => Math.round((value / max) * 100)),
  };
}

export const monthLabels = months;
