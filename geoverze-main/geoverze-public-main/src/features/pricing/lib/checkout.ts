/**
 * Single seam for checkout navigation.
 *
 * Every plan CTA calls `startCheckout()`. This is the only place that decides
 * whether to navigate to the checkout page or show a "not available yet" notice.
 *
 * When Razorpay is fully configured and live, this function simply navigates
 * to /pricing/checkout with the selected plan + cycle in the URL.
 * The checkout page handles the rest (Razorpay modal, subscription creation, etc).
 */

import { getRouterContext } from "@tanstack/react-router";
import { toast } from "sonner";

import type { BillingCycle, PricingPlan } from "../data/plans";
import { isRazorpayConfigured } from "./razorpay-client";

/**
 * Navigate to the checkout page for a paid plan.
 *
 * Call from any component with access to the TanStack Router context.
 * Falls back to a toast when the router is not available (e.g. during SSR).
 */
export function startCheckout(plan: PricingPlan, cycle: BillingCycle) {
  if (plan.id === "explorer") {
    toast("Explorer is already free", {
      description: "Create an account and start playing — no plan required.",
    });
    return;
  }

  // Build the checkout URL and navigate programmatically.
  // We use window.location as a fallback if the router context is unavailable
  // (e.g. if startCheckout is called outside a React tree).
  try {
    // Try to get the router from context — will throw if not inside a Router.
    const router = (getRouterContext as () => { navigate?: unknown })?.();
    if (
      router &&
      typeof (router as { navigate?: unknown }).navigate === "function"
    ) {
      void (
        router as {
          navigate: (opts: { to: string; search: Record<string, string> }) => void;
        }
      ).navigate({
        to: "/pricing/checkout",
        search: { plan: plan.id, cycle },
      });
      return;
    }
  } catch {
    // Fall through to window.location
  }

  // Fallback: direct navigation (works outside React tree)
  const params = new URLSearchParams({ plan: plan.id, cycle });
  window.location.href = `/pricing/checkout?${params.toString()}`;
}

/**
 * Navigate to the checkout page from a component that has access to the
 * TanStack Router `navigate` function (preferred over `startCheckout` when
 * called inside a React component).
 */
export function checkoutHref(plan: PricingPlan, cycle: BillingCycle): string {
  if (plan.id === "explorer") return "/pricing";
  return `/pricing/checkout?plan=${plan.id}&cycle=${cycle}`;
}

/** Shared "not wired yet" notice for billing management actions. */
export function notBillableYet(what: string) {
  toast(`${what} isn't available yet`, {
    description: "It activates once the GVRZE payments module goes live.",
  });
}

/** True when the Razorpay integration is fully configured. */
export { isRazorpayConfigured };
