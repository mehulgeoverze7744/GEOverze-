/**
 * usePaymentInfraConfig — unified payment infrastructure configuration.
 *
 * Returns the full provider/currency/country/shipping config from the
 * payment abstraction layer. Used by:
 *   - Admin payment dashboard
 *   - Future international checkout UI
 *   - Provider selection logic
 *
 * This hook DOES NOT replace usePaymentConfig — both coexist.
 * usePaymentConfig:     simple { mockEnabled, razorpayEnabled } — used by checkout
 * usePaymentInfraConfig: full provider/currency/zone config — used by admin + future
 */

import { useQuery } from "@tanstack/react-query";
import { getPaymentInfraConfigFn, type PaymentInfraConfig } from "@/lib/payments/paymentServerFns";

export function usePaymentInfraConfig() {
  return useQuery<PaymentInfraConfig>({
    queryKey: ["paymentInfraConfig"] as const,
    queryFn:  () => getPaymentInfraConfigFn(),
    staleTime: 120_000,   // 2 minutes — infrastructure config changes infrequently
    retry:     1,
    refetchOnWindowFocus: false,
  });
}
