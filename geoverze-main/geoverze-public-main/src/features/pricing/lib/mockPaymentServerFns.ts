/**
 * Mock Payment Server Functions — server-side gates for mock checkout RPCs.
 *
 * SECURITY MODEL:
 *   The environment variable is the authoritative gate.  When
 *   MOCK_PAYMENTS_ENABLED=true OR VITE_MOCK_PAYMENTS=true is set in Vercel,
 *   any authenticated user can use mock payments.  Only the site admin can
 *   set Vercel env vars, so this is sufficient access control.
 *
 * SECURITY LAYERS (defence in depth):
 *   1. Env gate   — assertMockEnabled() checks process.env at request time;
 *                   calls are rejected if mock mode is off.  Reads
 *                   MOCK_PAYMENTS_ENABLED (preferred, server-only, never
 *                   bundled) OR VITE_MOCK_PAYMENTS (convenience alias).
 *   2. Auth        — the caller's Supabase access_token is forwarded;
 *                   auth.uid() rejects unauthenticated / expired tokens.
 *   3. DB          — SECURITY DEFINER RPCs mark all records is_mock=true;
 *                   constraints are never bypassed.
 *
 * NEVER:
 *   - Use the service-role key here (we use the anon key + user JWT only).
 *   - Set MOCK_PAYMENTS_ENABLED or VITE_MOCK_PAYMENTS permanently in Production.
 *   - Collect real card/UPI/banking credentials in mock mode.
 */

import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Throws if mock mode is not explicitly enabled on the server.
 * Checks MOCK_PAYMENTS_ENABLED (preferred, server-only) then VITE_MOCK_PAYMENTS.
 */
function assertMockEnabled(): void {
  const enabled =
    process.env["MOCK_PAYMENTS_ENABLED"] === "true" ||
    process.env["VITE_MOCK_PAYMENTS"] === "true";
  if (!enabled) {
    throw new Error(
      "Mock payments are not enabled in this environment. " +
      "Set MOCK_PAYMENTS_ENABLED=true (or VITE_MOCK_PAYMENTS=true) in " +
      "Vercel env vars under the Production scope, then redeploy."
    );
  }
}

/**
 * Returns a Supabase client authenticated as the calling user.
 * Uses the anon key + user JWT (never the service-role key).
 */
function makeAuthenticatedClient(accessToken: string): SupabaseClient {
  const url     = process.env["VITE_SUPABASE_URL"];
  const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// ── begin_mock_subscription ───────────────────────────────────────────────────

const BeginSchema = z.object({
  access_token:         z.string().min(10),
  plan_tier:            z.enum(["basic", "pro", "advance"]),
  billing_interval:     z.enum(["monthly", "annual"]),
  charge_amount_minor:  z.number().int().positive(),
  base_amount_minor:    z.number().int().nonnegative(),
  gst_amount_minor:     z.number().int().nonnegative(),
  idempotency_key:      z.string().min(1).max(256),
});

export type BeginMockPaymentInput  = z.infer<typeof BeginSchema>;
export type BeginMockPaymentResult = { subscription_id: string; mock_session_id: string };

export const beginMockPaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => BeginSchema.parse(raw))
  .handler(async ({ data }): Promise<BeginMockPaymentResult> => {
    assertMockEnabled();
    const sb = makeAuthenticatedClient(data.access_token);

    const { data: result, error } = await sb.rpc("begin_mock_subscription", {
      p_plan_tier:            data.plan_tier,
      p_billing_interval:     data.billing_interval,
      p_charge_amount_minor:  data.charge_amount_minor,
      p_base_amount_minor:    data.base_amount_minor,
      p_gst_amount_minor:     data.gst_amount_minor,
      p_idempotency_key:      data.idempotency_key,
    });

    if (error) throw new Error(error.message ?? "begin_mock_subscription RPC failed.");
    const r = result as BeginMockPaymentResult | null;
    if (!r?.subscription_id) throw new Error("Invalid response from begin_mock_subscription.");
    return r;
  });

// ── confirm_mock_subscription ─────────────────────────────────────────────────

const ConfirmSchema = z.object({
  access_token:    z.string().min(10),
  subscription_id: z.string().uuid(),
  outcome:         z.enum(["success", "failed", "cancel"]),
});

export type ConfirmMockPaymentInput  = z.infer<typeof ConfirmSchema>;
export type ConfirmMockPaymentResult = {
  success: boolean;
  invoice_number?: string;
  outcome?: string;
  already_active?: boolean;
};

export const confirmMockPaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => ConfirmSchema.parse(raw))
  .handler(async ({ data }): Promise<ConfirmMockPaymentResult> => {
    assertMockEnabled();
    const sb = makeAuthenticatedClient(data.access_token);

    const { data: result, error } = await sb.rpc("confirm_mock_subscription", {
      p_subscription_id: data.subscription_id,
      p_outcome:         data.outcome,
    });

    if (error) throw new Error(error.message ?? "confirm_mock_subscription RPC failed.");
    return (result as ConfirmMockPaymentResult) ?? { success: false };
  });

// ── schedule_cancel_mock_subscription ─────────────────────────────────────────
//
// Sets cancel_at_period_end = true on the specified mock subscription.
// Does NOT immediately cancel — access stays active until current_period_end.
// This is the billing-screen cancellation path (cancel at next renewal).
//
// NOTE: assertMockEnabled() is intentionally NOT called here.
// This function manages an EXISTING mock subscription (just flips a flag in the
// DB) — it does not create new payments and does not need the payment env gate.
// Security is provided by the user JWT + DB ownership check in the SECURITY
// DEFINER RPC (provider_name = 'mock' AND user_id = auth.uid() checks).

const ScheduleCancelSchema = z.object({
  access_token:    z.string().min(10),
  subscription_id: z.string().uuid(),
});

export type ScheduleCancelMockInput  = z.infer<typeof ScheduleCancelSchema>;
export type ScheduleCancelMockResult = {
  ok: boolean;
  reason?: string;
  period_end?: string;
};

export const scheduleCancelMockSubscriptionFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => ScheduleCancelSchema.parse(raw))
  .handler(async ({ data }): Promise<ScheduleCancelMockResult> => {
    // No assertMockEnabled() — managing existing subscriptions works regardless
    // of whether new mock payments are currently enabled on this environment.
    const sb = makeAuthenticatedClient(data.access_token);

    const { data: result, error } = await sb.rpc(
      "schedule_cancel_mock_subscription" as never,
      { p_subscription_id: data.subscription_id },
    );

    if (error) {
      const msg = (error as { message?: string }).message ?? "schedule_cancel_mock_subscription RPC failed.";
      console.error("[scheduleCancelMockSubscription] RPC error:", msg);
      throw new Error(msg);
    }
    return (result as ScheduleCancelMockResult) ?? { ok: false };
  });


// ── reactivate_mock_subscription ──────────────────────────────────────────────
//
// Clears cancel_at_period_end so the mock subscription renews automatically.
// Idempotent: safe to call when subscription is not scheduled for cancellation.
//
// NOTE: assertMockEnabled() is intentionally NOT called here — same rationale
// as schedule_cancel_mock_subscription above.

const ReactivateMockSchema = z.object({
  access_token:    z.string().min(10),
  subscription_id: z.string().uuid(),
});

export type ReactivateMockInput  = z.infer<typeof ReactivateMockSchema>;
export type ReactivateMockResult = { ok: boolean; reason?: string };

export const reactivateMockSubscriptionFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => ReactivateMockSchema.parse(raw))
  .handler(async ({ data }): Promise<ReactivateMockResult> => {
    // No assertMockEnabled() — managing existing subscriptions does not require
    // the payment env gate.
    const sb = makeAuthenticatedClient(data.access_token);

    const { data: result, error } = await sb.rpc(
      "reactivate_mock_subscription" as never,
      { p_subscription_id: data.subscription_id },
    );

    if (error) {
      const msg = (error as { message?: string }).message ?? "reactivate_mock_subscription RPC failed.";
      console.error("[reactivateMockSubscription] RPC error:", msg);
      throw new Error(msg);
    }
    return (result as ReactivateMockResult) ?? { ok: false };
  });


// ── cancel_mock_subscription ───────────────────────────────────────────────────

const CancelSchema = z.object({
  access_token:    z.string().min(10),
  subscription_id: z.string().uuid(),
});

export type CancelMockPaymentInput  = z.infer<typeof CancelSchema>;
export type CancelMockPaymentResult = { success: boolean; already_cancelled?: boolean };

export const cancelMockSubscriptionFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => CancelSchema.parse(raw))
  .handler(async ({ data }): Promise<CancelMockPaymentResult> => {
    assertMockEnabled();
    const sb = makeAuthenticatedClient(data.access_token);

    const { data: result, error } = await sb.rpc("cancel_mock_subscription", {
      p_subscription_id: data.subscription_id,
    });

    if (error) throw new Error(error.message ?? "cancel_mock_subscription RPC failed.");
    return (result as CancelMockPaymentResult) ?? { success: false };
  });
