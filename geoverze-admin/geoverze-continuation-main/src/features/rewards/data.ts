import { catalogDaysAgo, pickFrom, rng } from "@/lib/catalog";
import {
  eligibilityRules,
  rewardStatuses,
  rewardTypes,
  type Reward,
  type RewardClaim,
  type RewardType,
} from "@/features/rewards/types";

const namesByType: Record<RewardType, string[]> = {
  Credits: ["GEO Credits 250", "GEO Credits 500", "GEO Credits 1200", "Weekend Credit Boost"],
  Digital: [
    "Atlas Wallpaper Pack",
    "Explorer Avatar Frame",
    "Animated Globe Badge",
    "Map Filter Set",
  ],
  Store: ["Explorer Hoodie", "Cartographer Notebook", "Summit Wall Map", "Voyager Tote Bag"],
  Achievement: ["Continent Master Badge", "Streak Sentinel", "Perfect Run Trophy", "Atlas Scholar"],
  "Special Event": [
    "World Map Day Bundle",
    "Summer Expedition Pass",
    "Winter Cartography Crate",
    "Anniversary Credit Drop",
  ],
};

const claimants = [
  "Ada Whitfield",
  "Milo Grant",
  "Sofia Reyes",
  "Kenji Watanabe",
  "Nora Bergström",
  "Idris Bello",
  "Camille Fontaine",
  "Tomás Oliveira",
];

function buildRewards(): Reward[] {
  const rand = rng(4242);
  return Array.from({ length: 42 }, (_, index) => {
    const type = rewardTypes[index % rewardTypes.length] as RewardType;
    const name = pickFrom(rand, namesByType[type]);
    const unlimited = type === "Achievement" || rand() > 0.7;
    return {
      id: `RWD-${500 + index}`,
      name: `${name}${index > rewardTypes.length ? ` #${index}` : ""}`,
      description: `${type} reward redeemable from the GEOverze rewards hub.`,
      type,
      eligibility: pickFrom(rand, eligibilityRules),
      creditsRequired: [0, 150, 300, 500, 900, 1800, 2500, 4500][Math.floor(rand() * 8)] ?? 300,
      stock: unlimited ? 0 : 20 + Math.floor(rand() * 900),
      unlimited,
      status: pickFrom(rand, rewardStatuses),
      availableFrom: catalogDaysAgo(30 + Math.floor(rand() * 120), 8),
      expiresAt: catalogDaysAgo(-(10 + Math.floor(rand() * 200)), 8),
      claims: Math.floor(rand() * 21000),
      createdAt: catalogDaysAgo(60 + Math.floor(rand() * 240), 8),
      updatedAt: catalogDaysAgo(Math.floor(rand() * 20), 10),
    } satisfies Reward;
  });
}

export const rewards = buildRewards();

function buildClaims(): RewardClaim[] {
  const rand = rng(777);
  const statuses = ["fulfilled", "pending", "cancelled"] as const;
  return Array.from({ length: 160 }, (_, index) => {
    const reward = rewards[Math.floor(rand() * rewards.length)] as Reward;
    return {
      id: `CLM-${9000 + index}`,
      rewardId: reward.id,
      rewardName: reward.name,
      user: pickFrom(rand, claimants),
      credits: reward.creditsRequired,
      status: pickFrom(rand, statuses),
      claimedAt: catalogDaysAgo(Math.floor(rand() * 60), 11),
    } satisfies RewardClaim;
  });
}

export const rewardClaims = buildClaims();

export interface RewardSummary {
  total: number;
  active: number;
  claims: number;
  creditsSpent: number;
  expiringSoon: number;
}

export function summarizeRewards(list: Reward[]): RewardSummary {
  return {
    total: list.length,
    active: list.filter((reward) => reward.status === "active").length,
    claims: list.reduce((sum, reward) => sum + reward.claims, 0),
    creditsSpent: list.reduce((sum, reward) => sum + reward.claims * reward.creditsRequired, 0),
    expiringSoon: list.filter(
      (reward) => new Date(reward.expiresAt).getTime() - Date.now() < 45 * 86400000,
    ).length,
  };
}

/** Top rewards by claim volume — consumed by the dashboard widget. */
export const topRewards = [...rewards]
  .sort((a, b) => b.claims - a.claims)
  .slice(0, 5)
  .map((reward) => ({
    id: reward.id,
    name: reward.name,
    type: reward.type,
    claims: reward.claims,
  }));

export const claimTrend = [42, 55, 48, 63, 58, 71, 66, 78, 74, 85, 81, 93];
