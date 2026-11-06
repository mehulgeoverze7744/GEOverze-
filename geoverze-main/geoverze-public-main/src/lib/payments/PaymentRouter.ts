/**
 * GVRZE Payment Router
 *
 * The PaymentRouter is the single entry point for all payment operations.
 * Business logic and checkout flows call the router — NEVER a provider adapter directly.
 *
 * RESPONSIBILITIES:
 *   - Select the correct payment provider based on billing type, country, currency
 *   - Validate that the selected provider is configured and capable
 *   - Log payment events to the audit trail
 *   - Provide a unified error boundary around all payment operations
 *   - Support mock mode transparently (overrides real providers)
 *
 * USAGE:
 *   // Server-side only
 *   const router = getPaymentRouter();
 *   const result = await router.createOneTimePayment({
 *     amountMinor: 299_900,
 *     currency: "INR",
 *     country: "IN",
 *     ...
 *   });
 *
 * ADDING A NEW PROVIDER:
 *   1. Create the adapter in providers/YourAdapter.ts
 *   2. Import and register it in the PROVIDER_REGISTRY below
 *   3. Add routing rules in config.ts
 *   4. Update PROVIDER_CONFIG in config.ts with enabled: true when ready
 */

import type { PaymentProviderInterface } from "./PaymentProviderInterface";
import type {
  ProviderId,
  BillingType,
  CurrencyCode,
  CountryCode,
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
  PaymentAuditLogEntry,
} from "./types";
import { selectProvider, PROVIDER_CONFIG, isProviderEnabled } from "./config";
import { validateMinorAmount } from "./currencies";

// ── Provider registry ─────────────────────────────────────────────────────────
// Static imports for all adapters. Stubs throw when called if not configured.
// The build system tree-shakes unused handler code from the client bundle.

import { razorpayAdapter } from "./providers/RazorpayAdapter";
import { stripeAdapter } from "./providers/StripeAdapter.stub";
import { paypalAdapter } from "./providers/PayPalAdapter.stub";

type ProviderFactory = () => PaymentProviderInterface;
const PROVIDER_REGISTRY: Map<ProviderId, ProviderFactory> = new Map([
  ["razorpay", () => razorpayAdapter],
  ["stripe",   () => stripeAdapter],
  ["paypal",   () => paypalAdapter],
]);

/**
 * Register a provider adapter.
 * Called at module initialization time for custom/third-party providers.
 */
export function registerProvider(id: ProviderId, factory: ProviderFactory): void {
  PROVIDER_REGISTRY.set(id, factory);
}

function ensureProvidersRegistered(): void {
  // No-op: providers are registered via static imports above
}

// ── Audit logger ──────────────────────────────────────────────────────────────

type AuditLogger = (entry: PaymentAuditLogEntry) => void | Promise<void>;

let _auditLogger: AuditLogger = (entry) => {
  // Default: log to console (replace with DB logger in production)
  console.log("[PAYMENT_AUDIT]", JSON.stringify(entry));
};

export function setAuditLogger(logger: AuditLogger): void {
  _auditLogger = logger;
}

function audit(entry: Omit<PaymentAuditLogEntry, "timestamp">): void {
  void _auditLogger({ ...entry, timestamp: new Date().toISOString() });
}

// ── PaymentRouter ─────────────────────────────────────────────────────────────

export class PaymentRouter {
  private mockEnabled: boolean;

  constructor(mockEnabled = false) {
    this.mockEnabled = mockEnabled;
    ensureProvidersRegistered();
  }

  // ── Provider selection ──────────────────────────────────────────────────────

  private getProvider(
    billingType: BillingType,
    country: CountryCode,
    currency: CurrencyCode,
  ): PaymentProviderInterface {
    const providerId = selectProvider(billingType, country, currency, this.mockEnabled);
    if (!providerId) {
      throw new Error(
        `No payment provider available for: ` +
        `billingType=${billingType}, country=${country}, currency=${currency}. ` +
        `Check config.ts routing rules and provider enabled status.`
      );
    }

    const factory = PROVIDER_REGISTRY.get(providerId);
    if (!factory) {
      throw new Error(
        `Provider "${providerId}" is registered in config but not in PROVIDER_REGISTRY. ` +
        `Add the adapter import to PaymentRouter.ts.`
      );
    }

    const provider = factory();

    // Verify the provider is configured (has required API keys, etc.)
    if (!this.mockEnabled && !provider.isConfigured()) {
      throw new Error(
        `Payment provider "${providerId}" is selected but not configured. ` +
        `Add required environment variables and retry.`
      );
    }

    return provider;
  }

  getProviderForWebhook(providerId: ProviderId): PaymentProviderInterface {
    ensureProvidersRegistered();
    const factory = PROVIDER_REGISTRY.get(providerId);
    if (!factory) throw new Error(`Unknown provider: ${providerId}`);
    return factory();
  }

  // ── One-time payments ───────────────────────────────────────────────────────

  async createOneTimePayment(
    intent: CreateOneTimePaymentIntent & { country: CountryCode },
  ): Promise<OneTimePaymentResult & { providerId: ProviderId }> {
    validateMinorAmount(intent.amountMinor, intent.currency);

    const provider = this.getProvider("ONE_TIME", intent.country, intent.currency);

    audit({
      event:         "payment_intent_created",
      provider:      provider.id,
      billingType:   "ONE_TIME",
      purpose:       intent.purpose,
      amountMinor:   intent.amountMinor,
      currency:      intent.currency,
      orderId:       intent.orderId,
      paymentId:     intent.paymentId,
      success:       true,
    });

    try {
      const result = await provider.createOneTimePayment(intent);
      return { ...result, providerId: provider.id };
    } catch (error) {
      audit({
        event:       "provider_error",
        provider:    provider.id,
        billingType: "ONE_TIME",
        purpose:     intent.purpose,
        orderId:     intent.orderId,
        success:     false,
        error:       error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ── Subscriptions ───────────────────────────────────────────────────────────

  async createSubscription(
    intent: CreateSubscriptionIntent & { country: CountryCode },
  ): Promise<SubscriptionResult & { providerId: ProviderId }> {
    const provider = this.getProvider("RECURRING", intent.country, intent.currency);

    audit({
      event:       "subscription_created",
      provider:    provider.id,
      billingType: "RECURRING",
      purpose:     "SUBSCRIPTION",
      currency:    intent.currency,
      success:     true,
    });

    const result = await provider.createSubscription(intent);
    return { ...result, providerId: provider.id };
  }

  // ── Verification ────────────────────────────────────────────────────────────

  async verifyPayment(
    verification: PaymentVerification & { country: CountryCode },
  ): Promise<VerificationResult> {
    const provider = this.getProvider(
      verification.billingType, verification.country, verification.currency
    );

    const result = await provider.verifyPayment(verification);

    audit({
      event:               result.verified ? "payment_verified" : "payment_failed",
      provider:            provider.id,
      billingType:         verification.billingType,
      purpose:             verification.purpose,
      orderId:             verification.orderId,
      paymentId:           verification.paymentId,
      providerOrderId:     verification.providerOrderId,
      providerPaymentId:   verification.providerPaymentId,
      success:             result.verified,
      error:               result.message,
    });

    return result;
  }

  // ── Management ──────────────────────────────────────────────────────────────

  async cancelPayment(
    reference: PaymentReference,
    country: CountryCode,
    currency: CurrencyCode,
    billingType: BillingType,
  ): Promise<void> {
    const provider = this.getProvider(billingType, country, currency);
    await provider.cancelPayment(reference);

    audit({
      event:       "payment_cancelled",
      provider:    provider.id,
      billingType,
      purpose:     "GSTORE_ORDER",
      orderId:     reference.orderId,
      success:     true,
    });
  }

  async refundPayment(
    refund: RefundRequest,
    country: CountryCode,
    billingType: BillingType,
  ): Promise<RefundResult> {
    const provider = this.getProvider(billingType, country, refund.currency);

    audit({
      event:       "refund_initiated",
      provider:    provider.id,
      billingType,
      purpose:     "GSTORE_ORDER",
      amountMinor: refund.amountMinor,
      currency:    refund.currency,
      success:     true,
    });

    return provider.refundPayment(refund);
  }

  // ── Webhooks ────────────────────────────────────────────────────────────────

  async processWebhook(
    event: WebhookEvent,
  ): Promise<WebhookResult> {
    const provider = this.getProviderForWebhook(event.provider);

    // Signature verification MUST happen before processing
    const signatureValid = await provider.verifyWebhookSignature(
      event.rawBody,
      event.signature,
    );

    if (!signatureValid) {
      audit({
        event:       "webhook_received",
        provider:    provider.id,
        billingType: "ONE_TIME",
        purpose:     "GSTORE_ORDER",
        success:     false,
        error:       "Invalid webhook signature",
      });
      throw new Error(`Invalid webhook signature for provider: ${event.provider}`);
    }

    const result = await provider.processWebhook(event);

    audit({
      event:     "webhook_processed",
      provider:  provider.id,
      billingType: "ONE_TIME",
      purpose:   "GSTORE_ORDER",
      orderId:   result.orderId,
      success:   result.processed,
    });

    return result;
  }
}

// ── Singleton factory ─────────────────────────────────────────────────────────

let _router: PaymentRouter | null = null;

/**
 * Returns the global PaymentRouter instance.
 * Pass mockEnabled=true when MOCK_PAYMENTS_ENABLED env var is set.
 *
 * Usage in server functions:
 *   const router = getPaymentRouter(isMockEnabled());
 *   const result = await router.createOneTimePayment({ ... });
 */
export function getPaymentRouter(mockEnabled = false): PaymentRouter {
  // Create a new instance if mock mode changes
  if (!_router || _router["mockEnabled"] !== mockEnabled) {
    _router = new PaymentRouter(mockEnabled);
  }
  return _router;
}
