/**
 * useEntitlements — React hook for client-side membership feature gating.
 *
 * Sources the current user's tier from `useMyBilling()` (which reads the live
 * Supabase `get_my_plan_tier` RPC). Falls back to "explorer" while loading or
 * when the user is not signed in.
 *
 * Usage:
 *   const { can, tier, loading } = useEntitlements();
 *   if (!can.pvpAccess) return <UpgradePrompt requiredTier="pro" />;
 *
 * Important: this hook is for UI gating only. All server-side access control
 * uses Postgres RLS and Edge Function auth guards — never rely on the client
 * alone for security.
 */

import { useMyMembership } from "@/features/pricing/hooks/useMyMembership";
import {
  resolveEntitlements,
  EXPLORER_ENTITLEMENTS,
  meetsMinTier,
  minTierLabel,
  type Entitlements,
} from "@/features/pricing/lib/entitlements";
import type { TierId } from "@/features/pricing/data/plans";
import {
  getRemainingQuizzes,
  type RemainingQuizzes,
  type UserMembership,
} from "@/features/pricing/lib/membership";

export type UseEntitlementsResult = {
  /** Feature entitlement flags for the current user. */
  can: Entitlements;
  /** The user's current tier. "explorer" when loading or not signed in. */
  tier: TierId;
  /** True while the billing data is loading. */
  loading: boolean;
  /** Error message if the billing fetch failed; null otherwise. */
  error: string | null;
  /** Helper: does the current user meet the minimum tier? */
  meetsMinTier: (required: TierId) => boolean;
  /** Helper: human-readable label for a required tier. */
  minTierLabel: (required: TierId) => string;
  /** Live membership snapshot when signed in. */
  membership: UserMembership | null;
  /** Remaining monthly quiz allowances. */
  remaining: RemainingQuizzes | null;
  /** Gstore discount in basis points (300 = 3%). */
  gstoreDiscountBps: number;
};

export function useEntitlements(): UseEntitlementsResult {
  const { membership, remaining, loading, error } = useMyMembership();
  const tier: TierId = membership?.tier ?? "explorer";
  const can: Entitlements = membership
    ? {
        ...resolveEntitlements(tier),
        pvpAccess: membership.pvpAccess,
        multiplayerAccess: membership.multiplayerAccess,
        allAtlases: membership.allAtlases,
        advancedAnalytics: membership.advancedAnalytics,
        memberChallenges: membership.memberChallenges,
        gstoreDiscount3Pct: membership.gstoreDiscountBps >= 300,
        gstoreDiscount10Pct: membership.gstoreDiscountBps >= 1000,
      }
    : EXPLORER_ENTITLEMENTS;

  return {
    can,
    tier,
    loading,
    error,
    meetsMinTier: (required: TierId) => meetsMinTier(tier, required),
    minTierLabel,
    membership,
    remaining: membership ? remaining ?? getRemainingQuizzes(membership) : remaining,
    gstoreDiscountBps: membership?.gstoreDiscountBps ?? 0,
  };
}
