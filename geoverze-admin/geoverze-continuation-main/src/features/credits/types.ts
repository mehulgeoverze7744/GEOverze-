export const creditReasons = [
  "Quiz completion",
  "Daily streak",
  "Referral bonus",
  "Store purchase",
  "Reward redemption",
  "Subscription grant",
  "Manual adjustment",
  "Refund",
  "Fraud clawback",
] as const;
export type CreditReason = (typeof creditReasons)[number];

export const creditDirections = ["issued", "redeemed", "adjusted"] as const;
export type CreditDirection = (typeof creditDirections)[number];

export interface CreditTransaction {
  id: string;
  userId: string;
  user: string;
  direction: CreditDirection;
  amount: number;
  balanceAfter: number;
  reason: CreditReason;
  reference: string;
  actor: string;
  createdAt: string;
}

export interface CreditRule {
  id: string;
  name: string;
  trigger: string;
  award: number;
  dailyCap: number;
  enabled: boolean;
  updatedAt: string;
}

export interface CreditResetConfig {
  cadence: "never" | "monthly" | "quarterly" | "annually";
  resetDay: number;
  carryOverPercent: number;
  expiryDays: number;
}

export interface CreditFilterState {
  direction: string;
  reason: string;
  window: string;
}

export const emptyCreditFilters: CreditFilterState = {
  direction: "all",
  reason: "all",
  window: "all",
};
