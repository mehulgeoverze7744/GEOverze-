import { toast } from "sonner";

import type { BillingCycle, PricingPlan } from "../data/plans";

/**
 * Single seam for future billing providers.
 *
 * Today it explains that nothing is billable. When Stripe or Razorpay is wired,
 * this is the only file that changes — every CTA already routes through it.
 */
export function startCheckout(plan: PricingPlan, cycle: BillingCycle) {
  if (plan.id === "explorer") {
    toast("Explorer is already free", {
      description: "Create an account and start playing — no plan required.",
    });
    return;
  }

  const price = plan.prices[cycle];
  toast(`${plan.name} isn't billable yet`, {
    description: `${price.amount} ${price.cadence} — checkout activates with the payments phase.`,
  });
}

/** Shared "not wired yet" notice for every billing management action. */
export function notBillableYet(what: string) {
  toast(`${what} isn't available yet`, {
    description: "It activates once the GEOverze payments module goes live.",
  });
}
