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

/** Generates a stable idempotency key from user ID + plan + cycle + timestamp. */
export function generateIdempotencyKey(
  userId: string,
  planTier: TierId,
  billingInterval: BillingCycle,
): string {
  const dateKey = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  return `mock_${userId}_${planTier}_${billingInterval}_${dateKey}`;
}
