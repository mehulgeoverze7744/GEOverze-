import { Check, Lock } from "lucide-react";
import { memo } from "react";

import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

import type { BillingCycle, PricingPlan } from "../data/plans";
import { startCheckout } from "../lib/checkout";

import "../../marketing/components/home-hero.css";

/** Single membership tier column. Pure presentation plus one checkout seam. */
export const PlanCard = memo(function PlanCard({
  plan,
  cycle,
}: {
  plan: PricingPlan;
  cycle: BillingCycle;
}) {
  const price = plan.prices[cycle];
  const locked = plan.id === "advance";

  return (
    <GlassCard
      strong={plan.featured}
      interactive={!locked}
      className={cn(
        "pricing-plan-card relative flex h-full min-w-0 flex-col p-7 sm:p-8 xl:p-9",
        plan.featured && "pricing-plan-card--featured border-bronze/45 bronze-glow",
        locked && "pricing-plan-card--locked",
      )}
      {...(locked ? { "aria-disabled": true as const } : {})}
    >
      <div className="relative">
        {plan.badge ? (
          <AnimatedBadge className="absolute -top-3 left-8">{plan.badge}</AnimatedBadge>
        ) : null}
        <p className="text-[0.66rem] uppercase tracking-[0.3em] text-bronze">{plan.name}</p>
      </div>
      <p className="mt-3 text-sm text-foreground/50">{plan.positioning}</p>

      <div className="mt-7">
        {price.compareAt ? (
          <p className="text-sm text-foreground/45 line-through">{price.compareAt}</p>
        ) : null}
        <div className="flex items-baseline gap-2">
          <span className="font-light leading-none text-foreground text-[clamp(2.1rem,3.6vw,3rem)]">
            {price.amount}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-foreground/50">
            {price.cadence}
          </span>
        </div>
      </div>
      <p className="pricing-plan-card__note mt-3 text-xs text-foreground/50">{price.note ?? ""}</p>

      <p className="pricing-plan-card__summary mt-6 text-sm leading-relaxed text-foreground/55">
        {plan.summary}
      </p>

      <div
        className={cn(
          "pricing-plan-store-perk-slot",
          !plan.storePerk && "pricing-plan-store-perk-slot--empty",
        )}
      >
        {plan.storePerk ? (
          <p className="pricing-plan-store-perk home-hero-cta shadow-none" role="note">
            {plan.storePerk}
          </p>
        ) : null}
      </div>

      <ul className="pricing-plan-card__features mt-8 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-foreground/65">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.6} />
            {feature}
          </li>
        ))}
      </ul>

      <div className="pricing-plan-card__spacer mt-10 flex-1" />
      {locked ? (
        <GeoButton
          variant="secondary"
          disabled
          className="w-full min-h-11 cursor-not-allowed disabled:opacity-90"
          aria-label="Advance plan coming soon"
        >
          <Lock className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
          Coming soon
        </GeoButton>
      ) : (
        <GeoButton
          variant={plan.featured ? "primary" : "secondary"}
          className="w-full min-h-11"
          onClick={() => startCheckout(plan, cycle)}
          aria-label={`${plan.cta} — ${plan.name} plan`}
        >
          {plan.cta}
        </GeoButton>
      )}

      {locked ? (
        <div
          aria-hidden
          className="pricing-plan-card__frost pointer-events-none absolute inset-0 z-[2] rounded-[inherit] bg-charcoal/16 backdrop-blur-[1.5px]"
        />
      ) : null}
    </GlassCard>
  );
});
