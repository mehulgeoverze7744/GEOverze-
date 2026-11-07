/**
 * GVRZE Mock Payment Library — testing helpers.
 *
 * Environment security model:
 *   Mock mode is controlled at RUNTIME by server functions that read
 *   process.env["VITE_MOCK_PAYMENTS"] on the Node.js server. Setting this
 *   variable in Vercel takes effect immediately — no rebuild required.
 *
 *   ┌─────────────────┬──────────────────────────────────────────────────┐
 *   │ Local dev       │ true (in .env.local — never committed)           │
 *   │ Vercel Preview  │ true (Vercel → Settings → Env Vars → Preview)   │
 *   │ Vercel Prod     │ true ONLY during temporary authorized testing;   │
 *   │                 │ MUST be cleared / unset when testing ends        │
 *   └─────────────────┴──────────────────────────────────────────────────┘
 *
 * Security layers (defence in depth):
 *   1. UI   — mock checkout button only shown when server config returns
 *             mockEnabled=true (via usePaymentConfig).
 *   2. Gate — beginMockPaymentFn / confirmMockPaymentFn are TanStack Start
 *             server functions that reject calls when VITE_MOCK_PAYMENTS is
 *             not "true" in process.env on the server.
 *   3. Auth — the caller's Supabase access_token is forwarded to the RPC;
 *             auth.uid() rejects unauthenticated / expired token calls.
 *   4. DB   — SECURITY DEFINER RPCs mark every record is_mock=true so
 *             production billing reports can filter mock data at all times.
 *
 * NEVER use these functions to activate memberships via real payments.
 * NEVER set VITE_MOCK_PAYMENTS=true in Vercel Production permanently.
 */

import { supabase } from "@/lib/supabase/client";
import type { TierId, BillingCycle } from "../data/plans";
import {
  beginMockPaymentFn,
  confirmMockPaymentFn,
  cancelMockSubscriptionFn,
  scheduleCancelMockSubscriptionFn,
  reactivateMockSubscriptionFn,
  beginMockUpgradeFn,
  confirmMockUpgradeFn,
  type BeginMockUpgradeResult,
  type ConfirmMockUpgradeResult,
} from "./mockPaymentServerFns";

/**
 * True when VITE_MOCK_PAYMENTS=true is set in the BUILD-TIME environment.
 *
 * This is a build-time fallback only — prefer usePaymentConfig() in React
 * components (which reads the RUNTIME server value via getPaymentConfig).
 */
export function isMockPaymentEnabled(): boolean {
  return import.meta.env["VITE_MOCK_PAYMENTS"] === "true";
}

/** Data returned by beginMockSubscription. */
export type MockSession = {
  /** Internal GVRZE subscription UUID. */
  subscription_id: string;
  /** Opaque session handle (mock_ + subscription_id). */
  mock_session_id: string;
  /** Pre-tax base amount in paise (INR minor units). */
  base_amount_minor: number;
  /** GST portion in paise. */
  gst_amount_minor: number;
  /** Total payable in paise (base + GST). */
  charge_amount_minor: number;
  /**
   * Upgrade-specific fields — present only for upgrade sessions.
   * When is_upgrade=true, MockPaymentGateway calls confirmMockUpgrade
   * instead of confirmMockSubscription.
   */
  is_upgrade?: boolean;
  upgrade_payment_id?: string;
  current_plan_tier?: string;
  target_plan_tier?: string;
  credit_rupees?: number;
  upgrade_rupees?: number;
};

/** Outcome of confirmMockSubscription. */
export type MockConfirmResult = {
  success: boolean;
  invoice_number?: string;
  outcome?: string;
  /** True when the subscription was already active (idempotent retry). */
  already_active?: boolean;
};

export class MockPaymentError extends Error {
  constructor(
    message: string,
    public readonly code: string = "MOCK_ERROR",
  ) {
    super(message);
    this.name = "MockPaymentError";
  }
}

/**
 * Returns the current user's Supabase access token.
 * Throws MockPaymentError if the user is not authenticated.
 */
async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new MockPaymentError(
      "Sign in to continue to checkout.",
      "UNAUTHENTICATED",
    );
  }
  return session.access_token;
}

/**
 * Creates a pending mock subscription + payment record server-side.
 *
 * Routes through beginMockPaymentFn (createServerFn) which checks
 * process.env["VITE_MOCK_PAYMENTS"] before forwarding to the Supabase RPC.
 * Idempotent: safe to call twice with the same idempotency_key.
 *
 * @throws MockPaymentError on network, auth, or RPC failure.
 */
export async function beginMockSubscription(params: {
  plan_tier: TierId;
  billing_interval: BillingCycle;
  base_amount_minor: number;
  gst_amount_minor: number;
  charge_amount_minor: number;
  idempotency_key: string;
}): Promise<MockSession> {
  const access_token = await getAccessToken();

  try {
    const result = await beginMockPaymentFn({
      data: {
        access_token,
        plan_tier:            params.plan_tier,
        billing_interval:     params.billing_interval,
        charge_amount_minor:  params.charge_amount_minor,
        base_amount_minor:    params.base_amount_minor,
        gst_amount_minor:     params.gst_amount_minor,
        idempotency_key:      params.idempotency_key,
      },
    });

    return {
      subscription_id:     result.subscription_id,
      mock_session_id:     result.mock_session_id,
      base_amount_minor:   params.base_amount_minor,
      gst_amount_minor:    params.gst_amount_minor,
      charge_amount_minor: params.charge_amount_minor,
    };
  } catch (err) {
    throw new MockPaymentError(
      err instanceof Error ? err.message : "Failed to create mock payment session.",
      "RPC_ERROR",
    );
  }
}

/**
 * Resolves a pending mock subscription to a final outcome.
 *
 * Routes through confirmMockPaymentFn (createServerFn) which checks
 * process.env["VITE_MOCK_PAYMENTS"] before forwarding to the Supabase RPC.
 *
 * - 'success'  → activates subscription, issues invoice, grants credits
 * - 'failed'   → marks payment failed, cancels subscription
 * - 'cancel'   → marks payment cancelled, cancels subscription
 *
 * Idempotent: calling 'success' on an already-active subscription returns
 * the existing invoice (already_active: true) without granting duplicate credits.
 *
 * @throws MockPaymentError on network, auth, or RPC failure.
 */
export async function confirmMockSubscription(params: {
  subscription_id: string;
  outcome: "success" | "failed" | "cancel";
}): Promise<MockConfirmResult> {
  const access_token = await getAccessToken();

  try {
    const result = await confirmMockPaymentFn({
      data: {
        access_token,
        subscription_id: params.subscription_id,
        outcome:         params.outcome,
      },
    });

    return result ?? { success: false };
  } catch (err) {
    throw new MockPaymentError(
      err instanceof Error ? err.message : "Failed to confirm mock payment.",
      "RPC_ERROR",
    );
  }
}

/**
 * Cancels an active mock subscription from the billing screen.
 *
 * Routes through cancelMockSubscriptionFn (createServerFn) which checks the
 * tester allowlist and process.env["MOCK_PAYMENTS_ENABLED"] before forwarding.
 * Idempotent: safe to call twice on an already-cancelled subscription.
 *
 * @throws MockPaymentError on network, auth, allowlist, or RPC failure.
 */
export async function cancelMockSubscription(params: {
  subscription_id: string;
}): Promise<{ success: boolean; already_cancelled?: boolean }> {
  const access_token = await getAccessToken();

  try {
    const result = await cancelMockSubscriptionFn({
      data: {
        access_token,
        subscription_id: params.subscription_id,
      },
    });
    return result ?? { success: false };
  } catch (err) {
    throw new MockPaymentError(
      err instanceof Error ? err.message : "Failed to cancel mock subscription.",
      "RPC_ERROR",
    );
  }
}

/**
 * Schedules cancellation of a mock subscription at the end of the billing period.
 *
 * Sets cancel_at_period_end = true on the subscription WITHOUT immediately
 * cancelling it.  The subscription stays "active" and all membership benefits
 * (credits, library access, etc.) continue until current_period_end.
 *
 * This is the correct cancellation path for the billing screen.
 * Use cancelMockSubscription only for immediate teardown (e.g. on payment failure).
 *
 * @throws MockPaymentError on network, auth, or RPC failure.
 */
export async function scheduleCancelMockSubscription(params: {
  subscription_id: string;
}): Promise<{ ok: boolean; reason?: string; period_end?: string }> {
  const access_token = await getAccessToken();
  try {
    const result = await scheduleCancelMockSubscriptionFn({
      data: { access_token, subscription_id: params.subscription_id },
    });
    return result ?? { ok: false };
  } catch (err) {
    throw new MockPaymentError(
      err instanceof Error ? err.message : "Failed to schedule mock subscription cancellation.",
      "RPC_ERROR",
    );
  }
}

/**
 * Reactivates a mock subscription that has cancel_at_period_end = true.
 *
 * Clears the scheduled cancellation so the subscription renews automatically
 * at the next billing cycle.  Idempotent: safe if already active / not scheduled.
 *
 * Only valid while the subscription is still in its paid period (before expiry).
 *
 * @throws MockPaymentError on network, auth, or RPC failure.
 */
export async function reactivateMockSubscription(params: {
  subscription_id: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const access_token = await getAccessToken();
  try {
    const result = await reactivateMockSubscriptionFn({
      data: { access_token, subscription_id: params.subscription_id },
    });
    return result ?? { ok: false };
  } catch (err) {
    throw new MockPaymentError(
      err instanceof Error ? err.message : "Failed to reactivate mock subscription.",
      "RPC_ERROR",
    );
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Upgrade flow                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Creates a pending upgrade payment for an existing active mock subscription.
 *
 * The DB RPC calculates the proration (time-based credit) server-side.
 * Returns a MockSession with is_upgrade=true and upgrade_payment_id populated.
 *
 * @throws MockPaymentError on network, auth, or RPC failure.
 */
export async function beginMockUpgrade(params: {
  target_plan_tier: "basic" | "pro" | "advance";
  billing_interval: "monthly" | "annual";
  idempotency_key: string;
}): Promise<MockSession> {
  const access_token = await getAccessToken();

  try {
    const result: BeginMockUpgradeResult = await beginMockUpgradeFn({
      data: {
        access_token,
        target_plan_tier: params.target_plan_tier,
        billing_interval:  params.billing_interval,
        idempotency_key:   params.idempotency_key,
      },
    });

    return {
      subscription_id:    result.subscription_id,
      mock_session_id:    "mock_upgrade_" + result.upgrade_payment_id,
      base_amount_minor:  result.base_amount_minor,
      gst_amount_minor:   result.gst_amount_minor,
      charge_amount_minor: result.charge_amount_minor,
      is_upgrade:          true,
      upgrade_payment_id:  result.upgrade_payment_id,
      current_plan_tier:   result.current_plan_tier,
      target_plan_tier:    result.target_plan_tier,
      credit_rupees:       result.credit_rupees,
      upgrade_rupees:      result.upgrade_rupees,
    };
  } catch (err) {
    throw new MockPaymentError(
      err instanceof Error ? err.message : "Failed to begin mock upgrade payment.",
      "RPC_ERROR",
    );
  }
}

/**
 * Resolves a pending mock upgrade payment to a final outcome.
 *
 * - 'success'  → upgrades subscription plan_tier, issues invoice, grants credits
 * - 'failed'   → marks payment failed; subscription plan_tier unchanged
 * - 'cancel'   → marks payment cancelled; subscription plan_tier unchanged
 *
 * Idempotent: safe to call twice with 'success' on an already-upgraded payment.
 *
 * @throws MockPaymentError on network, auth, or RPC failure.
 */
export async function confirmMockUpgrade(params: {
  upgrade_payment_id: string;
  outcome: "success" | "failed" | "cancel";
}): Promise<ConfirmMockUpgradeResult> {
  const access_token = await getAccessToken();

  try {
    const result = await confirmMockUpgradeFn({
      data: {
        access_token,
        upgrade_payment_id: params.upgrade_payment_id,
        outcome:             params.outcome,
      },
    });

    return result ?? { success: false };
  } catch (err) {
    throw new MockPaymentError(
      err instanceof Error ? err.message : "Failed to confirm mock upgrade.",
      "RPC_ERROR",
    );
  }
}


/** Generates a stable idempotency key from user ID + plan + cycle + timestamp. */
export function generateIdempotencyKey(
  userId: string,
  planTier: TierId,
  billingInterval: BillingCycle,
): string {
  const dateKey = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  return `mock_${userId}_${planTier}_${billingInterval}_${dateKey}`;
}
