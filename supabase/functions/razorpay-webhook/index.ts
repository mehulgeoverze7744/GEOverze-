/**
 * Edge Function: razorpay-webhook
 *
 * Receives and processes Razorpay subscription lifecycle events.
 * This is the ONLY place subscription state is ever set to "active" or changed.
 * The client-side Razorpay handler NEVER activates subscriptions directly.
 *
 * Required secrets:
 *   RAZORPAY_WEBHOOK_SECRET  — From Razorpay Dashboard → Webhooks → Secret
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_URL
 *
 * Register this URL in Razorpay Dashboard → Webhooks:
 *   https://<project>.supabase.co/functions/v1/razorpay-webhook
 *
 * Subscribe to events:
 *   subscription.activated, subscription.charged, subscription.halted,
 *   subscription.cancelled, subscription.completed, subscription.updated,
 *   payment.captured, payment.failed
 *
 * Design principles:
 *   - Idempotent: same event processed twice = same outcome
 *   - Always return 200 to Razorpay (unless auth fails) to prevent retries on
 *     events we intentionally ignore or already processed
 *   - All DB mutations via service-role RPCs (not direct table writes from Edge)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyRazorpayWebhook } from "../_shared/razorpay-verify.ts";

// ─── Razorpay event shapes ─────────────────────────────────────────────────────

type RazorpaySubscriptionPayload = {
  id: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start?: number;
  current_end?: number;
  charge_at?: number;
  notes?: Record<string, string>;
};

type RazorpayPaymentPayload = {
  id: string;
  subscription_id?: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  status: string;
  error_code?: string;
  error_description?: string;
};

type RazorpayWebhookEvent = {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    subscription?: { entity: RazorpaySubscriptionPayload };
    payment?: { entity: RazorpayPaymentPayload };
  };
  created_at: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unixToIso(ts: number | undefined): string | null {
  if (!ts) return null;
  return new Date(ts * 1000).toISOString();
}

function sha256Hex(text: string): Promise<string> {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(text))
    .then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );
}

function ok(message: string): Response {
  return new Response(JSON.stringify({ ok: true, message }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ─── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return err("Method not allowed", 405);
  }

  // ── 1. Environment ─────────────────────────────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

  if (!supabaseUrl || !serviceKey || !webhookSecret) {
    console.error("razorpay-webhook: missing environment variables");
    return err("Webhook handler not configured", 503);
  }

  // ── 2. Read raw body for signature verification ────────────────────────────
  const rawBody = await req.text();
  const signature = req.headers.get("X-Razorpay-Signature") ?? "";

  if (!signature) {
    console.warn("razorpay-webhook: missing X-Razorpay-Signature header");
    return err("Missing webhook signature", 401);
  }

  // ── 3. Verify signature ────────────────────────────────────────────────────
  const isValid = await verifyRazorpayWebhook(rawBody, signature, webhookSecret);
  if (!isValid) {
    console.warn("razorpay-webhook: invalid signature");
    return err("Invalid webhook signature", 401);
  }

  // ── 4. Parse event ─────────────────────────────────────────────────────────
  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return err("Invalid JSON payload", 400);
  }

  const eventType = event.event ?? "";
  const eventId = `${event.account_id}:${eventType}:${event.created_at}`;

  console.log(`razorpay-webhook: received event=${eventType} id=${eventId}`);

  // ── 5. Admin client ────────────────────────────────────────────────────────
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // ── 6. Idempotency check + insert webhook event row ────────────────────────
  const payloadSha = await sha256Hex(rawBody);
  const sub = event.payload.subscription?.entity;
  const payment = event.payload.payment?.entity;

  const { data: existingEvent } = await admin
    .from("billing_webhook_events")
    .select("id, processing_status")
    .eq("provider", "razorpay")
    .eq("provider_event_id", eventId)
    .maybeSingle();

  if (existingEvent?.processing_status === "processed") {
    console.log(`razorpay-webhook: already processed event ${eventId}, skipping`);
    return ok("already processed");
  }

  // Upsert the event record
  const { data: eventRow, error: eventInsertError } = await admin
    .from("billing_webhook_events")
    .upsert(
      {
        provider: "razorpay",
        provider_event_id: eventId,
        event_type: eventType,
        normalized_event_type: eventType,
        provider_subscription_id: sub?.id ?? payment?.subscription_id ?? null,
        provider_payment_id: payment?.id ?? null,
        provider_customer_id: sub?.customer_id ?? null,
        provider_event_created_at: event.created_at
          ? new Date(event.created_at * 1000).toISOString()
          : null,
        payload: JSON.parse(rawBody) as Record<string, unknown>,
        payload_sha256: payloadSha,
        processing_status: "processing",
        attempt_count: (existingEvent ? 1 : 0) + 1,
        received_at: new Date().toISOString(),
      },
      { onConflict: "provider,provider_event_id", ignoreDuplicates: false },
    )
    .select("id")
    .maybeSingle();

  if (eventInsertError) {
    console.error("razorpay-webhook: failed to record event", eventInsertError);
  }

  const webhookEventId = eventRow?.id as string | undefined;

  // ── 7. Dispatch event handler ──────────────────────────────────────────────
  try {
    switch (eventType) {
      case "subscription.activated":
      case "subscription.charged": {
        if (!sub) break;
        await admin.rpc("activate_razorpay_subscription", {
          p_provider_subscription_id: sub.id,
          p_provider_event_id: eventId,
          p_period_start: unixToIso(sub.current_start),
          p_period_end: unixToIso(sub.current_end),
          p_next_billing_at: unixToIso(sub.charge_at),
        });

        // Also record the payment if present
        if (payment && payment.status === "captured") {
          const { data: internalSub } = await admin
            .from("user_subscriptions")
            .select("id, user_id, current_price_snapshot_id, plan_tier, billing_interval, billing_address_id")
            .eq("provider_subscription_id", sub.id)
            .eq("provider_name", "razorpay")
            .maybeSingle();

          if (internalSub) {
            // Fetch GST config for invoice
            const { data: gstRow } = await admin
              .from("billing_gst_config")
              .select("rate_percent, tax_inclusive")
              .eq("id", 1)
              .maybeSingle();

            const rateDecimal = gstRow ? Number(gstRow.rate_percent) / 100 : 0.18;
            const taxInclusive = gstRow ? Boolean(gstRow.tax_inclusive) : true;

            // Calculate GST breakdown from charge amount (in paise)
            const totalPaise = payment.amount;
            let basePaise: number;
            let gstPaise: number;
            if (taxInclusive) {
              basePaise = Math.round(totalPaise / (1 + rateDecimal));
              gstPaise = totalPaise - basePaise;
            } else {
              gstPaise = Math.round(totalPaise * rateDecimal);
              basePaise = totalPaise - gstPaise;
            }

            const { data: paymentRow } = await admin.rpc("record_razorpay_payment", {
              p_subscription_id: internalSub.id,
              p_user_id: internalSub.user_id,
              p_price_snapshot_id: internalSub.current_price_snapshot_id,
              p_provider_payment_id: payment.id,
              p_provider_invoice_id: payment.invoice_id ?? null,
              p_provider_subscription_id: sub.id,
              p_plan_tier: internalSub.plan_tier,
              p_charge_currency: payment.currency,
              p_charge_amount_minor: payment.amount,
              p_catalog_usd_amount_cents: payment.amount,
              p_status: "succeeded",
              p_period_start: unixToIso(sub.current_start),
              p_period_end: unixToIso(sub.current_end),
              p_webhook_event_id: webhookEventId ?? null,
            });

            // Create GST invoice
            await admin.rpc("create_billing_invoice", {
              p_user_id: internalSub.user_id,
              p_subscription_id: internalSub.id,
              p_payment_id: paymentRow ?? null,
              p_plan_tier: internalSub.plan_tier,
              p_billing_interval: internalSub.billing_interval ?? "monthly",
              p_base_amount_minor: basePaise,
              p_gst_amount_minor: gstPaise,
              p_total_amount_minor: totalPaise,
              p_gst_rate_percent: gstRow?.rate_percent ?? 18,
              p_currency: payment.currency,
              p_billing_address_id: internalSub.billing_address_id ?? null,
              p_period_start: unixToIso(sub.current_start),
              p_period_end: unixToIso(sub.current_end),
            });
          }
        }
        break;
      }

      case "payment.captured": {
        if (!payment || !payment.subscription_id) break;

        const { data: internalSub } = await admin
          .from("user_subscriptions")
          .select("id, user_id, current_price_snapshot_id, plan_tier")
          .eq("provider_subscription_id", payment.subscription_id)
          .eq("provider_name", "razorpay")
          .maybeSingle();

        if (internalSub) {
          await admin.rpc("record_razorpay_payment", {
            p_subscription_id: internalSub.id,
            p_user_id: internalSub.user_id,
            p_price_snapshot_id: internalSub.current_price_snapshot_id,
            p_provider_payment_id: payment.id,
            p_provider_invoice_id: payment.invoice_id ?? null,
            p_provider_subscription_id: payment.subscription_id,
            p_plan_tier: internalSub.plan_tier,
            p_charge_currency: payment.currency,
            p_charge_amount_minor: payment.amount,
            p_catalog_usd_amount_cents: payment.amount,
            p_status: "succeeded",
            p_period_start: null,
            p_period_end: null,
            p_webhook_event_id: webhookEventId ?? null,
          });
        }
        break;
      }

      case "payment.failed": {
        if (!payment || !payment.subscription_id) break;

        const { data: internalSub } = await admin
          .from("user_subscriptions")
          .select("id, user_id, current_price_snapshot_id, plan_tier")
          .eq("provider_subscription_id", payment.subscription_id)
          .eq("provider_name", "razorpay")
          .maybeSingle();

        if (internalSub) {
          await admin.rpc("record_razorpay_payment", {
            p_subscription_id: internalSub.id,
            p_user_id: internalSub.user_id,
            p_price_snapshot_id: internalSub.current_price_snapshot_id,
            p_provider_payment_id: payment.id,
            p_provider_invoice_id: payment.invoice_id ?? null,
            p_provider_subscription_id: payment.subscription_id,
            p_plan_tier: internalSub.plan_tier,
            p_charge_currency: payment.currency,
            p_charge_amount_minor: payment.amount,
            p_catalog_usd_amount_cents: payment.amount,
            p_status: "failed",
            p_failure_code: payment.error_code ?? null,
            p_failure_reason: payment.error_description ?? null,
            p_period_start: null,
            p_period_end: null,
            p_webhook_event_id: webhookEventId ?? null,
          });
        }
        break;
      }

      case "subscription.halted": {
        if (!sub) break;
        await admin.rpc("halt_razorpay_subscription", {
          p_provider_subscription_id: sub.id,
          p_provider_event_id: eventId,
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        if (!sub) break;
        await admin.rpc("cancel_razorpay_subscription", {
          p_provider_subscription_id: sub.id,
          p_provider_event_id: eventId,
          p_cancel_at_period_end: false,
        });
        break;
      }

      case "subscription.updated": {
        // Log but no action needed — plan changes are complex and require
        // dedicated handling. For now, record the event and investigate.
        console.log(`razorpay-webhook: subscription.updated received for ${sub?.id}`);
        break;
      }

      default:
        console.log(`razorpay-webhook: unhandled event type ${eventType}`);
    }

    // ── 8. Mark event as processed ──────────────────────────────────────────
    if (webhookEventId) {
      await admin
        .from("billing_webhook_events")
        .update({
          processing_status: "processed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", webhookEventId);
    }

    return ok(`processed ${eventType}`);
  } catch (handlerError) {
    console.error(`razorpay-webhook: handler error for ${eventType}`, handlerError);

    // Mark event as failed so it can be retried
    if (webhookEventId) {
      await admin
        .from("billing_webhook_events")
        .update({
          processing_status: "failed",
          processing_error:
            handlerError instanceof Error ? handlerError.message : String(handlerError),
        })
        .eq("id", webhookEventId);
    }

    // Return 200 to Razorpay anyway — we've logged it; Razorpay retries on 5xx
    // but we prefer to investigate via the billing_webhook_events table.
    return ok(`received ${eventType} (handler error logged)`);
  }
});
