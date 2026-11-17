/**
 * Central GVRZE membership entitlement client.
 *
 * Server RPCs (`get_my_membership`, `check_entitlement`, `get_remaining_quizzes`)
 * are authoritative. Helpers here only interpret that snapshot for UI.
 */

import type { TierId } from "../data/plans";
import { resolveEntitlements, type Entitlements } from "./entitlements.ts";

export type LibraryAccessLevel = "browse" | "limited" | "full";

export type QuizUsageSnapshot = {
  periodStart: string | null;
  soloCount: number;
  pvpCount: number;
  multiplayerCount: number;
  totalCount: number;
};

export type RemainingQuizzes = {
  periodStart: string | null;
  soloRemaining: number | null;
  pvpRemaining: number | null;
  multiplayerRemaining: number | null;
  monthlyRemaining: number | null;
  unlimited: boolean;
};

export type UserMembership = {
  userId: string;
  tier: TierId;
  planName: string;
  status: string;
  startedAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  billingInterval: "monthly" | "annual" | null;
  monthlyQuizLimit: number | null;
  soloQuizLimit: number | null;
  pvpLimit: number | null;
  multiplayerLimit: number | null;
  monthlyCreditGrant: number;
  creditRolloverMonths: number;
  availableCredits: number;
  periodGrantAmount: number;
  gstoreDiscountBps: number;
  libraryAccess: LibraryAccessLevel;
  pvpAccess: boolean;
  multiplayerAccess: boolean;
  allAtlases: boolean;
  advancedAnalytics: boolean;
  memberChallenges: boolean;
  creatorStudio: boolean;
  quizUsage: QuizUsageSnapshot;
  entitlements: Entitlements;
};

export type EntitlementFeature =
  | "limited_library"
  | "full_library"
  | "atlases"
  | "question_packs"
  | "advanced_analytics"
  | "member_challenges"
  | "creator_studio"
  | "pvp"
  | "multiplayer"
  | "gstore_discount";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asTier(value: unknown): TierId {
  if (value === "basic" || value === "pro" || value === "advance") return value;
  return "explorer";
}

function asLibraryAccess(value: unknown): LibraryAccessLevel {
  if (value === "limited" || value === "full" || value === "browse") return value;
  return "browse";
}

function remainingOf(limit: number | null, used: number): number | null {
  if (limit == null) return null;
  return Math.max(0, limit - used);
}

/** Parse `get_my_membership` JSON into a typed snapshot. */
export function parseUserMembership(raw: unknown): UserMembership | null {
  const data = asRecord(raw);
  if (!data) return null;
  const userId = asString(data.user_id);
  if (!userId) return null;

  const usageRaw = asRecord(data.quiz_usage);
  const quizUsage: QuizUsageSnapshot = {
    periodStart: asString(usageRaw?.period_start) ?? null,
    soloCount: asNumber(usageRaw?.solo_count) ?? 0,
    pvpCount: asNumber(usageRaw?.pvp_count) ?? 0,
    multiplayerCount: asNumber(usageRaw?.multiplayer_count) ?? 0,
    totalCount: asNumber(usageRaw?.total_count) ?? 0,
  };

  const tier = asTier(data.tier);
  const intervalRaw = asString(data.billing_interval);

  return {
    userId,
    tier,
    planName: asString(data.plan_name) ?? "Explorer",
    status: asString(data.status) ?? "active",
    startedAt: asString(data.started_at),
    currentPeriodStart: asString(data.current_period_start),
    currentPeriodEnd: asString(data.current_period_end),
    renewalDate: asString(data.renewal_date) ?? asString(data.current_period_end),
    cancelAtPeriodEnd: asBoolean(data.cancel_at_period_end),
    cancelledAt: asString(data.cancelled_at),
    billingInterval: intervalRaw === "annual" ? "annual" : intervalRaw === "monthly" ? "monthly" : null,
    monthlyQuizLimit: asNumber(data.monthly_quiz_limit),
    soloQuizLimit: asNumber(data.solo_quiz_limit),
    pvpLimit: asNumber(data.pvp_limit),
    multiplayerLimit: asNumber(data.multiplayer_limit),
    monthlyCreditGrant: asNumber(data.monthly_credit_grant) ?? 0,
    creditRolloverMonths: asNumber(data.credit_rollover_months) ?? 1,
    availableCredits: asNumber(data.available_credits) ?? 0,
    periodGrantAmount: asNumber(data.period_grant_amount) ?? 0,
    gstoreDiscountBps: asNumber(data.gstore_discount_bps) ?? 0,
    libraryAccess: asLibraryAccess(data.library_access),
    pvpAccess: asBoolean(data.pvp_access),
    multiplayerAccess: asBoolean(data.multiplayer_access),
    allAtlases: asBoolean(data.all_atlases),
    advancedAnalytics: asBoolean(data.advanced_analytics),
    memberChallenges: asBoolean(data.member_challenges),
    creatorStudio: asBoolean(data.creator_studio),
    quizUsage,
    entitlements: {
      ...resolveEntitlements(tier),
      pvpAccess: asBoolean(data.pvp_access),
      multiplayerAccess: asBoolean(data.multiplayer_access),
      allAtlases: asBoolean(data.all_atlases),
      advancedAnalytics: asBoolean(data.advanced_analytics),
      memberChallenges: asBoolean(data.member_challenges),
      gstoreDiscount3Pct: (asNumber(data.gstore_discount_bps) ?? 0) >= 300,
      gstoreDiscount10Pct: (asNumber(data.gstore_discount_bps) ?? 0) >= 1000,
    },
  };
}

export function getRemainingQuizzes(membership: UserMembership): RemainingQuizzes {
  const used = membership.quizUsage;
  const unlimited =
    membership.monthlyQuizLimit == null && membership.soloQuizLimit == null;
  return {
    periodStart: used.periodStart,
    soloRemaining: remainingOf(membership.soloQuizLimit, used.soloCount),
    pvpRemaining: remainingOf(membership.pvpLimit, used.pvpCount),
    multiplayerRemaining: remainingOf(membership.multiplayerLimit, used.multiplayerCount),
    monthlyRemaining: remainingOf(membership.monthlyQuizLimit, used.totalCount),
    unlimited,
  };
}

export function getLibraryAccess(membership: UserMembership | null): LibraryAccessLevel {
  return membership?.libraryAccess ?? "browse";
}

export function getMembershipDiscountBps(membership: UserMembership | null): number {
  return membership?.gstoreDiscountBps ?? 0;
}

export function getMembershipDiscountPercent(membership: UserMembership | null): number {
  return getMembershipDiscountBps(membership) / 100;
}

export function checkEntitlement(
  membership: UserMembership | null,
  feature: EntitlementFeature,
): boolean {
  if (!membership) return false;
  const can = membership.entitlements;
  switch (feature) {
    case "limited_library":
      return can.limitedLibraryAccess;
    case "full_library":
      return can.fullLibraryAccess;
    case "atlases":
    case "question_packs":
      return can.allAtlases;
    case "advanced_analytics":
      return can.advancedAnalytics;
    case "member_challenges":
      return can.memberChallenges;
    case "creator_studio":
      return can.creatorStudio;
    case "pvp":
      return membership.pvpAccess;
    case "multiplayer":
      return membership.multiplayerAccess;
    case "gstore_discount":
      return membership.gstoreDiscountBps > 0;
    default:
      return false;
  }
}

export function quotaExceededKind(message: string | null | undefined): "solo" | "pvp" | "multiplayer" | "monthly" | "locked" | null {
  if (!message) return null;
  if (message.includes("QUOTA_EXCEEDED:solo")) return "solo";
  if (message.includes("QUOTA_EXCEEDED:pvp")) return "pvp";
  if (message.includes("QUOTA_EXCEEDED:multiplayer")) return "multiplayer";
  if (message.includes("QUOTA_EXCEEDED:monthly")) return "monthly";
  if (message.includes("QUIZ_LOCKED") || message.includes("ENTITLEMENT:")) return "locked";
  return null;
}

export function explorerMembershipFallback(): Omit<UserMembership, "userId"> & { userId: string | null } {
  return {
    userId: null,
    tier: "explorer",
    planName: "Explorer",
    status: "active",
    startedAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    renewalDate: null,
    cancelAtPeriodEnd: false,
    cancelledAt: null,
    billingInterval: null,
    monthlyQuizLimit: null,
    soloQuizLimit: 8,
    pvpLimit: 1,
    multiplayerLimit: 1,
    monthlyCreditGrant: 0,
    creditRolloverMonths: 1,
    availableCredits: 0,
    periodGrantAmount: 0,
    gstoreDiscountBps: 0,
    libraryAccess: "browse",
    pvpAccess: true,
    multiplayerAccess: true,
    allAtlases: false,
    advancedAnalytics: false,
    memberChallenges: false,
    creatorStudio: false,
    quizUsage: {
      periodStart: null,
      soloCount: 0,
      pvpCount: 0,
      multiplayerCount: 0,
      totalCount: 0,
    },
    entitlements: resolveEntitlements("explorer"),
  };
}
