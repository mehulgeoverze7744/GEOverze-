import type { LibraryAccessTier } from "@/features/library/lib/access-tier";
import type { SubscriptionPlanRow } from "@/features/pricing/data/fetchSubscriptionCatalog";

export type ContinuePlayMode = "solo" | "pvp" | "multiplayer";

/** Mirrors pricing comparison: a 0/null competitive cap means the mode is closed. */
export function isPlayModeOpen(
  plan: SubscriptionPlanRow | undefined,
  mode: ContinuePlayMode,
): boolean {
  if (mode === "solo") return true;
  if (!plan) return false;

  if (plan.monthly_quiz_limit != null) return true;

  const limit = mode === "pvp" ? plan.pvp_limit : plan.multiplayer_limit;
  return typeof limit === "number" && limit > 0;
}

export function planRowForTier(
  plans: SubscriptionPlanRow[],
  tier: LibraryAccessTier,
): SubscriptionPlanRow | undefined {
  return plans.find((plan) => plan.tier === tier);
}
