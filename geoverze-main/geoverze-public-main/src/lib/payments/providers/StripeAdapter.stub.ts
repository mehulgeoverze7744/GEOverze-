/**
 * GVRZE — Stripe Payment Provider Adapter (INTEGRATION STUB)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  THIS IS A DOCUMENTED INTEGRATION STUB — NOT A REAL IMPLEMENTATION ⚠️
 *
 * Stripe is NOT enabled. Do NOT activate Stripe without business owner approval.
 * This file exists to document the integration path and preserve architecture.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * HOW TO ACTIVATE STRIPE:
 *
 * Step 1 — Prerequisites (require approval)
 *   [ ] Business owner approves Stripe integration
 *   [ ] Legal review of Stripe Terms of Service for applicable countries
 *   [ ] Tax review for new currencies/countries being enabled
 *   [ ] Stripe account created and verified
 *   [ ] Stripe webhooks endpoint deployed
 *
 * Step 2 — Install the Stripe SDK
 *   npm install stripe @stripe/stripe-js
 *
 * Step 3 — Add environment variables to Vercel
 *   STRIPE_PUBLISHABLE_KEY    — pk_live_... or pk_test_... (safe for client)
 *   STRIPE_SECRET_KEY         — sk_live_... or sk_test_... (server-side ONLY)
 *   STRIPE_WEBHOOK_SECRET     — whsec_... (from Stripe dashboard webhooks)
 *
 * Step 4 — Implement this adapter
 *   Replace each TODO comment below with the real Stripe SDK call.
 *   The interface is already correct — only the implementations need filling in.
 *
 * Step 5 — Register in PaymentRouter.ts
 *   Import and register StripeAdapter in the router:
 *     import { stripeAdapter } from "./providers/StripeAdapter.stub";
 *     registry.set("stripe", stripeAdapter);
 *
 * Step 6 — Update config.ts
 *   Set stripe.enabled = true in PROVIDER_CONFIG.
 *   Add routing rules for USD, GBP, EUR, etc.
 *
 * Step 7 — Deploy and test in Stripe test mode
 *   Use Stripe test card numbers (e.g. 4242424242424242).
 *   Verify webhook delivery via Stripe Dashboard → Developers → Webhooks.
 *   Test all flows: one-time, subscription, refund, failure, webhook.
 *
 * Step 8 — Enable in Production
 *   Switch from test keys to live keys.
 *   Enable the countries and currencies in countries.ts and currencies.ts.
 *   Update PROVIDER_CONFIG to set supported countries/currencies.
 *
 * STRIPE RESOURCES:
 *   Stripe Checkout: https://stripe.com/docs/payments/checkout
 *   Stripe Subscriptions: https://stripe.com/docs/billing/subscriptions/overview
 *   Stripe Webhooks: https://stripe.com/docs/webhooks
 *   Stripe TypeScript: https://stripe.com/docs/api?lang=node
 *   Stripe Test Cards: https://stripe.com/docs/testing#cards
 */

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

// ── Stripe environment helpers ────────────────────────────────────────────────

function getStripePublishableKey(): string {
  return process.env["STRIPE_PUBLISHABLE_KEY"] ?? "";
}

function getStripeSecretKey(): string {
  return process.env["STRIPE_SECRET_KEY"] ?? "";
}

function getStripeWebhookSecret(): string {
  return process.env["STRIPE_WEBHOOK_SECRET"] ?? "";
}

// ── StripeAdapter ─────────────────────────────────────────────────────────────

export class StripeAdapter implements PaymentProviderInterface {
  readonly id = "stripe" as const;
  readonly name = "Stripe";

  isConfigured(): boolean {
    // TODO: When implementing, check for required env vars
    return getStripePublishableKey().length > 0 && getStripeSecretKey().length > 0;
  }

  getProviderCapabilities(): ProviderCapabilities {
    return {
      supportsOneTimePayments:   true,
      supportsSubscriptions:     true,
      supportsRefunds:           true,
      supportsPartialRefunds:    true,
      supportsWebhooks:          true,
      supportsMultiCurrency:     true,
      supportsInternationalCards: true,
      supportedCountries:        ["US", "GB", "SG", "AE"],
      supportedCurrencies:       ["USD", "GBP", "EUR", "SGD", "AED"],
      supportedPaymentMethods:   this.getSupportedPaymentMethods("US"),
    };
  }

  getSupportedPaymentMethods(country: CountryCode): PaymentMethodType[] {
    // TODO: Return actual Stripe payment methods per country
    // Stripe payment methods vary by country and require Stripe dashboard configuration
    if (country === "US") return ["card", "apple_pay", "google_pay", "bank_transfer"];
    if (country === "GB") return ["card", "apple_pay", "google_pay", "klarna", "sepa"];
    return ["card"];
  }

  getSupportedCurrencies(): CurrencyCode[] {
    return ["USD", "GBP", "EUR", "SGD", "AED"];
  }

  async createOneTimePayment(intent: CreateOneTimePaymentIntent): Promise<OneTimePaymentResult> {
    // TODO: Implement Stripe PaymentIntent creation
    //
    // import Stripe from "stripe";
    // const stripe = new Stripe(getStripeSecretKey());
    //
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount:   intent.amountMinor,
    //   currency: intent.currency.toLowerCase(),
    //   metadata: {
    //     order_id:         intent.orderId,
    //     payment_id:       intent.paymentId,
    //     order_number:     intent.orderNumber,
    //     purpose:          intent.purpose,
    //   },
    //   receipt_email: intent.customer.email,
    //   idempotency_key: intent.idempotencyKey,
    // });
    //
    // return {
    //   providerOrderId:       paymentIntent.id,
    //   providerPublishableKey: getStripePublishableKey(),
    //   checkoutOptions: {
    //     clientSecret:  paymentIntent.client_secret,
    //     publishableKey: getStripePublishableKey(),
    //     // The client opens Stripe Elements or Stripe Checkout using clientSecret
    //   },
    //   amountMinor: intent.amountMinor,
    //   currency:    intent.currency,
    //   isMock:      false,
    // };

    throw new Error(
      "StripeAdapter: createOneTimePayment not implemented. " +
      "See StripeAdapter.stub.ts for the integration guide."
    );
  }

  async createSubscription(intent: CreateSubscriptionIntent): Promise<SubscriptionResult> {
    // TODO: Implement Stripe Subscription creation
    //
    // import Stripe from "stripe";
    // const stripe = new Stripe(getStripeSecretKey());
    //
    // 1. Find or create Stripe Customer
    // 2. Create a Stripe Subscription with the correct Price ID
    // 3. Return the client_secret for the SetupIntent or PaymentIntent
    //
    // Stripe subscription flow with 3D Secure:
    //   const subscription = await stripe.subscriptions.create({
    //     customer:              stripeCustomerId,
    //     items:                 [{ price: stripePriceId }],
    //     payment_behavior:      "default_incomplete",
    //     expand:                ["latest_invoice.payment_intent"],
    //     metadata:              { subscription_id: intent.subscriptionId },
    //   });

    throw new Error(
      "StripeAdapter: createSubscription not implemented. " +
      "See StripeAdapter.stub.ts for the integration guide."
    );
  }

  async verifyPayment(verification: PaymentVerification): Promise<VerificationResult> {
    // TODO: For one-time payments, verify by retrieving the PaymentIntent from Stripe
    // and checking its status === "succeeded" and amount matches.
    //
    // import Stripe from "stripe";
    // const stripe = new Stripe(getStripeSecretKey());
    //
    // const paymentIntent = await stripe.paymentIntents.retrieve(
    //   verification.providerPaymentId
    // );
    //
    // const verified = paymentIntent.status === "succeeded"
    //   && paymentIntent.amount === verification.amountMinor
    //   && paymentIntent.currency === verification.currency.toLowerCase();

    throw new Error(
      "StripeAdapter: verifyPayment not implemented. " +
      "See StripeAdapter.stub.ts for the integration guide."
    );
  }

  async cancelPayment(_reference: PaymentReference): Promise<void> {
    // TODO: Cancel a PaymentIntent
    // const stripe = new Stripe(getStripeSecretKey());
    // await stripe.paymentIntents.cancel(reference.providerPaymentId!);
    throw new Error("StripeAdapter: cancelPayment not implemented.");
  }

  async refundPayment(refund: RefundRequest): Promise<RefundResult> {
    // TODO: Create a Stripe Refund
    // const stripe = new Stripe(getStripeSecretKey());
    // const rzpRefund = await stripe.refunds.create({
    //   payment_intent: refund.providerPaymentId,
    //   amount:         refund.amountMinor,
    //   reason:         "requested_by_customer",
    //   idempotency_key: refund.idempotencyKey,
    // });

    throw new Error("StripeAdapter: refundPayment not implemented.");
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // TODO: Use Stripe's built-in webhook verification
    //
    // import Stripe from "stripe";
    // const stripe = new Stripe(getStripeSecretKey());
    //
    // try {
    //   stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
    //   return true;
    // } catch {
    //   return false;
    // }
    //
    // NOTE: Stripe uses a timestamp in the signature header to prevent replay attacks.
    // The `constructEvent` call handles this automatically.

    void payload; void signature; void getStripeWebhookSecret;
    throw new Error("StripeAdapter: verifyWebhookSignature not implemented.");
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    // TODO: Handle Stripe webhook events
    //
    // import Stripe from "stripe";
    // const stripe = new Stripe(getStripeSecretKey());
    // const stripeEvent = stripe.webhooks.constructEvent(
    //   event.rawBody, event.headers["stripe-signature"] ?? "", getStripeWebhookSecret()
    // );
    //
    // switch (stripeEvent.type) {
    //   case "payment_intent.succeeded":   → mark payment paid
    //   case "payment_intent.failed":      → mark payment failed
    //   case "invoice.paid":               → mark subscription period active
    //   case "invoice.payment_failed":     → handle subscription past_due
    //   case "customer.subscription.deleted": → cancel subscription
    //   case "charge.refunded":            → update refund status
    // }

    void event;
    throw new Error("StripeAdapter: processWebhook not implemented.");
  }
}

// ── Singleton (not registered until activated) ────────────────────────────────

export const stripeAdapter = new StripeAdapter();
