/**
 * GVRZE Mock Payment Library — development-only helpers.
 *
 * Production safety:
 *   isMockPaymentEnabled() returns false in production builds because
 *   Vite replaces `import.meta.env.DEV` with the literal `false` at
 *   build time. Even if VITE_MOCK_PAYMENTS is set in a prod env-file,
 *   the runtime value of DEV is false, so this gate never opens.
 *
 * Server-side safety:
 *   The SQL RPCs (begin_mock_subscription, confirm_mock_subscription)
 *   are callable only by the `authenticated` role. They do not check
 *   an env var on their own, but the idempotency_key ties each session
 *   to a specific user+intent and the client only calls them when
 *   isMockPaymentEnabled() is true.
 *
 * NEVER use these functions to activate memberships in real payments.
 */

import { supabase } from "@/lib/supabase/client";
import type { TierId, BillingCycle } from "../data/plans";

/** True only in a Vite dev build with VITE_MOCK_PAYMENTS=true. */
export function isMockPaymentEnabled(): boolean {
  return (
    import.meta.env.DEV === true &&
    import.meta.env["VITE_MOCK_PAYMENTS"] === "true"
  );
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
};

/** Outcome of confirmMockSubscription. */
export type MockConfirmResult = {
  success: boolean;
  invoice_number?: string;
  outcome?: string;
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
 * Creates a pending mock subscription + payment record server-side.
 * Idempotent: safe to call twice with the same idempotency_key.
 *
 * @throws MockPaymentError on network or RPC failure.
 */
export async function beginMockSubscription(params: {
  plan_tier: TierId;
  billing_interval: BillingCycle;
  base_amount_minor: number;
  gst_amount_minor: number;
  charge_amount_minor: number;
  idempotency_key: string;
}): Promise<MockSession> {
  if (!isMockPaymentEnabled()) {
    throw new MockPaymentError("Mock payments are disabled in this environment.", "MOCK_DISABLED");
  }

  const { data, error } = await (supabase.rpc as (fn: string, args: Record<string, unknown>) => ReturnType<typeof supabase.rpc>)(
    "begin_mock_subscription",
    {
      p_plan_tier:           params.plan_tier,
      p_billing_interval:    params.billing_interval,
      p_base_amount_minor:   params.base_amount_minor,
      p_gst_amount_minor:    params.gst_amount_minor,
      p_charge_amount_minor: params.charge_amount_minor,
      p_idempotency_key:     params.idempotency_key,
    },
  );

  if (error) {
    throw new MockPaymentError(
      error.message ?? "Failed to create mock payment session.",
      error.code ?? "RPC_ERROR",
    );
  }

  const result = data as { subscription_id: string; mock_session_id: string } | null;
  if (!result?.subscription_id) {
    throw new MockPaymentError("Invalid response from begin_mock_subscription.", "BAD_RESPONSE");
  }

  return {
    subscription_id:    result.subscription_id,
    mock_session_id:    result.mock_session_id,
    base_amount_minor:  params.base_amount_minor,
    gst_amount_minor:   params.gst_amount_minor,
    charge_amount_minor: params.charge_amount_minor,
  };
}

/**
 * Resolves a pending mock subscription to a final outcome.
 *
 * - 'success'  → activates subscription, issues invoice, marks payment succeeded
 * - 'failed'   → marks payment failed, cancels subscription
 * - 'cancel'   → marks payment cancelled, cancels subscription
 *
 * Idempotent: safe to call twice with 'success' on an already-active sub.
 *
 * @throws MockPaymentError on network or RPC failure.
 */
export async function confirmMockSubscription(params: {
  subscription_id: string;
  outcome: "success" | "failed" | "cancel";
}): Promise<MockConfirmResult> {
  if (!isMockPaymentEnabled()) {
    throw new MockPaymentError("Mock payments are disabled in this environment.", "MOCK_DISABLED");
  }

  const { data, error } = await (supabase.rpc as (fn: string, args: Record<string, unknown>) => ReturnType<typeof supabase.rpc>)(
    "confirm_mock_subscription",
    {
      p_subscription_id: params.subscription_id,
      p_outcome:         params.outcome,
    },
  );

  if (error) {
    throw new MockPaymentError(
      error.message ?? "Failed to confirm mock payment.",
      error.code ?? "RPC_ERROR",
    );
  }

  return (data as MockConfirmResult) ?? { success: false };
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
