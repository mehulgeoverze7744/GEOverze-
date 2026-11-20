import { formatInrRupees } from "./formatInr";

/**
 * Formats subscription catalog amounts (whole INR rupees).
 * Legacy export name retained for compatibility — values are not USD cents.
 */
export function formatUsdCents(rupees: number): string {
  return formatInrRupees(rupees);
}

export const formatCatalogPrice = formatInrRupees;