import { catalogDaysAgo, pickFrom, rng } from "@/lib/catalog";
import {
  creditDirections,
  creditReasons,
  type CreditDirection,
  type CreditResetConfig,
  type CreditRule,
  type CreditTransaction,
} from "@/features/credits/types";

const members = [
  "Ada Whitfield",
  "Milo Grant",
  "Sofia Reyes",
  "Kenji Watanabe",
  "Nora Bergström",
  "Idris Bello",
  "Camille Fontaine",
  "Tomás Oliveira",
  "Hana Kimura",
  "Lucas Meyer",
];

const actors = ["system", "a.hughes@geoverze.com", "m.torres@geoverze.com", "automation"];

function buildTransactions(): CreditTransaction[] {
  const rand = rng(9182);
  let balance = 4200;
  return Array.from({ length: 220 }, (_, index) => {
    const direction = pickFrom(rand, creditDirections) as CreditDirection;
    const amount = 25 + Math.floor(rand() * 1500);
    balance = Math.max(0, balance + (direction === "redeemed" ? -amount : amount));
    const member = pickFrom(rand, members);
    return {
      id: `CRD-${20000 + index}`,
      userId: `USR-${1000 + (index % 60)}`,
      user: member,
      direction,
      amount,
      balanceAfter: balance,
      reason: pickFrom(rand, creditReasons),
      reference: `REF-${4000 + Math.floor(rand() * 5000)}`,
      actor: pickFrom(rand, actors),
      createdAt: catalogDaysAgo(Math.floor(rand() * 120), 7),
    } satisfies CreditTransaction;
  });
}

export const creditTransactions = buildTransactions();

export const creditRules: CreditRule[] = [
  {
    id: "CR-01",
    name: "Quiz completion",
    trigger: "Player finishes any published quiz",
    award: 25,
    dailyCap: 500,
    enabled: true,
    updatedAt: catalogDaysAgo(12, 9),
  },
  {
    id: "CR-02",
    name: "Perfect score bonus",
    trigger: "Player scores 100% on a quiz",
    award: 75,
    dailyCap: 300,
    enabled: true,
    updatedAt: catalogDaysAgo(21, 9),
  },
  {
    id: "CR-03",
    name: "Daily streak",
    trigger: "Consecutive daily login",
    award: 40,
    dailyCap: 40,
    enabled: true,
    updatedAt: catalogDaysAgo(5, 9),
  },
  {
    id: "CR-04",
    name: "Referral bonus",
    trigger: "Invited player verifies their account",
    award: 500,
    dailyCap: 2500,
    enabled: true,
    updatedAt: catalogDaysAgo(33, 9),
  },
  {
    id: "CR-05",
    name: "Creator publish reward",
    trigger: "Creator publishes an approved quiz",
    award: 250,
    dailyCap: 1000,
    enabled: false,
    updatedAt: catalogDaysAgo(48, 9),
  },
  {
    id: "CR-06",
    name: "Community helper",
    trigger: "Answer marked helpful in community",
    award: 30,
    dailyCap: 150,
    enabled: true,
    updatedAt: catalogDaysAgo(9, 9),
  },
];

export const creditResetConfig: CreditResetConfig = {
  cadence: "annually",
  resetDay: 1,
  carryOverPercent: 50,
  expiryDays: 365,
};

export interface CreditSummary {
  issued: number;
  redeemed: number;
  outstanding: number;
  transactions: number;
  activeRules: number;
}

export function summarizeCredits(
  list: CreditTransaction[],
  rules: CreditRule[] = creditRules,
): CreditSummary {
  const issued = list
    .filter((item) => item.direction !== "redeemed")
    .reduce((sum, item) => sum + item.amount, 0);
  const redeemed = list
    .filter((item) => item.direction === "redeemed")
    .reduce((sum, item) => sum + item.amount, 0);
  return {
    issued,
    redeemed,
    outstanding: Math.max(0, issued - redeemed),
    transactions: list.length,
    activeRules: rules.filter((rule) => rule.enabled).length,
  };
}

export const creditIssuanceTrend = [52, 61, 58, 70, 66, 79, 74, 88, 83, 91, 87, 96];
export const creditRedemptionTrend = [31, 38, 41, 47, 44, 55, 52, 63, 59, 68, 66, 72];
