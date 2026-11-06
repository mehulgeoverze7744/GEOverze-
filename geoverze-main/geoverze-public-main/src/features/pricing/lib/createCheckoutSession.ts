/**
 * Calls the `create-razorpay-subscription` Supabase Edge Function and returns
 * the data needed to open the Razorpay checkout modal.
 *
 * The Edge Function runs with the Supabase service role so it can:
 *  1. Look up the user's billing_provider_plan_instance (Razorpay Plan ID).
 *  2. Create a Razorpay Subscription via the Razorpay REST API.
 *  3. Insert a pending user_subscriptions row via begin_razorpay_subscription().
 *  4. Calculate GST from billing_gst_config and return the breakdown.
 *  5. Save billing address and return invoice-ready amounts.
 *
 * This file contains NO secrets — it only forwards the user's auth session JWT.
 */

import { supabase } from "@/lib/supabase/client";
import type { BillingCycle, TierId } from "../data/plans";

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
  /** Internal GVRZE subscription UUID (stored in user_subscriptions). */
  subscription_id: string;
  /** Razorpay Subscription ID (sub_xxxx). Open the modal with this. */
  razorpay_subscription_id: string;

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

  /** Human-readable price label, e.g. "₹499 / month". */
  price_label: string;
  /** Whether a promo was applied. */
  promotion_applied: boolean;
  /** Promo label if applied. */
  promotion_label?: string;
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

  const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
  const functionUrl = `${supabaseUrl}/functions/v1/create-razorpay-subscription`;

  let response: Response;
  try {
    response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify(request),
    });
  } catch {
    throw new CheckoutSessionError(
      "Could not reach the payment server. Check your connection and try again.",
      "NETWORK_ERROR",
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new CheckoutSessionError(
      `Payment server returned an unexpected response (${response.status}).`,
      "PARSE_ERROR",
    );
  }

  if (!response.ok) {
    const err = body as { error?: string; code?: string } | null;
    throw new CheckoutSessionError(
      err?.error ?? `Payment server error (${response.status}).`,
      err?.code ?? `HTTP_${response.status}`,
    );
  }

  return body as CheckoutSessionResponse;
}
