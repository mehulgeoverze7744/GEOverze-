/**
 * Creates a Razorpay membership checkout session.
 *
 * Primary path: TanStack server function `createRazorpaySubscriptionFn`
 * (works in local `npm run dev` without deploying Edge Functions).
 *
 * Prices are loaded from subscription_plans on the server. The browser never
 * chooses the charge amount.
 */

import { supabase } from "@/lib/supabase/client";
import type { BillingCycle, TierId } from "../data/plans";
import { createRazorpaySubscriptionFn } from "./subscriptionServerFns";

/** Billing address provided by the user at checkout. */
export type CheckoutBillingDetails = {
  display_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  /** Optional GSTIN for B2B GST invoices. */
  gstin?: string;
};

export type CheckoutSessionRequest = {
  plan_tier: TierId;
  billing_interval: BillingCycle;
  /** Optional promo/coupon code entered by the user. */
  coupon_code?: string;
  /** Billing address and optional GSTIN for the invoice. */
  billing_details: CheckoutBillingDetails;
};

export type CheckoutSessionResponse = {
  /** True when the user already has a continuing membership for this plan. */
  already_active?: boolean;
  /** True when checkout must not open Razorpay (duplicate, pending, or unsupported). */
  checkout_blocked?: boolean;
  block_reason?: "already_active" | "pending_authorization" | null;
  existing_plan_tier?: string | null;
  is_upgrade?: boolean;
  upgrade_payment_id?: string | null;
  /** Internal GVRZE subscription UUID (stored in user_subscriptions). */
  subscription_id: string;
  /** Razorpay Subscription ID (sub_xxxx). Open the modal with this when set. */
  razorpay_subscription_id: string;
  /** Razorpay Order ID (order_xxxx). Used when Subscriptions API is unavailable. */
  razorpay_order_id?: string;
  checkout_mode?: "subscription" | "order";
  razorpay_key_id?: string;

  /** GST breakdown (server-authoritative) ─────────────────────────── */
  /** Subscription base amount in paise (pre-tax). */
  base_amount_minor: number;
  /** GST portion in paise. */
  gst_amount_minor: number;
  /** Total payable in paise (base + GST). */
  charge_amount_minor: number;
  /** ISO 4217 currency code, e.g. "INR". */
  charge_currency: string;
  /** GST rate used (e.g. 18.00). */
  gst_rate_percent: number;
  /** Tax label (e.g. "GST (18%)"). */
  gst_label: string;

  /** Human-readable price label, e.g. "₹399 / month". */
  price_label: string;
  /** Whether a promo was applied. */
  promotion_applied: boolean;
  /** Promo label if applied. */
  promotion_label?: string;
  test_mode?: boolean;
};

export class CheckoutSessionError extends Error {
  constructor(
    message: string,
    public readonly code: string = "UNKNOWN",
  ) {
    super(message);
    this.name = "CheckoutSessionError";
  }
}

/** Creates a Razorpay subscription and returns session data for the modal. */
export async function createCheckoutSession(
  request: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new CheckoutSessionError(
      "Sign in to continue to checkout.",
      "AUTH_REQUIRED",
    );
  }

  if (request.plan_tier === "explorer") {
    throw new CheckoutSessionError("Explorer is free and does not require payment.", "FREE_PLAN");
  }

  try {
    const result = await createRazorpaySubscriptionFn({
      data: {
        access_token: sessionData.session.access_token,
        plan_tier: request.plan_tier,
        billing_interval: request.billing_interval,
        idempotency_key: `${request.plan_tier}:${request.billing_interval}:${sessionData.session.user.id}`,
        billing_details: request.billing_details,
        ...(request.coupon_code ? { coupon_code: request.coupon_code } : {}),
      },
    });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start checkout.";
    throw new CheckoutSessionError(message, "CHECKOUT_FAILED");
  }
}
