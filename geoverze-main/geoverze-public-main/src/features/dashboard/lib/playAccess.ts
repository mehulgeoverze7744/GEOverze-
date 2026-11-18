import type { LibraryAccessTier } from "@/features/library/lib/access-tier";
import type { SubscriptionPlanRow } from "@/features/pricing/data/fetchSubscriptionCatalog";

export type ContinuePlayMode = "solo" | "pvp" | "multiplayer";

/**
 * Competitive modes are open when the plan's mode cap is unlimited (null)
 * or greater than zero. Basic shares Explorer's one PvP / one multiplayer
 * monthly allowance; Pro is unlimited (null caps).
 */
export function isPlayModeOpen(
  plan: SubscriptionPlanRow | undefined,
  mode: ContinuePlayMode,
): boolean {
  if (mode === "solo") return true;
  if (!plan) return false;

  const limit = mode === "pvp" ? plan.pvp_limit : plan.multiplayer_limit;
  return limit == null || (typeof limit === "number" && limit > 0);
}

export function planRowForTier(
  plans: SubscriptionPlanRow[],
  tier: LibraryAccessTier,
): SubscriptionPlanRow | undefined {
  return plans.find((plan) => plan.tier === tier);
}
