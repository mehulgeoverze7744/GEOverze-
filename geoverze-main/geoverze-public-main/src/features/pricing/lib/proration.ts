/**
 * Subscription upgrade proration utilities — GVRZE billing.
 *
 * Proration formula (time-based, GST-inclusive catalog prices):
 *
 *   credit_ratio    = remaining_ms / total_period_ms
 *   credit_rupees   = round(current_price_rupees × credit_ratio)
 *   upgrade_rupees  = max(1, target_price_rupees − credit_rupees)
 *   base_rupees     = round(upgrade_rupees / 1.18, 2)   // back out 18% GST
 *   gst_rupees      = round(upgrade_rupees − base_rupees, 2)
 *   charge_minor    = round(upgrade_rupees × 100)        // paise
 *
 * GST is INCLUSIVE (catalog prices already contain GST at 18%).
 *
 * Server authority:
 *   The DB function begin_mock_upgrade() recalculates every value
 *   server-side.  Client-side values are display-only and are never
 *   trusted by the backend for the actual charge amount.
 */

import { TIER_ORDER, type TierId } from "../data/plans";
import { calcGst } from "./gstConfig";
import { formatInrRupees } from "./formatInr";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Types                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

export type ProrationResult = {
  /** Unused credit from current subscription (whole rupees). */
  creditRupees: number;
  /** Upgrade amount = target price − credit (minimum ₹1). */
  upgradeRupees: number;
  /** GST breakdown on the upgrade amount. */
  gst: { baseRupees: number; gstRupees: number; totalRupees: number };
  /** Upgrade amount in paise (INR minor units, for API calls). */
  chargeMinor: number;
  /** GST amount in paise. */
  gstMinor: number;
  /** Base (pre-GST) amount in paise. */
  baseMinor: number;
  /** Remaining days (approximate, for display). */
  remainingDays: number;
  /** Total period days (for display). */
  totalDays: number;
  /** Fraction of period remaining [0, 1]. */
  creditRatio: number;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Tier ordering helper                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Returns true when `targetTier` is a genuine upgrade from `currentTier`.
 * Uses the canonical TIER_ORDER array.
 */
export function isUpgradeTo(currentTier: TierId, targetTier: TierId): boolean {
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const targetIdx = TIER_ORDER.indexOf(targetTier);
  return targetIdx > currentIdx && currentIdx !== -1 && targetIdx !== -1;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Client-side proration calculation (display only)                             */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Calculates the upgrade proration breakdown for UI display.
 *
 * @param currentPriceRupees - Catalog price of current plan (whole rupees, GST-inclusive).
 * @param targetPriceRupees  - Catalog price of target plan (whole rupees, GST-inclusive).
 * @param periodStartIso     - ISO-8601 start of the current billing period.
 * @param periodEndIso       - ISO-8601 end of the current billing period.
 *
 * @returns ProrationResult with display amounts and paise values for the API call.
 */
export function calcClientProration(params: {
  currentPriceRupees: number;
  targetPriceRupees: number;
  periodStartIso: string;
  periodEndIso: string;
}): ProrationResult {
  const { currentPriceRupees, targetPriceRupees, periodStartIso, periodEndIso } = params;

  const now = Date.now();
  const startMs = new Date(periodStartIso).getTime();
  const endMs = new Date(periodEndIso).getTime();

  const totalMs = Math.max(1, endMs - startMs);
  const remainingMs = Math.max(0, endMs - now);

  const creditRatio = remainingMs / totalMs;

  // Days (approximate, for display only)
  const msPerDay = 86_400_000;
  const totalDays = Math.round(totalMs / msPerDay);
  const remainingDays = Math.round(remainingMs / msPerDay);

  // Credit = current price × remaining ratio, rounded to nearest rupee
  const creditRupees = Math.round(currentPriceRupees * creditRatio);

  // Upgrade = target − credit, minimum ₹1
  const upgradeRupees = Math.max(1, targetPriceRupees - creditRupees);

  // GST-inclusive breakdown
  const gst = calcGst(upgradeRupees);

  // Convert to paise
  const chargeMinor = Math.round(upgradeRupees * 100);
  const baseMinor = Math.round(gst.baseRupees * 100);
  const gstMinor = Math.round(gst.gstRupees * 100);

  return {
    creditRupees,
    upgradeRupees,
    gst,
    chargeMinor,
    gstMinor,
    baseMinor,
    remainingDays,
    totalDays,
    creditRatio,
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Display helpers                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Builds a human-readable proration breakdown for the checkout order summary.
 *
 * Example:
 *   Pro Monthly          ₹499
 *   Basic Credit (-22d)  −₹72
 *   ──────────────────────────
 *   Upgrade Payment      ₹427
 *
 * @param currentPlanName  e.g. "Basic"
 * @param result           ProrationResult from calcClientProration()
 */
export function formatProrationLines(
  currentPlanName: string,
  result: ProrationResult,
): Array<{ label: string; value: string; isCredit?: boolean; isTotal?: boolean }> {
  const lines: Array<{ label: string; value: string; isCredit?: boolean; isTotal?: boolean }> = [];

  if (result.creditRupees > 0) {
    lines.push({
      label: `${currentPlanName} credit (${result.remainingDays}d remaining)`,
      value: `−${formatInrRupees(result.creditRupees)}`,
      isCredit: true,
    });
  }

  lines.push({
    label: "Upgrade payment",
    value: formatInrRupees(result.upgradeRupees),
    isTotal: true,
  });

  return lines;
}

/** Generates the idempotency key for a mock upgrade payment. */
export function generateUpgradeIdempotencyKey(
  userId: string,
  currentTier: string,
  targetTier: string,
  billingInterval: string,
): string {
  const dateKey = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  return `mock_upgrade_${userId}_${currentTier}_to_${targetTier}_${billingInterval}_${dateKey}`;
}
