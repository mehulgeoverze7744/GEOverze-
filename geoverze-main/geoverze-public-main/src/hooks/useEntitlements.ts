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

import { useMyBilling } from "@/features/pricing/hooks/useMyBilling";
import {
  resolveEntitlements,
  EXPLORER_ENTITLEMENTS,
  meetsMinTier,
  minTierLabel,
  type Entitlements,
} from "@/features/pricing/lib/entitlements";
import type { TierId } from "@/features/pricing/data/plans";

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
};

export function useEntitlements(): UseEntitlementsResult {
  const { data, loading, error } = useMyBilling();
  const tier: TierId = data?.tier ?? "explorer";
  const can = data ? resolveEntitlements(tier) : EXPLORER_ENTITLEMENTS;

  return {
    can,
    tier,
    loading,
    error,
    meetsMinTier: (required: TierId) => meetsMinTier(tier, required),
    minTierLabel,
  };
}
