/**
 * GVRZE Shipping Zone Configuration
 *
 * Defines shipping zones, rates, and rules for Gstore physical product delivery.
 *
 * CURRENT STATE:
 *   India-only shipping is active.
 *   International shipping is architecturally defined but NOT enabled.
 *
 * HOW TO ENABLE A NEW SHIPPING ZONE:
 *   1. Add a zone definition in SHIPPING_ZONES below.
 *   2. Set `enabled: true` after:
 *      a. Shipping carrier contracts signed
 *      b. Delivery cost and rules confirmed
 *      c. Customs/duties handling decided
 *      d. Product weight/dimension data populated
 *      e. Delivery time estimates confirmed
 *      f. Business owner approval
 *   3. Update the country config in countries.ts to set `shippingEnabled: true`.
 *   4. Notify users of the new region.
 *
 * SHIPPING METHODS:
 *   Each zone defines its available shipping methods and costs.
 *   Costs are in the zone's default currency minor units.
 *
 * FREE SHIPPING:
 *   Zones may define a free-shipping threshold (order total above which
 *   the standard method becomes free).
 */

import type { CurrencyCode, CountryCode } from "./types";

// ── Shipping method definition ─────────────────────────────────────────────────

export type ShippingMethodRate = {
  /** Machine-readable ID used in DB records. */
  id: string;
  /** Display name shown to the user at checkout. */
  label: string;
  /** Short description of delivery time. */
  note: string;
  /** Cost in minor units of the zone's currency. 0 = free. */
  priceMinor: number;
  /** Whether this method supports parcel tracking. */
  trackable: boolean;
  /** Estimated delivery in business days (range). */
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  /** Carrier name (for tracking link generation). */
  carrier?: string;
};

// ── Shipping zone definition ──────────────────────────────────────────────────

export type ShippingZone = {
  /** Unique zone ID (used in DB and config). */
  id: string;
  /** Display name. */
  name: string;
  /** Countries in this zone. */
  countries: CountryCode[];
  /** Default currency for this zone's pricing. */
  currency: CurrencyCode;
  /** Whether this zone is active for Gstore checkout. */
  enabled: boolean;
  disabledReason?: string;
  /** Available shipping methods, ordered by display preference. */
  methods: ShippingMethodRate[];
  /** Order total (minor units) above which the standard method is free. */
  freeShippingThresholdMinor: number;
  /** Whether the zone supports physical product delivery. */
  supportsPhysical: boolean;
  /** Whether digital-only orders (no shipping) are allowed from this zone. */
  supportsDigital: boolean;
  /** Notes about customs, duties, restricted items (for ops reference). */
  operationsNotes?: string;
};

// ── Zone definitions ──────────────────────────────────────────────────────────

export const SHIPPING_ZONES: Record<string, ShippingZone> = {

  // ── ENABLED ────────────────────────────────────────────────────────────────

  india: {
    id:          "india",
    name:        "India",
    countries:   ["IN"],
    currency:    "INR",
    enabled:     true,
    methods: [
      {
        id:                "standard",
        label:             "Standard Delivery",
        note:              "5–7 business days · Free above ₹3,999",
        priceMinor:        0,         // Cost when below threshold: computed dynamically
        trackable:         false,
        estimatedDaysMin:  5,
        estimatedDaysMax:  7,
        carrier:           "India Post / Delhivery",
      },
      {
        id:                "tracked",
        label:             "Tracked Delivery",
        note:              "3–5 business days with tracking",
        priceMinor:        69_000,    // ₹690
        trackable:         true,
        estimatedDaysMin:  3,
        estimatedDaysMax:  5,
        carrier:           "Delhivery / DTDC",
      },
      {
        id:                "express",
        label:             "Express Delivery",
        note:              "1–2 business days",
        priceMinor:        149_900,   // ₹1,499
        trackable:         true,
        estimatedDaysMin:  1,
        estimatedDaysMax:  2,
        carrier:           "BlueDart / FedEx India",
      },
    ],
    freeShippingThresholdMinor: 399_900,   // ₹3,999
    supportsPhysical:  true,
    supportsDigital:   true,
    operationsNotes:   "COD is NOT offered. Prepaid only via Razorpay.",
  },

  // ── NOT YET ENABLED ────────────────────────────────────────────────────────

  us_canada: {
    id:          "us_canada",
    name:        "United States & Canada",
    countries:   ["US"],
    currency:    "USD",
    enabled:     false,
    disabledReason: "Pending international shipping carrier contracts and customs handling setup",
    methods: [
      {
        id:                "standard_intl",
        label:             "Standard International",
        note:              "14–21 business days",
        priceMinor:        1500,      // $15.00 — PLACEHOLDER, verify with carrier
        trackable:         true,
        estimatedDaysMin:  14,
        estimatedDaysMax:  21,
        carrier:           "TBD",
      },
      {
        id:                "express_intl",
        label:             "Express International",
        note:              "5–7 business days",
        priceMinor:        3500,      // $35.00 — PLACEHOLDER
        trackable:         true,
        estimatedDaysMin:  5,
        estimatedDaysMax:  7,
        carrier:           "TBD",
      },
    ],
    freeShippingThresholdMinor: 15000,   // $150.00 — PLACEHOLDER
    supportsPhysical:  true,
    supportsDigital:   true,
    operationsNotes:   "Customs duties paid by recipient (DDP vs DDU TBD). Check restricted items list.",
  },

  europe: {
    id:          "europe",
    name:        "Europe (UK + EU)",
    countries:   ["GB"],
    currency:    "GBP",
    enabled:     false,
    disabledReason: "Pending international shipping setup",
    methods: [
      {
        id:                "standard_eu",
        label:             "Standard International",
        note:              "10–14 business days",
        priceMinor:        1200,      // £12.00 — PLACEHOLDER
        trackable:         true,
        estimatedDaysMin:  10,
        estimatedDaysMax:  14,
        carrier:           "TBD",
      },
    ],
    freeShippingThresholdMinor: 10000,   // £100 — PLACEHOLDER
    supportsPhysical:  true,
    supportsDigital:   true,
    operationsNotes:   "Post-Brexit customs implications for UK. VAT OSS may apply for EU.",
  },
};

// ── Helper functions ──────────────────────────────────────────────────────────

export function getShippingZone(zoneId: string): ShippingZone | null {
  return SHIPPING_ZONES[zoneId] ?? null;
}

export function getZoneForCountry(countryCode: CountryCode): ShippingZone | null {
  return Object.values(SHIPPING_ZONES).find(z =>
    z.enabled && z.countries.includes(countryCode)
  ) ?? null;
}

export function getEnabledShippingZones(): ShippingZone[] {
  return Object.values(SHIPPING_ZONES).filter(z => z.enabled);
}

/**
 * Compute shipping cost for a given method in a zone.
 * Standard shipping is free when subtotal >= freeShippingThresholdMinor.
 *
 * @param zoneId       - Shipping zone ID (e.g. "india")
 * @param methodId     - Shipping method ID (e.g. "standard", "tracked")
 * @param subtotalMinor - Order subtotal in minor units
 * @param hasPhysical  - Whether the order contains physical products
 * @returns Cost in minor units (0 = free)
 */
export function computeShippingCost(
  zoneId: string,
  methodId: string,
  subtotalMinor: number,
  hasPhysical: boolean,
): number {
  if (!hasPhysical) return 0;

  const zone = getShippingZone(zoneId);
  if (!zone) return 0;

  const method = zone.methods.find(m => m.id === methodId);
  if (!method) return 0;

  // Standard method is free above threshold
  if (methodId === "standard" && subtotalMinor >= zone.freeShippingThresholdMinor) {
    return 0;
  }

  return method.priceMinor;
}

/**
 * Returns the available shipping methods for a given zone.
 */
export function getAvailableShippingMethods(zoneId: string): ShippingMethodRate[] {
  return SHIPPING_ZONES[zoneId]?.methods ?? [];
}

/**
 * Returns the first enabled zone that ships to a given country.
 */
export function canShipTo(countryCode: CountryCode): boolean {
  return Object.values(SHIPPING_ZONES).some(
    z => z.enabled && z.supportsPhysical && z.countries.includes(countryCode)
  );
}
