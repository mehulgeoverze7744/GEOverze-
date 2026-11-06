/**
 * GVRZE Unified Payment Infrastructure — Core Types
 *
 * This module defines every shared type used across the payment layer.
 * All providers, adapters, server functions, and UI components import from here.
 *
 * DESIGN PRINCIPLES:
 *   - Monetary amounts are ALWAYS integers in minor units (paise, cents, etc.)
 *   - Currency is ALWAYS an explicit ISO 4217 code — never assumed
 *   - Billing types are STRICTLY separated: ONE_TIME vs RECURRING
 *   - Every payment has an explicit purpose (GSTORE_ORDER | SUBSCRIPTION | …)
 *   - Provider IDs are string literals so new providers can be added safely
 *
 * MINOR UNITS:
 *   INR  = 100 paise per rupee    (₹100 = 10,000 paise)
 *   USD  = 100 cents per dollar   ($1 = 100 cents)
 *   EUR  = 100 cents per euro     (€1 = 100 cents)
 *   GBP  = 100 pence per pound    (£1 = 100 pence)
 *   JPY  = 1 (zero-decimal)       (¥100 = 100 yen — no minor unit)
 *   KWD  = 1000 fils per dinar    (1 KWD = 1000 fils — 3 decimal places)
 *
 * See currencies.ts for the full minor-unit registry.
 */

// ── Provider IDs ──────────────────────────────────────────────────────────────

/**
 * String union of all known provider identifiers.
 * Add new IDs here when adding a provider adapter.
 * "mock" is for testing without real payments.
 */
export type ProviderId = "razorpay" | "stripe" | "paypal" | "mock";

// ── Currency ──────────────────────────────────────────────────────────────────

/** ISO 4217 currency code (3-letter uppercase). */
export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "SGD" | "AED" | "JPY";

// ── Country ───────────────────────────────────────────────────────────────────

/** ISO 3166-1 alpha-2 country code (2-letter uppercase). */
export type CountryCode = "IN" | "US" | "GB" | "EU" | "SG" | "AE" | string;

// ── Billing types ─────────────────────────────────────────────────────────────

/**
 * Fundamental billing type.
 * ONE_TIME: Gstore product purchase — a single charge.
 * RECURRING: Subscription — ongoing recurring charge.
 */
export type BillingType = "ONE_TIME" | "RECURRING";

/**
 * Business purpose of a payment.
 * Determines which workflow and fulfillment logic is triggered.
 * A GSTORE_ORDER must never create a subscription and vice versa.
 */
export type PaymentPurpose =
  | "GSTORE_ORDER"      // Physical product purchase
  | "SUBSCRIPTION"      // Recurring subscription
  | "CREDIT_PURCHASE"   // In-app credit purchase
  | "DONATION"          // Future: donation/tip
  | "OTHER";            // Catch-all for extensions

// ── Payment status ────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "pending"    // Awaiting user action / gateway response
  | "authorized" // Authorized but not captured
  | "paid"       // Successfully captured
  | "failed"     // Payment attempt failed
  | "cancelled"  // User cancelled or order cancelled
  | "refunded"   // Full or partial refund issued
  | "expired"    // Payment window expired
  | "disputed";  // Chargeback / dispute opened

export type SubscriptionStatus =
  | "created"    // DB record created, not yet active
  | "pending"    // Awaiting first payment
  | "active"     // Active, billing ongoing
  | "past_due"   // Payment overdue
  | "cancelled"  // Cancelled (access until period end)
  | "expired"    // Period ended, fully inactive
  | "paused";    // Temporarily paused (provider-specific)

// ── Payment method ────────────────────────────────────────────────────────────

export type PaymentMethodType =
  | "card"
  | "upi"
  | "netbanking"
  | "wallet"
  | "emi"
  | "bank_transfer"
  | "apple_pay"
  | "google_pay"
  | "paypal"
  | "klarna"
  | "sepa"
  | "ideal"
  | "mock";

// ── Provider capabilities ─────────────────────────────────────────────────────

export type ProviderCapabilities = {
  supportsOneTimePayments: boolean;
  supportsSubscriptions: boolean;
  supportsRefunds: boolean;
  supportsPartialRefunds: boolean;
  supportsWebhooks: boolean;
  supportsMultiCurrency: boolean;
  supportsInternationalCards: boolean;
  supportedCountries: CountryCode[];
  supportedCurrencies: CurrencyCode[];
  supportedPaymentMethods: PaymentMethodType[];
};

// ── Payment intent (input to provider) ───────────────────────────────────────

/**
 * Represents the intent to create a one-time payment.
 * This is passed to `PaymentProviderInterface.createOneTimePayment()`.
 */
export type CreateOneTimePaymentIntent = {
  /** Amount in minor units of the specified currency. Never floating-point. */
  amountMinor: number;
  currency: CurrencyCode;
  purpose: PaymentPurpose;
  billingType: "ONE_TIME";

  /** Internal GVRZE reference IDs (for notes/receipts). */
  orderId: string;
  paymentId: string;
  orderNumber: string;

  /** Customer info for pre-fill. */
  customer: {
    name: string;
    email: string;
    phone?: string;
    countryCode: CountryCode;
  };

  /** Provider-specific options (passed through without modification). */
  providerOptions?: Record<string, unknown>;

  /** Idempotency key to prevent duplicate charges. */
  idempotencyKey: string;

  /** True when this is a mock/test payment. */
  isMock: boolean;
};

/**
 * Represents the intent to create a recurring subscription.
 */
export type CreateSubscriptionIntent = {
  billingType: "RECURRING";
  currency: CurrencyCode;
  purpose: "SUBSCRIPTION";

  planTier: string;
  billingInterval: "monthly" | "annual";

  /** Internal GVRZE reference */
  subscriptionId?: string;

  customer: {
    name: string;
    email: string;
    phone?: string;
    countryCode: CountryCode;
  };

  billingDetails?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    gstin?: string;
  };

  couponCode?: string;
  providerOptions?: Record<string, unknown>;
  idempotencyKey: string;
  isMock: boolean;
};

// ── Payment results (output from provider) ───────────────────────────────────

/**
 * Result returned by `createOneTimePayment()`.
 * Contains everything the client needs to render the payment modal.
 */
export type OneTimePaymentResult = {
  /** Provider-generated payment/order reference */
  providerOrderId: string;
  /** Provider's publishable key (safe to send to browser) */
  providerPublishableKey: string;
  /** Provider-specific checkout options (passed to modal/redirect) */
  checkoutOptions: Record<string, unknown>;
  /** Amount confirmed by provider (should match intent) */
  amountMinor: number;
  currency: CurrencyCode;
  /** Whether this is a mock/test result */
  isMock: boolean;
};

/**
 * Result returned by `createSubscription()`.
 */
export type SubscriptionResult = {
  subscriptionId: string;
  providerSubscriptionId: string;
  providerPublishableKey: string;
  checkoutOptions: Record<string, unknown>;
  amountMinor: number;
  currency: CurrencyCode;
  isMock: boolean;
};

// ── Payment verification ──────────────────────────────────────────────────────

export type PaymentVerification = {
  /** Internal order/subscription ID */
  orderId: string;
  paymentId: string;

  /** Provider-returned transaction references */
  providerOrderId: string;
  providerPaymentId: string;
  providerSignature: string;

  billingType: BillingType;
  purpose: PaymentPurpose;
  amountMinor: number;
  currency: CurrencyCode;

  /** For guest orders */
  guestToken?: string;

  /** Access token for authenticated orders */
  accessToken?: string;
};

export type VerificationResult = {
  success: boolean;
  verified: boolean;
  outcome: "success" | "failed" | "cancelled";
  message?: string;
};

// ── Refund ────────────────────────────────────────────────────────────────────

export type RefundRequest = {
  providerPaymentId: string;
  amountMinor: number;
  currency: CurrencyCode;
  reason?: string;
  idempotencyKey: string;
};

export type RefundResult = {
  refundId: string;
  amountMinor: number;
  status: "pending" | "processed" | "failed";
};

// ── Webhook ───────────────────────────────────────────────────────────────────

export type WebhookEvent = {
  rawBody: string;
  signature: string;
  headers: Record<string, string>;
  provider: ProviderId;
};

export type WebhookResult = {
  processed: boolean;
  event: string;
  orderId?: string;
  outcome?: "paid" | "failed" | "refunded" | "cancelled" | "ignored";
};

// ── Payment reference ─────────────────────────────────────────────────────────

export type PaymentReference = {
  orderId: string;
  paymentId: string;
  providerOrderId?: string;
  providerPaymentId?: string;
};

// ── Routing ───────────────────────────────────────────────────────────────────

export type ProviderSelectionCriteria = {
  billingType: BillingType;
  purpose: PaymentPurpose;
  country: CountryCode;
  currency: CurrencyCode;
  paymentMethod?: PaymentMethodType;
};

// ── Audit log entry ───────────────────────────────────────────────────────────

export type PaymentAuditEvent =
  | "payment_intent_created"
  | "payment_verified"
  | "payment_captured"
  | "payment_failed"
  | "payment_cancelled"
  | "refund_initiated"
  | "refund_processed"
  | "webhook_received"
  | "webhook_processed"
  | "subscription_created"
  | "subscription_activated"
  | "subscription_cancelled"
  | "subscription_expired"
  | "provider_error";

export type PaymentAuditLogEntry = {
  event: PaymentAuditEvent;
  provider: ProviderId;
  billingType: BillingType;
  purpose: PaymentPurpose;
  amountMinor?: number;
  currency?: CurrencyCode;
  orderId?: string;
  paymentId?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};
