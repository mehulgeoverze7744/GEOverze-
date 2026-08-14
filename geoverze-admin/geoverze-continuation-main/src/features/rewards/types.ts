export const rewardTypes = ["Credits", "Digital", "Store", "Achievement", "Special Event"] as const;
export type RewardType = (typeof rewardTypes)[number];

export const rewardStatuses = ["draft", "active", "paused", "archived"] as const;
export type RewardStatus = (typeof rewardStatuses)[number];

export const eligibilityRules = [
  "All players",
  "Verified accounts",
  "Pro subscribers",
  "Advanced subscribers",
  "Creators",
  "Streak 7+ days",
  "Top 10% leaderboard",
] as const;
export type EligibilityRule = (typeof eligibilityRules)[number];

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  eligibility: EligibilityRule;
  creditsRequired: number;
  stock: number;
  unlimited: boolean;
  status: RewardStatus;
  availableFrom: string;
  expiresAt: string;
  claims: number;
  createdAt: string;
  updatedAt: string;
}

export interface RewardClaim {
  id: string;
  rewardId: string;
  rewardName: string;
  user: string;
  credits: number;
  status: "fulfilled" | "pending" | "cancelled";
  claimedAt: string;
}

export interface RewardFilterState {
  type: string;
  status: string;
  eligibility: string;
}

export const emptyRewardFilters: RewardFilterState = {
  type: "all",
  status: "all",
  eligibility: "all",
};
