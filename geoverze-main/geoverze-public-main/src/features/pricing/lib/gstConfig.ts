/**
 * Centralized GST (Goods and Services Tax) configuration for GVRZE billing.
 *
 * India GST for digital / software services:
 *   - CGST 9% + SGST 9% = 18% (intra-state)
 *   - IGST 18% (inter-state / export)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT: Before going live, verify GST applicability and rate with a
 * qualified Indian tax advisor. Update this file and re-deploy.
 *
 * To change the rate: update GST_CONFIG.ratePercent and rateDecimal.
 * Do NOT hardcode GST anywhere outside this file.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * tax-inclusive vs tax-exclusive:
 *   inclusive (default) — catalog price already includes GST.
 *     e.g. ₹499 total → base ₹423.73 + GST ₹75.27 = ₹499
 *   exclusive — GST is added on top of catalog price.
 *     e.g. ₹499 + 18% → base ₹499 + GST ₹89.82 = ₹588.82
 *
 * We default to inclusive because:
 *   1. Users see a single clean number on the pricing page.
 *   2. Razorpay plan amount = catalog price (no extra step).
 *   3. GST is transparently broken out in the checkout summary.
 */

export type GstConfig = {
  /** GST rate as a percentage (e.g. 18 for 18%). */
  ratePercent: number;
  /** GST rate as a decimal multiplier (e.g. 0.18). Derived from ratePercent. */
  rateDecimal: number;
  /**
   * Whether catalog prices are GST-inclusive.
   * true  = price shown contains GST; extract base by dividing by (1 + rate).
   * false = price shown is pre-tax; add GST on top.
   */
  taxInclusive: boolean;
  /** Your GSTIN once registered (leave empty until registration is complete). */
  gstin: string;
  /** HSN/SAC code for the service (digital subscription = 9984 or 998431). */
  sacCode: string;
  /** Tax description shown on invoices. */
  taxLabel: string;
};

export const GST_CONFIG: GstConfig = {
  ratePercent: 18,
  rateDecimal: 0.18,
  taxInclusive: true,
  gstin: "", // Fill in after GST registration: format XXAAAAA0000A1Z5
  sacCode: "9984", // Digital / subscription services
  taxLabel: "GST (18%)",
};

/**
 * Calculates the GST breakdown for a given catalog rupee amount.
 *
 * @param catalogRupees  - The catalog price in whole rupees (from subscription_plans).
 * @param config         - GST configuration (defaults to GST_CONFIG).
 * @returns              - { baseRupees, gstRupees, totalRupees } all rounded to 2 dp.
 */
export function calcGst(
  catalogRupees: number,
  config: GstConfig = GST_CONFIG,
): { baseRupees: number; gstRupees: number; totalRupees: number } {
  if (catalogRupees <= 0) {
    return { baseRupees: 0, gstRupees: 0, totalRupees: 0 };
  }

  if (config.taxInclusive) {
    // Extract base from inclusive price
    const baseRupees = round2(catalogRupees / (1 + config.rateDecimal));
    const gstRupees = round2(catalogRupees - baseRupees);
    return { baseRupees, gstRupees, totalRupees: round2(catalogRupees) };
  } else {
    // Add GST on top
    const gstRupees = round2(catalogRupees * config.rateDecimal);
    const totalRupees = round2(catalogRupees + gstRupees);
    return { baseRupees: round2(catalogRupees), gstRupees, totalRupees };
  }
}

/** Rounds to 2 decimal places (standard currency rounding). */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Formats a GST breakdown summary string for receipts/invoices.
 * Example: "₹423.73 + ₹75.27 GST (18%) = ₹499"
 */
export function gstBreakdownSummary(
  catalogRupees: number,
  config: GstConfig = GST_CONFIG,
): string {
  const { baseRupees, gstRupees, totalRupees } = calcGst(catalogRupees, config);
  return `₹${baseRupees.toFixed(2)} + ₹${gstRupees.toFixed(2)} ${config.taxLabel} = ₹${totalRupees.toFixed(0)}`;
}
