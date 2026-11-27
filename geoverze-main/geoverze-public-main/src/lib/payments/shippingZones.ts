/**
 * Shipping zones and method rates for GVRZE commerce.
 * Gstore checkout uses gstoreProductPrices.computeShippingMinor for India physical orders.
 */

export type CountryCode = "IN" | "US" | "GB" | string;

export type ShippingMethodRate = {
  id: string;
  label: string;
  note: string;
  priceMinor: number;
  trackable: boolean;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  carrier: string;
};

export type ShippingZone = {
  id: string;
  name: string;
  countries: CountryCode[];
  currency: string;
  enabled: boolean;
  disabledReason?: string;
  methods: ShippingMethodRate[];
  freeShippingThresholdMinor: number;
  supportsPhysical: boolean;
  supportsDigital: boolean;
  operationsNotes: string;
};

export const SHIPPING_ZONES: Record<string, ShippingZone> = {

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
        note:              "Delivery within 7 days",
        priceMinor:        0,
        trackable:         false,
        estimatedDaysMin:  5,
        estimatedDaysMax:  7,
        carrier:           "India Post / Delhivery",
      },
      {
        id:                "express",
        label:             "Express Delivery",
        note:              "Priority delivery within 3–4 days",
        priceMinor:        15_000,
        trackable:         true,
        estimatedDaysMin:  3,
        estimatedDaysMax:  4,
        carrier:           "Delhivery / BlueDart",
      },
    ],
    freeShippingThresholdMinor: 0,
    supportsPhysical:  true,
    supportsDigital:   true,
    operationsNotes:   "COD is NOT offered. Prepaid only via Razorpay.",
  },

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
        priceMinor:        1500,
        trackable:         true,
        estimatedDaysMin:  14,
        estimatedDaysMax:  21,
        carrier:           "TBD",
      },
    ],
    freeShippingThresholdMinor: 0,
    supportsPhysical:  true,
    supportsDigital:   true,
    operationsNotes:   "Customs duties paid by recipient (DDP vs DDU TBD).",
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
        priceMinor:        1200,
        trackable:         true,
        estimatedDaysMin:  10,
        estimatedDaysMax:  14,
        carrier:           "TBD",
      },
    ],
    freeShippingThresholdMinor: 0,
    supportsPhysical:  true,
    supportsDigital:   true,
    operationsNotes:   "Post-Brexit customs implications for UK.",
  },
};

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

export function computeShippingCost(
  zoneId: string,
  methodId: string,
  _subtotalMinor: number,
  hasPhysical: boolean,
): number {
  if (!hasPhysical) return 0;

  const zone = getShippingZone(zoneId);
  if (!zone) return 0;

  const method = zone.methods.find(m => m.id === methodId);
  if (!method) return 0;

  return method.priceMinor;
}

export function getAvailableShippingMethods(zoneId: string): ShippingMethodRate[] {
  return SHIPPING_ZONES[zoneId]?.methods ?? [];
}

export function canShipTo(countryCode: CountryCode): boolean {
  return Object.values(SHIPPING_ZONES).some(
    z => z.enabled && z.supportsPhysical && z.countries.includes(countryCode)
  );
}