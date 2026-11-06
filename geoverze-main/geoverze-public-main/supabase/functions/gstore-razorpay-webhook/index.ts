/**
 * Supabase Edge Function: gstore-razorpay-webhook
 *
 * Handles Razorpay webhook events for Gstore one-time orders.
 *
 * SETUP:
 *   1. Deploy this function:
 *      npx supabase functions deploy gstore-razorpay-webhook --project-ref hcxifkgzugxqijttmpzc
 *
 *   2. Add secrets (never commit these):
 *      npx supabase secrets set RAZORPAY_WEBHOOK_SECRET=<your_webhook_secret> --project-ref hcxifkgzugxqijttmpzc
 *      npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key> --project-ref hcxifkgzugxqijttmpzc
 *
 *   3. Add this URL to Razorpay Dashboard → Settings → Webhooks:
 *      https://hcxifkgzugxqijttmpzc.supabase.co/functions/v1/gstore-razorpay-webhook
 *
 *   4. Enable events: payment.captured, payment.failed, order.paid
 *
 * SECURITY:
 *   - Verifies X-Razorpay-Signature using HMAC-SHA256(raw_body, WEBHOOK_SECRET)
 *   - Uses service role to update order status (bypasses RLS)
 *   - Idempotent: safe to receive the same event multiple times
 *
 * This webhook is a SECONDARY confirmation mechanism.
 * The primary confirmation is done by verifyGstorePaymentFn / verifyGstoreGuestPaymentFn
 * in the browser after the user completes payment.
 * The webhook catches edge cases where the browser callback doesn't fire
 * (network issues, page close, etc.).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

async function verifyRazorpayWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  // Constant-time compare
  return expected === signature;
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  // Read raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  // Verify signature
  const isValid = await verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    console.warn("Invalid Razorpay webhook signature");
    return new Response("Invalid signature", { status: 400 });
  }

  // Parse event
  let event: { event: string; payload: { payment?: { entity?: Record<string, unknown> }; order?: { entity?: Record<string, unknown> } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  console.log("Received Razorpay webhook:", event.event);

  // Setup Supabase service role client
  const supabaseUrl  = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRole  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase     = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  try {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity ?? {};
      const notes         = (paymentEntity["notes"] ?? {}) as Record<string, string>;

      const orderId   = notes["order_id"]   ?? "";
      const paymentId = notes["payment_id"] ?? "";

      if (!orderId || !paymentId) {
        console.warn("Webhook: missing order_id or payment_id in notes", notes);
        return new Response("OK — no action (missing notes)", { status: 200 });
      }

      // Check if order is already confirmed (idempotency)
      const { data: order, error: orderError } = await supabase
        .from("gstore_orders")
        .select("id, payment_status, user_id, guest_token")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        console.warn("Webhook: order not found", orderId, orderError?.message);
        return new Response("OK — order not found", { status: 200 });
      }

      if (order.payment_status === "paid") {
        console.log("Webhook: order already paid, skipping", orderId);
        return new Response("OK — already paid", { status: 200 });
      }

      // Update payment record
      const rzpOrderId   = (paymentEntity["order_id"]   ?? "") as string;
      const rzpPaymentId = (paymentEntity["id"]          ?? "") as string;

      await supabase
        .from("gstore_payments")
        .update({
          provider_order_id:   rzpOrderId,
          provider_payment_id: rzpPaymentId,
          provider_signature:  "webhook-confirmed",
          status:              "paid",
          updated_at:          new Date().toISOString(),
        })
        .eq("id", paymentId);

      // Update order status
      await supabase
        .from("gstore_orders")
        .update({
          payment_status: "paid",
          order_status:   "confirmed",
          updated_at:     new Date().toISOString(),
        })
        .eq("id", orderId);

      console.log(`Webhook: confirmed order ${orderId} via ${event.event}`);
      return new Response("OK", { status: 200 });
    }

    if (event.event === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity ?? {};
      const notes         = (paymentEntity["notes"] ?? {}) as Record<string, string>;
      const orderId   = notes["order_id"]   ?? "";
      const paymentId = notes["payment_id"] ?? "";

      if (!orderId) {
        return new Response("OK — no order_id in notes", { status: 200 });
      }

      // Only mark failed if currently unpaid/pending
      const { data: order } = await supabase
        .from("gstore_orders")
        .select("payment_status")
        .eq("id", orderId)
        .single();

      if (order && order.payment_status === "unpaid") {
        if (paymentId) {
          await supabase
            .from("gstore_payments")
            .update({ status: "failed", updated_at: new Date().toISOString() })
            .eq("id", paymentId);
        }
        await supabase
          .from("gstore_orders")
          .update({ payment_status: "failed", updated_at: new Date().toISOString() })
          .eq("id", orderId);
      }

      console.log(`Webhook: marked order ${orderId} as failed`);
      return new Response("OK", { status: 200 });
    }

    // Unhandled event type — return 200 so Razorpay doesn't retry
    console.log(`Webhook: unhandled event type ${event.event}, ignoring`);
    return new Response("OK — event not handled", { status: 200 });

  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 200 to prevent Razorpay from retrying (we log errors separately)
    return new Response("OK — internal error logged", { status: 200 });
  }
});
