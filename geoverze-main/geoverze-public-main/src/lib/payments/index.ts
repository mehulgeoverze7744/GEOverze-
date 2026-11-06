/**
 * GVRZE Unified Payment Infrastructure — Public API
 *
 * Import from "@/lib/payments" for all payment-related types and utilities.
 * Server functions should use getPaymentRouter() for all payment operations.
 *
 * BROWSER-SAFE exports: types, currencies, countries, shippingZones, config
 * SERVER-ONLY: PaymentRouter, provider adapters (contain crypto/fetch/process.env)
 */

// Core types
export type {
  ProviderId,
  CurrencyCode,
  CountryCode,
  BillingType,
  PaymentPurpose,
  PaymentStatus,
  SubscriptionStatus,
  PaymentMethodType,
  ProviderCapabilities,
  CreateOneTimePaymentIntent,
  CreateSubscriptionIntent,
  OneTimePaymentResult,
  SubscriptionResult,
  PaymentVerification,
  VerificationResult,
  RefundRequest,
  RefundResult,
  WebhookEvent,
  WebhookResult,
  PaymentReference,
  PaymentAuditEvent,
  PaymentAuditLogEntry,
  ProviderSelectionCriteria,
} from "./types";

// Provider interface
export type { PaymentProviderInterface } from "./PaymentProviderInterface";

// Currency utilities
export {
  CURRENCY_REGISTRY,
  getCurrency,
  getEnabledCurrencies,
  toMinorUnits,
  fromMinorUnits,
  formatCurrencyAmount,
  validateMinorAmount,
  areSameCurrency,
  getMinimumChargeMinor,
  MINIMUM_CHARGE_MINOR,
} from "./currencies";
export type { CurrencyDefinition } from "./currencies";

// Country utilities
export {
  COUNTRY_CONFIGS,
  getCountryConfig,
  getEnabledCountries,
  getShippingEnabledCountries,
  isCountryEnabled,
  isShippingEnabled,
  getDefaultCurrency,
  validatePostalCode,
  validatePhone,
} from "./countries";
export type { CountryConfig, AddressFormat, TaxConfig } from "./countries";

// Shipping zones
export {
  SHIPPING_ZONES,
  getShippingZone,
  getZoneForCountry,
  getEnabledShippingZones,
  computeShippingCost,
  getAvailableShippingMethods,
  canShipTo,
} from "./shippingZones";
export type { ShippingZone, ShippingMethodRate } from "./shippingZones";

// Configuration
export {
  PROVIDER_CONFIG,
  PAYMENT_ROUTING_RULES,
  FEATURE_FLAGS,
  selectProvider,
  isProviderEnabled,
  getActiveProviders,
} from "./config";
export type { ProviderConfig, RoutingRule, FeatureFlags } from "./config";

// Router — used in createServerFn handlers only (not directly in browser components)
export { PaymentRouter, getPaymentRouter, registerProvider, setAuditLogger } from "./PaymentRouter";

// Server functions — these export createServerFn instances (safe to import from client)
export {
  getPaymentInfraConfigFn,
  createUnifiedOneTimePaymentFn,
  verifyUnifiedPaymentFn,
  getAdminPaymentAuditLogFn,
  getAdminPaymentConfigFn,
  formatPaymentAmount,
} from "./paymentServerFns";
export type { PaymentInfraConfig } from "./paymentServerFns";
