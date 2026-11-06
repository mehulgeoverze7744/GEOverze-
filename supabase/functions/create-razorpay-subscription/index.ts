/**
 * Edge Function: create-razorpay-subscription
 *
 * Called by CheckoutScreen after the user clicks "Pay".
 * This function:
 *   1. Authenticates the user (JWT from Authorization header).
 *   2. Validates the requested plan tier and billing interval.
 *   3. Looks up the billing_provider_plan_instance (Razorpay Plan ID).
 *   4. Creates or retrieves a Razorpay Customer for the user.
 *   5. Creates a Razorpay Subscription via the Razorpay REST API.
 *   6. Calls begin_razorpay_subscription() to persist a pending user_subscriptions row.
 *   7. Returns the Razorpay subscription_id and pricing details to the client.
 *
 * Required secrets (set via Supabase Dashboard → Edge Functions → Manage secrets):
 *   RAZORPAY_KEY_ID         — Razorpay API key ID (publishable)
 *   RAZORPAY_KEY_SECRET     — Razorpay API key secret (server-only)
 *
 * Optional secrets:
 *   SITE_URL                — Frontend origin for CORS (defaults to https://geoverze.com)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS_HEADERS, handleOptions } from "../_shared/cors.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

type RequestBody = {
  plan_tier: string;
  billing_interval: string;
  coupon_code?: string;
};

type RazorpayCustomerCreateReq = {
  name?: string;
  email?: string;
  contact?: string;
  notes?: Record<string, string>;
};

type RazorpayCustomer = {
  id: string;
  name: string;
  email: string;
};

type RazorpaySubscriptionCreateReq = {
  plan_id: string;
  customer_notify: 1 | 0;
  total_count: number;
  quantity: number;
  notes?: Record<string, string>;
};

type RazorpaySubscription = {
  id: string;
  status: string;
  plan_id: string;
  customer_id?: string;
};

type RazorpayError = {
  error: {
    code: string;
    description: string;
  };
};

// ─── Razorpay REST helpers ─────────────────────────────────────────────────────

function razorpayAuth(keyId: string, keySecret: string): string {
  return "Basic " + btoa(`${keyId}:${keySecret}`);
}

async function razorpayPost<T>(
  path: string,
  body: unknown,
  keyId: string,
  keySecret: string,
): Promise<T> {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: razorpayAuth(keyId, keySecret),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json() as T | RazorpayError;

  if (!response.ok) {
    const err = data as RazorpayError;
    throw new Error(
      err.error?.description ??
        `Razorpay API error ${response.status}`,
    );
  }

  return data as T;
}

async function razorpayGet<T>(
  path: string,
  keyId: string,
  keySecret: string,
): Promise<T | null> {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: "GET",
    headers: {
      Authorization: razorpayAuth(keyId, keySecret),
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) return null;
  return response.json() as Promise<T>;
}

// ─── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return handleOptions();

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // ── 1. Environment ─────────────────────────────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
  const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!supabaseUrl || !supabaseServiceKey || !razorpayKeyId || !razorpayKeySecret) {
    console.error("create-razorpay-subscription: missing required environment variables");
    return new Response(
      JSON.stringify({ error: "Payment service not configured.", code: "NOT_CONFIGURED" }),
      { status: 503, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // ── 2. Authenticate ────────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Authentication required.", code: "AUTH_REQUIRED" }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const userJwt = authHeader.slice(7);
  const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: { user }, error: userError } = await anonClient.auth.getUser(userJwt);
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Invalid session. Sign in and try again.", code: "AUTH_INVALID" }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // ── 3. Parse + validate request body ──────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body.", code: "BAD_REQUEST" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const VALID_TIERS = ["basic", "pro", "advance"];
  const VALID_INTERVALS = ["monthly", "annual"];

  if (!VALID_TIERS.includes(body.plan_tier)) {
    return new Response(
      JSON.stringify({ error: "Invalid plan tier.", code: "INVALID_TIER" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }
  if (!VALID_INTERVALS.includes(body.billing_interval)) {
    return new Response(
      JSON.stringify({ error: "Invalid billing interval.", code: "INVALID_INTERVAL" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // ── 4. Service-role Supabase client ────────────────────────────────────────
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // ── 5. Look up billing_provider_plan_instance (Razorpay Plan ID) ───────────
  const { data: planInstance, error: planInstanceError } = await admin
    .from("billing_provider_plan_instances")
    .select("id, provider_plan_id, billing_provider_price_id")
    .eq("provider", "razorpay")
    .eq("plan_tier", body.plan_tier)
    .eq("billing_interval", body.billing_interval)
    .eq("active", true)
    .is("plan_promotion_id", null) // standard (non-promo) price
    .maybeSingle();

  if (planInstanceError) {
    console.error("create-razorpay-subscription: plan instance lookup error", planInstanceError);
    return new Response(
      JSON.stringify({ error: "Failed to look up plan. Please try again.", code: "PLAN_LOOKUP_ERROR" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  if (!planInstance?.provider_plan_id) {
    return new Response(
      JSON.stringify({
        error: "This plan is not yet activated for Razorpay payments. Please contact support.",
        code: "PLAN_NOT_ACTIVATED",
      }),
      { status: 422, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // ── 6. Look up price snapshot ───────────────────────────────────────────────
  const { data: priceSnapshot, error: snapshotError } = await admin
    .from("billing_price_snapshots")
    .select("id, charge_amount_minor, charge_currency, catalog_usd_amount_cents")
    .eq("billing_provider_price_id", planInstance.billing_provider_price_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (snapshotError || !priceSnapshot) {
    console.error("create-razorpay-subscription: price snapshot lookup error", snapshotError);
    return new Response(
      JSON.stringify({ error: "Failed to look up pricing. Please try again.", code: "SNAPSHOT_ERROR" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // ── 7. Get user profile for Razorpay customer ──────────────────────────────
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, country")
    .eq("id", user.id)
    .maybeSingle();

  // ── 8. Create or retrieve Razorpay Customer ────────────────────────────────
  let razorpayCustomerId: string;

  const { data: existingCustomer } = await admin
    .from("billing_customers")
    .select("provider_customer_id")
    .eq("user_id", user.id)
    .eq("provider", "razorpay")
    .maybeSingle();

  if (existingCustomer?.provider_customer_id) {
    razorpayCustomerId = existingCustomer.provider_customer_id;
  } else {
    const customerReq: RazorpayCustomerCreateReq = {
      email: user.email ?? undefined,
      name: profile?.display_name ?? user.email ?? undefined,
      notes: { gvrze_user_id: user.id },
    };

    try {
      const rzpCustomer = await razorpayPost<RazorpayCustomer>(
        "/customers",
        customerReq,
        razorpayKeyId,
        razorpayKeySecret,
      );
      razorpayCustomerId = rzpCustomer.id;
    } catch (err) {
      console.error("create-razorpay-subscription: customer creation failed", err);
      return new Response(
        JSON.stringify({
          error: "Failed to create payment profile. Please try again.",
          code: "CUSTOMER_CREATE_ERROR",
        }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
      );
    }
  }

  // ── 9. Create Razorpay Subscription ────────────────────────────────────────
  const subscriptionReq: RazorpaySubscriptionCreateReq = {
    plan_id: planInstance.provider_plan_id,
    customer_notify: 1,
    // total_count: 0 means indefinite recurring (until cancelled)
    total_count: 120, // 10 years max; Razorpay requires a finite number
    quantity: 1,
    notes: {
      gvrze_user_id: user.id,
      plan_tier: body.plan_tier,
      billing_interval: body.billing_interval,
    },
  };

  let rzpSubscription: RazorpaySubscription;
  try {
    rzpSubscription = await razorpayPost<RazorpaySubscription>(
      "/subscriptions",
      subscriptionReq,
      razorpayKeyId,
      razorpayKeySecret,
    );
  } catch (err) {
    console.error("create-razorpay-subscription: subscription creation failed", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error
          ? err.message
          : "Failed to create subscription. Please try again.",
        code: "SUBSCRIPTION_CREATE_ERROR",
      }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // ── 10. Persist pending subscription in Supabase ───────────────────────────
  const { data: internalSubId, error: rpcError } = await admin.rpc(
    "begin_razorpay_subscription",
    {
      p_user_id: user.id,
      p_plan_tier: body.plan_tier,
      p_billing_interval: body.billing_interval,
      p_provider_customer_id: razorpayCustomerId,
      p_provider_subscription_id: rzpSubscription.id,
      p_charge_currency: priceSnapshot.charge_currency,
      p_price_snapshot_id: priceSnapshot.id,
    },
  );

  if (rpcError || !internalSubId) {
    console.error("create-razorpay-subscription: begin_razorpay_subscription failed", rpcError);
    // Don't surface internal DB errors to client
    return new Response(
      JSON.stringify({
        error: "Failed to initialise subscription record. Please contact support.",
        code: "DB_ERROR",
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // ── 11. Build human-readable price label ──────────────────────────────────
  const currency = priceSnapshot.charge_currency.toUpperCase();
  const amount = priceSnapshot.charge_amount_minor / 100;
  const priceLabel = amount.toLocaleString("en-IN", {
    style: "currency",
    currency: currency === "INR" ? "INR" : "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }) + (body.billing_interval === "monthly" ? " / month" : " / year");

  return new Response(
    JSON.stringify({
      subscription_id: internalSubId,
      razorpay_subscription_id: rzpSubscription.id,
      charge_amount_minor: priceSnapshot.charge_amount_minor,
      charge_currency: priceSnapshot.charge_currency,
      price_label: priceLabel,
      promotion_applied: false,
    }),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
  );
});
