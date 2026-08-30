import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

export type SubscriptionPlanRow = Tables<"subscription_plans">;
export type PlanPromotionRow = Tables<"plan_promotions">;

export type SubscriptionCatalog = {
  plans: SubscriptionPlanRow[];
  promotions: PlanPromotionRow[];
};

const PLAN_SELECT =
  "tier, display_name, monthly_price_cents, annual_price_cents, monthly_credit_grant, rollover_tier_key, monthly_quiz_limit, solo_quiz_limit, pvp_limit, multiplayer_limit, credit_rollover_months, is_creator_plan, active";

const PROMOTION_SELECT =
  "id, plan_tier, billing_interval, price_cents, intro_period_months, label, active, metadata";

/** Active subscription catalog rows from Supabase (server-authoritative). */
export async function fetchSubscriptionCatalog(): Promise<SubscriptionCatalog> {
  const [plansResult, promotionsResult] = await Promise.all([
    supabase.from("subscription_plans").select(PLAN_SELECT).eq("active", true),
    supabase.from("plan_promotions").select(PROMOTION_SELECT).eq("active", true),
  ]);

  if (plansResult.error) throw new Error(plansResult.error.message);
  if (promotionsResult.error) throw new Error(promotionsResult.error.message);

  return {
    plans: plansResult.data ?? [],
    promotions: promotionsResult.data ?? [],
  };
}
