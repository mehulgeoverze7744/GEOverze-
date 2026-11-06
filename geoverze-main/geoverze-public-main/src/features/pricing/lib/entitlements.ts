/**
 * Centralized GVRZE membership entitlement definitions.
 *
 * Rules here are for client-side UI gating only (show/hide, soft prompts).
 * Server-side enforcement is in Postgres RLS policies and Edge Function guards.
 *
 * Tier ordering: explorer < basic < pro < advance
 */

import type { TierId } from "../data/plans";

export const TIER_RANK: Record<TierId, number> = {
  explorer: 0,
  basic: 1,
  pro: 2,
  advance: 3,
};

/** True when `tier` is at least `required`. */
export function meetsMinTier(tier: TierId, required: TierId): boolean {
  return TIER_RANK[tier] >= TIER_RANK[required];
}

/** Returns the minimum tier name needed for a feature, e.g. "Pro". */
export function minTierLabel(required: TierId): string {
  const labels: Record<TierId, string> = {
    explorer: "Explorer",
    basic: "Basic",
    pro: "Pro",
    advance: "Advance",
  };
  return labels[required];
}

export type Entitlements = {
  /** Unlimited quiz sessions (Pro+). */
  unlimitedQuizzes: boolean;
  /** PvP duel access (Pro+). */
  pvpAccess: boolean;
  /** Multiplayer rooms (Pro+). */
  multiplayerAccess: boolean;
  /** Full GVRZE Library browsing (Pro+). */
  fullLibraryAccess: boolean;
  /** Limited library access (Basic+). */
  limitedLibraryAccess: boolean;
  /** All atlases and question packs (Pro+). */
  allAtlases: boolean;
  /** Creator Studio and publishing (Advance only). */
  creatorStudio: boolean;
  /** Priority content review (Advance only). */
  priorityReview: boolean;
  /** Early AI feature access (Advance only). */
  earlyAiAccess: boolean;
  /** Gstore 3% discount (Basic+). */
  gstoreDiscount3Pct: boolean;
  /** Gstore 10% discount (Pro+). */
  gstoreDiscount10Pct: boolean;
  /** Advanced progress analytics (Pro+). */
  advancedAnalytics: boolean;
  /** Member-only challenges (Pro+). */
  memberChallenges: boolean;
  /** True when any paid plan is active. */
  isPaidMember: boolean;
};

/** Derives the full entitlement set from a tier. */
export function resolveEntitlements(tier: TierId): Entitlements {
  const rank = TIER_RANK[tier];
  const isBasic = rank >= TIER_RANK.basic;
  const isPro = rank >= TIER_RANK.pro;
  const isAdvance = rank >= TIER_RANK.advance;

  return {
    unlimitedQuizzes: isPro,
    pvpAccess: isPro,
    multiplayerAccess: isPro,
    fullLibraryAccess: isPro,
    limitedLibraryAccess: isBasic,
    allAtlases: isPro,
    creatorStudio: isAdvance,
    priorityReview: isAdvance,
    earlyAiAccess: isAdvance,
    gstoreDiscount3Pct: isBasic,
    gstoreDiscount10Pct: isPro,
    advancedAnalytics: isPro,
    memberChallenges: isPro,
    isPaidMember: isBasic,
  };
}

/** Explorer (free) baseline entitlements. */
export const EXPLORER_ENTITLEMENTS: Entitlements = resolveEntitlements("explorer");
