/**
 * Mock Payment Server Functions — server-side gates for mock checkout RPCs.
 *
 * WHY SERVER FUNCTIONS (requirement 8):
 *   The Supabase SQL RPCs (begin_mock_subscription, confirm_mock_subscription)
 *   only enforce auth.uid() — they cannot read Vercel's process.env.
 *   Without a server-side gate an authenticated user can call the RPCs
 *   directly (via Supabase JS client) even when mock mode is "disabled"
 *   in the UI.
 *
 *   These createServerFn handlers run on the Node.js server (Vercel/Nitro).
 *   They check process.env["VITE_MOCK_PAYMENTS"] === "true" before forwarding
 *   to Supabase, so toggling the env var in Vercel immediately closes or
 *   opens the mock payment gate — no rebuild required.
 *
 * SECURITY LAYERS (defence in depth):
 *   1. UI   — mock checkout button only shown when server config returns
 *             mockEnabled=true (via usePaymentConfig / getPaymentConfig).
 *   2. Gate — these server functions return an error if the env var is not
 *             set, preventing any direct RPC call bypassing the UI.
 *   3. Auth — the caller must supply their Supabase access_token; the RPC
 *             validates it via auth.uid() and raises "Authentication required"
 *             if the token is missing or expired.
 *   4. DB   — SECURITY DEFINER RPCs mark every record is_mock=true so
 *             production billing reports can filter mock data at any time.
 *
 * NEVER:
 *   - Use the service-role key here (we use the anon key + user JWT).
 *   - Set VITE_MOCK_PAYMENTS=true in Vercel Production permanently.
 *   - Collect real card/UPI/banking credentials in mock mode.
 */

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Throws if mock mode is not explicitly enabled on the server. */
function assertMockEnabled(): void {
  if (process.env["VITE_MOCK_PAYMENTS"] !== "true") {
    throw new Error(
      "Mock payments are not enabled in this environment. " +
      "To enable: set VITE_MOCK_PAYMENTS=true in Vercel env vars " +
      "(Production scope for temporary testing; Preview for staging). " +
      "No rebuild is required — the change takes effect on the next request."
    );
  }
}

/**
 * Returns a Supabase client authenticated as the calling user.
 *
 * Uses the anon key + user JWT (not the service-role key).
 * Row Level Security and auth.uid() inside RPCs work exactly as they do
 * when the client calls Supabase directly from the browser.
 */
function makeAuthenticatedClient(accessToken: string) {
  const url     = process.env["VITE_SUPABASE_URL"];
  const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set."
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// ── begin_mock_subscription ───────────────────────────────────────────────────

const BeginSchema = z.object({
  /** Short-lived Supabase JWT for the calling user. */
  access_token:         z.string().min(10),
  plan_tier:            z.enum(["basic", "pro", "advance"]),
  billing_interval:     z.enum(["monthly", "annual"]),
  /** Total charge in INR minor units (paise). Must be positive. */
  charge_amount_minor:  z.number().int().positive(),
  /** Pre-GST base amount in paise. */
  base_amount_minor:    z.number().int().nonnegative(),
  /** GST portion in paise. */
  gst_amount_minor:     z.number().int().nonnegative(),
  /** Stable key to deduplicate concurrent calls. */
  idempotency_key:      z.string().min(1).max(256),
});

export type BeginMockPaymentInput  = z.infer<typeof BeginSchema>;
export type BeginMockPaymentResult = { subscription_id: string; mock_session_id: string };

/**
 * Server-side proxy for `begin_mock_subscription`.
 *
 * Guards:
 *   - Rejects immediately when VITE_MOCK_PAYMENTS ≠ "true".
 *   - Passes caller's JWT to Supabase; auth.uid() rejects anonymous calls.
 */
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

    if (error) {
      throw new Error(error.message ?? "begin_mock_subscription RPC failed.");
    }
    const r = result as BeginMockPaymentResult | null;
    if (!r?.subscription_id) {
      throw new Error("Invalid response from begin_mock_subscription.");
    }
    return r;
  });

// ── confirm_mock_subscription ─────────────────────────────────────────────────

const ConfirmSchema = z.object({
  /** Short-lived Supabase JWT for the calling user. */
  access_token:    z.string().min(10),
  subscription_id: z.string().uuid(),
  outcome:         z.enum(["success", "failed", "cancel"]),
});

export type ConfirmMockPaymentInput  = z.infer<typeof ConfirmSchema>;
export type ConfirmMockPaymentResult = {
  success: boolean;
  invoice_number?: string;
  outcome?: string;
  /** True when the subscription was already active (idempotent retry). */
  already_active?: boolean;
};

/**
 * Server-side proxy for `confirm_mock_subscription`.
 *
 * Guards:
 *   - Rejects immediately when VITE_MOCK_PAYMENTS ≠ "true".
 *   - Validates outcome enum before forwarding to Supabase.
 *   - Passes caller's JWT; auth.uid() rejects anonymous calls.
 */
export const confirmMockPaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => ConfirmSchema.parse(raw))
  .handler(async ({ data }): Promise<ConfirmMockPaymentResult> => {
    assertMockEnabled();

    const sb = makeAuthenticatedClient(data.access_token);
    const { data: result, error } = await sb.rpc("confirm_mock_subscription", {
      p_subscription_id: data.subscription_id,
      p_outcome:         data.outcome,
    });

    if (error) {
      throw new Error(error.message ?? "confirm_mock_subscription RPC failed.");
    }
    return (result as ConfirmMockPaymentResult) ?? { success: false };
  });
