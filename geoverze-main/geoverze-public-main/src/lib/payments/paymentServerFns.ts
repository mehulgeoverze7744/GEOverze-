/**
 * GVRZE Unified Payment Server Functions
 *
 * These TanStack Start server functions provide the HTTP layer over the
 * PaymentRouter abstraction. They are called from client-side checkout flows.
 *
 * SECURITY:
 *   - All amounts and prices are validated server-side
 *   - Secret keys never leave the server (process.env only)
 *   - Webhook signatures verified before processing
 *   - Audit log written for every payment event
 *   - Guest orders use service role key (server-side only)
 *
 * USAGE IN CHECKOUT SCREENS:
 *   import { getPaymentInfraConfigFn } from "@/lib/payments/server/paymentServerFns";
 *   const { data: config } = usePaymentConfig(); // existing hook, unchanged
 *
 * DIRECT USAGE (server-side context):
 *   const router = getPaymentRouter(isMockEnabled());
 *   const result = await router.createOneTimePayment({ ... });
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import { getPaymentRouter } from "./PaymentRouter";
import {
  PROVIDER_CONFIG,
  FEATURE_FLAGS,
} from "./config";
import {
  getEnabledCurrencies,
  formatCurrencyAmount,
} from "./currencies";
import {
  getEnabledCountries,
} from "./countries";
import {
  getEnabledShippingZones,
  getAvailableShippingMethods,
} from "./shippingZones";
import type { CurrencyCode, CountryCode, BillingType } from "../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isMockEnabled(): boolean {
  return (
    process.env["MOCK_PAYMENTS_ENABLED"] === "true" ||
    process.env["VITE_MOCK_PAYMENTS"] === "true"
  );
}

function makeServiceClient() {
  const url         = process.env["VITE_SUPABASE_URL"] ?? "";
  const serviceRole = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  if (!url || !serviceRole) throw new Error("Supabase service role not configured.");
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

// ── 1. getPaymentInfraConfigFn ────────────────────────────────────────────────
//
// Returns the full payment infrastructure configuration:
//   - Active providers
//   - Enabled currencies
//   - Enabled countries
//   - Shipping zones
//   - Feature flags
//   - Mock mode status
//
// Used by admin dashboard and checkout preload.
// Replaces and extends getPaymentConfig from getPaymentConfig.ts.

export type PaymentInfraConfig = {
  mockEnabled: boolean;
  activeProviders: Array<{
    id: string;
    name: string;
    enabled: boolean;
    supportsOneTime: boolean;
    supportsSubscriptions: boolean;
    supportedCountries: string[];
    supportedCurrencies: string[];
    adminNote?: string;
  }>;
  enabledCurrencies: Array<{ code: string; name: string; symbol: string }>;
  enabledCountries: Array<{ code: string; name: string; flag: string; currency: string }>;
  shippingZones: Array<{
    id: string;
    name: string;
    countries: string[];
    currency: string;
    enabled: boolean;
    methods: Array<{ id: string; label: string; priceMinor: number }>;
  }>;
  featureFlags: typeof FEATURE_FLAGS;
  razorpayKeyId: string;
};

export const getPaymentInfraConfigFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PaymentInfraConfig> => {
    const mockEnabled = isMockEnabled();

    return {
      mockEnabled,
      activeProviders: Object.values(PROVIDER_CONFIG).map(p => ({
        id:                    p.id,
        name:                  p.name,
        enabled:               p.enabled || (p.id === "mock" && mockEnabled),
        supportsOneTime:       p.supportsOneTime,
        supportsSubscriptions: p.supportsSubscriptions,
        supportedCountries:    p.supportedCountries,
        supportedCurrencies:   p.supportedCurrencies,
        adminNote:             p.adminNote,
      })),
      enabledCurrencies: getEnabledCurrencies().map(c => ({
        code:   c.code,
        name:   c.name,
        symbol: c.symbol,
      })),
      enabledCountries: getEnabledCountries().map(c => ({
        code:     c.code,
        name:     c.name,
        flag:     c.flag,
        currency: c.defaultCurrency,
      })),
      shippingZones: getEnabledShippingZones().map(z => ({
        id:       z.id,
        name:     z.name,
        countries: z.countries,
        currency: z.currency,
        enabled:  z.enabled,
        methods:  getAvailableShippingMethods(z.id).map(m => ({
          id:         m.id,
          label:      m.label,
          priceMinor: m.priceMinor,
        })),
      })),
      featureFlags: FEATURE_FLAGS,
      razorpayKeyId: (
        process.env["RAZORPAY_KEY_ID"] ??
        process.env["VITE_RAZORPAY_KEY_ID"] ??
        ""
      ),
    };
  },
);

// ── 2. createUnifiedOneTimePaymentFn ─────────────────────────────────────────
//
// Provider-agnostic one-time payment creation.
// Routes to the correct provider via PaymentRouter.
// Currently routes to Razorpay for India/INR.
//
// This is an ALTERNATIVE to calling createGstoreOrderFn directly.
// Use this for new features; existing Gstore checkout can be migrated over time.

const CreateUnifiedPaymentSchema = z.object({
  access_token:    z.string().optional(),
  guest_mode:      z.boolean().optional().default(false),
  country:         z.string().min(2).max(2).optional().default("IN"),
  currency:        z.string().min(3).max(3).optional().default("INR"),
  order_id:        z.string().uuid(),
  payment_id:      z.string().uuid(),
  order_number:    z.string().min(1),
  amount_minor:    z.number().int().positive(),
  customer: z.object({
    name:    z.string().min(1),
    email:   z.string().email(),
    phone:   z.string().optional(),
  }),
  idempotency_key: z.string().min(1),
  is_mock:         z.boolean().optional().default(false),
});

export const createUnifiedOneTimePaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => CreateUnifiedPaymentSchema.parse(raw))
  .handler(async ({ data }) => {
    const mockEnabled = isMockEnabled();
    const router      = getPaymentRouter(mockEnabled);

    const result = await router.createOneTimePayment({
      amountMinor:     data.amount_minor,
      currency:        data.currency as CurrencyCode,
      country:         data.country as CountryCode,
      purpose:         "GSTORE_ORDER",
      billingType:     "ONE_TIME",
      orderId:         data.order_id,
      paymentId:       data.payment_id,
      orderNumber:     data.order_number,
      customer: {
        name:        data.customer.name,
        email:       data.customer.email,
        phone:       data.customer.phone,
        countryCode: data.country as CountryCode,
      },
      idempotencyKey:  data.idempotency_key,
      isMock:          mockEnabled || data.is_mock,
      providerOptions: {},
    });

    // Write to audit log
    try {
      const svc = makeServiceClient();
      await svc.rpc("insert_payment_audit_log", {
        p_event:       "payment_intent_created",
        p_provider:    result.providerId,
        p_billing_type: "ONE_TIME",
        p_purpose:     "GSTORE_ORDER",
        p_success:     true,
        p_amount_minor: data.amount_minor,
        p_currency:    data.currency,
        p_order_id:    data.order_id,
        p_payment_id:  data.payment_id,
        p_provider_order_id: result.providerOrderId,
      });
    } catch { /* audit failure should not block payment */ }

    return result;
  });

// ── 3. verifyUnifiedPaymentFn ─────────────────────────────────────────────────
//
// Provider-agnostic payment verification.
// Routes to the correct provider via PaymentRouter for HMAC verification.

const VerifyUnifiedPaymentSchema = z.object({
  billing_type:          z.enum(["ONE_TIME", "RECURRING"]),
  purpose:               z.string().optional().default("GSTORE_ORDER"),
  country:               z.string().min(2).max(2).optional().default("IN"),
  currency:              z.string().min(3).max(3).optional().default("INR"),
  order_id:              z.string().uuid(),
  payment_id:            z.string().uuid(),
  provider_order_id:     z.string().min(1),
  provider_payment_id:   z.string().min(1),
  provider_signature:    z.string().min(1),
  amount_minor:          z.number().int().positive(),
  access_token:          z.string().optional(),
  guest_token:           z.string().optional(),
});

export const verifyUnifiedPaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => VerifyUnifiedPaymentSchema.parse(raw))
  .handler(async ({ data }) => {
    const mockEnabled = isMockEnabled();
    const router      = getPaymentRouter(mockEnabled);

    const result = await router.verifyPayment({
      billingType:         data.billing_type as BillingType,
      purpose:             data.purpose as "GSTORE_ORDER",
      country:             data.country as CountryCode,
      currency:            data.currency as CurrencyCode,
      orderId:             data.order_id,
      paymentId:           data.payment_id,
      providerOrderId:     data.provider_order_id,
      providerPaymentId:   data.provider_payment_id,
      providerSignature:   data.provider_signature,
      amountMinor:         data.amount_minor,
      accessToken:         data.access_token,
      guestToken:          data.guest_token,
    });

    // Write to audit log
    try {
      const svc = makeServiceClient();
      await svc.rpc("insert_payment_audit_log", {
        p_event:               result.verified ? "payment_verified" : "payment_failed",
        p_provider:            "razorpay",
        p_billing_type:        data.billing_type,
        p_purpose:             data.purpose,
        p_success:             result.verified,
        p_amount_minor:        data.amount_minor,
        p_currency:            data.currency,
        p_order_id:            data.order_id,
        p_payment_id:          data.payment_id,
        p_provider_order_id:   data.provider_order_id,
        p_provider_payment_id: data.provider_payment_id,
        p_error:               result.message ?? null,
      });
    } catch { /* audit failure should not block verification */ }

    return result;
  });

// ── 4. getAdminPaymentAuditLogFn ──────────────────────────────────────────────
//
// Admin-only: returns recent payment audit log entries.

const AdminAuditLogSchema = z.object({
  access_token: z.string().min(10),
  provider:     z.string().optional(),
  event:        z.string().optional(),
  order_id:     z.string().optional(),
  limit:        z.number().int().min(1).max(500).optional().default(100),
  offset:       z.number().int().min(0).optional().default(0),
});

export const getAdminPaymentAuditLogFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => AdminAuditLogSchema.parse(raw))
  .handler(async ({ data }) => {
    // Verify admin
    const url     = process.env["VITE_SUPABASE_URL"] ?? "";
    const anonKey = process.env["VITE_SUPABASE_ANON_KEY"] ?? "";
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${data.access_token}` } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated.");

    const adminEmails = (process.env["GSTORE_ADMIN_EMAILS"] ?? "")
      .split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
      throw new Error("Admin access required.");
    }

    const svc = makeServiceClient();
    const { data: logs, error } = await svc.rpc("admin_get_payment_audit_log", {
      p_provider: data.provider ?? null,
      p_event:    data.event ?? null,
      p_order_id: data.order_id ?? null,
      p_limit:    data.limit ?? 100,
      p_offset:   data.offset ?? 0,
    });

    if (error) throw new Error(error.message);
    return { logs: (logs as unknown[]) ?? [] };
  });

// ── 5. getAdminPaymentConfigFn ────────────────────────────────────────────────
//
// Admin-only: full provider config including enabled state and DB state.

export const getAdminPaymentConfigFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => z.object({ access_token: z.string().min(10) }).parse(raw))
  .handler(async ({ data }) => {
    // Verify admin
    const url     = process.env["VITE_SUPABASE_URL"] ?? "";
    const anonKey = process.env["VITE_SUPABASE_ANON_KEY"] ?? "";
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${data.access_token}` } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated.");

    const adminEmails = (process.env["GSTORE_ADMIN_EMAILS"] ?? "")
      .split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
      throw new Error("Admin access required.");
    }

    const svc = makeServiceClient();

    // Fetch from DB
    const [providersRes, currenciesRes, zonesRes] = await Promise.all([
      svc.from("payment_providers").select("*").order("priority"),
      svc.from("payment_currencies").select("*").order("code"),
      svc.from("shipping_zones").select("*").order("id"),
    ]);

    const mockEnabled = isMockEnabled();

    return {
      mockEnabled,
      providers:   providersRes.data ?? [],
      currencies:  currenciesRes.data ?? [],
      zones:       zonesRes.data ?? [],
      featureFlags: FEATURE_FLAGS,
    };
  });

// ── 6. formatPaymentAmountFn ──────────────────────────────────────────────────
//
// Utility: format a minor-unit amount in a given currency.
// Useful for server-side receipt generation.

export function formatPaymentAmount(minorUnits: number, currency: CurrencyCode): string {
  return formatCurrencyAmount(minorUnits, currency);
}
