/**
 * Edge Function: create-razorpay-subscription
 *
 * Called by CheckoutScreen after the user clicks "Pay".
 * This function:
 *   1. Authenticates the user (JWT from Authorization header).
 *   2. Validates the requested plan tier and billing interval.
 *   3. Looks up the billing_provider_plan_instance (Razorpay Plan ID).
 *   4. Reads GST config from billing_gst_config (server-authoritative).
 *   5. Calculates GST breakdown: base, gst, total.
 *   6. Creates or retrieves a Razorpay Customer for the user.
 *   7. Creates a Razorpay Subscription via the Razorpay REST API.
 *   8. Saves billing address from request to billing_addresses.
 *   9. Calls begin_razorpay_subscription() to persist pending user_subscriptions.
 *   10. Returns GST breakdown + razorpay_subscription_id to the client.
 *
 * Required secrets (Supabase Dashboard → Edge Functions → Manage secrets):
 *   RAZORPAY_KEY_ID         — Razorpay API key ID
 *   RAZORPAY_KEY_SECRET     — Razorpay API key secret (server-only)
 *
 * Optional secrets:
 *   SITE_URL                — Frontend origin for CORS
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS_HEADERS, handleOptions } from "../_shared/cors.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

type BillingDetails = {
  display_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  gstin?: string;
};

type RequestBody = {
  plan_tier: string;
  billing_interval: string;
  coupon_code?: string;
  billing_details: BillingDetails;
};

type GstConfigRow = {
  rate_percent: number;
  tax_inclusive: boolean;
  gstin: string | null;
  sac_code: string;
  tax_label: string;
  currency: string;
};

type RazorpayCustomer = {
  id: string;
  name: string;
  email: string;
};

type RazorpaySubscription = {
  id: string;
  status: string;
  plan_id: string;
  customer_id?: string;
};

type RazorpayError = {
  error: { code: string; description: string };
};

// ─── GST calculation helpers ───────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calcGst(catalogRupees: number, cfg: GstConfigRow): {
  baseRupees: number;
  gstRupees: number;
  totalRupees: number;
} {
  const rate = Number(cfg.rate_percent) / 100;
  if (catalogRupees <= 0 || rate <= 0) {
    return { baseRupees: catalogRupees, gstRupees: 0, totalRupees: catalogRupees };
  }
  if (cfg.tax_inclusive) {
    const base = round2(catalogRupees / (1 + rate));
    const gst = round2(catalogRupees - base);
    return { baseRupees: base, gstRupees: gst, totalRupees: round2(catalogRupees) };
  } else {
    const gst = round2(catalogRupees * rate);
    const total = round2(catalogRupees + gst);
    return { baseRupees: round2(catalogRupees), gstRupees: gst, totalRupees: total };
  }
}

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
    throw new Error(err.error?.description ?? `Razorpay API error ${response.status}`);
  }
  return data as T;
}

function jsonErr(error: string, code: string, status: number): Response {
  return new Response(JSON.stringify({ error, code }), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// ─── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return jsonErr("Method not allowed", "METHOD_NOT_ALLOWED", 405);

  // ── 1. Environment ─────────────────────────────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
  const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!supabaseUrl || !supabaseServiceKey || !razorpayKeyId || !razorpayKeySecret) {
    console.error("create-razorpay-subscription: missing environment variables");
    return jsonErr("Payment service not configured.", "NOT_CONFIGURED", 503);
  }

  // ── 2. Authenticate ────────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonErr("Authentication required.", "AUTH_REQUIRED", 401);
  }
  const userJwt = authHeader.slice(7);
  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: userError } = await anonClient.auth.getUser(userJwt);
  if (userError || !user) {
    return jsonErr("Invalid session. Sign in and try again.", "AUTH_INVALID", 401);
  }

  // ── 3. Parse + validate body ───────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return jsonErr("Invalid request body.", "BAD_REQUEST", 400);
  }

  const VALID_TIERS = ["basic", "pro", "advance"];
  const VALID_INTERVALS = ["monthly", "annual"];
  if (!VALID_TIERS.includes(body.plan_tier))
    return jsonErr("Invalid plan tier.", "INVALID_TIER", 400);
  if (!VALID_INTERVALS.includes(body.billing_interval))
    return jsonErr("Invalid billing interval.", "INVALID_INTERVAL", 400);

  const bd = body.billing_details;
  if (!bd?.display_name?.trim() || !bd.line1?.trim() || !bd.city?.trim() ||
      !bd.state?.trim() || !bd.pincode?.trim()) {
    return jsonErr("Billing address is incomplete.", "BILLING_REQUIRED", 400);
  }
  if (bd.pincode && !/^\d{6}$/.test(bd.pincode.trim())) {
    return jsonErr("Invalid PIN code (must be 6 digits).", "INVALID_PINCODE", 400);
  }
  if (bd.gstin) {
    const gstinPattern = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
    if (!gstinPattern.test(bd.gstin.trim().toUpperCase())) {
      return jsonErr("Invalid GSTIN format.", "INVALID_GSTIN", 400);
    }
  }

  // ── 4. Admin client ────────────────────────────────────────────────────────
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // ── 5. Fetch GST config (server-authoritative) ─────────────────────────────
  const { data: gstRow, error: gstError } = await admin
    .from("billing_gst_config")
    .select("rate_percent, tax_inclusive, gstin, sac_code, tax_label, currency")
    .eq("id", 1)
    .single();

  if (gstError || !gstRow) {
    console.error("create-razorpay-subscription: GST config not found", gstError);
    return jsonErr("Tax configuration unavailable.", "GST_CONFIG_ERROR", 500);
  }
  const gstCfg = gstRow as GstConfigRow;

  // ── 6. Look up plan_instance (Razorpay Plan ID) ───────────────────────────
  const { data: planInstance, error: planInstanceError } = await admin
    .from("billing_provider_plan_instances")
    .select("id, provider_plan_id, billing_provider_price_id")
    .eq("provider", "razorpay")
    .eq("plan_tier", body.plan_tier)
    .eq("billing_interval", body.billing_interval)
    .eq("active", true)
    .is("plan_promotion_id", null)
    .maybeSingle();

  if (planInstanceError) {
    console.error("create-razorpay-subscription: plan instance lookup error", planInstanceError);
    return jsonErr("Failed to look up plan. Please try again.", "PLAN_LOOKUP_ERROR", 500);
  }
  if (!planInstance?.provider_plan_id) {
    return jsonErr(
      "This plan is not yet activated for Razorpay payments. Please contact support.",
      "PLAN_NOT_ACTIVATED",
      422,
    );
  }

  // ── 7. Look up price snapshot for charge amount ───────────────────────────
  const { data: priceSnapshot } = await admin
    .from("billing_price_snapshots")
    .select("id, charge_amount_minor, charge_currency, catalog_usd_amount_cents")
    .eq("billing_provider_price_id", planInstance.billing_provider_price_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Determine catalog rupee amount for GST calculation.
  // charge_amount_minor is in paise; divide by 100 for rupees.
  // catalog_usd_amount_cents stores the reference catalog price in rupees (despite name).
  const catalogRupees = priceSnapshot
    ? (priceSnapshot.charge_amount_minor / 100)
    : (() => {
        // Fall back to subscription_plans catalog price
        return 0;
      })();

  // ── 8. Look up subscription_plans catalog price as fallback ──────────────
  let catalogFallbackRupees = catalogRupees;
  if (catalogFallbackRupees === 0) {
    const { data: planRow } = await admin
      .from("subscription_plans")
      .select("monthly_price_cents, annual_price_cents")
      .eq("tier", body.plan_tier)
      .maybeSingle();
    if (planRow) {
      catalogFallbackRupees = body.billing_interval === "annual"
        ? (planRow.annual_price_cents ?? planRow.monthly_price_cents ?? 0)
        : (planRow.monthly_price_cents ?? 0);
    }
  }

  // ── 9. Calculate GST (server-side, from billing_gst_config) ───────────────
  const gstCalc = calcGst(catalogFallbackRupees, gstCfg);
  // Convert to paise for Razorpay and storage
  const baseAmountMinor = Math.round(gstCalc.baseRupees * 100);
  const gstAmountMinor = Math.round(gstCalc.gstRupees * 100);
  const totalAmountMinor = Math.round(gstCalc.totalRupees * 100);
  const currency = priceSnapshot?.charge_currency ?? gstCfg.currency;

  // ── 10. Get user profile ───────────────────────────────────────────────────
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, country")
    .eq("id", user.id)
    .maybeSingle();

  // ── 11. Save billing address ───────────────────────────────────────────────
  let billingAddressId: string | null = null;
  try {
    const { data: addrRow, error: addrError } = await admin
      .from("billing_addresses")
      .upsert(
        {
          user_id: user.id,
          display_name: bd.display_name.trim(),
          line1: bd.line1.trim(),
          line2: bd.line2?.trim() ?? null,
          city: bd.city.trim(),
          state: bd.state.trim(),
          pincode: bd.pincode.trim(),
          country: bd.country?.trim() ?? "IN",
          gstin: bd.gstin?.trim().toUpperCase() ?? null,
          is_default: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id", ignoreDuplicates: false },
      )
      .select("id")
      .maybeSingle();
    if (!addrError && addrRow) billingAddressId = addrRow.id as string;
  } catch (addrEx) {
    console.warn("create-razorpay-subscription: could not save billing address", addrEx);
    // Non-fatal — proceed without address FK
  }

  // ── 12. Create or retrieve Razorpay Customer ───────────────────────────────
  let razorpayCustomerId: string;
  const { data: existingCustomer } = await admin
    .from("billing_customers")
    .select("provider_customer_id")
    .eq("user_id", user.id)
    .eq("provider", "razorpay")
    .maybeSingle();

  if (existingCustomer?.provider_customer_id) {
    razorpayCustomerId = existingCustomer.provider_customer_id as string;
  } else {
    try {
      const rzpCustomer = await razorpayPost<RazorpayCustomer>(
        "/customers",
        {
          email: user.email ?? undefined,
          name: bd.display_name.trim() || profile?.display_name ?? user.email ?? undefined,
          notes: { gvrze_user_id: user.id },
        },
        razorpayKeyId,
        razorpayKeySecret,
      );
      razorpayCustomerId = rzpCustomer.id;
    } catch (err) {
      console.error("create-razorpay-subscription: customer creation failed", err);
      return jsonErr(
        "Failed to create payment profile. Please try again.",
        "CUSTOMER_CREATE_ERROR",
        502,
      );
    }
  }

  // ── 13. Create Razorpay Subscription ──────────────────────────────────────
  let rzpSubscription: RazorpaySubscription;
  try {
    rzpSubscription = await razorpayPost<RazorpaySubscription>(
      "/subscriptions",
      {
        plan_id: planInstance.provider_plan_id,
        customer_notify: 1,
        total_count: 120,
        quantity: 1,
        notes: {
          gvrze_user_id: user.id,
          plan_tier: body.plan_tier,
          billing_interval: body.billing_interval,
          gstin: bd.gstin?.trim() ?? "",
        },
      },
      razorpayKeyId,
      razorpayKeySecret,
    );
  } catch (err) {
    console.error("create-razorpay-subscription: subscription creation failed", err);
    return jsonErr(
      err instanceof Error ? err.message : "Failed to create subscription. Please try again.",
      "SUBSCRIPTION_CREATE_ERROR",
      502,
    );
  }

  // ── 14. Persist pending subscription in Supabase ──────────────────────────
  const { data: internalSubId, error: rpcError } = await admin.rpc(
    "begin_razorpay_subscription",
    {
      p_user_id: user.id,
      p_plan_tier: body.plan_tier,
      p_billing_interval: body.billing_interval,
      p_provider_customer_id: razorpayCustomerId,
      p_provider_subscription_id: rzpSubscription.id,
      p_charge_currency: currency,
      p_price_snapshot_id: priceSnapshot?.id ?? null,
    },
  );

  if (rpcError || !internalSubId) {
    console.error("create-razorpay-subscription: begin_razorpay_subscription failed", rpcError);
    return jsonErr(
      "Failed to initialise subscription record. Please contact support.",
      "DB_ERROR",
      500,
    );
  }

  // Link billing address to subscription
  if (billingAddressId) {
    await admin
      .from("user_subscriptions")
      .update({ billing_address_id: billingAddressId })
      .eq("id", internalSubId);
  }

  // ── 15. Build price label ──────────────────────────────────────────────────
  const priceLabel = `₹${gstCalc.totalRupees.toFixed(0)} ${body.billing_interval === "monthly" ? "/ month" : "/ year"}`;

  return new Response(
    JSON.stringify({
      subscription_id: internalSubId,
      razorpay_subscription_id: rzpSubscription.id,
      base_amount_minor: baseAmountMinor,
      gst_amount_minor: gstAmountMinor,
      charge_amount_minor: totalAmountMinor,
      charge_currency: currency,
      gst_rate_percent: Number(gstCfg.rate_percent),
      gst_label: gstCfg.tax_label,
      price_label: priceLabel,
      promotion_applied: false,
    }),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
  );
});
