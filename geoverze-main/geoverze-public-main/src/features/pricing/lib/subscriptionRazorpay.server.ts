/**
 * Server-only membership Razorpay helpers. Imported from createServerFn
 * handlers so node:crypto never lands in the browser bundle.
 */

import "@tanstack/react-start/server-only";
import { createClient } from "@supabase/supabase-js";

import {
  cancelRazorpaySubscription,
  createRazorpayPlan,
  createRazorpaySubscription,
  envPlanId,
  getRazorpayDiagnostics,
  getRazorpayKeyId,
  getRazorpayMode,
  isRazorpayServerConfigured,
  verifyCapturedSubscriptionPayment,
} from "@/lib/payments/razorpayServer";

export {
  cancelRazorpaySubscription,
  createRazorpaySubscription,
  getRazorpayDiagnostics,
  getRazorpayKeyId,
  getRazorpayMode,
  isRazorpayServerConfigured,
  verifyCapturedSubscriptionPayment,
};

function makeServiceClient() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
  const serviceRole = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  if (!url || !serviceRole) {
    throw new Error("Supabase service role not configured.");
  }
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

export async function resolveRazorpayPlanId(
  tier: string,
  interval: string,
  chargeMinor: number,
): Promise<string> {
  const fromEnv = envPlanId(tier, interval);
  if (fromEnv.startsWith("plan_")) return fromEnv;

  const svc = makeServiceClient();
  const { data: instances } = await svc
    .from("billing_provider_plan_instances")
    .select("provider_plan_id, billing_provider_prices(plan_tier, billing_interval, provider)")
    .eq("provider", "razorpay");

  const match = (instances ?? []).find((row) => {
    const price = row.billing_provider_prices as
      | { plan_tier?: string; billing_interval?: string; provider?: string }
      | { plan_tier?: string; billing_interval?: string; provider?: string }[]
      | null;
    const rec = Array.isArray(price) ? price[0] : price;
    return rec?.plan_tier === tier && rec?.billing_interval === interval;
  });
  const existingId = match?.provider_plan_id ?? "";
  if (existingId.startsWith("plan_")) return existingId;

  const plan = await createRazorpayPlan({
    period: interval === "annual" ? "yearly" : "monthly",
    interval: 1,
    name: `GVRZE ${tier} ${interval}`,
    amountMinor: chargeMinor,
  });

  await svc.rpc("upsert_razorpay_plan_id", {
    p_plan_tier: tier,
    p_billing_interval: interval,
    p_provider_plan_id: plan.id,
    p_charge_amount_minor: chargeMinor,
  });

  return plan.id;
}
