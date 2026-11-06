/**
 * GVRZE Country Configuration
 *
 * Defines country-specific payment and checkout rules.
 * Controls:
 *   - Which countries are enabled for checkout
 *   - Default currency per country
 *   - Supported payment methods per country
 *   - Address field requirements per country
 *   - Tax behavior per country
 *   - International shipping eligibility
 *
 * HOW TO ENABLE A NEW COUNTRY:
 *   1. Add/verify its entry in COUNTRY_CONFIGS below.
 *   2. Set `enabled: true` after business approval.
 *   3. Configure applicable payment methods and gateways.
 *   4. Add shipping zone configuration in shippingZones.ts.
 *   5. Configure applicable tax rules.
 *   6. Verify checkout field validation is correct for the country.
 *   7. Do NOT enable without approval (legal/tax/compliance review required).
 *
 * ADDRESS FIELD REQUIREMENTS:
 *   Different countries require different address fields.
 *   India:   line1, city, state, pincode (6 digits), phone (10 digits, 6-9 start)
 *   US:      line1, city, state (2-letter), zip (5-9 digits)
 *   UK:      line1, city, postcode (alphanumeric)
 *   UAE:     line1, emirate, pobox (optional)
 */

import type { CurrencyCode, CountryCode, PaymentMethodType } from "./types";

// ── Country definition ────────────────────────────────────────────────────────

export type AddressFormat = {
  /** Line 1 label (e.g. "Address Line 1", "Street Address") */
  line1Label: string;
  /** Whether line 2 is shown */
  hasLine2: boolean;
  line2Label?: string;
  /** Administrative division (state, province, emirate, county) */
  stateLabel: string;
  /** Postal code label */
  postalCodeLabel: string;
  /** Postal code regex for validation */
  postalCodePattern?: RegExp;
  postalCodeExample?: string;
  /** Phone validation regex (after stripping country code) */
  phonePattern?: RegExp;
  phoneExample?: string;
  phoneLabel?: string;
};

export type TaxConfig = {
  /** Tax authority name (e.g. "GST", "VAT", "Sales Tax") */
  taxName: string;
  /** Tax rate as a decimal (0.18 = 18%) */
  rate: number;
  /** Whether the displayed price already includes tax */
  taxInclusive: boolean;
  /** Whether to show tax registration field (B2B) */
  hasTaxId: boolean;
  taxIdLabel?: string;
  taxIdExample?: string;
};

export type CountryConfig = {
  /** ISO 3166-1 alpha-2 code */
  code: CountryCode;
  name: string;
  /** Unicode flag emoji */
  flag: string;
  /** Default currency for this country */
  defaultCurrency: CurrencyCode;
  /** Supported payment methods (ordered by prominence) */
  paymentMethods: PaymentMethodType[];
  /** Address format requirements */
  addressFormat: AddressFormat;
  /** Tax configuration */
  tax: TaxConfig;
  /** Whether checkout is enabled for this country */
  enabled: boolean;
  disabledReason?: string;
  /** Whether physical products can be shipped here */
  shippingEnabled: boolean;
  shippingDisabledReason?: string;
  /** Phone country code (e.g. "+91" for India) */
  phoneCountryCode: string;
  /** Whether digital subscriptions are available */
  subscriptionsEnabled: boolean;
};

// ── Country configurations ────────────────────────────────────────────────────

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {

  // ── ENABLED ────────────────────────────────────────────────────────────────

  IN: {
    code:            "IN",
    name:            "India",
    flag:            "🇮🇳",
    defaultCurrency: "INR",
    paymentMethods:  ["card", "upi", "netbanking", "wallet", "emi"],
    phoneCountryCode: "+91",
    addressFormat: {
      line1Label:          "Flat / House No., Building, Street",
      hasLine2:            true,
      line2Label:          "Area, Landmark",
      stateLabel:          "State",
      postalCodeLabel:     "PIN Code",
      postalCodePattern:   /^[1-9][0-9]{5}$/,
      postalCodeExample:   "400001",
      phonePattern:        /^[6-9][0-9]{9}$/,
      phoneExample:        "9876543210 (without +91)",
      phoneLabel:          "Mobile Number",
    },
    tax: {
      taxName:       "GST",
      rate:          0.18,
      taxInclusive:  false,   // We add 18% GST on top of listed prices
      hasTaxId:      true,
      taxIdLabel:    "GSTIN (optional — for B2B invoices)",
      taxIdExample:  "22AAAAA0000A1Z5",
    },
    enabled:              true,
    shippingEnabled:      true,
    subscriptionsEnabled: true,
  },

  // ── ARCHITECTURALLY READY — not yet enabled ───────────────────────────────
  // Set enabled: true only after:
  //   1. Legal and tax review for the country
  //   2. Payment gateway support verified
  //   3. Currency enabled in currencies.ts
  //   4. Shipping costs and rules configured in shippingZones.ts
  //   5. Business owner approval

  US: {
    code:            "US",
    name:            "United States",
    flag:            "🇺🇸",
    defaultCurrency: "USD",
    paymentMethods:  ["card", "apple_pay", "google_pay", "bank_transfer"],
    phoneCountryCode: "+1",
    addressFormat: {
      line1Label:          "Street Address",
      hasLine2:            true,
      line2Label:          "Apt, Suite, Unit",
      stateLabel:          "State",
      postalCodeLabel:     "ZIP Code",
      postalCodePattern:   /^\d{5}(-\d{4})?$/,
      postalCodeExample:   "10001",
      phoneLabel:          "Phone Number",
    },
    tax: {
      taxName:       "Sales Tax",
      rate:          0,         // Varies by state — requires tax engine
      taxInclusive:  false,
      hasTaxId:      false,
    },
    enabled:              false,
    disabledReason:       "Pending international expansion approval",
    shippingEnabled:      false,
    shippingDisabledReason: "Pending international shipping setup",
    subscriptionsEnabled: false,
  },

  GB: {
    code:            "GB",
    name:            "United Kingdom",
    flag:            "🇬🇧",
    defaultCurrency: "GBP",
    paymentMethods:  ["card", "apple_pay", "google_pay", "klarna"],
    phoneCountryCode: "+44",
    addressFormat: {
      line1Label:          "Address Line 1",
      hasLine2:            true,
      line2Label:          "Address Line 2",
      stateLabel:          "County",
      postalCodeLabel:     "Postcode",
      postalCodePattern:   /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
      postalCodeExample:   "SW1A 1AA",
      phoneLabel:          "Phone Number",
    },
    tax: {
      taxName:       "VAT",
      rate:          0.20,
      taxInclusive:  true,    // UK prices typically include VAT
      hasTaxId:      true,
      taxIdLabel:    "VAT Number (optional)",
    },
    enabled:              false,
    disabledReason:       "Pending international expansion approval",
    shippingEnabled:      false,
    shippingDisabledReason: "Pending international shipping setup",
    subscriptionsEnabled: false,
  },

  SG: {
    code:            "SG",
    name:            "Singapore",
    flag:            "🇸🇬",
    defaultCurrency: "SGD",
    paymentMethods:  ["card", "apple_pay", "google_pay", "bank_transfer"],
    phoneCountryCode: "+65",
    addressFormat: {
      line1Label:          "Block and Street Name",
      hasLine2:            true,
      line2Label:          "Unit Number",
      stateLabel:          "Region",
      postalCodeLabel:     "Postal Code",
      postalCodePattern:   /^\d{6}$/,
      postalCodeExample:   "238823",
      phoneLabel:          "Phone Number",
    },
    tax: {
      taxName:       "GST",
      rate:          0.09,
      taxInclusive:  false,
      hasTaxId:      false,
    },
    enabled:              false,
    disabledReason:       "Pending international expansion approval",
    shippingEnabled:      false,
    shippingDisabledReason: "Pending international shipping setup",
    subscriptionsEnabled: false,
  },

  AE: {
    code:            "AE",
    name:            "United Arab Emirates",
    flag:            "🇦🇪",
    defaultCurrency: "AED",
    paymentMethods:  ["card"],
    phoneCountryCode: "+971",
    addressFormat: {
      line1Label:          "Building and Street",
      hasLine2:            true,
      line2Label:          "P.O. Box (optional)",
      stateLabel:          "Emirate",
      postalCodeLabel:     "P.O. Box",
      postalCodeExample:   "12345",
      phoneLabel:          "Phone Number",
    },
    tax: {
      taxName:       "VAT",
      rate:          0.05,
      taxInclusive:  false,
      hasTaxId:      true,
      taxIdLabel:    "VAT TRN (optional)",
    },
    enabled:              false,
    disabledReason:       "Pending international expansion approval",
    shippingEnabled:      false,
    shippingDisabledReason: "Pending international shipping setup",
    subscriptionsEnabled: false,
  },
};

// ── Helper functions ──────────────────────────────────────────────────────────

export function getCountryConfig(code: CountryCode): CountryConfig | null {
  return COUNTRY_CONFIGS[code] ?? null;
}

export function getEnabledCountries(): CountryConfig[] {
  return Object.values(COUNTRY_CONFIGS).filter(c => c.enabled);
}

export function getShippingEnabledCountries(): CountryConfig[] {
  return Object.values(COUNTRY_CONFIGS).filter(c => c.enabled && c.shippingEnabled);
}

export function isCountryEnabled(code: CountryCode): boolean {
  return COUNTRY_CONFIGS[code]?.enabled ?? false;
}

export function isShippingEnabled(code: CountryCode): boolean {
  const config = COUNTRY_CONFIGS[code];
  return (config?.enabled ?? false) && (config?.shippingEnabled ?? false);
}

export function getDefaultCurrency(code: CountryCode): CurrencyCode {
  return COUNTRY_CONFIGS[code]?.defaultCurrency ?? "INR";
}

export function validatePostalCode(postalCode: string, countryCode: CountryCode): string | null {
  const config = COUNTRY_CONFIGS[countryCode];
  if (!config) return `Country ${countryCode} not supported`;
  const pattern = config.addressFormat.postalCodePattern;
  if (!pattern) return null; // No pattern = no validation
  if (!pattern.test(postalCode.trim())) {
    return `Invalid ${config.addressFormat.postalCodeLabel}. Example: ${config.addressFormat.postalCodeExample ?? ""}`;
  }
  return null;
}

export function validatePhone(phone: string, countryCode: CountryCode): string | null {
  const config = COUNTRY_CONFIGS[countryCode];
  if (!config) return `Country ${countryCode} not supported`;
  const pattern = config.addressFormat.phonePattern;
  if (!pattern) return null;
  // Strip country code prefix if present
  const stripped = phone.replace(/^\+91|^\+1|^\+44|^\+65|^\+971/, "").replace(/\s/g, "");
  if (!pattern.test(stripped)) {
    return `Invalid ${config.addressFormat.phoneLabel ?? "phone number"}. Example: ${config.addressFormat.phoneExample ?? ""}`;
  }
  return null;
}
