/**
 * Payment gateway configuration — server function.
 *
 * WHY A SERVER FUNCTION:
 *   import.meta.env.VITE_MOCK_PAYMENTS is a Vite *build-time* constant baked
 *   into the client bundle. Setting the Vercel env var after a build has no
 *   effect on existing deployments. This server function reads process.env at
 *   *request time*, so toggling the env var in Vercel takes effect on the
 *   next page load — no rebuild required.
 *
 * ENVIRONMENT VARIABLES (read server-side only):
 *
 *   MOCK_PAYMENTS_ENABLED=true   ← RECOMMENDED for Production testing.
 *     Never prefixed with VITE_, so Vite never bundles it into the client.
 *     Set in Vercel → Settings → Environment Variables → Production (or Preview).
 *     The key is never visible in browser DevTools or the JS bundle.
 *
 *   VITE_MOCK_PAYMENTS=true      ← Convenience alias, still works.
 *     Also read at request time by the server function (despite the VITE_ prefix,
 *     process.env reads it server-side). Vite *also* bakes it into the client
 *     bundle, which is why MOCK_PAYMENTS_ENABLED is preferred for Production.
 *
 *   Either variable (or both) enables mock mode. The server function ORs them.
 *
 *   ┌─────────────────┬────────────────────────────────────────────────────┐
 *   │ Local dev       │ VITE_MOCK_PAYMENTS=true in .env.local              │
 *   │ Vercel Preview  │ Either variable, Preview scope only                │
 *   │ Vercel Prod     │ MOCK_PAYMENTS_ENABLED=true (temporarily)           │
 *   │                 │ Clear it when testing ends                         │
 *   └─────────────────┴────────────────────────────────────────────────────┘
 *
 * SECURITY:
 *   - process.env is server-only. The value is never sent as a raw env var
 *     to the client — only as the computed boolean { mockEnabled }.
 *   - Mock RPC calls require authentication + tester allowlist membership.
 *   - All mock DB records are is_mock=true for billing report filtering.
 *   - Do NOT set MOCK_PAYMENTS_ENABLED permanently in Vercel Production.
 */

import { createServerFn } from "@tanstack/react-start";

import { isMockPaymentsExplicit } from "@/lib/payments/razorpayEnv";
import type { RazorpayCredentialSource, RazorpayKeyPrefix } from "@/lib/payments/razorpayCredentialParse";

export type PaymentConfig = {
  /**
   * True when MOCK_PAYMENTS_ENABLED=true OR VITE_MOCK_PAYMENTS=true in
   * the server environment. Determined at request time, not at build time.
   */
  mockEnabled: boolean;
  /**
   * True when a Razorpay Key ID is present and mock mode is off.
   */
  razorpayEnabled: boolean;
  /** True when Razorpay is running in TEST MODE (rzp_test_ keys or RAZORPAY_MODE=test). */
  testMode: boolean;
  /** Public Key ID used by the server for Basic Auth (never the Key Secret). */
  razorpayKeyId: string;
  razorpayKeyIdPrefix: RazorpayKeyPrefix;
  razorpayKeyIdFingerprint: string;
  razorpaySecretConfigured: boolean;
  razorpayCredentialSource: RazorpayCredentialSource;
};

export const getPaymentConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<PaymentConfig> => {
    const rzp = await import("@/lib/payments/razorpayServer");
    const diag = rzp.getRazorpayDiagnostics();
    const razorpayConfigured = diag.keyIdPresent && diag.keySecretPresent;
    const autoMockDev =
      process.env["NODE_ENV"] === "development" && !razorpayConfigured;
    const mockEnabled = isMockPaymentsExplicit() || autoMockDev;
    const testMode = razorpayConfigured && diag.mode === "test";

    return {
      mockEnabled,
      razorpayEnabled: razorpayConfigured && !mockEnabled,
      testMode: testMode && !mockEnabled,
      razorpayKeyId: diag.razorpayKeyId,
      razorpayKeyIdPrefix: diag.keyIdPrefix,
      razorpayKeyIdFingerprint: diag.keyIdFingerprint,
      razorpaySecretConfigured: diag.keySecretPresent,
      razorpayCredentialSource: diag.credentialSource,
    };
  },
);
