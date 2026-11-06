/**
 * usePaymentConfig — payment gateway availability, determined at runtime.
 *
 * Fetches { mockEnabled, razorpayEnabled } from the server on every checkout
 * mount. Because the server function reads process.env (not import.meta.env),
 * the result correctly reflects the CURRENT Vercel env var values without
 * needing a rebuild after the variable is changed.
 *
 * Loading behaviour:
 *   - While the server call is in-flight, falls back to the build-time
 *     constant (import.meta.env.VITE_MOCK_PAYMENTS) so the UI is not
 *     stuck in a spinner longer than necessary.
 *   - On error, falls back to build-time constants (graceful degradation).
 */

import { useQuery } from "@tanstack/react-query";

import { getPaymentConfig } from "../lib/getPaymentConfig";

export function usePaymentConfig() {
  const query = useQuery({
    queryKey: ["paymentConfig"] as const,
    queryFn: () => getPaymentConfig(),
    staleTime: 60_000,  // 1 minute — env vars change infrequently
    retry: 1,
    refetchOnWindowFocus: false,
  });

  /**
   * Build-time fallback: used while the server call is in-flight or on
   * transient network errors. Keeps the UI responsive on first render.
   */
  const buildTimeMock     = import.meta.env["VITE_MOCK_PAYMENTS"] === "true";
  const buildTimeRazorpay = Boolean(import.meta.env["VITE_RAZORPAY_KEY_ID"]);

  const mockEnabled     = query.isSuccess ? query.data.mockEnabled     : buildTimeMock;
  const razorpayEnabled = query.isSuccess ? query.data.razorpayEnabled : buildTimeRazorpay;

  return {
    /** True when VITE_MOCK_PAYMENTS=true is set in the server env. */
    mockEnabled,
    /** True when VITE_RAZORPAY_KEY_ID is set in the server env. */
    razorpayEnabled,
    /**
     * True while the initial server config call hasn't resolved yet.
     * Both mock and Razorpay buttons are hidden during this window to
     * prevent a flash of "Payment unavailable" on first load.
     */
    configLoading: query.isPending,
  };
}
