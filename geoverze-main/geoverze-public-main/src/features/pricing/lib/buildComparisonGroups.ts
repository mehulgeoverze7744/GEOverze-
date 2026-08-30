import type { SubscriptionPlanRow } from "../data/fetchSubscriptionCatalog";
import type { ComparisonGroup, ComparisonValue } from "../data/comparison";
import type { TierId } from "../data/plans";
import { TIER_ORDER } from "../data/plans";

function planByTier(plans: SubscriptionPlanRow[]): Partial<Record<TierId, SubscriptionPlanRow>> {
  return Object.fromEntries(plans.map((plan) => [plan.tier as TierId, plan])) as Partial<
    Record<TierId, SubscriptionPlanRow>
  >;
}

function valuesForTiers(
  plans: SubscriptionPlanRow[],
  resolver: (plan: SubscriptionPlanRow | undefined) => ComparisonValue,
): Record<TierId, ComparisonValue> {
  const byTier = planByTier(plans);
  return Object.fromEntries(TIER_ORDER.map((tier) => [tier, resolver(byTier[tier])])) as Record<
    TierId,
    ComparisonValue
  >;
}

function quizLimitValue(plan: SubscriptionPlanRow | undefined): ComparisonValue {
  if (!plan) return "—";

  if (plan.monthly_quiz_limit != null) {
    return `${plan.monthly_quiz_limit} per month`;
  }

  if (plan.solo_quiz_limit != null) {
    return `${plan.solo_quiz_limit} solo / ${plan.pvp_limit ?? 0} PvP / ${plan.multiplayer_limit ?? 0} MP per month`;
  }

  return "Unlimited";
}

function modeAccessValue(
  plan: SubscriptionPlanRow | undefined,
  mode: "pvp" | "multiplayer",
): ComparisonValue {
  if (!plan) return "—";

  if (plan.monthly_quiz_limit != null) {
    return true;
  }

  if (plan.solo_quiz_limit != null) {
    const limit = mode === "pvp" ? plan.pvp_limit : plan.multiplayer_limit;
    if (limit == null || limit <= 0) return false;
    return `${limit} per month`;
  }

  return true;
}

function creditBenefitValue(plan: SubscriptionPlanRow | undefined): ComparisonValue {
  if (!plan) return "—";
  if (plan.monthly_credit_grant === 0) return "Standard gameplay credits";
  return `${plan.monthly_credit_grant} membership credits/month`;
}

/** Builds the feature comparison matrix from the authoritative catalog. */
export function buildComparisonGroups(plans: SubscriptionPlanRow[]): ComparisonGroup[] {
  return [
    {
      title: "Playing",
      rows: [
        {
          feature: "Quiz limits",
          detail: "How many rounds you can play each calendar month.",
          values: valuesForTiers(plans, quizLimitValue),
        },
        {
          feature: "PvP access",
          detail: "One-on-one duels against other explorers.",
          values: valuesForTiers(plans, (plan) => modeAccessValue(plan, "pvp")),
        },
        {
          feature: "Multiplayer access",
          detail: "Live rooms, tournaments and group trivia.",
          values: valuesForTiers(plans, (plan) => modeAccessValue(plan, "multiplayer")),
        },
        {
          feature: "Exclusive content",
          detail: "Seasonal atlases and member-only question packs.",
          values: {
            explorer: false,
            basic: false,
            pro: "Member packs",
            advance: "Everything, first",
          },
        },
      ],
    },
    {
      title: "Learning",
      rows: [
        {
          feature: "GEOlibrary benefits",
          detail: "Reading, bookmarking and deep-dive collections.",
          values: {
            explorer: "Browse and read",
            basic: "Browse and read",
            pro: "Full library and collections",
            advance: "Full library and collections",
          },
        },
        {
          feature: "Future AI features",
          detail: "AI coach, adaptive practice and explanations on demand.",
          values: { explorer: false, basic: false, pro: "On release", advance: "Early access" },
        },
      ],
    },
    {
      title: "Progress and rewards",
      rows: [
        {
          feature: "Rewards",
          detail: "Badges, seasonal trophies and reward drops.",
          values: {
            explorer: "Standard",
            basic: "Standard",
            pro: "Premium tier",
            advance: "Premium tier",
          },
        },
        {
          feature: "Membership credits",
          detail: "Monthly credit grants included with paid plans.",
          values: valuesForTiers(plans, creditBenefitValue),
        },
        {
          feature: "Credit rollover",
          detail: "How long membership credits stay available.",
          values: valuesForTiers(plans, (plan) =>
            plan ? `${plan.credit_rollover_months}-month rollover` : "—",
          ),
        },
      ],
    },
    {
      title: "Creating and support",
      rows: [
        {
          feature: "Creator Studio",
          detail: "Build quizzes, publish articles, track performance.",
          values: {
            explorer: false,
            basic: false,
            pro: "Read-only preview",
            advance: true,
          },
        },
        {
          feature: "Priority support",
          detail: "How quickly the team gets back to you.",
          values: {
            explorer: "Community",
            basic: "Community",
            pro: "48 hours",
            advance: "Priority queue",
          },
        },
      ],
    },
  ];
}
