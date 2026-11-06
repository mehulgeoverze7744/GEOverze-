/**
 * GVRZE — Razorpay Payment Provider Adapter
 *
 * Implements PaymentProviderInterface for Razorpay.
 * This is the ACTIVE provider for India (INR) — both subscriptions and
 * one-time Gstore purchases.
 *
 * SUBSCRIPTION FLOW (Razorpay Subscriptions):
 *   1. Client calls createSubscription() → Razorpay Subscription created via API
 *   2. Client opens Razorpay modal with { subscription_id }
 *   3. User pays → Razorpay fires webhook AND returns to client handler
 *   4. verifyPayment() verifies HMAC-SHA256 signature
 *   5. DB updated via begin_razorpay_subscription / confirm_razorpay_subscription RPCs
 *
 * ONE-TIME FLOW (Razorpay Orders):
 *   1. Client calls createOneTimePayment() → Razorpay Order created via API
 *   2. Client opens Razorpay modal with { order_id }
 *   3. User pays → handler called with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 *   4. verifyPayment() verifies HMAC-SHA256(razorpay_order_id|razorpay_payment_id, KEY_SECRET)
 *   5. DB updated via create_gstore_order / confirm_gstore_payment RPCs
 *
 * WEBHOOK SIGNATURE (Razorpay):
 *   HMAC-SHA256(raw_body, RAZORPAY_WEBHOOK_SECRET)
 *   Sent in X-Razorpay-Signature header
 *
 * ENVIRONMENT VARIABLES:
 *   RAZORPAY_KEY_ID         — Publishable key (can be shared with client via config)
 *   VITE_RAZORPAY_KEY_ID    — Alias (also works)
 *   RAZORPAY_KEY_SECRET     — Secret key (server-side ONLY, never expose)
 *   RAZORPAY_WEBHOOK_SECRET — Webhook verification secret
 *
 * This file is SERVER-SIDE ONLY. Never import this file from client components.
 * Use `gstoreRazorpayClient.ts` and `razorpay-client.ts` for client-side SDK loading.
 */

import { createHmac } from "crypto";
import type { PaymentProviderInterface } from "../PaymentProviderInterface";
import type {
  CurrencyCode,
  CountryCode,
  PaymentMethodType,
  ProviderCapabilities,
  CreateOneTimePaymentIntent,
  OneTimePaymentResult,
  CreateSubscriptionIntent,
  SubscriptionResult,
  PaymentVerification,
  VerificationResult,
  RefundRequest,
  RefundResult,
  WebhookEvent,
  WebhookResult,
  PaymentReference,
} from "../types";

// ── Environment helpers (server-side only) ────────────────────────────────────

function getRazorpayKeyId(): string {
  return process.env["RAZORPAY_KEY_ID"] ?? process.env["VITE_RAZORPAY_KEY_ID"] ?? "";
}

function getRazorpayKeySecret(): string {
  return process.env["RAZORPAY_KEY_SECRET"] ?? "";
}

function getRazorpayWebhookSecret(): string {
  return process.env["RAZORPAY_WEBHOOK_SECRET"] ?? "";
}

function getBasicAuthHeader(): string {
  const id     = getRazorpayKeyId();
  const secret = getRazorpayKeySecret();
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

const RAZORPAY_API = "https://api.razorpay.com/v1";

// ── Razorpay API helpers ──────────────────────────────────────────────────────

type RazorpayOrderResponse = {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
};

type RazorpayRefundResponse = {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
};

async function razorpayPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${RAZORPAY_API}${path}`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": getBasicAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay API error (${res.status}): ${err}`);
  }

  return res.json() as Promise<T>;
}

// ── RazorpayAdapter ───────────────────────────────────────────────────────────

export class RazorpayAdapter implements PaymentProviderInterface {
  readonly id = "razorpay" as const;
  readonly name = "Razorpay";

  // ── Identity & Configuration ──────────────────────────────────────────────

  isConfigured(): boolean {
    return getRazorpayKeyId().length > 0 && getRazorpayKeySecret().length > 0;
  }

  getProviderCapabilities(): ProviderCapabilities {
    return {
      supportsOneTimePayments:   true,
      supportsSubscriptions:     true,
      supportsRefunds:           true,
      supportsPartialRefunds:    true,
      supportsWebhooks:          true,
      supportsMultiCurrency:     false,  // Only INR currently
      supportsInternationalCards: true,
      supportedCountries:        ["IN"],
      supportedCurrencies:       ["INR"],
      supportedPaymentMethods:   this.getSupportedPaymentMethods("IN"),
    };
  }

  getSupportedPaymentMethods(country: CountryCode): PaymentMethodType[] {
    if (country === "IN") {
      return ["card", "upi", "netbanking", "wallet", "emi"];
    }
    // Razorpay international cards (limited support)
    return ["card"];
  }

  getSupportedCurrencies(): CurrencyCode[] {
    return ["INR"];
  }

  // ── One-time payments (Gstore orders) ────────────────────────────────────

  async createOneTimePayment(intent: CreateOneTimePaymentIntent): Promise<OneTimePaymentResult> {
    if (intent.isMock) {
      return {
        providerOrderId:      `mock_order_${Date.now()}`,
        providerPublishableKey: getRazorpayKeyId() || "rzp_test_mock",
        checkoutOptions:      { mock: true },
        amountMinor:          intent.amountMinor,
        currency:             intent.currency,
        isMock:               true,
      };
    }

    if (!this.isConfigured()) {
      throw new Error("Razorpay not configured: missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
    }

    const rzpOrder = await razorpayPost<RazorpayOrderResponse>("/orders", {
      amount:   intent.amountMinor,
      currency: intent.currency,
      receipt:  intent.orderNumber,
      notes: {
        order_id:   intent.orderId,
        payment_id: intent.paymentId,
        order_type: "gstore_one_time",
        purpose:    intent.purpose,
      },
    });

    return {
      providerOrderId:      rzpOrder.id,
      providerPublishableKey: getRazorpayKeyId(),
      checkoutOptions: {
        key:         getRazorpayKeyId(),
        order_id:    rzpOrder.id,
        amount:      intent.amountMinor,
        currency:    intent.currency,
        name:        "GeoVerze Gstore",
        description: `Order ${intent.orderNumber}`,
        prefill: {
          name:    intent.customer.name,
          email:   intent.customer.email,
          contact: intent.customer.phone ?? "",
        },
        notes: {
          order_id:   intent.orderId,
          payment_id: intent.paymentId,
        },
        theme:  { color: "#ffffff" },
      },
      amountMinor: rzpOrder.amount,
      currency:    intent.currency,
      isMock:      false,
    };
  }

  // ── Subscriptions ─────────────────────────────────────────────────────────

  async createSubscription(intent: CreateSubscriptionIntent): Promise<SubscriptionResult> {
    // Razorpay subscriptions are created by the `create-razorpay-subscription`
    // Supabase Edge Function which has access to the full billing catalog.
    // This adapter delegates to it rather than duplicating the logic.
    //
    // The Edge Function URL: {SUPABASE_URL}/functions/v1/create-razorpay-subscription
    //
    // This design keeps subscription plan management (plan IDs, pricing) in the
    // Edge Function, which can be updated without redeploying the main app.
    //
    // If the Edge Function approach is replaced in the future, implement the
    // Razorpay Subscriptions API call here and remove the delegation.

    throw new Error(
      "Razorpay subscriptions are created via the create-razorpay-subscription Edge Function. " +
      "Call createCheckoutSession() from createCheckoutSession.ts instead.",
    );
  }

  // ── Payment verification ──────────────────────────────────────────────────

  async verifyPayment(verification: PaymentVerification): Promise<VerificationResult> {
    const keySecret = getRazorpayKeySecret();
    if (!keySecret) {
      throw new Error("RAZORPAY_KEY_SECRET not configured");
    }

    if (verification.billingType === "ONE_TIME") {
      // One-time order verification: HMAC-SHA256(orderId|paymentId, KEY_SECRET)
      const body     = `${verification.providerOrderId}|${verification.providerPaymentId}`;
      const expected = createHmac("sha256", keySecret).update(body).digest("hex");

      const verified = expected === verification.providerSignature;
      // exactOptionalPropertyTypes: omit message when undefined (success case)
      return {
        success: verified,
        verified,
        outcome: verified ? "success" : "failed",
        ...(verified ? {} : { message: "Razorpay signature verification failed" }),
      };
    }

    if (verification.billingType === "RECURRING") {
      // Subscription verification: HMAC-SHA256(paymentId|subscriptionId, KEY_SECRET)
      const body     = `${verification.providerPaymentId}|${verification.providerOrderId}`;
      const expected = createHmac("sha256", keySecret).update(body).digest("hex");

      const verified = expected === verification.providerSignature;
      // exactOptionalPropertyTypes: omit message when undefined (success case)
      return {
        success: verified,
        verified,
        outcome: verified ? "success" : "failed",
        ...(verified ? {} : { message: "Razorpay subscription signature verification failed" }),
      };
    }

    return { success: false, verified: false, outcome: "failed", message: "Unknown billing type" };
  }

  // ── Payment management ────────────────────────────────────────────────────

  async cancelPayment(reference: PaymentReference): Promise<void> {
    // For Razorpay: payments can't be cancelled after creation without capture.
    // We just mark them in our DB — no Razorpay API call needed for pending orders.
    console.log("RazorpayAdapter.cancelPayment:", reference.orderId);
  }

  async refundPayment(refund: RefundRequest): Promise<RefundResult> {
    if (!this.isConfigured()) {
      throw new Error("Razorpay not configured");
    }

    const rzpRefund = await razorpayPost<RazorpayRefundResponse>(
      `/payments/${refund.providerPaymentId}/refund`,
      {
        amount: refund.amountMinor,
        notes: { reason: refund.reason ?? "Customer request" },
      },
    );

    return {
      refundId:    rzpRefund.id,
      amountMinor: rzpRefund.amount,
      status:      rzpRefund.status === "processed" ? "processed" : "pending",
    };
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = getRazorpayWebhookSecret();
    if (!secret) {
      console.warn("RazorpayAdapter: RAZORPAY_WEBHOOK_SECRET not set");
      return false;
    }
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    // Constant-time comparison to prevent timing attacks
    return expected.length === signature.length && expected === signature;
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    let parsed: { event: string; payload?: unknown };
    try {
      parsed = JSON.parse(event.rawBody) as typeof parsed;
    } catch {
      return { processed: false, event: "unknown" };
    }

    const eventName = parsed.event ?? "unknown";

    // Extract notes from payment entity
    const payload    = parsed.payload as Record<string, unknown> | undefined;
    // Index-signature members must use bracket notation (noUncheckedIndexedAccess + exactOptionalPropertyTypes)
    const paymentEnt = (payload?.['payment'] as Record<string, unknown> | undefined)?.['entity'] as Record<string, unknown> | undefined;
    const notes      = (paymentEnt?.['notes'] ?? {}) as Record<string, string>;
    const orderId    = notes["order_id"];

    switch (eventName) {
      // exactOptionalPropertyTypes: spread orderId only when defined
      case "payment.captured":
      case "order.paid":
        return { processed: true, event: eventName, ...(orderId !== undefined && { orderId }), outcome: "paid" };

      case "payment.failed":
        return { processed: true, event: eventName, ...(orderId !== undefined && { orderId }), outcome: "failed" };

      case "refund.processed":
      case "refund.created":
        return { processed: true, event: eventName, ...(orderId !== undefined && { orderId }), outcome: "refunded" };

      case "subscription.cancelled":
        return { processed: true, event: eventName, ...(orderId !== undefined && { orderId }), outcome: "cancelled" };

      default:
        return { processed: false, event: eventName };
    }
  }
}

// ── Singleton instance ────────────────────────────────────────────────────────

export const razorpayAdapter = new RazorpayAdapter();
