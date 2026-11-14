/**
 * Legacy Gstore webhook URL. Delegates to the same RPCs as razorpay-webhook
 * so existing Razorpay dashboard endpoints keep working.
 *
 * Prefer: /functions/v1/razorpay-webhook
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
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const webhookSecret = (Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "").trim();
  if (!webhookSecret || webhookSecret === "your_webhook_secret") {
    return new Response("Webhook not configured", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!signature) return new Response("Missing signature", { status: 400 });
  if ((await hmacHex(webhookSecret, rawBody)) !== signature) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: { event?: string; id?: string; payload?: Record<string, { entity?: Record<string, unknown> }> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = event.event ?? "unknown";
  const eventId = event.id ?? `${eventType}:${await hmacHex("id", rawBody)}`;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

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
  if (claimed?.processed === true) return new Response("OK — duplicate", { status: 200 });

  const payment = event.payload?.["payment"]?.entity ?? {};
  const notes = notesOf(payment);

  try {
    if (eventType === "payment.captured" || eventType === "order.paid") {
      await supabase.rpc("fulfill_gstore_order_from_webhook", {
        p_provider_order_id: (payment["order_id"] as string) ?? "",
        p_provider_payment_id: (payment["id"] as string) ?? "",
        p_gstore_order_id: notes["order_id"] || notes["gvrze_order_id"] || null,
        p_gstore_payment_id: notes["payment_id"] || null,
        p_payment_method: (payment["method"] as string) ?? null,
        p_outcome: "success",
      });
    } else if (eventType === "payment.failed") {
      await supabase.rpc("fulfill_gstore_order_from_webhook", {
        p_provider_order_id: (payment["order_id"] as string) ?? "",
        p_provider_payment_id: (payment["id"] as string) ?? "",
        p_gstore_order_id: notes["order_id"] || notes["gvrze_order_id"] || null,
        p_gstore_payment_id: notes["payment_id"] || null,
        p_outcome: "failed",
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
