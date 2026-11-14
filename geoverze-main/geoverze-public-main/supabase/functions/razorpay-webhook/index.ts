/**
 * Unified Razorpay webhook — Gstore orders + memberships.
 *
 * Deploy:
 *   npx supabase functions deploy razorpay-webhook --project-ref hcxifkgzugxqijttmpzc
 *
 * Secrets:
 *   RAZORPAY_WEBHOOK_SECRET
 *   SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 *
 * Dashboard URL:
 *   https://<project-ref>.supabase.co/functions/v1/razorpay-webhook
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function hmacHex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  if (left.length !== right.length || left.length === 0) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i++) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return mismatch === 0;
}

function notesOf(entity: Record<string, unknown> | undefined): Record<string, string> {
  const raw = entity?.["notes"];
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = (Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "").trim();
  if (!webhookSecret || webhookSecret === "your_webhook_secret") {
    console.error("RAZORPAY_WEBHOOK_SECRET not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!signature) return new Response("Missing signature", { status: 400 });

  const expected = await hmacHex(webhookSecret, rawBody);
  if (!timingSafeEqualHex(expected, signature)) {
    console.warn("Invalid Razorpay webhook signature");
    return new Response("Invalid signature", { status: 400 });
  }

  let event: {
    event?: string;
    id?: string;
    payload?: Record<string, { entity?: Record<string, unknown> }>;
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = event.event ?? "unknown";
  const envelopeId = typeof event.id === "string" ? event.id.trim() : "";
  const eventId = envelopeId || `${eventType}:${await hmacHex("id", rawBody)}`;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  const { data: claim, error: claimError } = await supabase.rpc("claim_payment_webhook_event", {
    p_razorpay_event_id: eventId,
    p_event_type: eventType,
    p_payload: event,
  });
  if (claimError) {
    console.error("Webhook claim failed:", claimError.message);
    return new Response("Webhook claim failed", { status: 500 });
  }
  const claimed = claim as { id?: string; duplicate?: boolean; processed?: boolean } | null;
  if (claimed?.processed === true) {
    return new Response("OK — duplicate", { status: 200 });
  }

  const payment = event.payload?.["payment"]?.entity ?? {};
  const subscription = event.payload?.["subscription"]?.entity ?? {};
  const order = event.payload?.["order"]?.entity ?? {};
  const notes = { ...notesOf(order), ...notesOf(payment), ...notesOf(subscription) };
  const isMembership =
    notes["checkout"] === "membership" || notes["checkout"] === "membership_upgrade";
  const isMembershipUpgrade = notes["checkout"] === "membership_upgrade";
  const membershipOrderId = isMembership
    ? (typeof payment["order_id"] === "string" && payment["order_id"]) ||
      (typeof order["id"] === "string" && order["id"]) ||
      ""
    : "";

  try {
    if ((eventType === "payment.captured" || eventType === "order.paid") && !isMembership) {
      await supabase.rpc("fulfill_gstore_order_from_webhook", {
        p_provider_order_id: (payment["order_id"] as string) ?? "",
        p_provider_payment_id: (payment["id"] as string) ?? "",
        p_gstore_order_id: notes["order_id"] || notes["gvrze_order_id"] || null,
        p_gstore_payment_id: notes["payment_id"] || null,
        p_payment_method: (payment["method"] as string) ?? null,
        p_outcome: "success",
      });
    }

    if (isMembershipUpgrade) {
      // Upgrade orders are confirmed by the signed checkout verify path so
      // Basic is not replaced until the prorated Razorpay payment is verified.
    } else if (eventType === "payment.captured" || eventType === "order.paid") {
      const rzpSub =
        (payment["subscription_id"] as string) ||
        (subscription["id"] as string) ||
        membershipOrderId;
      if (rzpSub) {
        await supabase.rpc("apply_razorpay_subscription_event", {
          p_event_type: "subscription.charged",
          p_provider_subscription_id: rzpSub,
          p_provider_payment_id: (payment["id"] as string) ?? null,
          p_internal_subscription_id: notes["internal_subscription_id"] || null,
          p_period_key: null,
        });
      }
    } else if (eventType === "payment.failed" && !isMembership) {
      await supabase.rpc("fulfill_gstore_order_from_webhook", {
        p_provider_order_id: (payment["order_id"] as string) ?? "",
        p_provider_payment_id: (payment["id"] as string) ?? "",
        p_gstore_order_id: notes["order_id"] || notes["gvrze_order_id"] || null,
        p_gstore_payment_id: notes["payment_id"] || null,
        p_outcome: "failed",
      });
    } else if (eventType.startsWith("subscription.")) {
      await supabase.rpc("apply_razorpay_subscription_event", {
        p_event_type: eventType,
        p_provider_subscription_id: (subscription["id"] as string) ?? (payment["subscription_id"] as string) ?? "",
        p_provider_payment_id: (payment["id"] as string) ?? null,
        p_internal_subscription_id: notes["internal_subscription_id"] || notes["subscription_id"] || null,
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
    console.error("Webhook handler error:", err);
    if (claimed?.id) {
      await supabase.rpc("mark_payment_webhook_event", {
        p_id: claimed.id,
        p_processed: false,
        p_error: err instanceof Error ? err.message : "unknown",
      });
    }
    return new Response("Webhook processing failed", { status: 500 });
  }
});
