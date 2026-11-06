/**
 * GVRZE Currency Registry
 *
 * Defines every currency that may ever be used by GVRZE payments.
 * Controls:
 *   - Minor unit conversion (never float arithmetic for payments)
 *   - Display formatting
 *   - Zero-decimal currencies (JPY, KRW, etc.)
 *   - 3-decimal currencies (KWD, BHD, etc.)
 *   - Which currencies are ENABLED in GVRZE config (independent of gateway support)
 *
 * HOW TO ENABLE A NEW CURRENCY:
 *   1. Add/verify its entry in CURRENCY_REGISTRY below.
 *   2. Set `enabled: true`.
 *   3. Verify the gateway (Razorpay, Stripe, etc.) supports it.
 *   4. Add currency-specific product prices in the DB.
 *   5. Verify tax and shipping calculations for that currency's country.
 *   6. Do NOT enable without approval (see INTERNATIONAL_EXPANSION_CHECKLIST).
 *
 * MINOR UNIT RULES (ISO 4217):
 *   - Most currencies: 2 decimal places (multiply rupees/dollars by 100)
 *   - Zero-decimal:    JPY, KRW, VND, XAF, etc. (multiply by 1)
 *   - 3-decimal:       KWD, BHD, OMR, TND (multiply by 1000)
 *   - NEVER use floating-point for payment amounts
 *   - Use `toMinorUnits()` and `fromMinorUnits()` from this module
 */

import type { CurrencyCode } from "./types";

// ── Currency definition ───────────────────────────────────────────────────────

export type CurrencyDefinition = {
  /** ISO 4217 code */
  code: CurrencyCode;
  /** Human-readable name */
  name: string;
  /** Unicode symbol */
  symbol: string;
  /**
   * Number of minor units per major unit.
   * INR: 100 (paise), USD: 100 (cents), JPY: 1 (zero-decimal), KWD: 1000 (fils)
   */
  minorUnitFactor: number;
  /**
   * Decimal places for display (0 for JPY, 2 for most, 3 for KWD).
   * Note: minorUnitFactor = 10^decimalPlaces (except for some legacy codes).
   */
  decimalPlaces: number;
  /** BCP 47 locale for Intl.NumberFormat. */
  locale: string;
  /** Whether this currency is currently enabled in GVRZE. */
  enabled: boolean;
  /** Why disabled (if applicable) — human-readable note. */
  disabledReason?: string;
};

// ── Registry ──────────────────────────────────────────────────────────────────

export const CURRENCY_REGISTRY: Record<CurrencyCode, CurrencyDefinition> = {

  // ── ENABLED ──────────────────────────────────────────────────────────────

  INR: {
    code:            "INR",
    name:            "Indian Rupee",
    symbol:          "₹",
    minorUnitFactor: 100,      // paise
    decimalPlaces:   2,
    locale:          "en-IN",
    enabled:         true,
  },

  // ── ARCHITECTURALLY READY — not yet enabled ───────────────────────────────
  // Enable each with business owner approval after:
  //   1. Gateway support verified
  //   2. Tax implications reviewed
  //   3. Currency-specific product prices added
  //   4. International shipping configured

  USD: {
    code:            "USD",
    name:            "US Dollar",
    symbol:          "$",
    minorUnitFactor: 100,      // cents
    decimalPlaces:   2,
    locale:          "en-US",
    enabled:         false,
    disabledReason:  "Pending international expansion approval",
  },

  EUR: {
    code:            "EUR",
    name:            "Euro",
    symbol:          "€",
    minorUnitFactor: 100,      // cents
    decimalPlaces:   2,
    locale:          "de-DE",
    enabled:         false,
    disabledReason:  "Pending international expansion approval",
  },

  GBP: {
    code:            "GBP",
    name:            "British Pound",
    symbol:          "£",
    minorUnitFactor: 100,      // pence
    decimalPlaces:   2,
    locale:          "en-GB",
    enabled:         false,
    disabledReason:  "Pending international expansion approval",
  },

  SGD: {
    code:            "SGD",
    name:            "Singapore Dollar",
    symbol:          "S$",
    minorUnitFactor: 100,      // cents
    decimalPlaces:   2,
    locale:          "en-SG",
    enabled:         false,
    disabledReason:  "Pending international expansion approval",
  },

  AED: {
    code:            "AED",
    name:            "UAE Dirham",
    symbol:          "د.إ",
    minorUnitFactor: 100,      // fils
    decimalPlaces:   2,
    locale:          "ar-AE",
    enabled:         false,
    disabledReason:  "Pending international expansion approval",
  },

  JPY: {
    code:            "JPY",
    name:            "Japanese Yen",
    symbol:          "¥",
    minorUnitFactor: 1,        // zero-decimal currency
    decimalPlaces:   0,
    locale:          "ja-JP",
    enabled:         false,
    disabledReason:  "Pending international expansion approval",
  },
};

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Returns the currency definition for a code, or throws if not registered.
 */
export function getCurrency(code: CurrencyCode): CurrencyDefinition {
  const def = CURRENCY_REGISTRY[code];
  if (!def) throw new Error(`Unknown currency: ${code}`);
  return def;
}

/**
 * Returns all currently enabled currencies.
 */
export function getEnabledCurrencies(): CurrencyDefinition[] {
  return Object.values(CURRENCY_REGISTRY).filter(c => c.enabled);
}

/**
 * Converts a major unit amount (e.g. rupees) to minor units (paise).
 * Uses integer arithmetic — no floating point.
 *
 * Example: toMinorUnits(299.99, "INR") === 29999
 *
 * @param majorUnits - Display amount (may have decimal part)
 * @param currency   - ISO 4217 currency code
 */
export function toMinorUnits(majorUnits: number, currency: CurrencyCode): number {
  const def = getCurrency(currency);
  // Use string parsing to avoid floating-point precision issues
  const factor = def.minorUnitFactor;
  return Math.round(majorUnits * factor);
}

/**
 * Converts minor units to major units.
 * Returns a number — format with `formatCurrencyAmount()` for display.
 *
 * Example: fromMinorUnits(29999, "INR") === 299.99
 */
export function fromMinorUnits(minorUnits: number, currency: CurrencyCode): number {
  const def = getCurrency(currency);
  return minorUnits / def.minorUnitFactor;
}

/**
 * Formats a minor-unit amount as a locale-appropriate currency string.
 *
 * Example:
 *   formatCurrencyAmount(29999, "INR") → "₹299.99"
 *   formatCurrencyAmount(100,   "JPY") → "¥100"
 *   formatCurrencyAmount(1000,  "USD") → "$10.00"
 */
export function formatCurrencyAmount(minorUnits: number, currency: CurrencyCode): string {
  const def = getCurrency(currency);
  const majorUnits = fromMinorUnits(minorUnits, currency);
  return majorUnits.toLocaleString(def.locale, {
    style:                 "currency",
    currency:              def.code,
    minimumFractionDigits: def.decimalPlaces,
    maximumFractionDigits: def.decimalPlaces,
  });
}

/**
 * Validates that a minor-unit amount is valid for the given currency.
 *
 * Rules:
 *   - Must be a positive integer
 *   - For zero-decimal currencies, must already be in major units
 *   - For 2-decimal currencies, paise/cents (integer)
 */
export function validateMinorAmount(amount: number, currency: CurrencyCode): void {
  if (!Number.isInteger(amount)) {
    throw new Error(
      `Payment amount must be an integer (minor units). Got ${amount} for ${currency}. ` +
      `Use toMinorUnits() to convert.`
    );
  }
  if (amount <= 0) {
    throw new Error(`Payment amount must be positive. Got ${amount} for ${currency}.`);
  }
  const def = getCurrency(currency);
  if (!def.enabled) {
    throw new Error(
      `Currency ${currency} is not enabled in GVRZE. ` +
      (def.disabledReason ? `Reason: ${def.disabledReason}` : "")
    );
  }
}

/**
 * Returns whether two amounts in different currencies can be compared.
 * Always returns false (amounts in different currencies must never be compared).
 * Use this to guard against accidental cross-currency arithmetic.
 */
export function areSameCurrency(a: { currency: CurrencyCode }, b: { currency: CurrencyCode }): boolean {
  return a.currency === b.currency;
}

// ── Minimum charge amounts ────────────────────────────────────────────────────
// Razorpay requires minimum ₹1 (100 paise) for INR.
// Stripe requires minimum $0.50 (50 cents) for USD.

export const MINIMUM_CHARGE_MINOR: Partial<Record<CurrencyCode, number>> = {
  INR: 100,    // ₹1
  USD: 50,     // $0.50
  EUR: 50,     // €0.50
  GBP: 30,     // £0.30
};

export function getMinimumChargeMinor(currency: CurrencyCode): number {
  return MINIMUM_CHARGE_MINOR[currency] ?? 100;
}
