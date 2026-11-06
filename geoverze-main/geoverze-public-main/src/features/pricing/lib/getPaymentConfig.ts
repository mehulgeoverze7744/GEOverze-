/**
 * Payment gateway configuration — server function.
 *
 * WHY A SERVER FUNCTION:
 *   import.meta.env.VITE_MOCK_PAYMENTS is a Vite *build-time* constant. If
 *   the Vercel env var is set after the last build, the client bundle still
 *   sees the old value (undefined). That is why the checkout showed "Payment
 *   temporarily unavailable" even after adding the env var in Vercel.
 *
 *   This server function reads process.env at *request time*. Setting
 *   VITE_MOCK_PAYMENTS=true in Vercel env vars takes effect immediately on
 *   the NEXT request — no rebuild or redeploy required.
 *
 * ENVIRONMENT MODEL:
 *   ┌─────────────────┬────────────────────────────────────────────────┐
 *   │ Local dev       │ VITE_MOCK_PAYMENTS=true in .env.local          │
 *   │ Vercel Preview  │ VITE_MOCK_PAYMENTS=true  (Preview scope only)  │
 *   │ Vercel Prod     │ NOT SET — must remain empty for production      │
 *   └─────────────────┴────────────────────────────────────────────────┘
 *
 * SECURITY:
 *   - process.env is server-only. The value is never sent to clients as a
 *     raw env var — only as the computed boolean { mockEnabled }.
 *   - Mock RPC calls (begin/confirm_mock_subscription) still require the
 *     user to be authenticated (Supabase auth guard) and mark every record
 *     is_mock=true so production billing reports can filter them.
 *   - Do NOT set VITE_MOCK_PAYMENTS=true in Vercel Production env vars.
 */

import { createServerFn } from "@tanstack/react-start";

export type PaymentConfig = {
  /**
   * True when VITE_MOCK_PAYMENTS=true is present in the server environment.
   * Determined at runtime — not baked into the client bundle.
   */
  mockEnabled: boolean;
  /**
   * True when VITE_RAZORPAY_KEY_ID is present in the server environment.
   * Returned from the server so both keys are sourced consistently.
   */
  razorpayEnabled: boolean;
};

export const getPaymentConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<PaymentConfig> => ({
    mockEnabled: process.env["VITE_MOCK_PAYMENTS"] === "true",
    razorpayEnabled: Boolean(process.env["VITE_RAZORPAY_KEY_ID"]),
  }),
);
