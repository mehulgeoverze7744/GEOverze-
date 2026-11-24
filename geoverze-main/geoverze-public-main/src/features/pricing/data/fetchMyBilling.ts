import { supabase } from "@/lib/supabase/client";

import {
  libraryTierLabel,
  parseLibraryAccessTier,
  type LibraryAccessTier,
} from "@/features/library/lib/access-tier";
import { TIER_PRESENTATION } from "./plans";
import { formatMinorAmount, formatInrRupees } from "../lib/formatInr";
import { parseUserMembership } from "../lib/membership";
import {
  isPendingAuthorizationStatus,
  pickMembershipForCheckout,
  type MembershipCheckoutRecord,
} from "../lib/membershipCheckoutGuard";

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
  /** UUID of the active subscription (mock or Razorpay). */
  subscriptionId: string | null;
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
   * ISO-8601 string for the current billing period start date.
   * Used by CheckoutScreen to calculate time-based proration for upgrades.
   * Null for free-tier / explorer users.
   */
  periodStartIso: string | null;
  /**
   * Current plan's catalog price in whole INR rupees (GST-inclusive).
   * Monthly price is used unless the subscription is annual and annual_price_cents is set.
   * Zero for free (Explorer) tier.
   * Used by CheckoutScreen to calculate the upgrade credit for display.
   */
  currentPlanPriceRupees: number;
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
  /** Raw user_subscriptions.status for the membership used at checkout. */
  membershipStatus: string | null;
  /** True when a previous checkout is still authorizing and must not be charged again. */
  hasPendingAuthorization: boolean;
  /** Plan tier of a pending authorization, if any. */
  pendingPlanTier: string | null;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function throwIfUnauthenticated(message: string) {
  if (/authentication required/i.test(message) || /jwt/i.test(message)) {
    throw new Error(`UNAUTHENTICATED:${message}`);
  }
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

function membershipStatusLabel(input: {
  cancelAtPeriodEnd: boolean;
  periodEndIso: string | null;
  status: string;
  isPaidTier: boolean;
}): string {
  if (input.cancelAtPeriodEnd) {
    if (input.periodEndIso) return `Cancels on ${formatDateLabel(input.periodEndIso)}`;
    return "Cancels at period end";
  }
  return input.status || (input.isPaidTier ? "inactive" : "active");
}

function formatCharge(amountMinor: number, currency: string): string {
  // charge_amount_minor is in paise (INR minor units); formatMinorAmount divides by 100
  return formatMinorAmount(amountMinor, currency);
}

type PlanCatalogRow = {
  display_name: string;
  monthly_price_cents: number;
  annual_price_cents: number | null;
};

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

  const [membershipResult, paymentsResult, activeSubResult, catalogResult] = await Promise.all([
    supabase.rpc("get_my_membership"),
    supabase
      .from("billing_payments")
      .select(
        "id, provider_invoice_id, provider_payment_id, plan_tier, status, paid_at, attempted_at, charge_amount_minor, charge_currency",
      )
      .eq("user_id", user.id)
      .order("attempted_at", { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from("user_subscriptions")
      .select("id, provider_name, status, plan_tier, billing_interval")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due", "pending", "incomplete"])
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("subscription_plans")
      .select("tier, display_name, monthly_price_cents, annual_price_cents")
      .eq("active", true),
  ]);

  if (membershipResult.error) {
    throwIfUnauthenticated(membershipResult.error.message);
    throw new Error(membershipResult.error.message);
  }

  const membership = parseUserMembership(membershipResult.data);
  if (!membership) {
    throw new Error("Could not read membership snapshot.");
  }

  if (paymentsResult.error) {
    console.warn("[fetchMyBilling] billing_payments:", paymentsResult.error.message);
  }
  if (activeSubResult.error) {
    console.warn("[fetchMyBilling] user_subscriptions:", activeSubResult.error.message);
  }
  if (catalogResult.error) {
    console.warn("[fetchMyBilling] subscription_plans:", catalogResult.error.message);
  }

  const membershipRows = (activeSubResult.data ?? []) as MembershipCheckoutRecord[];
  const activeSub = pickMembershipForCheckout(membershipRows);

  const tier = membership.tier;
  const presentation = TIER_PRESENTATION[tier];
  const billingInterval: "monthly" | "annual" =
    membership.billingInterval === "annual" ? "annual" : "monthly";

  const catalogByTier = new Map(
    (catalogResult.data ?? []).map((row) => [parseLibraryAccessTier(row.tier as string) ?? "explorer", row]),
  );
  const catalog = catalogByTier.get(tier) as PlanCatalogRow | undefined;
  const monthlyPrice = catalog?.monthly_price_cents ?? 0;
  const annualPrice = catalog?.annual_price_cents ?? null;
  const isPaidTier = tier !== "explorer";
  const priceCents =
    billingInterval === "annual" && annualPrice != null ? annualPrice : monthlyPrice;

  const payments = paymentsResult.data ?? [];
  const periodEndIso = membership.currentPeriodEnd;
  const periodStartIso = membership.currentPeriodStart;

  return {
    userId: user.id,
    tier,
    planName: membership.planName || catalog?.display_name || libraryTierLabel(tier),
    planSummary: presentation.summary,
    statusLabel: membershipStatusLabel({
      cancelAtPeriodEnd: membership.cancelAtPeriodEnd,
      periodEndIso,
      status: membership.status,
      isPaidTier,
    }),
    billingInterval,
    memberSinceLabel: formatDateLabel(membership.startedAt ?? user.created_at),
    renewsLabel: formatDateLabel(periodEndIso),
    accessUntilLabel: formatDateLabel(periodEndIso),
    periodEndIso,
    cancelAtPeriodEnd: membership.cancelAtPeriodEnd,
    periodStartIso,
    currentPlanPriceRupees: priceCents,
    reactivationSupported: isPaidTier,
    priceAmount: isPaidTier ? formatInrRupees(priceCents) : "Free",
    priceCadence: isPaidTier
      ? billingInterval === "annual"
        ? "/ year"
        : "/ month"
      : "forever",
    monthlyCreditGrant: membership.monthlyCreditGrant,
    availableCredits: membership.availableCredits,
    periodGrantAmount: membership.periodGrantAmount > 0 ? membership.periodGrantAmount : null,
    canSwitchToAnnual: isPaidTier && billingInterval === "monthly" && annualPrice != null,
    isPaidMembership: isPaidTier,
    isMockSubscription: activeSub?.provider_name === "mock",
    mockSubscriptionId: activeSub?.provider_name === "mock" ? activeSub.id : null,
    subscriptionId: activeSub?.id ?? null,
    membershipStatus: activeSub?.status ?? membership.status,
    hasPendingAuthorization: Boolean(
      activeSub && isPendingAuthorizationStatus(activeSub.status),
    ),
    pendingPlanTier:
      activeSub && isPendingAuthorizationStatus(activeSub.status) ? activeSub.plan_tier : null,
    history: payments.map((row) => {
      const historyTier = parseLibraryAccessTier(row.plan_tier);
      const currency = (row.charge_currency ?? "INR").trim().toUpperCase();
      const amountMinor = typeof row.charge_amount_minor === "number" ? row.charge_amount_minor : 0;
      return {
        id: row.provider_invoice_id ?? row.provider_payment_id ?? row.id,
        date: formatDateLabel(row.paid_at ?? row.attempted_at),
        description: `${historyTier ? libraryTierLabel(historyTier) : row.plan_tier} membership`,
        amount: formatCharge(amountMinor, currency),
        currency,
        status: mapPaymentStatus(row.status),
      };
    }),
  };
}
