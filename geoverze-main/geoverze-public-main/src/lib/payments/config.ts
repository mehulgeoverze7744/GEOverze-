/**
 * GVRZE Payment Infrastructure — Provider & Routing Configuration
 *
 * This is the central configuration file for the payment layer.
 * Business owners and engineers use this file to:
 *   - Activate or deactivate payment providers
 *   - Configure payment routing rules
 *   - Set provider priority per billing type and country
 *   - Configure environment-based overrides
 *
 * HOW TO ACTIVATE A NEW PROVIDER:
 *   1. Set `enabled: true` for the provider in PROVIDER_CONFIG below.
 *   2. Add required environment variables to Vercel.
 *   3. Update PAYMENT_ROUTING_RULES if needed.
 *   4. Test thoroughly in mock/preview mode before production.
 *   5. ⚠️  NEVER activate a new provider in Production without approval.
 *
 * ENVIRONMENT VARIABLES USED:
 *   RAZORPAY_KEY_ID            — Required for Razorpay
 *   RAZORPAY_KEY_SECRET        — Required for Razorpay (server-side only)
 *   RAZORPAY_WEBHOOK_SECRET    — Required for webhook verification
 *   STRIPE_PUBLISHABLE_KEY     — Required for Stripe (when activated)
 *   STRIPE_SECRET_KEY          — Required for Stripe (server-side only)
 *   STRIPE_WEBHOOK_SECRET      — Required for Stripe webhooks
 *   PAYPAL_CLIENT_ID           — Required for PayPal (when activated)
 *   PAYPAL_CLIENT_SECRET       — Required for PayPal (server-side only)
 *   MOCK_PAYMENTS_ENABLED      — Enables mock mode (testing only)
 */

import type { ProviderId, BillingType, CountryCode, CurrencyCode, PaymentMethodType } from "./types";

// ── Provider configuration ────────────────────────────────────────────────────

export type ProviderConfig = {
  id: ProviderId;
  name: string;
  /** Whether this provider is active and can process payments */
  enabled: boolean;
  /** Whether this provider can handle one-time payments */
  supportsOneTime: boolean;
  /** Whether this provider can handle subscriptions */
  supportsSubscriptions: boolean;
  /** Countries this provider is configured to handle */
  supportedCountries: CountryCode[];
  /** Currencies this provider is configured to handle */
  supportedCurrencies: CurrencyCode[];
  /** Priority (lower = preferred when multiple providers match) */
  priority: number;
  /** Human-readable note for admin dashboard */
  adminNote?: string;
};

/**
 * Central provider registry.
 *
 * CURRENT STATE:
 *   - razorpay: ACTIVE (India, INR)
 *   - stripe:   NOT ACTIVE (future integration)
 *   - paypal:   NOT ACTIVE (future integration)
 *   - mock:     Controlled by MOCK_PAYMENTS_ENABLED env var
 */
export const PROVIDER_CONFIG: Record<ProviderId, ProviderConfig> = {

  razorpay: {
    id:                   "razorpay",
    name:                 "Razorpay",
    enabled:              true,
    supportsOneTime:      true,
    supportsSubscriptions: true,
    supportedCountries:   ["IN"],
    supportedCurrencies:  ["INR"],
    priority:             1,
    adminNote:            "Active provider for India. Handles both subscriptions and one-time Gstore payments.",
  },

  stripe: {
    id:                   "stripe",
    name:                 "Stripe",
    enabled:              false,   // ← Do NOT enable without approval
    supportsOneTime:      true,
    supportsSubscriptions: true,
    supportedCountries:   ["US", "GB", "SG", "AE"],
    supportedCurrencies:  ["USD", "GBP", "EUR", "SGD", "AED"],
    priority:             2,
    adminNote:            "NOT ACTIVE. Requires STRIPE_PUBLISHABLE_KEY + STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET. See StripeAdapter.stub.ts for integration guide.",
  },

  paypal: {
    id:                   "paypal",
    name:                 "PayPal",
    enabled:              false,   // ← Do NOT enable without approval
    supportsOneTime:      true,
    supportsSubscriptions: false,
    supportedCountries:   ["US", "GB"],
    supportedCurrencies:  ["USD", "GBP", "EUR"],
    priority:             3,
    adminNote:            "NOT ACTIVE. Requires PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET. See PayPalAdapter.stub.ts for integration guide.",
  },

  mock: {
    id:                   "mock",
    name:                 "Mock Gateway (Testing)",
    enabled:              false,   // Dynamically enabled by MOCK_PAYMENTS_ENABLED env var at runtime
    supportsOneTime:      true,
    supportsSubscriptions: true,
    supportedCountries:   ["IN", "US", "GB", "SG", "AE"],
    supportedCurrencies:  ["INR", "USD", "GBP", "EUR", "SGD", "AED"],
    priority:             0,       // Highest priority when active
    adminNote:            "Test-only provider. Activated by MOCK_PAYMENTS_ENABLED=true env var.",
  },
};

// ── Payment routing rules ─────────────────────────────────────────────────────

export type RoutingRule = {
  billingType: BillingType | "*";
  country: CountryCode | "*";
  currency: CurrencyCode | "*";
  preferredProvider: ProviderId;
  fallbackProvider?: ProviderId;
};

/**
 * Routing rules determine which provider handles a payment.
 * Rules are evaluated in order — first match wins.
 * "*" matches any value for that field.
 */
export const PAYMENT_ROUTING_RULES: RoutingRule[] = [
  // India one-time (Gstore) → Razorpay
  {
    billingType:       "ONE_TIME",
    country:           "IN",
    currency:          "INR",
    preferredProvider: "razorpay",
  },
  // India subscriptions → Razorpay
  {
    billingType:       "RECURRING",
    country:           "IN",
    currency:          "INR",
    preferredProvider: "razorpay",
  },
  // US one-time → Stripe (when activated)
  {
    billingType:       "ONE_TIME",
    country:           "US",
    currency:          "USD",
    preferredProvider: "stripe",
  },
  // UK one-time → Stripe (when activated)
  {
    billingType:       "ONE_TIME",
    country:           "GB",
    currency:          "GBP",
    preferredProvider: "stripe",
  },
  // International subscriptions → Stripe (when activated)
  {
    billingType:       "RECURRING",
    country:           "*",
    currency:          "*",
    preferredProvider: "stripe",
  },
];

// ── Feature flags ─────────────────────────────────────────────────────────────

export type FeatureFlags = {
  /** Whether guest checkout (no login) is enabled */
  guestCheckout: boolean;
  /** Whether international checkout is exposed to users (even if countries not enabled) */
  internationalCheckoutUi: boolean;
  /** Whether the admin payment dashboard is enabled */
  adminPaymentDashboard: boolean;
  /** Whether Gstore is open for purchases */
  gstoreEnabled: boolean;
  /** Whether subscription checkout is enabled */
  subscriptionsEnabled: boolean;
};

export const FEATURE_FLAGS: FeatureFlags = {
  guestCheckout:           true,
  internationalCheckoutUi: false,  // Show "coming soon" for international
  adminPaymentDashboard:   true,
  gstoreEnabled:           true,
  subscriptionsEnabled:    true,
};

// ── Helper: select provider for a given criteria ──────────────────────────────

export function selectProvider(
  billingType: BillingType,
  country: CountryCode,
  currency: CurrencyCode,
  mockEnabled = false,
): ProviderId | null {
  // Mock mode overrides everything
  if (mockEnabled && PROVIDER_CONFIG["mock"]) {
    return "mock";
  }

  for (const rule of PAYMENT_ROUTING_RULES) {
    const matchesBilling  = rule.billingType === "*" || rule.billingType === billingType;
    const matchesCountry  = rule.country === "*" || rule.country === country;
    const matchesCurrency = rule.currency === "*" || rule.currency === currency;

    if (!matchesBilling || !matchesCountry || !matchesCurrency) continue;

    const provider = PROVIDER_CONFIG[rule.preferredProvider];
    if (provider && provider.enabled) return provider.id;

    // Try fallback
    if (rule.fallbackProvider) {
      const fallback = PROVIDER_CONFIG[rule.fallbackProvider];
      if (fallback && fallback.enabled) return fallback.id;
    }
  }

  return null;
}

export function isProviderEnabled(id: ProviderId): boolean {
  return PROVIDER_CONFIG[id]?.enabled ?? false;
}

export function getActiveProviders(): ProviderConfig[] {
  return Object.values(PROVIDER_CONFIG).filter(p => p.enabled);
}
