/**
 * GVRZE Payment Provider Interface
 *
 * Every payment gateway adapter MUST implement this interface.
 * Business logic (checkout, subscription, order management) depends ONLY on
 * this interface — never on a specific gateway's SDK or types.
 *
 * HOW TO ADD A NEW PROVIDER:
 *   1. Create `src/lib/payments/providers/YourProviderAdapter.ts`
 *   2. Implement `PaymentProviderInterface`
 *   3. Register the provider in `PaymentRouter.ts`
 *   4. Add activation configuration in `config.ts`
 *   5. Add any required secrets to Vercel env vars
 *
 * See StripeAdapter.stub.ts and PayPalAdapter.stub.ts for integration guides.
 */

import type {
  ProviderId,
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
} from "./types";

// ── Main interface ────────────────────────────────────────────────────────────

export interface PaymentProviderInterface {
  // ── Identity ────────────────────────────────────────────────────────────────

  /** Unique provider identifier (e.g. "razorpay", "stripe"). */
  readonly id: ProviderId;

  /** Human-readable provider name. */
  readonly name: string;

  // ── Health and configuration ────────────────────────────────────────────────

  /**
   * Returns true when the provider is fully configured and ready to process
   * payments. Called before routing to verify the provider is usable.
   *
   * Check for required env vars, API keys, etc.
   * Never throw here — return false if not ready.
   */
  isConfigured(): boolean;

  /**
   * Returns the provider's declared capabilities.
   * Used by PaymentRouter to validate routing decisions.
   */
  getProviderCapabilities(): ProviderCapabilities;

  // ── Payment methods ─────────────────────────────────────────────────────────

  /**
   * Returns payment methods supported for a given country.
   * Example: India → [card, upi, netbanking, wallet]
   *          US    → [card, apple_pay, google_pay]
   */
  getSupportedPaymentMethods(country: CountryCode): PaymentMethodType[];

  /**
   * Returns currencies supported by this provider.
   * Note: a currency must also be enabled in GVRZE's currency config to be
   * available to users (double-gating: provider + GVRZE config).
   */
  getSupportedCurrencies(): CurrencyCode[];

  // ── One-time payments ───────────────────────────────────────────────────────

  /**
   * Creates a one-time payment intent.
   *
   * Server-side only — do NOT call from client code.
   * Returns checkout options (provider order ID, key, etc.) for the client
   * to open the payment modal.
   *
   * MUST NOT create subscription or recurring billing.
   * MUST validate amount/currency against provider rules.
   * MUST be idempotent: same `idempotencyKey` → same result.
   */
  createOneTimePayment(intent: CreateOneTimePaymentIntent): Promise<OneTimePaymentResult>;

  // ── Subscriptions ───────────────────────────────────────────────────────────

  /**
   * Creates a recurring subscription.
   *
   * Server-side only.
   * MUST NOT create a one-time charge.
   * MUST NOT create ecommerce orders.
   *
   * Returns subscription checkout options for the client.
   */
  createSubscription(intent: CreateSubscriptionIntent): Promise<SubscriptionResult>;

  // ── Verification ────────────────────────────────────────────────────────────

  /**
   * Verifies a payment after the user completes the gateway flow.
   *
   * Server-side only. MUST:
   *   - Verify the cryptographic signature (HMAC or JWT, provider-specific)
   *   - Re-verify amount and currency match the original intent
   *   - Be idempotent (safe to call more than once for same payment)
   *   - NOT trust any amount from the client
   *
   * Returns `VerificationResult.verified = true` ONLY after successful
   * cryptographic signature verification.
   */
  verifyPayment(verification: PaymentVerification): Promise<VerificationResult>;

  // ── Payment management ──────────────────────────────────────────────────────

  /**
   * Cancels a pending payment that has not yet been captured.
   * Does NOT refund an already-captured payment (use refundPayment for that).
   */
  cancelPayment(reference: PaymentReference): Promise<void>;

  /**
   * Initiates a refund for a captured payment.
   * Full or partial refund depending on `amountMinor`.
   *
   * Server-side only. Must be authorized by an admin.
   */
  refundPayment(refund: RefundRequest): Promise<RefundResult>;

  // ── Webhooks ────────────────────────────────────────────────────────────────

  /**
   * Verifies the webhook signature.
   *
   * MUST be called BEFORE `processWebhook()`.
   * Returns false if the signature is invalid — the caller MUST reject the
   * webhook (return 400) without processing it.
   *
   * Signature algorithm is provider-specific:
   *   Razorpay: HMAC-SHA256(raw_body, WEBHOOK_SECRET)
   *   Stripe:   Stripe-Signature header with timestamp replay protection
   *   PayPal:   (varies by webhook type)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean | Promise<boolean>;

  /**
   * Processes a verified webhook event.
   *
   * Called ONLY after `verifyWebhookSignature()` returns true.
   * MUST be idempotent: processing the same event twice must not double-fulfill.
   * MUST handle unknown event types gracefully (return processed: false, not throw).
   */
  processWebhook(event: WebhookEvent): Promise<WebhookResult>;
}

// ── Helper: assert interface compliance at compile time ───────────────────────

/**
 * Type-level assertion that an object implements PaymentProviderInterface.
 * Use in adapter files:
 *
 *   const _: AssertImplements<MyAdapter> = {} as MyAdapter;
 *   void _;
 */
export type AssertImplements<T extends PaymentProviderInterface> = T;
