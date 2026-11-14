/**
 * Node webhook handler for POST /api/webhooks/razorpay.
 * Mirrors supabase/functions/razorpay-webhook so local `npm run dev`
 * can receive Razorpay TEST webhooks without deploying Edge Functions.
 *
 * Production should still use the Edge Function URL unless this app
 * origin is registered in the Razorpay dashboard.
 */

import { createClient } from "@supabase/supabase-js";

import { hmacSha256Hex, verifyRazorpayWebhookSignature } from "./razorpayCrypto";
import {
  extractGstoreWebhookRefs,
  extractSubscriptionWebhookRefs,
  isMembershipOrderWebhook,
  RAZORPAY_GSTORE_EVENTS,
  RAZORPAY_SUBSCRIPTION_EVENTS,
  resolveRazorpayWebhookEventId,
  shouldSkipProcessedWebhook,
  type RazorpayWebhookEnvelope,
} from "./razorpayWebhookLogic";
import { getRazorpayWebhookSecret } from "./razorpayServer";

function serviceClient() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
  const serviceRole = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  if (!url || !serviceRole) {
    throw new Error("Supabase service role is not configured for webhooks.");
  }
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

export async function handleRazorpayWebhookRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = getRazorpayWebhookSecret();
  if (!webhookSecret) {
    console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (
    !verifyRazorpayWebhookSignature({
      webhookSecret,
      rawBody,
      signature,
    })
  ) {
    console.warn("[razorpay-webhook] invalid signature");
    return new Response("Invalid signature", { status: 400 });
  }

  let envelope: RazorpayWebhookEnvelope & { id?: string };
  try {
    envelope = JSON.parse(rawBody) as RazorpayWebhookEnvelope & { id?: string };
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = envelope.event ?? "unknown";
  const eventId = resolveRazorpayWebhookEventId({
    envelopeId: envelope.id,
    eventType,
    rawBodyHash: hmacSha256Hex("id", rawBody),
  });
  const supabase = serviceClient();

  const { data: claim, error: claimError } = await supabase.rpc("claim_payment_webhook_event", {
    p_razorpay_event_id: eventId,
    p_event_type: eventType,
    p_payload: envelope,
  });
  if (claimError) {
    console.error("[razorpay-webhook] claim failed:", claimError.message);
    return new Response("Webhook claim failed", { status: 500 });
  }
  const claimed = claim as { id?: string; duplicate?: boolean; processed?: boolean } | null;
  if (shouldSkipProcessedWebhook(claimed)) {
    return new Response("OK — duplicate", { status: 200 });
  }

  try {
    if (RAZORPAY_GSTORE_EVENTS.has(eventType) && !isMembershipOrderWebhook(envelope)) {
      const refs = extractGstoreWebhookRefs(envelope);
      const outcome = eventType === "payment.failed" ? "failed" : "success";
      await supabase.rpc("fulfill_gstore_order_from_webhook", {
        p_provider_order_id: refs.rzpOrderId ?? "",
        p_provider_payment_id: refs.rzpPaymentId ?? "",
        p_gstore_order_id: refs.gstoreOrderId,
        p_gstore_payment_id: refs.gstorePaymentId,
        p_outcome: outcome,
      });
    }

    const subRefs = extractSubscriptionWebhookRefs(envelope);
    const rzpSub = subRefs.rzpSubscriptionId;
    if (
      rzpSub &&
      (RAZORPAY_SUBSCRIPTION_EVENTS.has(eventType) ||
        eventType === "payment.captured" ||
        eventType === "order.paid")
    ) {
      await supabase.rpc("apply_razorpay_subscription_event", {
        p_event_type: RAZORPAY_SUBSCRIPTION_EVENTS.has(eventType)
          ? eventType
          : "subscription.charged",
        p_provider_subscription_id: rzpSub,
        p_provider_payment_id: subRefs.rzpPaymentId,
        p_internal_subscription_id: subRefs.internalSubscriptionId,
        p_period_key: null,
      });
    }

    if (claimed?.id) {
      await supabase.rpc("mark_payment_webhook_event", {
        p_id: claimed.id,
        p_processed: true,
        p_error: null,
      });
    }
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[razorpay-webhook] processing error:", err);
    if (claimed?.id) {
      await supabase.rpc("mark_payment_webhook_event", {
        p_id: claimed.id,
        p_processed: false,
        p_error: err instanceof Error ? err.message : "unknown",
      });
    }
    return new Response("Webhook processing failed", { status: 500 });
  }
}
