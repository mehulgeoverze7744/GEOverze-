import { Check, Lock } from "lucide-react";
import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { useAuthStore, selectIsSignedIn } from "@/stores/authStore";

import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

import type { BillingCycle, PricingPlan } from "../data/plans";

import "../../marketing/components/home-hero.css";

/**
 * Single membership tier column.
 *
 * CTA strategy:
 *  - Explorer (free)  → <Link> to /auth/signup (signed-out) or / (signed-in)
 *  - Basic / Pro      → <Link> to /pricing/checkout?plan=...&cycle=...
 *                       (asChild keeps GeoButton styling; real <a> means right-click,
 *                        middle-click and browser-native navigation all work)
 *  - Advance          → disabled button (plan not released)
 */
export const PlanCard = memo(function PlanCard({
  plan,
  cycle,
}: {
  plan: PricingPlan;
  cycle: BillingCycle;
}) {
  const isSignedIn = useAuthStore(selectIsSignedIn);
  const price = plan.prices[cycle];
  const locked = plan.id === "advance";
  const isFree = plan.id === "explorer";

  return (
    <GlassCard
      strong={plan.featured}
      interactive={!locked}
      data-tier={plan.id}
      className={cn(
        "pricing-plan-card relative flex h-full min-w-0 flex-col p-7 sm:p-8 xl:p-9",
        plan.featured && "pricing-plan-card--featured border-bronze/45 bronze-glow",
        locked && "pricing-plan-card--locked",
      )}
      {...(locked ? { "aria-disabled": true as const } : {})}
    >
      {plan.badge ? (
        <AnimatedBadge className="pricing-plan-card__badge absolute right-4 top-4 z-[1] sm:right-5 sm:top-5">
          {plan.badge}
        </AnimatedBadge>
      ) : null}

      <div className="relative">
        <p className="text-[0.66rem] uppercase tracking-[0.3em] text-bronze">{plan.name}</p>
      </div>
      <p className="mt-3 text-sm text-foreground/50">{plan.positioning}</p>

      {/* Price display */}
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

      {/*
       * ── CTA button + GST notice ─────────────────────────────────────
       *
       * IMPORTANT: Keep the button and the GST notice inside ONE wrapper
       * div so they form a single grid item (row 9 of the CSS subgrid on
       * desktop ≥ 1280 px).
       *
       * The card uses `grid-template-rows: subgrid; grid-row: 1 / span 9`
       * on desktop.  Any direct child beyond the 9th overflows into an
       * implicit grid track that collapses on top of row 9, causing the
       * GST text to visually overlap the button.  Wrapping both in a div
       * keeps row 9 intact and renders the GST note below the button.
       */}
      <div className="flex flex-col">

        {locked ? (
          /* Advance — not yet available */
          <GeoButton
            variant="secondary"
            disabled
            className="w-full min-h-11 cursor-not-allowed disabled:opacity-90"
            aria-label="Advance plan coming soon"
          >
            <Lock className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
            Coming soon
          </GeoButton>

        ) : isFree ? (
          /* Explorer — free; skip checkout entirely */
          isSignedIn ? (
            <GeoButton
              variant="secondary"
              className="w-full min-h-11"
              asChild
              aria-label="Go to your GVRZE dashboard"
            >
              <Link to="/">Start exploring</Link>
            </GeoButton>
          ) : (
            <GeoButton
              variant="secondary"
              className="w-full min-h-11"
              asChild
              aria-label="Create a free GVRZE account — no card needed"
            >
              <Link to="/auth/signup">Start free — no card needed</Link>
            </GeoButton>
          )

        ) : (
          /*
           * Basic / Pro — navigate to checkout via a real <a> element.
           * asChild merges GeoButton's classes onto the Link, rendering a
           * styled anchor tag. The entire pill surface is clickable:
           *   • left-click    → SPA navigation
           *   • middle-click  → opens in new tab
           *   • right-click   → browser context menu with "Open in new tab"
           *   • keyboard      → Enter/Space activate the link
           *   • touch         → full touch target (min-h-11)
           */
          <GeoButton
            variant={plan.featured ? "primary" : "secondary"}
            className="w-full min-h-11"
            asChild
            aria-label={`${plan.cta} — ${plan.name} membership`}
          >
            <Link
              to="/pricing/checkout"
              search={{ plan: plan.id, cycle }}
            >
              {plan.cta}
            </Link>
          </GeoButton>
        )}

        {/* GST notice — only for paid, available plans */}
        {!isFree && !locked ? (
          <p className="mt-2 text-center text-[0.6rem] text-foreground/35 tracking-wide">
            Prices incl. 18% GST · Billed in INR
          </p>
        ) : null}

      </div>

      {/* Frost overlay — Advance plan only */}
      {locked ? (
        <div
          aria-hidden
          className="pricing-plan-card__frost pointer-events-none absolute inset-0 z-[2] rounded-[inherit] bg-charcoal/16 backdrop-blur-[1.5px]"
        />
      ) : null}
    </GlassCard>
  );
});
