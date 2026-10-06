import { Link } from "@tanstack/react-router";
import { Check, CreditCard, Lock } from "lucide-react";

import { useLibrarySubscriptionTier } from "@/features/library/hooks/useLibrarySubscriptionTier";
import { libraryTierLabel } from "@/features/library/lib/access-tier";
import { TIER_PRESENTATION } from "@/features/pricing/data/plans";
import { cn } from "@/lib/utils";

import { useSubscriptionPlanRows } from "../hooks/useSubscriptionPlanRows";
import { planRowForTier } from "../lib/playAccess";

function limitLabel(value: number | null | undefined, suffix: string) {
  if (value == null) return null;
  if (value <= 0) return `No ${suffix}`;
  return `${value} ${suffix}`;
}

/** Live membership card from get_my_plan_tier + subscription_plans. */
export function SubscriptionCard({ className }: { className?: string }) {
  const { tier } = useLibrarySubscriptionTier();
  const { plans } = useSubscriptionPlanRows();
  const plan = planRowForTier(plans, tier);
  const presentation = TIER_PRESENTATION[tier];
  const planName = plan?.display_name ?? libraryTierLabel(tier);
  const isAdvance = tier === "advance";

  const usage = [
    limitLabel(plan?.monthly_quiz_limit, "quizzes / month"),
    limitLabel(plan?.solo_quiz_limit, "solo / month"),
    limitLabel(plan?.pvp_limit, "PvP / month"),
    limitLabel(plan?.multiplayer_limit, "multiplayer / month"),
    plan ? `${plan.monthly_credit_grant} membership credits / month` : null,
    plan ? `${plan.credit_rollover_months}-month credit rollover` : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <section
      className={cn("dashboard-subscription", className)}
      aria-labelledby="subscription-heading"
    >
      <h2 id="subscription-heading" className="dashboard-section-label dashboard-subscription-title">
        <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        Your current expedition pass
      </h2>

      <div className="dashboard-subscription-panel">
        <p className="dashboard-subscription-plan">{planName}</p>
        <p className="dashboard-subscription-tier">{libraryTierLabel(tier)} tier</p>
        <p className="dashboard-subscription-positioning">{presentation.positioning}</p>
      </div>

      {usage.length > 0 ? (
        <ul className="dashboard-subscription-features">
          {usage.map((item) => (
            <li key={item}>
              <Check
                className="dashboard-subscription-check"
                strokeWidth={2}
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {isAdvance ? (
        <p className="dashboard-subscription-note">
          <Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Creator Studio remains coming soon.
        </p>
      ) : null}

      <Link to="/pricing" className="dashboard-subscription-cta">
        Change plan
      </Link>
    </section>
  );
}
