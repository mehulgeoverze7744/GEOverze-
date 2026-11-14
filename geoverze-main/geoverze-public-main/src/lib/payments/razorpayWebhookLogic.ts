/**
 * Pure webhook helpers: event extraction and idempotency decisions.
 * Used by unit tests and documented for the Deno Edge Function copy.
 */

export type RazorpayWebhookEnvelope = {
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, unknown> };
    order?: { entity?: Record<string, unknown> };
    subscription?: { entity?: Record<string, unknown> };
  };
};

export type GstoreWebhookRefs = {
  event: string;
  rzpPaymentId: string | null;
  rzpOrderId: string | null;
  gstoreOrderId: string | null;
  gstorePaymentId: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  captured: boolean;
};

export type SubscriptionWebhookRefs = {
  event: string;
  rzpSubscriptionId: string | null;
  rzpPaymentId: string | null;
  rzpPlanId: string | null;
  internalSubscriptionId: string | null;
  status: string | null;
};

export function shouldSkipProcessedWebhook(existing: {
  processed?: boolean;
  processing_status?: string;
} | null): boolean {
  if (!existing) return false;
  if (existing.processed === true) return true;
  return existing.processing_status === "processed";
}

/**
 * Razorpay webhook envelopes do not include a stable top-level `id`.
 * Never fall back to the event type alone — that would collapse every
 * `payment.captured` (etc.) into one idempotency key.
 */
export function resolveRazorpayWebhookEventId(input: {
  envelopeId?: string | null | undefined;
  eventType: string;
  rawBodyHash: string;
}): string {
  const envelopeId = input.envelopeId?.trim() ?? "";
  if (envelopeId.length > 0) return envelopeId;
  const eventType = input.eventType.trim() || "unknown";
  const hash = input.rawBodyHash.trim();
  if (!hash) {
    throw new Error("Webhook event hash is required when Razorpay envelope id is missing.");
  }
  return `${eventType}:${hash}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function extractGstoreWebhookRefs(envelope: RazorpayWebhookEnvelope): GstoreWebhookRefs {
  const event = envelope.event ?? "unknown";
  const payment = asRecord(envelope.payload?.payment?.entity);
  const order = asRecord(envelope.payload?.order?.entity);
  const notes = asRecord(payment["notes"] ?? order["notes"]);
  const rzpPaymentId = asString(payment["id"]);
  const rzpOrderId = asString(payment["order_id"]) ?? asString(order["id"]);
  return {
    event,
    rzpPaymentId,
    rzpOrderId,
    gstoreOrderId:
      asString(notes["order_id"]) ??
      asString(notes["gvrze_order_id"]) ??
      asString(notes["gstore_order_id"]),
    gstorePaymentId: asString(notes["payment_id"]) ?? asString(notes["gvrze_payment_id"]),
    amount: asNumber(payment["amount"]) ?? asNumber(order["amount"]),
    currency: asString(payment["currency"]) ?? asString(order["currency"]),
    status: asString(payment["status"]) ?? asString(order["status"]),
    captured: payment["captured"] === true || asString(payment["status"]) === "captured",
  };
}

function webhookNotes(envelope: RazorpayWebhookEnvelope): Record<string, unknown> {
  const sub = asRecord(envelope.payload?.subscription?.entity);
  const payment = asRecord(envelope.payload?.payment?.entity);
  const order = asRecord(envelope.payload?.order?.entity);
  return {
    ...asRecord(order["notes"]),
    ...asRecord(payment["notes"]),
    ...asRecord(sub["notes"]),
  };
}

export function isMembershipOrderWebhook(envelope: RazorpayWebhookEnvelope): boolean {
  return asString(webhookNotes(envelope)["checkout"]) === "membership";
}

export function extractSubscriptionWebhookRefs(
  envelope: RazorpayWebhookEnvelope,
): SubscriptionWebhookRefs {
  const event = envelope.event ?? "unknown";
  const sub = asRecord(envelope.payload?.subscription?.entity);
  const payment = asRecord(envelope.payload?.payment?.entity);
  const order = asRecord(envelope.payload?.order?.entity);
  const notes = webhookNotes(envelope);
  const membershipOrderId = isMembershipOrderWebhook(envelope)
    ? asString(payment["order_id"]) ?? asString(order["id"])
    : null;
  return {
    event,
    rzpSubscriptionId:
      asString(sub["id"]) ?? asString(payment["subscription_id"]) ?? membershipOrderId,
    rzpPaymentId: asString(payment["id"]),
    rzpPlanId: asString(sub["plan_id"]),
    internalSubscriptionId:
      asString(notes["internal_subscription_id"]) ?? asString(notes["subscription_id"]),
    status: asString(sub["status"]),
  };
}

export const RAZORPAY_GSTORE_EVENTS = new Set([
  "payment.captured",
  "payment.failed",
  "order.paid",
]);

export const RAZORPAY_SUBSCRIPTION_EVENTS = new Set([
  "subscription.activated",
  "subscription.charged",
  "subscription.pending",
  "subscription.halted",
  "subscription.cancelled",
  "subscription.completed",
  "subscription.updated",
]);
