/**
 * Calls the `create-razorpay-subscription` Supabase Edge Function and returns
 * the data needed to open the Razorpay checkout modal.
 *
 * The Edge Function runs with the Supabase service role so it can:
 *  1. Look up the user's billing_provider_plan_instance (Razorpay Plan ID).
 *  2. Create a Razorpay Subscription via the Razorpay REST API.
 *  3. Insert a pending user_subscriptions row via begin_razorpay_subscription().
 *
 * This file contains NO secrets — it only forwards the user's auth session JWT.
 */

import { supabase } from "@/lib/supabase/client";
import type { BillingCycle, TierId } from "../data/plans";

export type CheckoutSessionRequest = {
  plan_tier: TierId;
  billing_interval: BillingCycle;
  /** Optional promo/coupon code entered by the user. */
  coupon_code?: string;
};

export type CheckoutSessionResponse = {
  /** Internal GVRZE subscription UUID (stored in user_subscriptions). */
  subscription_id: string;
  /** Razorpay Subscription ID (sub_xxxx). Open the modal with this. */
  razorpay_subscription_id: string;
  /** Display price in smallest currency unit (e.g. paise for INR). */
  charge_amount_minor: number;
  /** ISO 4217 currency code, e.g. "INR". */
  charge_currency: string;
  /** Human-readable price label, e.g. "₹499 / month". */
  price_label: string;
  /** Whether a promo was applied. */
  promotion_applied: boolean;
  /** Promo label if applied, e.g. "Introductory 3-month rate". */
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
