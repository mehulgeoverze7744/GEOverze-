import { Link } from "@tanstack/react-router";
import { Check, CreditCard, Lock } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
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
      className={cn(
        "dashboard-subscription rounded-2xl border border-bronze/18 bg-gradient-to-br from-charcoal/50 to-charcoal/25 p-6 backdrop-blur-sm",
        className,
      )}
      aria-labelledby="subscription-heading"
    >
      <h2 id="subscription-heading" className="dashboard-section-label flex items-center gap-2">
        <CreditCard className="h-3.5 w-3.5 text-bronze/90" strokeWidth={1.5} aria-hidden="true" />
        Your current expedition pass
      </h2>

      <div className="mt-6 rounded-xl border border-bronze/15 bg-background/20 p-5">
        <p className="text-xl font-light text-foreground">{planName}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-bronze/90">
          {libraryTierLabel(tier)} tier
        </p>
        <p className="mt-3 text-xs text-foreground/45">{presentation.positioning}</p>
      </div>

      {usage.length > 0 ? (
        <ul className="mt-5 space-y-2.5">
          {usage.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-xs text-foreground/60">
              <Check
                className="h-3.5 w-3.5 shrink-0 text-bronze/90"
                strokeWidth={2}
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {isAdvance ? (
        <p className="mt-4 inline-flex items-center gap-2 text-xs text-foreground/45">
          <Lock className="h-3.5 w-3.5 text-bronze/70" strokeWidth={1.5} aria-hidden="true" />
          Creator Studio remains coming soon.
        </p>
      ) : null}

      <GeoButton asChild variant="secondary" className="mt-6 w-full">
        <Link to="/pricing">Change plan</Link>
      </GeoButton>
    </section>
  );
}
