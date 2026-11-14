/**
 * Razorpay membership checkout — TanStack server functions.
 *
 * Prices come from subscription_plans (whole INR rupees). GST is extracted
 * because catalog prices are inclusive. Razorpay Plan IDs are reused when
 * present in env or billing_provider_plan_instances.
 */

import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { GST_CONFIG, calcGst } from "./gstConfig";
import { assertRateLimit } from "@/lib/payments/paymentRateLimit";

function makeUserClient(accessToken: string): SupabaseClient {
  const url = process.env["VITE_SUPABASE_URL"];
  const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !anonKey) throw new Error("Supabase not configured.");
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

function makeServiceClient(): SupabaseClient {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
  const serviceRole = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  if (!url || !serviceRole) {
    throw new Error("Supabase service role not configured.");
  }
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

const PlanTier = z.enum(["basic", "pro", "advance"]);
const Interval = z.enum(["monthly", "annual"]);

async function catalogChargePaise(tier: string, interval: string): Promise<{
  catalogRupees: number;
  baseMinor: number;
  gstMinor: number;
  chargeMinor: number;
}> {
  const svc = makeServiceClient();
  const { data, error } = await svc
    .from("subscription_plans")
    .select("monthly_price_cents, annual_price_cents, active")
    .eq("tier", tier)
    .single();
  if (error || !data) throw new Error(`Unknown plan: ${tier}`);
  if (!data.active) throw new Error(`Plan ${tier} is not available.`);
  const catalogRupees =
    interval === "annual"
      ? Number(data.annual_price_cents ?? 0)
      : Number(data.monthly_price_cents ?? 0);
  if (catalogRupees <= 0) throw new Error("This plan cannot be billed.");
  const gst = calcGst(catalogRupees, GST_CONFIG);
  return {
    catalogRupees,
    baseMinor: Math.round(gst.baseRupees * 100),
    gstMinor: Math.round(gst.gstRupees * 100),
    chargeMinor: Math.round(gst.totalRupees * 100),
  };
}

const CreateSubSchema = z.object({
  access_token: z.string().min(10),
  plan_tier: PlanTier,
  billing_interval: Interval,
  idempotency_key: z.string().min(1).max(256),
  coupon_code: z.string().max(64).optional(),
  billing_details: z.object({
    display_name: z.string().min(1).max(200),
    line1: z.string().min(1).max(300),
    line2: z.string().max(300).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    pincode: z.string().min(4).max(10),
    country: z.string().max(100).optional(),
    gstin: z.string().max(20).optional(),
  }),
});

export type CreateRazorpaySubscriptionResult = {
  subscription_id: string;
  razorpay_subscription_id: string;
  razorpay_key_id: string;
  base_amount_minor: number;
  gst_amount_minor: number;
  charge_amount_minor: number;
  charge_currency: string;
  gst_rate_percent: number;
  gst_label: string;
  price_label: string;
  promotion_applied: boolean;
  test_mode: boolean;
};

export const createRazorpaySubscriptionFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => CreateSubSchema.parse(raw))
  .handler(async ({ data }): Promise<CreateRazorpaySubscriptionResult> => {
    assertRateLimit(`sub-create:${data.access_token.slice(-24)}`, 8, 60_000);
    const rzp = await import("./subscriptionRazorpay.server");
    if (!rzp.isRazorpayServerConfigured()) {
      const diag = rzp.getRazorpayDiagnostics();
      throw new Error(
        `Razorpay is not configured on the server. Key ID prefix: ${diag.keyIdPrefix}. Key Secret present: ${diag.keySecretPresent}. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET as a matching pair in Vercel Production, plus VITE_RAZORPAY_KEY_ID with the same Key ID.`,
      );
    }

    const amounts = await catalogChargePaise(data.plan_tier, data.billing_interval);
    const planId = await rzp.resolveRazorpayPlanId(data.plan_tier, data.billing_interval, amounts.chargeMinor);
    const totalCount = data.billing_interval === "annual" ? 10 : 120;

    const rzpSub = await rzp.createRazorpaySubscription({
      planId,
      totalCount,
      notes: {
        plan_tier: data.plan_tier,
        billing_interval: data.billing_interval,
        idempotency_key: data.idempotency_key,
      },
    });

    const sb = makeUserClient(data.access_token);
    const { data: rpcResult, error } = await sb.rpc("begin_razorpay_subscription", {
      p_plan_tier: data.plan_tier,
      p_billing_interval: data.billing_interval,
      p_base_amount_minor: amounts.baseMinor,
      p_gst_amount_minor: amounts.gstMinor,
      p_charge_amount_minor: amounts.chargeMinor,
      p_provider_subscription_id: rzpSub.id,
      p_provider_plan_id: planId,
      p_idempotency_key: data.idempotency_key,
    });
    if (error || !rpcResult) {
      throw new Error(error?.message ?? "Failed to start subscription.");
    }
    const result = rpcResult as { subscription_id: string };

    const rupees = amounts.chargeMinor / 100;
    const cadence = data.billing_interval === "annual" ? "year" : "month";

    return {
      subscription_id: result.subscription_id,
      razorpay_subscription_id: rzpSub.id,
      razorpay_key_id: rzp.getRazorpayKeyId(),
      base_amount_minor: amounts.baseMinor,
      gst_amount_minor: amounts.gstMinor,
      charge_amount_minor: amounts.chargeMinor,
      charge_currency: "INR",
      gst_rate_percent: GST_CONFIG.ratePercent,
      gst_label: GST_CONFIG.taxLabel,
      price_label: `₹${rupees.toLocaleString("en-IN")} / ${cadence}`,
      promotion_applied: false,
      test_mode: rzp.getRazorpayMode() === "test",
    };
  });

const VerifySubSchema = z.object({
  access_token: z.string().min(10),
  subscription_id: z.string().uuid(),
  rzp_payment_id: z.string().min(1),
  rzp_subscription_id: z.string().min(1),
  rzp_signature: z.string().min(1),
});

export const verifyRazorpaySubscriptionFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => VerifySubSchema.parse(raw))
  .handler(async ({ data }) => {
    assertRateLimit(`sub-verify:${data.access_token.slice(-24)}`, 20, 60_000);
    const rzp = await import("./subscriptionRazorpay.server");
    await rzp.verifyCapturedSubscriptionPayment({
      rzpSubscriptionId: data.rzp_subscription_id,
      rzpPaymentId: data.rzp_payment_id,
      rzpSignature: data.rzp_signature,
    });
    const sb = makeUserClient(data.access_token);
    const { data: result, error } = await sb.rpc("confirm_razorpay_subscription", {
      p_subscription_id: data.subscription_id,
      p_provider_payment_id: data.rzp_payment_id,
      p_provider_subscription_id: data.rzp_subscription_id,
    });
    if (error) throw new Error(error.message);
    return { success: true, result };
  });

const CancelSubSchema = z.object({
  access_token: z.string().min(10),
  subscription_id: z.string().uuid(),
});

export const cancelRazorpaySubscriptionFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => CancelSubSchema.parse(raw))
  .handler(async ({ data }) => {
    const sb = makeUserClient(data.access_token);
    const { data: sub, error } = await sb
      .from("user_subscriptions")
      .select("id, provider_subscription_id, provider_name, status")
      .eq("id", data.subscription_id)
      .single();
    if (error || !sub) throw new Error("Subscription not found.");
    if (sub.provider_name !== "razorpay") {
      throw new Error("This subscription is not billed through Razorpay.");
    }
    if (sub.provider_subscription_id) {
      const rzp = await import("./subscriptionRazorpay.server");
      await rzp.cancelRazorpaySubscription(sub.provider_subscription_id, true);
    }
    const { error: cancelError } = await sb.rpc("request_cancel_subscription");
    if (cancelError) {
      await sb
        .from("user_subscriptions")
        .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
        .eq("id", data.subscription_id);
    }
    return { success: true, cancel_at_period_end: true };
  });
