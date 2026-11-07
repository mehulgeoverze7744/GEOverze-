import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";

import {
  libraryTierLabel,
  parseLibraryAccessTier,
  type LibraryAccessTier,
} from "@/features/library/lib/access-tier";
import { TIER_PRESENTATION } from "./plans";
import { formatMinorAmount, formatInrRupees } from "../lib/formatInr";

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
  /** True when the active subscription was created via mock payment (is_mock=true). */
  isMockSubscription: boolean;
  /** UUID of the active mock subscription, or null if not a mock subscription. */
  mockSubscriptionId: string | null;
  /** True when cancel_at_period_end is set — renewal cancelled but access still active. */
  cancelAtPeriodEnd: boolean;
  /**
   * Human-readable label for the period end / access expiry.
   * Same value as renewsLabel but kept separately for semantic clarity.
   */
  accessUntilLabel: string;
  /**
   * ISO-8601 string for the current billing period end date.
   * Used to display the exact expiry date in the cancellation confirmation modal.
   * Null when the subscription has no known period end.
   */
  periodEndIso: string | null;
  /**
   * True when the backend supports reversing a scheduled cancellation.
   * When false, the "Reactivate Subscription" button is hidden to avoid
   * showing a misleading option.
   *
   * Both mock subscriptions (via reactivate_mock_subscription RPC) and live
   * subscriptions (via request_reactivate_subscription RPC) support it, so
   * this is always true for active paid subscriptions.
   */
  reactivationSupported: boolean;
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

function membershipStatusLabel(
  subscription: SubscriptionRpc | null,
  isPaidTier: boolean,
): string {
  if (asBoolean(subscription?.cancel_at_period_end)) {
    const periodEnd = asString(subscription?.current_period_end);
    if (periodEnd) return `Cancels on ${formatDateLabel(periodEnd)}`;
    return "Cancels at period end";
  }
  return asString(subscription?.status) ?? (isPaidTier ? "inactive" : "active");
}

function formatCharge(amountMinor: number, currency: string): string {
  // charge_amount_minor is in paise (INR minor units); formatMinorAmount divides by 100
  return formatMinorAmount(amountMinor, currency);
}

function parsePlanTierRpc(data: Json): PlanTierRpc {
  return asRecord(data) ?? {};
}

function parseSubscription(value: unknown): SubscriptionRpc | null {
  return asRecord(value);
}

/** Authenticated membership, credits and payment history. RLS-scoped. */
export async function fetchMyBilling(): Promise<MyBillingSnapshot> {
  //
  // WHY getSession() instead of getUser():
  //
  // getUser() always fires a GET /auth/v1/user network request to validate the
  // JWT server-side.  On mobile this round-trip frequently fails when:
  //   • The JWT has just expired and the auto-refresh timer hasn't fired yet.
  //   • The browser backgrounded the app and the refresh was deferred.
  //   • The network is slow or briefly unavailable (common on Android).
  //
  // getSession() reads the stored session from localStorage.  If the token is
  // expired it automatically awaits the refresh before returning.  It is the
  // correct choice here because:
  //   1. useMyBilling already guards with enabled: authReady && signedIn, so
  //      this function only runs when the authStore confirms a signed-in user.
  //   2. The subsequent Supabase RPC and table queries enforce RLS with the JWT
  //      from the session header, so server-side validation happens implicitly.
  //   3. It is far more resilient on mobile and low-latency networks.
  //
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error("UNAUTHENTICATED:" + (sessionError.message ?? "Session error"));
  }
  const user = sessionData?.session?.user ?? null;
  if (!user) {
    throw new Error("UNAUTHENTICATED:No active session. Please sign in to view your billing details.");
  }

  const [planResult, paymentsResult, progressionResult, grantResult, activeSubResult] = await Promise.all([
    supabase.rpc("get_my_plan_tier"),
    supabase
      .from("billing_payments")
      .select(
        "id, provider_invoice_id, provider_payment_id, plan_tier, status, paid_at, attempted_at, charge_amount_minor, charge_currency",
      )
      .order("attempted_at", { ascending: false })
      .limit(50),
    supabase.from("user_progression").select("credits").maybeSingle(),
    // Most recent completed credit grant — used to show "This period granted: N credits".
    // Secondary sort by created_at ensures we get the latest grant when multiple exist
    // in the same period (e.g. user upgraded from Basic → Pro in the same month).
    // status = 'completed' (allowed: pending / completed / skipped / failed).
    supabase
      .from("membership_credit_grants")
      .select("credit_amount, status, grant_period_start, created_at")
      .eq("status", "completed")
      .order("grant_period_start", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Active subscription details (to detect mock subscriptions)
    supabase
      .from("user_subscriptions")
      .select("id, provider_name")
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (planResult.error) throw new Error(planResult.error.message);
  if (paymentsResult.error) throw new Error(paymentsResult.error.message);
  if (progressionResult.error) throw new Error(progressionResult.error.message);
  if (grantResult.error) throw new Error(grantResult.error.message);
  // activeSubResult errors are non-fatal (best-effort)
  const activeSub = activeSubResult.data ?? null;

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

  const cancelAtPeriodEnd = asBoolean(subscription?.cancel_at_period_end);
  const periodEndIso = asString(subscription?.current_period_end);

  return {
    userId: user.id,
    tier,
    planName: asString(rpc.display_name) ?? libraryTierLabel(tier),
    planSummary: presentation.summary,
    statusLabel: membershipStatusLabel(subscription, isPaidTier),
    billingInterval,
    memberSinceLabel: formatDateLabel(asString(subscription?.started_at) ?? user.created_at),
    renewsLabel: formatDateLabel(periodEndIso),
    accessUntilLabel: formatDateLabel(periodEndIso),
    periodEndIso,
    cancelAtPeriodEnd,
    // Both mock subscriptions and live subscriptions support reactivation via
    // our RPCs (reactivate_mock_subscription / request_reactivate_subscription).
    // Only hide the button if the sub is not in an active-ish state.
    reactivationSupported: isPaidTier,
    // monthly_price_cents / annual_price_cents store whole INR rupees (not paise)
    priceAmount: isPaidTier ? formatInrRupees(priceCents) : "Free",
    priceCadence: isPaidTier
      ? billingInterval === "annual"
        ? "/ year"
        : "/ month"
      : "forever",
    monthlyCreditGrant,
    availableCredits: progressionResult.data?.credits ?? 0,
    periodGrantAmount: grantResult.data?.credit_amount ?? null,
    canSwitchToAnnual: isPaidTier && billingInterval === "monthly" && annualPrice != null,
    isPaidMembership: isPaidTier,
    isMockSubscription: activeSub?.provider_name === "mock",
    mockSubscriptionId: activeSub?.provider_name === "mock" ? (activeSub.id as string) : null,
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
