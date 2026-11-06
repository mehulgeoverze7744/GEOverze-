/**
 * GVRZE — PayPal Payment Provider Adapter (INTEGRATION STUB)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  THIS IS A DOCUMENTED INTEGRATION STUB — NOT A REAL IMPLEMENTATION ⚠️
 *
 * PayPal is NOT enabled. Do NOT activate PayPal without business owner approval.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * HOW TO ACTIVATE PAYPAL:
 *
 * Step 1 — Prerequisites (require approval)
 *   [ ] Business owner approves PayPal integration
 *   [ ] PayPal Business account created and verified
 *   [ ] Legal review for applicable countries
 *   [ ] Tax review for new currencies
 *   [ ] PayPal webhooks endpoint deployed
 *
 * Step 2 — Install the PayPal SDK
 *   npm install @paypal/paypal-server-sdk
 *   Or use the REST API directly (recommended for more control)
 *
 * Step 3 — Add environment variables to Vercel
 *   PAYPAL_CLIENT_ID      — From PayPal Developer Dashboard (safe for client)
 *   PAYPAL_CLIENT_SECRET  — From PayPal Developer Dashboard (server-side ONLY)
 *   PAYPAL_WEBHOOK_ID     — From PayPal webhook settings
 *
 * Step 4 — Implement this adapter
 *   See TODO comments below for the PayPal API calls to implement.
 *
 * Step 5 — Register in PaymentRouter.ts
 *   Import and register PayPalAdapter in the router.
 *
 * Step 6 — Update config.ts
 *   Set paypal.enabled = true in PROVIDER_CONFIG.
 *
 * PAYPAL NOTES:
 *   - PayPal supports one-time payments via Orders API v2
 *   - PayPal subscriptions require PayPal Billing Plans (more complex than Razorpay)
 *   - PayPal checkout uses a redirect flow or JS SDK button (not a modal like Razorpay)
 *   - PayPal IPN (Instant Payment Notification) is deprecated; use Webhooks API v1
 *
 * PAYPAL RESOURCES:
 *   REST API:       https://developer.paypal.com/api/rest/
 *   Orders API v2:  https://developer.paypal.com/api/orders/v2/
 *   Subscriptions:  https://developer.paypal.com/api/subscriptions/v1/
 *   Webhooks:       https://developer.paypal.com/api/webhooks/v1/
 *   JS SDK:         https://developer.paypal.com/sdk/js/
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

function getPayPalClientId():     string { return process.env["PAYPAL_CLIENT_ID"] ?? ""; }
function getPayPalClientSecret(): string { return process.env["PAYPAL_CLIENT_SECRET"] ?? ""; }
function getPayPalWebhookId():    string { return process.env["PAYPAL_WEBHOOK_ID"] ?? ""; }

export class PayPalAdapter implements PaymentProviderInterface {
  readonly id = "paypal" as const;
  readonly name = "PayPal";

  isConfigured(): boolean {
    return getPayPalClientId().length > 0 && getPayPalClientSecret().length > 0;
  }

  getProviderCapabilities(): ProviderCapabilities {
    return {
      supportsOneTimePayments:   true,
      supportsSubscriptions:     false,  // Complex — requires separate PayPal plan setup
      supportsRefunds:           true,
      supportsPartialRefunds:    true,
      supportsWebhooks:          true,
      supportsMultiCurrency:     true,
      supportsInternationalCards: true,
      supportedCountries:        ["US", "GB"],
      supportedCurrencies:       ["USD", "GBP", "EUR"],
      supportedPaymentMethods:   ["paypal", "card"],
    };
  }

  getSupportedPaymentMethods(_country: CountryCode): PaymentMethodType[] {
    return ["paypal", "card"];
  }

  getSupportedCurrencies(): CurrencyCode[] {
    return ["USD", "GBP", "EUR"];
  }

  async createOneTimePayment(_intent: CreateOneTimePaymentIntent): Promise<OneTimePaymentResult> {
    // TODO: Implement PayPal Orders API v2
    //
    // 1. Get access token:
    //    POST https://api.paypal.com/v1/oauth2/token
    //    with Basic Auth and grant_type=client_credentials
    //
    // 2. Create order:
    //    POST https://api.paypal.com/v2/checkout/orders
    //    {
    //      intent: "CAPTURE",
    //      purchase_units: [{
    //        reference_id: intent.orderId,
    //        amount: {
    //          currency_code: intent.currency,
    //          value: (intent.amountMinor / 100).toFixed(2)  ← NOTE: PayPal uses decimal amounts!
    //        }
    //      }]
    //    }
    //
    // 3. Return the order ID and client_id for the PayPal JS SDK button

    throw new Error(
      "PayPalAdapter: createOneTimePayment not implemented. " +
      "See PayPalAdapter.stub.ts for the integration guide."
    );
  }

  async createSubscription(_intent: CreateSubscriptionIntent): Promise<SubscriptionResult> {
    throw new Error("PayPalAdapter does not support subscriptions. Use Stripe or Razorpay.");
  }

  async verifyPayment(_verification: PaymentVerification): Promise<VerificationResult> {
    // TODO: Capture the PayPal order after buyer approval
    // POST https://api.paypal.com/v2/checkout/orders/{orderId}/capture
    // Verify captured amount matches expected amount

    throw new Error("PayPalAdapter: verifyPayment not implemented.");
  }

  async cancelPayment(_reference: PaymentReference): Promise<void> {
    throw new Error("PayPalAdapter: cancelPayment not implemented.");
  }

  async refundPayment(_refund: RefundRequest): Promise<RefundResult> {
    // TODO: POST https://api.paypal.com/v2/payments/captures/{captureId}/refund
    throw new Error("PayPalAdapter: refundPayment not implemented.");
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // TODO: PayPal webhook verification uses the Webhook-Id and event data
    // POST https://api.paypal.com/v1/notifications/verify-webhook-signature
    // This is an async API call, unlike Razorpay/Stripe HMAC verification
    throw new Error("PayPalAdapter: verifyWebhookSignature not implemented.");
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    // TODO: Handle PayPal webhook events
    // Event types:
    //   CHECKOUT.ORDER.APPROVED       → buyer approved, needs capture
    //   PAYMENT.CAPTURE.COMPLETED     → payment captured
    //   PAYMENT.CAPTURE.REFUNDED      → refund processed
    //   BILLING.SUBSCRIPTION.EXPIRED  → subscription expired

    void event; void getPayPalWebhookId;
    throw new Error("PayPalAdapter: processWebhook not implemented.");
  }
}

export const paypalAdapter = new PayPalAdapter();
