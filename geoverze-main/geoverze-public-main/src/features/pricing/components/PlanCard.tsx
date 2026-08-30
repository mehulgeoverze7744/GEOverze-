import { Check } from "lucide-react";
import { memo } from "react";

import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

import type { BillingCycle, PricingPlan } from "../data/plans";
import { startCheckout } from "../lib/checkout";

/** Single membership tier column. Pure presentation plus one checkout seam. */
export const PlanCard = memo(function PlanCard({
  plan,
  cycle,
}: {
  plan: PricingPlan;
  cycle: BillingCycle;
}) {
  const price = plan.prices[cycle];

  return (
    <GlassCard
      strong={plan.featured}
      interactive
      className={cn(
        "relative flex h-full flex-col p-8 md:p-9",
        plan.featured && "border-bronze/45 bronze-glow",
      )}
    >
      {plan.badge ? (
        <AnimatedBadge className="absolute -top-3 left-8">{plan.badge}</AnimatedBadge>
      ) : null}

      <p className="text-[0.66rem] uppercase tracking-[0.3em] text-bronze">{plan.name}</p>
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
      {price.note ? <p className="mt-3 text-xs text-foreground/50">{price.note}</p> : null}

      <p className="mt-6 text-sm leading-relaxed text-foreground/55">{plan.summary}</p>

      <ul className="mt-8 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-foreground/65">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.6} />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex-1" />
      <GeoButton
        variant={plan.featured ? "primary" : "secondary"}
        className="w-full min-h-11"
        onClick={() => startCheckout(plan, cycle)}
        aria-label={`${plan.cta} — ${plan.name} plan`}
      >
        {plan.cta}
      </GeoButton>
    </GlassCard>
  );
});
