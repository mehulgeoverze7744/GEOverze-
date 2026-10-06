import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";

import {
  libraryTierLabel,
  parseLibraryAccessTier,
  type LibraryAccessTier,
} from "@/features/library/lib/access-tier";
import { TIER_PRESENTATION } from "./plans";
import { formatUsdCents } from "../lib/formatPrice";

export type BillingPaymentStatus = "paid" | "pending" | "refunded" | "failed" | "cancelled";

export type BillingHistoryRow = {
  id: string;
  date: string;
  description: string;
  amount: string;
  currency: string;
  status: BillingPaymentStatus;
};

export type MyBillingSnapshot = {
  userId: string;
  tier: LibraryAccessTier;
  planName: string;
  planSummary: string;
  statusLabel: string;
  billingInterval: "monthly" | "annual";
  memberSinceLabel: string;
  renewsLabel: string;
  priceAmount: string;
  priceCadence: string;
  monthlyCreditGrant: number;
  availableCredits: number;
  periodGrantAmount: number | null;
  canSwitchToAnnual: boolean;
  isPaidMembership: boolean;
  history: BillingHistoryRow[];
};

type PlanTierRpc = {
  tier?: unknown;
  display_name?: unknown;
  monthly_price_cents?: unknown;
  annual_price_cents?: unknown;
  monthly_credit_grant?: unknown;
  subscription?: unknown;
};

type SubscriptionRpc = {
  status?: unknown;
  billing_interval?: unknown;
  started_at?: unknown;
  current_period_end?: unknown;
  cancel_at_period_end?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function formatDateLabel(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mapPaymentStatus(status: string): BillingPaymentStatus {
  if (status === "succeeded") return "paid";
  if (status === "refunded" || status === "partially_refunded") return "refunded";
  if (status === "failed") return "failed";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

function membershipStatusLabel(subscription: SubscriptionRpc | null, isPaidTier: boolean): string {
  if (asBoolean(subscription?.cancel_at_period_end)) return "cancels at period end";
  return asString(subscription?.status) ?? (isPaidTier ? "inactive" : "active");
}

function formatCharge(amountMinor: number, currency: string): string {
  const code = currency.trim().toUpperCase();
  try {
    return (amountMinor / 100).toLocaleString("en-US", {
      style: "currency",
      currency: code.length === 3 ? code : "USD",
      minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return formatUsdCents(amountMinor);
  }
}

function parsePlanTierRpc(data: Json): PlanTierRpc {
  return asRecord(data) ?? {};
}

function parseSubscription(value: unknown): SubscriptionRpc | null {
  return asRecord(value);
}

/** Authenticated membership, credits and payment history. RLS-scoped. */
export async function fetchMyBilling(): Promise<MyBillingSnapshot> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  const user = userData.user;
  if (!user) throw new Error("Authentication required");

  const [planResult, paymentsResult, progressionResult, grantResult] = await Promise.all([
    supabase.rpc("get_my_plan_tier"),
    supabase
      .from("billing_payments")
      .select(
        "id, provider_invoice_id, provider_payment_id, plan_tier, status, paid_at, attempted_at, charge_amount_minor, charge_currency",
      )
      .order("attempted_at", { ascending: false })
      .limit(50),
    supabase.from("user_progression").select("credits").maybeSingle(),
    supabase
      .from("membership_credit_grants")
      .select("credit_amount, status, grant_period_start")
      .eq("status", "granted")
      .order("grant_period_start", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (planResult.error) throw new Error(planResult.error.message);
  if (paymentsResult.error) throw new Error(paymentsResult.error.message);
  if (progressionResult.error) throw new Error(progressionResult.error.message);
  if (grantResult.error) throw new Error(grantResult.error.message);

  const rpc = parsePlanTierRpc(planResult.data);
  const tier = parseLibraryAccessTier(asString(rpc.tier)) ?? "explorer";
  const presentation = TIER_PRESENTATION[tier];
  const subscription = parseSubscription(rpc.subscription);
  const intervalRaw = asString(subscription?.billing_interval);
  const billingInterval: "monthly" | "annual" = intervalRaw === "annual" ? "annual" : "monthly";
  const monthlyPrice = asNumber(rpc.monthly_price_cents) ?? 0;
  const annualPrice = asNumber(rpc.annual_price_cents);
  const monthlyCreditGrant = asNumber(rpc.monthly_credit_grant) ?? 0;
  const isPaidTier = tier !== "explorer";
  const priceCents =
    billingInterval === "annual" && annualPrice != null ? annualPrice : monthlyPrice;

  const payments = paymentsResult.data ?? [];

  return {
    userId: user.id,
    tier,
    planName: asString(rpc.display_name) ?? libraryTierLabel(tier),
    planSummary: presentation.summary,
    statusLabel: membershipStatusLabel(subscription, isPaidTier),
    billingInterval,
    memberSinceLabel: formatDateLabel(asString(subscription?.started_at) ?? user.created_at),
    renewsLabel: formatDateLabel(asString(subscription?.current_period_end)),
    priceAmount: isPaidTier ? formatUsdCents(priceCents) : "Free",
    priceCadence: isPaidTier
      ? billingInterval === "annual"
        ? "per year"
        : "per month"
      : "forever",
    monthlyCreditGrant,
    availableCredits: progressionResult.data?.credits ?? 0,
    periodGrantAmount: grantResult.data?.credit_amount ?? null,
    canSwitchToAnnual: isPaidTier && billingInterval === "monthly" && annualPrice != null,
    isPaidMembership: isPaidTier,
    history: payments.map((row) => {
      const historyTier = parseLibraryAccessTier(row.plan_tier);
      return {
        id: row.provider_invoice_id ?? row.provider_payment_id ?? row.id,
        date: formatDateLabel(row.paid_at ?? row.attempted_at),
        description: `${historyTier ? libraryTierLabel(historyTier) : row.plan_tier} membership`,
        amount: formatCharge(row.charge_amount_minor, row.charge_currency),
        currency: row.charge_currency.trim().toUpperCase(),
        status: mapPaymentStatus(row.status),
      };
    }),
  };
}
