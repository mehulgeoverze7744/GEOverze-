import { fetchSubscriptionPlans, fetchUserSubscriptions } from "@/features/commerce/api";
import type {
  BillingCycle,
  PlanTier,
  Subscriber,
  SubscriberStatus,
  SubscriptionPlan,
} from "@/features/subscriptions/types";

function asTier(tier: string): PlanTier {
  if (tier === "pro") return "Pro";
  if (tier === "advance" || tier === "advanced") return "Advanced";
  return "Basic";
}

export async function fetchMappedPlans(): Promise<SubscriptionPlan[]> {
  const [plans, subs] = await Promise.all([fetchSubscriptionPlans(), fetchUserSubscriptions()]);
  return plans.map((plan) => {
    const members = subs.filter((row) => row.plan_tier === plan.tier && row.status === "active");
    return {
      id: plan.tier,
      tier: asTier(plan.tier),
      tagline: plan.display_name,
      monthlyPrice: plan.monthly_price_cents / 100,
      annualPrice: (plan.annual_price_cents ?? 0) / 100,
      includedSeats: 1,
      monthlyCredits: plan.monthly_credit_grant,
      features: [`${plan.monthly_credit_grant} monthly credits`, plan.is_creator_plan ? "Creator tools" : "Standard play"],
      subscribers: members.length,
      mrr: members.length * (plan.monthly_price_cents / 100),
      popular: plan.tier === "pro",
    };
  });
}

export async function fetchMappedSubscribers(): Promise<Subscriber[]> {
  const rows = await fetchUserSubscriptions();
  return rows.map((row) => ({
    id: row.id,
    account: row.user_id,
    contact: row.user_id,
    tier: asTier(row.plan_tier),
    cycle: (row.billing_interval === "annual" ? "Annual" : "Monthly") as BillingCycle,
    status: (["active", "trialing", "past_due", "cancelled"].includes(row.status)
      ? row.status
      : "cancelled") as SubscriberStatus,
    seats: 1,
    mrr: 0,
    startedAt: row.started_at,
    renewsAt: row.current_period_end ?? row.started_at,
    lifetimeValue: 0,
    invoices: [],
  }));
}
