/**
 * Single seam for checkout navigation.
 *
 * Every plan CTA calls `startCheckout()`. This is the only place that decides
 * whether to navigate to the checkout page or show a "not available yet" notice.
 *
 * NOTE: In React components, prefer using the `useNavigate` hook directly
 * (as PlanCard does) so navigation integrates with the TanStack Router context.
 * `startCheckout` is kept as a utility for non-component call sites that
 * don't have router context (e.g. event handlers outside the React tree).
 */

import { toast } from "sonner";

import type { BillingCycle, PricingPlan } from "../data/plans";
import { isRazorpayConfigured } from "./razorpay-client";

/**
 * Returns the checkout URL for a given plan + cycle.
 * Use this to build <a href> or for `navigate({ to: ... })` calls.
 */
export function checkoutHref(plan: PricingPlan, cycle: BillingCycle): string {
  if (plan.id === "explorer") return "/pricing";
  return `/pricing/checkout?plan=${plan.id}&cycle=${cycle}`;
}

/**
 * Navigate to the checkout page. Works outside a React component.
 * Inside components, prefer `useNavigate({ to: "/pricing/checkout", search: ... })`.
 */
export function startCheckout(plan: PricingPlan, cycle: BillingCycle) {
  if (plan.id === "explorer") {
    toast("Explorer is already free", {
      description: "Create an account and start playing — no plan required.",
    });
    return;
  }

  // Direct navigation — works both inside and outside the React tree
  window.location.href = checkoutHref(plan, cycle);
}

/** Shared "not wired yet" notice for billing management actions. */
export function notBillableYet(what: string) {
  toast(`${what} isn't available yet`, {
    description: "It activates once the GVRZE payments module goes live.",
  });
}

/** True when the Razorpay integration is fully configured. */
export { isRazorpayConfigured };
