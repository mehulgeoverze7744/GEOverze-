import type { PlanPromotionRow, SubscriptionPlanRow } from "../data/fetchSubscriptionCatalog";
import type { BillingCycle, PlanPrice, PricingPlan, TierId } from "../data/plans";
import { TIER_ORDER, TIER_PRESENTATION } from "../data/plans";
import { formatInrRupees } from "./formatInr";
import { GST_CONFIG } from "./gstConfig";

/**
 * NOTE on catalog amounts:
 * subscription_plans.monthly_price_cents / annual_price_cents store WHOLE INR RUPEES
 * despite the _cents suffix. Use formatInrRupees() (no division by 100).
 * e.g. 499 → ₹499/month
 */

const EMPTY_PROVIDER_IDS = { stripe: null, razorpay: null } as const;

/** GST suffix appended to prices on the pricing page. */
const GST_SUFFIX = GST_CONFIG.taxInclusive
  ? " incl. GST"
  : " + GST";

function findPromotion(
  promotions: PlanPromotionRow[],
  tier: string,
  interval: BillingCycle,
): PlanPromotionRow | undefined {
  return promotions.find((p) => p.plan_tier === tier && p.billing_interval === interval);
}

function buildMonthlyPrice(plan: SubscriptionPlanRow, promotions: PlanPromotionRow[]): PlanPrice {
  if (plan.monthly_price_cents === 0) {
    return {
      amount: "Free",
      cadence: "forever",
      note: "No credit card required. No expiry.",
      providerPriceId: { ...EMPTY_PROVIDER_IDS },
    };
  }

  const promo = findPromotion(promotions, plan.tier, "monthly");
  if (promo) {
    const standard = plan.monthly_price_cents;
    const introNote = promo.intro_period_months
      ? `First ${promo.intro_period_months} months, then ${formatInrRupees(standard)}/month.${GST_SUFFIX}. Billed monthly, cancel anytime.`
      : `${GST_SUFFIX}. Billed monthly, cancel anytime.`;

    return {
      amount: formatInrRupees(promo.price_cents),
      compareAt: formatInrRupees(standard),
      cadence: "/ month",
      note: introNote,
      providerPriceId: { ...EMPTY_PROVIDER_IDS },
    };
  }

  return {
    amount: formatInrRupees(plan.monthly_price_cents),
    cadence: "/ month",
    note: `${GST_SUFFIX}. Billed monthly, cancel anytime.`,
    providerPriceId: { ...EMPTY_PROVIDER_IDS },
  };
}

function buildAnnualPrice(plan: SubscriptionPlanRow): PlanPrice {
  if (!plan.annual_price_cents || plan.annual_price_cents === 0) {
    return {
      amount: "Free",
      cadence: "forever",
      note: "No credit card required. No expiry.",
      providerPriceId: { ...EMPTY_PROVIDER_IDS },
    };
  }

  // Savings: annual vs 12 × monthly (not 10×, to show true annual savings)
  const twelveMonthlyCost = plan.monthly_price_cents * 12;
  const savings = twelveMonthlyCost - plan.annual_price_cents;
  const note =
    savings > 0
      ? `Save ${formatInrRupees(savings)} vs twelve monthly payments.${GST_SUFFIX}. Billed annually, cancel anytime.`
      : `${GST_SUFFIX}. Billed annually, cancel anytime.`;

  return {
    amount: formatInrRupees(plan.annual_price_cents),
    cadence: "/ year",
    note,
    providerPriceId: { ...EMPTY_PROVIDER_IDS },
  };
}

function buildFeatures(plan: SubscriptionPlanRow): string[] {
  const features: string[] = [];

  if (plan.monthly_quiz_limit != null) {
    features.push(`${plan.monthly_quiz_limit} quizzes per calendar month`);
  } else if (
    plan.solo_quiz_limit != null ||
    plan.pvp_limit != null ||
    plan.multiplayer_limit != null
  ) {
    if (plan.solo_quiz_limit != null) {
      features.push(`${plan.solo_quiz_limit} solo quizzes per month`);
    }
    if (plan.pvp_limit != null && plan.pvp_limit > 0) {
      features.push(`${plan.pvp_limit} PvP ${plan.pvp_limit === 1 ? "quiz" : "quizzes"} per month`);
    }
    if (plan.multiplayer_limit != null && plan.multiplayer_limit > 0) {
      features.push(
        `${plan.multiplayer_limit} multiplayer ${plan.multiplayer_limit === 1 ? "quiz" : "quizzes"} per month`,
      );
    }
  } else {
    features.push("Unlimited quizzes");
  }

  if (plan.monthly_credit_grant > 0) {
    features.push(`${plan.monthly_credit_grant} membership credits per month`);
  }

  if (plan.credit_rollover_months > 0) {
    features.push(`${plan.credit_rollover_months}-month credit rollover`);
  }

  const tier = plan.tier as TierId;
  return [...features, ...(TIER_PRESENTATION[tier]?.extraFeatures ?? [])];
}

function tierSortIndex(tier: string): number {
  const index = TIER_ORDER.indexOf(tier as TierId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/** Maps authoritative catalog rows into pricing UI plan cards. */
export function buildPricingPlans(
  plans: SubscriptionPlanRow[],
  promotions: PlanPromotionRow[],
): PricingPlan[] {
  return [...plans]
    .sort((a, b) => tierSortIndex(a.tier) - tierSortIndex(b.tier))
    .map((plan) => {
      const tier = plan.tier as TierId;
      const presentation = TIER_PRESENTATION[tier];

      return {
        id: tier,
        name: plan.display_name,
        positioning: presentation.positioning,
        summary: presentation.summary,
        features: buildFeatures(plan),
        monthlyCreditGrant: plan.monthly_credit_grant,
        featured: presentation.featured,
        badge: presentation.badge,
        cta: presentation.cta,
        ...(presentation.storePerk ? { storePerk: presentation.storePerk } : {}),
        prices: {
          monthly: buildMonthlyPrice(plan, promotions),
          annual: buildAnnualPrice(plan),
        },
      };
    });
}
