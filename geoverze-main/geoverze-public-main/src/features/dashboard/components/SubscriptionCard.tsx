import { Link } from "@tanstack/react-router";
import { Check, CreditCard, Lock } from "lucide-react";

import { useLibrarySubscriptionTier } from "@/features/library/hooks/useLibrarySubscriptionTier";
import { libraryTierLabel } from "@/features/library/lib/access-tier";
import { TIER_PRESENTATION } from "@/features/pricing/data/plans";
import { useMyMembership } from "@/features/pricing/hooks/useMyMembership";
import { getRemainingQuizzes } from "@/features/pricing/lib/membership";
import { membershipDiscountLabel } from "@/features/store/lib/membershipDiscount";
import { cn } from "@/lib/utils";

import { useSubscriptionPlanRows } from "../hooks/useSubscriptionPlanRows";
import { planRowForTier } from "../lib/playAccess";

function limitLabel(value: number | null | undefined, suffix: string) {
  if (value == null) return `Unlimited ${suffix}`;
  if (value <= 0) return `No ${suffix}`;
  return `${value} ${suffix}`;
}

function remainingLabel(remaining: number | null | undefined, limit: number | null | undefined, suffix: string) {
  if (limit == null) return `Unlimited ${suffix} remaining`;
  if (remaining == null) return null;
  return `${remaining} of ${limit} ${suffix} remaining`;
}

/** Live membership card from get_my_membership + subscription_plans. */
export function SubscriptionCard({ className }: { className?: string }) {
  const { tier } = useLibrarySubscriptionTier();
  const { plans } = useSubscriptionPlanRows();
  const { membership } = useMyMembership();
  const plan = planRowForTier(plans, membership?.tier ?? tier);
  const liveTier = membership?.tier ?? tier;
  const presentation = TIER_PRESENTATION[liveTier];
  const planName = membership?.planName ?? plan?.display_name ?? libraryTierLabel(liveTier);
  const isAdvance = liveTier === "advance";
  const remaining = membership ? getRemainingQuizzes(membership) : null;
  const discount = membershipDiscountLabel(membership?.gstoreDiscountBps ?? 0);

  const usage = [
    remaining
      ? remainingLabel(remaining.monthlyRemaining, membership?.monthlyQuizLimit, "quizzes")
      : limitLabel(plan?.monthly_quiz_limit, "quizzes / month"),
    remaining
      ? remainingLabel(remaining.soloRemaining, membership?.soloQuizLimit, "solo quizzes")
      : limitLabel(plan?.solo_quiz_limit, "solo / month"),
    remaining
      ? remainingLabel(remaining.pvpRemaining, membership?.pvpLimit, "PvP quizzes")
      : limitLabel(plan?.pvp_limit, "PvP / month"),
    remaining
      ? remainingLabel(remaining.multiplayerRemaining, membership?.multiplayerLimit, "multiplayer quizzes")
      : limitLabel(plan?.multiplayer_limit, "multiplayer / month"),
    `${membership?.monthlyCreditGrant ?? plan?.monthly_credit_grant ?? 0} membership credits / month`,
    `${membership?.creditRolloverMonths ?? plan?.credit_rollover_months ?? 1}-month credit rollover`,
    discount,
    membership?.renewalDate
      ? `Renews ${new Date(membership.renewalDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`
      : null,
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
        <p className="dashboard-subscription-tier">{libraryTierLabel(liveTier)} tier</p>
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
        {liveTier === "pro" || liveTier === "advance" ? "Manage plan" : "Upgrade"}
      </Link>
    </section>
  );
}
