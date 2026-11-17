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
import { evaluateMembershipCheckoutIntent } from "./membershipCheckoutGuard";
import { loadMembershipForCheckout } from "./loadMembershipForCheckout";

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

export type MembershipCheckoutBlockReason = "already_active" | "pending_authorization";

export type CreateRazorpaySubscriptionResult = {
  already_active: boolean;
  checkout_blocked: boolean;
  block_reason: MembershipCheckoutBlockReason | null;
  existing_plan_tier: string | null;
  is_upgrade: boolean;
  upgrade_payment_id: string | null;
  subscription_id: string;
  razorpay_subscription_id: string;
  razorpay_order_id: string;
  checkout_mode: "subscription" | "order";
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
  diagnostics: {
    keyIdPrefix: string;
    keyIdFingerprint: string;
    frontendKeyIdPrefix: string;
    frontendBackendKeyIdsMatch: boolean;
    envVarNames: { keyId: string[]; keySecret: string[]; frontendKeyId: string[] };
    checkoutMode: "subscription" | "order";
  };
};

function blockedCheckoutResult(
  rzp: Awaited<typeof import("./subscriptionRazorpay.server")>,
  input: {
    reason: MembershipCheckoutBlockReason;
    subscriptionId: string;
    existingPlanTier: string | null;
  },
): CreateRazorpaySubscriptionResult {
  const diag = rzp.getSubscriptionRazorpayDiagnostics();
  return {
    already_active: input.reason === "already_active",
    checkout_blocked: true,
    block_reason: input.reason,
    existing_plan_tier: input.existingPlanTier,
    is_upgrade: false,
    upgrade_payment_id: null,
    subscription_id: input.subscriptionId,
    razorpay_subscription_id: "",
    razorpay_order_id: "",
    checkout_mode: "order",
    razorpay_key_id: rzp.getRazorpayKeyId(),
    base_amount_minor: 0,
    gst_amount_minor: 0,
    charge_amount_minor: 0,
    charge_currency: "INR",
    gst_rate_percent: GST_CONFIG.ratePercent,
    gst_label: GST_CONFIG.taxLabel,
    price_label: "",
    promotion_applied: false,
    test_mode: rzp.getRazorpayMode() === "test",
    diagnostics: {
      keyIdPrefix: diag.keyIdPrefix,
      keyIdFingerprint: diag.keyIdFingerprint,
      frontendKeyIdPrefix: diag.frontendKeyIdPrefix,
      frontendBackendKeyIdsMatch: diag.frontendBackendKeyIdsMatch,
      envVarNames: diag.envVarNames,
      checkoutMode: "order",
    },
  };
}

export const createRazorpaySubscriptionFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => CreateSubSchema.parse(raw))
  .handler(async ({ data }): Promise<CreateRazorpaySubscriptionResult> => {
    assertRateLimit(`sub-create:${data.access_token.slice(-24)}`, 8, 60_000);
    if (data.plan_tier === "advance") {
      throw new Error("Advance membership is coming soon and cannot be purchased yet.");
    }
    const rzp = await import("./subscriptionRazorpay.server");
    if (!rzp.isRazorpayServerConfigured()) {
      const diag = rzp.getRazorpayDiagnostics();
      throw new Error(
        `Razorpay is not configured on the server. Key ID prefix: ${diag.keyIdPrefix}. Key Secret present: ${diag.keySecretPresent}. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET as a matching pair in Vercel Production, plus VITE_RAZORPAY_KEY_ID with the same Key ID.`,
      );
    }

    const sb = makeUserClient(data.access_token);
    const existingRow = await loadMembershipForCheckout(sb);
    const intent = evaluateMembershipCheckoutIntent({
      existing: existingRow,
      targetTier: data.plan_tier,
      targetInterval: data.billing_interval,
    });
    if (
      (intent.action === "already_active" || intent.action === "pending_authorization") &&
      existingRow
    ) {
      return blockedCheckoutResult(rzp, {
        reason: intent.action,
        subscriptionId: existingRow.id,
        existingPlanTier: existingRow.plan_tier,
      });
    }

    if (intent.action === "upgrade" && existingRow) {
      const { data: upgradeRpc, error: upgradeError } = await sb.rpc("begin_razorpay_upgrade", {
        p_target_plan_tier: data.plan_tier,
        p_billing_interval: data.billing_interval,
        p_idempotency_key: data.idempotency_key,
      });
      if (upgradeError || !upgradeRpc) {
        throw new Error(upgradeError?.message ?? "Failed to start membership upgrade.");
      }
      const upgrade = upgradeRpc as {
        subscription_id: string;
        upgrade_payment_id: string;
        charge_amount_minor: number;
        base_amount_minor: number;
        gst_amount_minor: number;
        provider_order_id?: string;
      };
      let rzpOrderId = typeof upgrade.provider_order_id === "string" ? upgrade.provider_order_id : "";
      if (!rzpOrderId.startsWith("order_")) {
        const order = await rzp.createRazorpayOrder({
          amountMinor: Number(upgrade.charge_amount_minor),
          receipt: `upg_${data.plan_tier}_${Date.now()}`.slice(0, 40),
          notes: {
            checkout: "membership_upgrade",
            plan_tier: data.plan_tier,
            billing_interval: data.billing_interval,
            internal_subscription_id: upgrade.subscription_id,
            upgrade_payment_id: upgrade.upgrade_payment_id,
            idempotency_key: data.idempotency_key,
          },
        });
        rzpOrderId = order.id;
        const { error: attachError } = await sb.rpc("attach_razorpay_upgrade_order", {
          p_upgrade_payment_id: upgrade.upgrade_payment_id,
          p_provider_order_id: rzpOrderId,
        });
        if (attachError) throw new Error(attachError.message);
      }
      const diag = rzp.getSubscriptionRazorpayDiagnostics();
      const rupees = Number(upgrade.charge_amount_minor) / 100;
      return {
        already_active: false,
        checkout_blocked: false,
        block_reason: null,
        existing_plan_tier: existingRow.plan_tier,
        is_upgrade: true,
        upgrade_payment_id: upgrade.upgrade_payment_id,
        subscription_id: upgrade.subscription_id,
        razorpay_subscription_id: "",
        razorpay_order_id: rzpOrderId,
        checkout_mode: "order",
        razorpay_key_id: rzp.getRazorpayKeyId(),
        base_amount_minor: Number(upgrade.base_amount_minor),
        gst_amount_minor: Number(upgrade.gst_amount_minor),
        charge_amount_minor: Number(upgrade.charge_amount_minor),
        charge_currency: "INR",
        gst_rate_percent: GST_CONFIG.ratePercent,
        gst_label: GST_CONFIG.taxLabel,
        price_label: `₹${rupees.toLocaleString("en-IN")} upgrade`,
        promotion_applied: false,
        test_mode: rzp.getRazorpayMode() === "test",
        diagnostics: {
          keyIdPrefix: diag.keyIdPrefix,
          keyIdFingerprint: diag.keyIdFingerprint,
          frontendKeyIdPrefix: diag.frontendKeyIdPrefix,
          frontendBackendKeyIdsMatch: diag.frontendBackendKeyIdsMatch,
          envVarNames: diag.envVarNames,
          checkoutMode: "order",
        },
      };
    }

    const amounts = await catalogChargePaise(data.plan_tier, data.billing_interval);
    const planId = await rzp.resolveRazorpayPlanId(data.plan_tier, data.billing_interval, amounts.chargeMinor);
    const totalCount = data.billing_interval === "annual" ? 10 : 120;
    const diag = rzp.getSubscriptionRazorpayDiagnostics();

    let checkoutMode: "subscription" | "order" = "order";
    let rzpSubId = "";
    let rzpOrderId = "";

    if (planId.startsWith("plan_")) {
      try {
        const rzpSub = await rzp.createRazorpaySubscription({
          planId,
          totalCount,
          notes: {
            plan_tier: data.plan_tier,
            billing_interval: data.billing_interval,
            idempotency_key: data.idempotency_key,
          },
        });
        rzpSubId = rzpSub.id;
        checkoutMode = "subscription";
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (!/401|Unauthorized/i.test(message)) throw err;
      }
    }

    if (!rzpSubId) {
      const order = await rzp.createRazorpayOrder({
        amountMinor: amounts.chargeMinor,
        receipt: `mem_${data.plan_tier}_${Date.now()}`.slice(0, 40),
        notes: {
          checkout: "membership",
          plan_tier: data.plan_tier,
          billing_interval: data.billing_interval,
          idempotency_key: data.idempotency_key,
        },
      });
      rzpOrderId = order.id;
      checkoutMode = "order";
    }

    const { data: rpcResult, error } = await sb.rpc("begin_razorpay_subscription", {
      p_plan_tier: data.plan_tier,
      p_billing_interval: data.billing_interval,
      p_base_amount_minor: amounts.baseMinor,
      p_gst_amount_minor: amounts.gstMinor,
      p_charge_amount_minor: amounts.chargeMinor,
      p_provider_subscription_id: rzpSubId || rzpOrderId,
      p_provider_plan_id: planId,
      p_idempotency_key: data.idempotency_key,
    });
    if (error || !rpcResult) {
      throw new Error(error?.message ?? "Failed to start subscription.");
    }
    const result = rpcResult as { subscription_id: string };

    if (rzpOrderId && result.subscription_id) {
      try {
        await rzp.updateRazorpayOrderNotes(rzpOrderId, {
          checkout: "membership",
          plan_tier: data.plan_tier,
          billing_interval: data.billing_interval,
          internal_subscription_id: result.subscription_id,
          idempotency_key: data.idempotency_key,
        });
      } catch {
        // Checkout still verifies against the order id stored on the subscription row.
      }
    }

    const rupees = amounts.chargeMinor / 100;
    const cadence = data.billing_interval === "annual" ? "year" : "month";

    return {
      already_active: false,
      checkout_blocked: false,
      block_reason: null,
      existing_plan_tier: existingRow?.plan_tier ?? null,
      is_upgrade: false,
      upgrade_payment_id: null,
      subscription_id: result.subscription_id,
      razorpay_subscription_id: rzpSubId,
      razorpay_order_id: rzpOrderId,
      checkout_mode: checkoutMode,
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
      diagnostics: {
        keyIdPrefix: diag.keyIdPrefix,
        keyIdFingerprint: diag.keyIdFingerprint,
        frontendKeyIdPrefix: diag.frontendKeyIdPrefix,
        frontendBackendKeyIdsMatch: diag.frontendBackendKeyIdsMatch,
        envVarNames: diag.envVarNames,
        checkoutMode,
      },
    };
  });

const VerifySubSchema = z.object({
  access_token: z.string().min(10),
  subscription_id: z.string().uuid(),
  rzp_payment_id: z.string().min(1),
  rzp_signature: z.string().min(1),
  rzp_subscription_id: z.string().min(1).optional(),
  rzp_order_id: z.string().min(1).optional(),
  upgrade_payment_id: z.string().uuid().optional(),
});

function friendlyVerifyValidationError(error: z.ZodError): string {
  const paths = error.issues.map((issue) => issue.path.join("."));
  if (paths.includes("rzp_signature")) {
    return "Payment signature was missing. If you were charged, membership will activate shortly.";
  }
  if (paths.includes("rzp_payment_id")) {
    return "Payment ID was missing. Return to checkout and try again.";
  }
  if (paths.includes("subscription_id") || paths.includes("access_token")) {
    return "Sign in to confirm this membership payment.";
  }
  return "Payment confirmation is incomplete. Return to checkout and try again.";
}

export type VerifyRazorpaySubscriptionResult = {
  success: true;
  activated: boolean;
  idempotent: boolean;
  plan_tier: string;
  billing_interval: string;
  current_period_end: string | null;
  provider_payment_id: string;
};

export const verifyRazorpaySubscriptionFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => {
    const parsed = VerifySubSchema.safeParse(raw);
    if (!parsed.success) throw new Error(friendlyVerifyValidationError(parsed.error));
    return parsed.data;
  })
  .handler(async ({ data }): Promise<VerifyRazorpaySubscriptionResult> => {
    assertRateLimit(`sub-verify:${data.access_token.slice(-24)}`, 20, 60_000);
    const rzp = await import("./subscriptionRazorpay.server");
    const sb = makeUserClient(data.access_token);

    if (data.upgrade_payment_id) {
      const { data: upgradePay, error: upgradePayError } = await sb
        .from("billing_payments")
        .select("id, subscription_id, charge_amount_minor, provider_subscription_id, metadata, status")
        .eq("id", data.upgrade_payment_id)
        .single();
      if (upgradePayError || !upgradePay) throw new Error("Upgrade payment not found.");
      const orderId =
        data.rzp_order_id ||
        (typeof upgradePay.provider_subscription_id === "string" &&
        upgradePay.provider_subscription_id.startsWith("order_")
          ? upgradePay.provider_subscription_id
          : "");
      if (!orderId.startsWith("order_")) {
        throw new Error("Upgrade checkout is missing a Razorpay order id.");
      }
      await rzp.verifyCapturedOrderPayment({
        rzpOrderId: orderId,
        rzpPaymentId: data.rzp_payment_id,
        rzpSignature: data.rzp_signature,
        expectedAmountMinor: Number(upgradePay.charge_amount_minor),
      });
      const { data: upgradeResult, error: upgradeConfirmError } = await sb.rpc(
        "confirm_razorpay_upgrade",
        {
          p_upgrade_payment_id: data.upgrade_payment_id,
          p_provider_payment_id: data.rzp_payment_id,
        },
      );
      if (upgradeConfirmError) throw new Error(upgradeConfirmError.message);
      const confirmed = (upgradeResult ?? {}) as { success?: boolean; idempotent?: boolean };

      const { data: refreshed } = await sb
        .from("user_subscriptions")
        .select("id, status, plan_tier, billing_interval, current_period_end, provider_subscription_id")
        .eq("id", upgradePay.subscription_id)
        .single();

      const oldProviderId = refreshed?.provider_subscription_id ?? "";
      if (oldProviderId.startsWith("sub_")) {
        try {
          const meta =
            upgradePay.metadata && typeof upgradePay.metadata === "object" && !Array.isArray(upgradePay.metadata)
              ? (upgradePay.metadata as Record<string, unknown>)
              : {};
          const targetTier =
            (typeof meta["to_plan_tier"] === "string" ? meta["to_plan_tier"] : null) ??
            refreshed?.plan_tier ??
            "pro";
          const interval = refreshed?.billing_interval ?? "monthly";
          const amounts = await catalogChargePaise(String(targetTier), String(interval));
          const planId = await rzp.resolveRazorpayPlanId(String(targetTier), String(interval), amounts.chargeMinor);
          if (planId.startsWith("plan_")) {
            await rzp.updateRazorpaySubscriptionPlan({
              subscriptionId: oldProviderId,
              planId,
              scheduleChangeAt: "cycle_end",
            });
          }
        } catch {
          // Entitlements already upgraded in-place. Recurring plan change is best-effort.
        }
      }

      if ((refreshed?.status ?? "") === "active" || (refreshed?.status ?? "") === "trialing") {
        const { schedulePaidSubscriptionNotifications } = await import(
          "@/lib/notifications/commerceNotifications.server"
        );
        schedulePaidSubscriptionNotifications(upgradePay.subscription_id);
      }

      return {
        success: true,
        activated: (refreshed?.status ?? "") === "active" || (refreshed?.status ?? "") === "trialing",
        idempotent: confirmed.idempotent === true,
        plan_tier: refreshed?.plan_tier ?? "",
        billing_interval: refreshed?.billing_interval ?? "",
        current_period_end: refreshed?.current_period_end ?? null,
        provider_payment_id: data.rzp_payment_id,
      };
    }

    const { data: subRow, error: subError } = await sb
      .from("user_subscriptions")
      .select(
        "id, plan_tier, billing_interval, status, provider_subscription_id, current_period_end",
      )
      .eq("id", data.subscription_id)
      .single();
    if (subError || !subRow) throw new Error("Subscription not found.");

    const storedProviderId = subRow.provider_subscription_id ?? "";
    if (data.rzp_order_id && storedProviderId.startsWith("order_") && data.rzp_order_id !== storedProviderId) {
      throw new Error("Payment does not match this membership checkout.");
    }
    if (
      data.rzp_subscription_id &&
      storedProviderId.startsWith("sub_") &&
      data.rzp_subscription_id !== storedProviderId
    ) {
      throw new Error("Payment does not match this membership checkout.");
    }

    const amounts = await catalogChargePaise(subRow.plan_tier, subRow.billing_interval);
    if (storedProviderId.startsWith("order_")) {
      await rzp.verifyCapturedOrderPayment({
        rzpOrderId: storedProviderId,
        rzpPaymentId: data.rzp_payment_id,
        rzpSignature: data.rzp_signature,
        expectedAmountMinor: amounts.chargeMinor,
      });
    } else if (storedProviderId.startsWith("sub_")) {
      await rzp.verifyCapturedSubscriptionPayment({
        rzpSubscriptionId: storedProviderId,
        rzpPaymentId: data.rzp_payment_id,
        rzpSignature: data.rzp_signature,
      });
    } else {
      throw new Error("Membership checkout is missing a Razorpay reference. Return to checkout and try again.");
    }

    const { data: result, error } = await sb.rpc("confirm_razorpay_subscription", {
      p_subscription_id: data.subscription_id,
      p_provider_payment_id: data.rzp_payment_id,
      p_provider_subscription_id: storedProviderId,
    });
    if (error) throw new Error(error.message);
    const confirmed = (result ?? {}) as { success?: boolean; idempotent?: boolean };

    const { data: refreshed } = await sb
      .from("user_subscriptions")
      .select("status, plan_tier, billing_interval, current_period_end")
      .eq("id", data.subscription_id)
      .single();

    const activated = (refreshed?.status ?? subRow.status) === "active";
    if (activated) {
      const { schedulePaidSubscriptionNotifications } = await import(
        "@/lib/notifications/commerceNotifications.server"
      );
      schedulePaidSubscriptionNotifications(data.subscription_id);
    }

    return {
      success: true,
      activated,
      idempotent: confirmed.idempotent === true,
      plan_tier: refreshed?.plan_tier ?? subRow.plan_tier,
      billing_interval: refreshed?.billing_interval ?? subRow.billing_interval,
      current_period_end: refreshed?.current_period_end ?? subRow.current_period_end,
      provider_payment_id: data.rzp_payment_id,
    };
  });

const StatusSubSchema = z.object({
  access_token: z.string().min(10),
  subscription_id: z.string().uuid().optional(),
  payment_id: z.string().min(1).optional(),
});

export type SubscriptionPaymentStatusResult = {
  found: boolean;
  activated: boolean;
  checkout_pending: boolean;
  existing_active: boolean;
  status: string | null;
  plan_tier: string | null;
  billing_interval: string | null;
  current_period_end: string | null;
  payment_id: string | null;
  payment_status: string | null;
  checkout_subscription_id: string | null;
  continuing_subscription_id: string | null;
};

export const getSubscriptionPaymentStatusFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => {
    const parsed = StatusSubSchema.safeParse(raw);
    if (!parsed.success) throw new Error("Sign in to check this membership payment.");
    return parsed.data;
  })
  .handler(async ({ data }): Promise<SubscriptionPaymentStatusResult> => {
    const sb = makeUserClient(data.access_token);
    let subscriptionId = data.subscription_id ?? "";

    if (!subscriptionId && data.payment_id) {
      const { data: payment } = await sb
        .from("billing_payments")
        .select("subscription_id")
        .eq("provider_payment_id", data.payment_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      subscriptionId = payment?.subscription_id ?? "";
    }

    const { data: continuing } = await sb
      .from("user_subscriptions")
      .select("id, status, plan_tier, billing_interval, current_period_end")
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let checkout: {
      id: string;
      status: string;
      plan_tier: string;
      billing_interval: string;
      current_period_end: string | null;
    } | null = null;
    if (subscriptionId) {
      const { data: target } = await sb
        .from("user_subscriptions")
        .select("id, status, plan_tier, billing_interval, current_period_end")
        .eq("id", subscriptionId)
        .maybeSingle();
      if (target) checkout = target;
    }

    const display = checkout ?? continuing ?? null;
    if (!display) {
      return {
        found: false,
        activated: false,
        checkout_pending: false,
        existing_active: false,
        status: null,
        plan_tier: null,
        billing_interval: null,
        current_period_end: null,
        payment_id: data.payment_id ?? null,
        payment_status: null,
        checkout_subscription_id: null,
        continuing_subscription_id: null,
      };
    }

    const { data: payment } = await sb
      .from("billing_payments")
      .select("provider_payment_id, status")
      .eq("subscription_id", display.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const checkoutActivated =
      checkout != null && (checkout.status === "active" || checkout.status === "trialing");
    const checkoutPending =
      checkout != null &&
      (checkout.status === "pending" ||
        checkout.status === "incomplete" ||
        checkout.status === "past_due");

    return {
      found: true,
      activated: checkoutActivated,
      checkout_pending: checkoutPending,
      existing_active: Boolean(continuing),
      status: display.status,
      plan_tier: display.plan_tier,
      billing_interval: display.billing_interval,
      current_period_end: display.current_period_end,
      payment_id: payment?.provider_payment_id ?? data.payment_id ?? null,
      payment_status: payment?.status ?? null,
      checkout_subscription_id: checkout?.id ?? null,
      continuing_subscription_id: continuing?.id ?? null,
    };
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
    if (sub.provider_subscription_id?.startsWith("sub_")) {
      const rzp = await import("./subscriptionRazorpay.server");
      try {
        await rzp.cancelRazorpaySubscription(sub.provider_subscription_id, true);
      } catch (cancelErr) {
        const message = cancelErr instanceof Error ? cancelErr.message : "";
        if (!/401|Unauthorized/i.test(message)) throw cancelErr;
      }
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
