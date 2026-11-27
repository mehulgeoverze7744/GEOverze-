/**
 * Gstore One-Time Checkout — Server Functions
 *
 * SECURITY MODEL:
 *   - All price calculations happen server-side from the authoritative
 *     price catalog (gstoreProductPrices.ts). Client prices are never trusted.
 *   - Razorpay secret key (RAZORPAY_KEY_SECRET) is never sent to the browser.
 *   - Payment verification uses HMAC-SHA256 (Razorpay signature verification).
 *   - Authenticated orders: SECURITY DEFINER RPC checks auth.uid().
 *   - Guest orders: service role key is used (server-side only).
 *   - Mock mode requires MOCK_PAYMENTS_ENABLED=true in Vercel env vars.
 *
 * ENVIRONMENT VARIABLES (all server-side only except VITE_ ones):
 *   RAZORPAY_KEY_ID           — Razorpay Key ID
 *   RAZORPAY_KEY_SECRET       — Razorpay Key Secret (NEVER expose to client)
 *   RAZORPAY_WEBHOOK_SECRET   — Razorpay Webhook Secret for webhook signature verification
 *   VITE_SUPABASE_URL         — Supabase project URL
 *   VITE_SUPABASE_ANON_KEY    — Supabase anon key (for authenticated RPC calls)
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (for guest orders, admin)
 *   MOCK_PAYMENTS_ENABLED     — Set to "true" for testing without real payments
 *   GSTORE_ADMIN_EMAILS       — Comma-separated list of admin email addresses
 */

import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { isSlugAvailableForSale } from "../data/catalogAvailability";
import { assertRateLimit } from "@/lib/payments/paymentRateLimit";
import { isMockPaymentsExplicit, readRazorpayKeyId } from "@/lib/payments/razorpayEnv";
import {
  getProductPrice,
  computeShippingMinor,
  isGstoreShippingMethod,
  computeTaxMinor,
  computeOrderTotalMinor,
  isGstoreCreditsCheckoutSlug,
  resolveGstoreCreditPrice,
} from "./gstoreProductPrices";
import {
  GSTORE_PAYMENT_CREDITS,
  GSTORE_PAYMENT_OPTION_KEY,
} from "./gstoreDualPricing";
import { computeMembershipDiscountMinor } from "./membershipDiscount";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSupabaseClient(accessToken: string): SupabaseClient {
  const url     = process.env["VITE_SUPABASE_URL"];
  const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !anonKey) throw new Error("Supabase not configured.");
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

function isMockEnabled(): boolean {
  if (isMockPaymentsExplicit()) return true;
  if (process.env["NODE_ENV"] === "development" && !readRazorpayKeyId()) return true;
  return false;
}

type MembershipDiscountQuote = {
  discountBps: number;
  discountMinor: number;
  planTier: string;
  userId: string | null;
};

/** Server-side membership discount. Client percentages are never trusted. */
async function quoteMembershipDiscount(
  sb: SupabaseClient,
  subtotalMinor: number,
): Promise<MembershipDiscountQuote> {
  const [{ data: bpsRaw }, { data: userData }, { data: planRaw }] = await Promise.all([
    sb.rpc("get_gstore_membership_discount_bps"),
    sb.auth.getUser(),
    sb.rpc("get_my_plan_tier"),
  ]);
  const discountBps = typeof bpsRaw === "number" && Number.isFinite(bpsRaw) ? Math.max(0, Math.trunc(bpsRaw)) : 0;
  const planTier =
    planRaw && typeof planRaw === "object" && "tier" in planRaw && typeof (planRaw as { tier: unknown }).tier === "string"
      ? (planRaw as { tier: string }).tier
      : "explorer";
  return {
    discountBps,
    discountMinor: computeMembershipDiscountMinor(subtotalMinor, discountBps),
    planTier,
    userId: userData.user?.id ?? null,
  };
}

async function persistMembershipDiscount(input: {
  orderId: string;
  userId: string | null;
  planTier: string;
  discountBps: number;
  subtotalMinor: number;
  discountMinor: number;
}): Promise<void> {
  if (!input.userId || input.discountMinor <= 0) return;
  try {
    const service = makeServiceRoleClient();
    await service.rpc("record_gstore_membership_discount", {
      _order_id: input.orderId,
      _user_id: input.userId,
      _plan_tier: input.planTier,
      _discount_bps: input.discountBps,
      _subtotal_minor: input.subtotalMinor,
      _discount_minor: input.discountMinor,
    });
  } catch {
    // Order already stores discount_minor; audit row is best-effort.
  }
}

/**
 * Returns the Supabase project URL.
 * Accepts both the standard Vercel Supabase integration name (SUPABASE_URL)
 * and the VITE_-prefixed name used by the GVRZE client bundle.
 */
function getSupabaseUrl(): string {
  return (
    process.env["SUPABASE_URL"] ??
    process.env["VITE_SUPABASE_URL"] ??
    ""
  );
}

/**
 * Creates a Supabase admin client using the service-role key.
 * Required for guest orders and admin operations that bypass RLS.
 *
 * Missing SUPABASE_SERVICE_ROLE_KEY causes an actionable error:
 *   1. Open your Supabase dashboard → Project Settings → API.
 *   2. Copy the service_role secret (never expose it to the browser).
 *   3. Add it to .env.local:  SUPABASE_SERVICE_ROLE_KEY=<value>
 *   4. On Vercel: Settings → Environment Variables → add it there too.
 *
 * For mock-mode testing without guest checkout, sign in first — the
 * authenticated path does NOT require the service-role key.
 */
function makeServiceRoleClient(): SupabaseClient {
  const url         = getSupabaseUrl();
  const serviceRole = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !serviceRole) {
    const missing: string[] = [];
    if (!url)         missing.push("SUPABASE_URL (or VITE_SUPABASE_URL)");
    if (!serviceRole) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    throw new Error(
      `Supabase service role not configured. Missing: ${missing.join(", ")}. ` +
      "Get it from Supabase Dashboard → Project Settings → API → service_role secret. " +
      "Add it to .env.local (local) or Vercel Environment Variables (deployed). " +
      "Tip: for mock-payment testing, sign in first — authenticated checkout does not need the service-role key.",
    );
  }

  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

function getAdminEmails(): string[] {
  const raw = process.env["GSTORE_ADMIN_EMAILS"] ?? "";
  return raw.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type GstoreCartItem = {
  slug: string;
  quantity: number;
  options: Record<string, string>;
};

export type GstoreCheckoutDetails = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
  deliveryNotes: string;
  shippingMethod: "standard" | "express";
};

// ── 1. createGstoreOrderFn ────────────────────────────────────────────────────
//
// Validates cart items server-side, computes totals from the authoritative
// price catalog, creates the DB order record, and (when Razorpay is configured)
// creates a Razorpay order for the amount. Returns everything the client
// needs to open the Razorpay checkout modal.

const CreateOrderSchema = z.object({
  access_token: z.string().min(10),
  items: z.array(
    z.object({
      slug:     z.string().min(1),
      quantity: z.number().int().min(1).max(10),
      options:  z.record(z.string(), z.string()),
    }),
  ).min(1),
  details: z.object({
    customerName:    z.string().min(1).max(200),
    customerEmail:   z.string().email(),
    customerPhone:   z.string().min(5).max(20),
    shippingName:    z.string().min(1).max(200),
    shippingLine1:   z.string().min(1).max(300),
    shippingLine2:   z.string().max(300).optional().default(""),
    shippingCity:    z.string().min(1).max(100),
    shippingState:   z.string().min(1).max(100),
    shippingPincode: z.string().min(4).max(10),
    shippingCountry: z.string().min(1).max(100).optional().default("India"),
    deliveryNotes:   z.string().max(500).optional().default(""),
    shippingMethod:  z.enum(["standard", "express"]).optional().default("standard"),
  }),
  idempotency_key: z.string().min(1).max(256),
});

export type CreateGstoreOrderInput  = z.infer<typeof CreateOrderSchema>;
export type CreateGstoreOrderResult = {
  order_id:         string;
  order_number:     string;
  payment_id:       string;
  /** GST-inclusive total = subtotal + shipping - membership discount. */
  total_minor:      number;
  discount_minor?:  number;
  discount_bps?:    number;
  currency:         string;
  /** Razorpay order ID — present when Razorpay is configured. */
  rzp_order_id?:    string | null;
  /** Razorpay publishable Key ID — always present for client modal initialisation. */
  rzp_key_id:       string;
  /** True when mock payment mode is active. */
  mock_enabled:     boolean;
  idempotent:       boolean;
};

export const createGstoreOrderFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => CreateOrderSchema.parse(raw))
  .handler(async ({ data }): Promise<CreateGstoreOrderResult> => {
    const { access_token, items, details, idempotency_key } = data;
    assertRateLimit(`gstore-create:${access_token.slice(-24)}`, 10, 60_000);

    // ── Validate + price every cart item server-side ──────────────────────
    type ValidatedItem = {
      product_id:       string;
      product_name:     string;
      product_slug:     string;
      sku:              string;
      category:         string;
      options:          Record<string, string>;
      quantity:         number;
      unit_price_minor: number;
      line_total_minor: number;
      physical:         boolean;
    };

    const validatedItems: ValidatedItem[] = [];
    for (const item of items) {
      if (item.options?.[GSTORE_PAYMENT_OPTION_KEY] === GSTORE_PAYMENT_CREDITS) {
        throw new Error(
          `${item.slug} is set to pay with credits. Use the credits checkout flow.`,
        );
      }
      const product = getProductPrice(item.slug);
      if (!product || !isSlugAvailableForSale(item.slug, product.category)) {
        throw new Error(`Product not found or not available: ${item.slug}`);
      }
      validatedItems.push({
        product_id:       item.slug,
        product_name:     product.name,
        product_slug:     item.slug,
        sku:              item.slug,
        category:         product.category,
        options:          item.options,
        quantity:         item.quantity,
        unit_price_minor: product.priceMinor,
        line_total_minor: product.priceMinor * item.quantity,
        physical:         product.physical,
      });
    }

    // ── Compute totals server-side ─────────────────────────────────────────
    // Product prices are GST-inclusive MRPs.
    // taxMinor is the GST EXTRACTED from the inclusive subtotal (for accounting).
    // It is stored in the DB for tax reporting but NOT added to the total.
    // Total = subtotal (inclusive) + shipping   ← no extra tax layer
    const subtotalMinor = validatedItems.reduce(
      (sum, i) => sum + i.line_total_minor, 0,
    );
    const hasPhysical = validatedItems.some((i) => i.physical);
    if (!isGstoreShippingMethod(details.shippingMethod)) {
      throw new Error("Invalid delivery method.");
    }
    const shippingMinor = computeShippingMinor(
      details.shippingMethod,
      subtotalMinor,
      hasPhysical,
    );
    const sb = makeSupabaseClient(access_token);
    const membershipDiscount = await quoteMembershipDiscount(sb, subtotalMinor);
    const discountMinor = membershipDiscount.discountMinor;
    const discountedSubtotal = Math.max(0, subtotalMinor - discountMinor);
    const taxMinor   = computeTaxMinor(discountedSubtotal, shippingMinor); // extracted, not added
    const totalMinor = computeOrderTotalMinor(subtotalMinor, shippingMinor, discountMinor);

    // ── Create DB order via RPC ───────────────────────────────────────────
    const mock = isMockEnabled();

    const { data: rpcResult, error: rpcError } = await sb.rpc("create_gstore_order", {
      p_customer_name:    details.customerName,
      p_customer_email:   details.customerEmail,
      p_customer_phone:   details.customerPhone,
      p_shipping_name:    details.shippingName,
      p_shipping_line1:   details.shippingLine1,
      p_shipping_line2:   details.shippingLine2 ?? "",
      p_shipping_city:    details.shippingCity,
      p_shipping_state:   details.shippingState,
      p_shipping_pincode: details.shippingPincode,
      p_shipping_country: details.shippingCountry ?? "India",
      p_delivery_notes:   details.deliveryNotes ?? "",
      p_subtotal_minor:   subtotalMinor,
      p_shipping_minor:   shippingMinor,
      p_tax_minor:        taxMinor,
      p_discount_minor:   discountMinor,
      p_total_minor:      totalMinor,
      p_shipping_method:  details.shippingMethod,
      p_items:            validatedItems.map((i) => ({
        product_id:       i.product_id,
        product_name:     i.product_name,
        product_slug:     i.product_slug,
        sku:              i.sku,
        category:         i.category,
        options:          i.options,
        quantity:         i.quantity,
        unit_price_minor: i.unit_price_minor,
        line_total_minor: i.line_total_minor,
      })),
      p_idempotency_key:  idempotency_key,
      p_is_mock:          mock,
    });

    if (rpcError) throw new Error(`Failed to create order: ${rpcError.message}`);
    if (!rpcResult) {
      // The RPC returned NULL — this usually means the idempotency RETURN fired
      // before the INSERT ran.  Apply migration
      // 20261107010000_fix_gstore_order_idempotency.sql to fix the function.
      throw new Error(
        "Order creation returned an empty result. " +
        "Please apply the latest Supabase migration and try again.",
      );
    }
    const result = rpcResult as {
      order_id: string; order_number: string; payment_id: string; idempotent: boolean;
    };

    await persistMembershipDiscount({
      orderId: result.order_id,
      userId: membershipDiscount.userId,
      planTier: membershipDiscount.planTier,
      discountBps: membershipDiscount.discountBps,
      subtotalMinor,
      discountMinor,
    });

    // ── Mock mode: skip Razorpay ──────────────────────────────────────────
    if (mock) {
      return {
        order_id:     result.order_id,
        order_number: result.order_number,
        payment_id:   result.payment_id,
        total_minor:  totalMinor,
        discount_minor: discountMinor,
        discount_bps: membershipDiscount.discountBps,
        currency:     "INR",
        rzp_key_id:   "",
        mock_enabled: true,
        idempotent:   result.idempotent,
      };
    }

    const sbAuth = makeSupabaseClient(access_token);

    const rzp = await import("./gstoreRazorpay.server");

    if (result.idempotent) {
      const { data: existingPay } = await sbAuth
        .from("gstore_payments")
        .select("provider_order_id")
        .eq("id", result.payment_id)
        .maybeSingle();
      const existingId = (existingPay as { provider_order_id?: string } | null)?.provider_order_id;
      if (existingId) {
        return {
          order_id:     result.order_id,
          order_number: result.order_number,
          payment_id:   result.payment_id,
          total_minor:  totalMinor,
          discount_minor: discountMinor,
          discount_bps: membershipDiscount.discountBps,
          currency:     "INR",
          rzp_order_id: existingId,
          rzp_key_id:   rzp.getRazorpayKeyId(),
          mock_enabled: false,
          idempotent:   true,
        };
      }
    }

    const placed = await rzp.placeRazorpayOrder({
      orderId: result.order_id,
      paymentId: result.payment_id,
      orderNumber: result.order_number,
      totalMinor,
      customerEmail: details.customerEmail,
    });

    if (!placed.rzpOrderId) {
      throw new Error("Razorpay keys not configured.");
    }

    await sbAuth.rpc("attach_gstore_razorpay_order", {
      p_order_id: result.order_id,
      p_payment_id: result.payment_id,
      p_provider_order_id: placed.rzpOrderId,
    });

    return {
      order_id:     result.order_id,
      order_number: result.order_number,
      payment_id:   result.payment_id,
      total_minor:  totalMinor,
      discount_minor: discountMinor,
      discount_bps: membershipDiscount.discountBps,
      currency:     "INR",
      rzp_order_id: placed.rzpOrderId,
      rzp_key_id:   placed.rzpKeyId,
      mock_enabled: false,
      idempotent:   result.idempotent,
    };
  });


// ── 2. verifyGstorePaymentFn ──────────────────────────────────────────────────
//
// Called after the Razorpay payment callback fires on the client.
// Verifies the Razorpay signature server-side (HMAC-SHA256), then calls
// confirm_gstore_payment RPC to mark the order paid.
//
// SECURITY: Never trust the client's claim that payment succeeded.
// Only the HMAC signature verified against the secret key is authoritative.

const VerifyPaymentSchema = z.object({
  access_token:         z.string().min(10),
  order_id:             z.string().uuid(),
  payment_id:           z.string().uuid(),
  rzp_order_id:         z.string().min(1),
  rzp_payment_id:       z.string().min(1),
  rzp_signature:        z.string().min(1),
});

export type VerifyGstorePaymentInput  = z.infer<typeof VerifyPaymentSchema>;
export type VerifyGstorePaymentResult = {
  success:      boolean;
  order_id:     string;
  order_number: string;
};

export const verifyGstorePaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => VerifyPaymentSchema.parse(raw))
  .handler(async ({ data }): Promise<VerifyGstorePaymentResult> => {
    assertRateLimit(`gstore-verify:${data.access_token.slice(-24)}`, 20, 60_000);
    const sb = makeSupabaseClient(data.access_token);
    const { data: orderRow, error: orderError } = await sb
      .from("gstore_orders")
      .select("order_number, total_minor, currency, payment_status")
      .eq("id", data.order_id)
      .single();
    if (orderError || !orderRow) throw new Error("Order not found.");
    const order = orderRow as {
      order_number: string;
      total_minor: number;
      currency: string;
      payment_status: string;
    };

    if (order.payment_status === "paid") {
      const { schedulePaidGstoreOrderNotifications } = await import(
        "@/lib/notifications/commerceNotifications.server"
      );
      schedulePaidGstoreOrderNotifications(data.order_id);
      return { success: true, order_id: data.order_id, order_number: order.order_number };
    }

    const rzp = await import("./gstoreRazorpay.server");
    await rzp.verifyCapturedOrderPayment({
      rzpOrderId: data.rzp_order_id,
      rzpPaymentId: data.rzp_payment_id,
      rzpSignature: data.rzp_signature,
      expectedAmountMinor: Number(order.total_minor),
      expectedCurrency: order.currency || "INR",
    });

    const { error: confirmError } = await sb.rpc("confirm_gstore_payment", {
      p_order_id:            data.order_id,
      p_payment_id:          data.payment_id,
      p_provider_order_id:   data.rzp_order_id,
      p_provider_payment_id: data.rzp_payment_id,
      p_provider_signature:  data.rzp_signature,
      p_outcome:             "success",
    });

    if (confirmError) throw new Error(`Failed to confirm payment: ${confirmError.message}`);

    const { schedulePaidGstoreOrderNotifications } = await import(
      "@/lib/notifications/commerceNotifications.server"
    );
    schedulePaidGstoreOrderNotifications(data.order_id);

    return {
      success:      true,
      order_id:     data.order_id,
      order_number: order.order_number,
    };
  });


// ── 3. confirmMockGstorePaymentFn ─────────────────────────────────────────────
//
// Mock payment confirmation (when MOCK_PAYMENTS_ENABLED=true).
// Skips Razorpay signature verification; uses mock provider.

const ConfirmMockSchema = z.object({
  access_token: z.string().min(10),
  order_id:     z.string().uuid(),
  payment_id:   z.string().uuid(),
  outcome:      z.enum(["success", "failed", "cancel"]),
});

export type ConfirmMockGstoreInput  = z.infer<typeof ConfirmMockSchema>;
export type ConfirmMockGstoreResult = {
  success:      boolean;
  order_id:     string;
  order_number: string;
};

export const confirmMockGstorePaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => ConfirmMockSchema.parse(raw))
  .handler(async ({ data }): Promise<ConfirmMockGstoreResult> => {
    if (!isMockEnabled()) {
      throw new Error("Mock payments are not enabled.");
    }

    const sb = makeSupabaseClient(data.access_token);
    const { error } = await sb.rpc("confirm_gstore_payment", {
      p_order_id:            data.order_id,
      p_payment_id:          data.payment_id,
      p_provider_order_id:   "mock_order",
      p_provider_payment_id: `mock_pay_${Date.now()}`,
      p_provider_signature:  "mock_signature",
      p_outcome:             data.outcome,
    });

    if (error) throw new Error(`Mock payment confirmation failed: ${error.message}`);

    const { data: order } = await sb
      .from("gstore_orders")
      .select("order_number")
      .eq("id", data.order_id)
      .single();

    if (data.outcome === "success") {
      const { schedulePaidGstoreOrderNotifications } = await import(
        "@/lib/notifications/commerceNotifications.server"
      );
      schedulePaidGstoreOrderNotifications(data.order_id);
    }

    return {
      success:      data.outcome === "success",
      order_id:     data.order_id,
      order_number: (order as { order_number: string } | null)?.order_number ?? "",
    };
  });


// ── 4. getMyGstoreOrdersFn ───────────────────────────────────────────────────
//
// Fetches the authenticated user's order history (most recent first).

const GetOrdersSchema = z.object({
  access_token: z.string().min(10),
  limit:        z.number().int().min(1).max(50).optional().default(20),
  offset:       z.number().int().min(0).optional().default(0),
});

export type GstoreOrderRow = {
  id:             string;
  order_number:   string;
  total_minor:    number;
  currency:       string;
  order_status:   string;
  payment_status: string;
  shipping_method: string;
  tracking_number: string | null;
  is_mock:        boolean;
  created_at:     string;
  items: {
    id:               string;
    product_name:     string;
    product_slug:     string;
    options:          Record<string, string>;
    quantity:         number;
    unit_price_minor: number;
    line_total_minor: number;
  }[];
};

export const getMyGstoreOrdersFn = createServerFn({ method: "GET" })
  .validator((raw: unknown) => GetOrdersSchema.parse(raw))
  .handler(async ({ data }): Promise<GstoreOrderRow[]> => {
    const sb = makeSupabaseClient(data.access_token);

    const { data: orders, error } = await sb
      .from("gstore_orders")
      .select(`
        id, order_number, total_minor, currency,
        order_status, payment_status, shipping_method,
        tracking_number, is_mock, created_at,
        gstore_order_items (
          id, product_name, product_slug, options,
          quantity, unit_price_minor, line_total_minor
        )
      `)
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    return ((orders ?? []) as unknown[]).map((o) => {
      const order = o as {
        id: string; order_number: string; total_minor: number; currency: string;
        order_status: string; payment_status: string; shipping_method: string;
        tracking_number: string | null; is_mock: boolean; created_at: string;
        gstore_order_items: {
          id: string; product_name: string; product_slug: string;
          options: Record<string, string>; quantity: number;
          unit_price_minor: number; line_total_minor: number;
        }[];
      };
      return {
        id:             order.id,
        order_number:   order.order_number,
        total_minor:    order.total_minor,
        currency:       order.currency,
        order_status:   order.order_status,
        payment_status: order.payment_status,
        shipping_method: order.shipping_method,
        tracking_number: order.tracking_number,
        is_mock:        order.is_mock,
        created_at:     order.created_at,
        items:          order.gstore_order_items ?? [],
      };
    });
  });


// ── 5. getGstoreOrderDetailFn ────────────────────────────────────────────────

const GetOrderDetailSchema = z.object({
  access_token: z.string().min(10),
  order_id:     z.string().uuid(),
});

export type GstoreOrderDetail = GstoreOrderRow & {
  customer_name:    string;
  customer_email:   string;
  customer_phone:   string;
  shipping_name:    string;
  shipping_line1:   string;
  shipping_line2:   string;
  shipping_city:    string;
  shipping_state:   string;
  shipping_pincode: string;
  shipping_country: string;
  subtotal_minor:   number;
  shipping_minor:   number;
  tax_minor:        number;
  discount_minor:   number;
  latest_payment_id: string | null;
};

export const getGstoreOrderDetailFn = createServerFn({ method: "GET" })
  .validator((raw: unknown) => GetOrderDetailSchema.parse(raw))
  .handler(async ({ data }): Promise<GstoreOrderDetail> => {
    const sb = makeSupabaseClient(data.access_token);

    const { data: order, error } = await sb
      .from("gstore_orders")
      .select(`
        id, order_number, total_minor, currency,
        order_status, payment_status, shipping_method,
        tracking_number, is_mock, created_at,
        customer_name, customer_email, customer_phone,
        shipping_name, shipping_line1, shipping_line2,
        shipping_city, shipping_state, shipping_pincode, shipping_country,
        subtotal_minor, shipping_minor, tax_minor, discount_minor,
        gstore_order_items (
          id, product_name, product_slug, options,
          quantity, unit_price_minor, line_total_minor
        )
      `)
      .eq("id", data.order_id)
      .single();

    if (error || !order) {
      throw new Error("Order not found or access denied.");
    }

    const { data: latestPayment } = await sb
      .from("gstore_payments")
      .select("id")
      .eq("order_id", data.order_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const o = order as typeof order & {
      customer_name: string; customer_email: string; customer_phone: string;
      shipping_name: string; shipping_line1: string; shipping_line2: string;
      shipping_city: string; shipping_state: string; shipping_pincode: string;
      shipping_country: string; subtotal_minor: number; shipping_minor: number;
      tax_minor: number; discount_minor: number;
      gstore_order_items: GstoreOrderRow["items"];
    };

    return {
      id:               o.id,
      order_number:     o.order_number,
      total_minor:      o.total_minor,
      currency:         o.currency,
      order_status:     o.order_status,
      payment_status:   o.payment_status,
      shipping_method:  o.shipping_method,
      tracking_number:  o.tracking_number,
      is_mock:          o.is_mock,
      created_at:       o.created_at,
      customer_name:    o.customer_name,
      customer_email:   o.customer_email,
      customer_phone:   o.customer_phone,
      shipping_name:    o.shipping_name,
      shipping_line1:   o.shipping_line1,
      shipping_line2:   o.shipping_line2,
      shipping_city:    o.shipping_city,
      shipping_state:   o.shipping_state,
      shipping_pincode: o.shipping_pincode,
      shipping_country: o.shipping_country,
      subtotal_minor:   o.subtotal_minor,
      shipping_minor:   o.shipping_minor,
      tax_minor:        o.tax_minor,
      discount_minor:   o.discount_minor,
      latest_payment_id: (latestPayment as { id?: string } | null)?.id ?? null,
      items:            o.gstore_order_items ?? [],
    };
  });

// ── 6. createGstoreGuestOrderFn ───────────────────────────────────────────────
//
// Creates an order for a guest (unauthenticated) user.
// Uses the Supabase service role key on the server to call a SECURITY DEFINER
// RPC that bypasses auth.uid() checks.
// Returns guest_token which the client must store securely (localStorage)
// for order lookup later.

const GuestOrderSchema = z.object({
  items: z.array(
    z.object({
      slug:     z.string().min(1),
      quantity: z.number().int().min(1).max(10),
      options:  z.record(z.string(), z.string()),
    }),
  ).min(1),
  details: z.object({
    customerName:    z.string().min(1).max(200),
    customerEmail:   z.string().email(),
    customerPhone:   z.string().min(5).max(20),
    shippingName:    z.string().min(1).max(200),
    shippingLine1:   z.string().min(1).max(300),
    shippingLine2:   z.string().max(300).optional().default(""),
    shippingCity:    z.string().min(1).max(100),
    shippingState:   z.string().min(1).max(100),
    shippingPincode: z.string().min(4).max(10),
    shippingCountry: z.string().min(1).max(100).optional().default("India"),
    deliveryNotes:   z.string().max(500).optional().default(""),
    shippingMethod:  z.enum(["standard", "express"]).optional().default("standard"),
  }),
  idempotency_key: z.string().min(1).max(256),
});

export type CreateGstoreGuestOrderResult = {
  order_id: string;
  order_number: string;
  payment_id: string;
  guest_token: string;
  total_minor: number;
  subtotal_minor: number;
  shipping_minor: number;
  tax_minor: number;
  rzp_order_id: string | null;
  rzp_key_id: string;
  mock_enabled: boolean;
  idempotent: boolean;
};

export const createGstoreGuestOrderFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => GuestOrderSchema.parse(raw))
  .handler(async ({ data }): Promise<CreateGstoreGuestOrderResult> => {
    const mockEnabled = isMockEnabled();
    const rzp = await import("./gstoreRazorpay.server");
    const keyId = rzp.getRazorpayKeyId();
    assertRateLimit(`gstore-guest-create:${data.details.customerEmail}`, 8, 60_000);

    // Early service-role check with a mock-mode-aware hint.
    // Guest orders (no auth.uid()) need the service-role key to bypass RLS.
    // For authenticated mock testing, sign in first — the auth path never needs this key.
    const svcUrl  = getSupabaseUrl();
    const svcKey  = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!svcUrl || !svcKey) {
      throw new Error(
        mockEnabled
          ? "Guest checkout requires SUPABASE_SERVICE_ROLE_KEY. " +
            "Either sign in (authenticated mock checkout works without this key) " +
            "or add SUPABASE_SERVICE_ROLE_KEY to .env.local — " +
            "get it from Supabase Dashboard → Project Settings → API → service_role secret."
          : "Supabase service role not configured. " +
            "Add SUPABASE_SERVICE_ROLE_KEY to .env.local or Vercel Environment Variables.",
      );
    }

    // 1. Validate items and compute totals (server-side, never trust client)
    type ItemRow = {
      product_id: string;
      product_name: string;
      product_slug: string;
      sku: string;
      category: string;
      options: Record<string, string>;
      quantity: number;
      unit_price_minor: number;
      line_total_minor: number;
    };

    const itemRows: ItemRow[] = [];
    let subtotalMinor = 0;
    const hasPhysical = data.items.some(item => {
      const p = getProductPrice(item.slug);
      return p?.physical ?? true;
    });

    for (const item of data.items) {
      const product = getProductPrice(item.slug);
      if (!product || !isSlugAvailableForSale(item.slug, product.category)) {
        throw new Error(`Unknown product: ${item.slug}`);
      }
      const lineTotal = product.priceMinor * item.quantity;
      subtotalMinor += lineTotal;
      itemRows.push({
        product_id:       product.slug,
        product_name:     product.name,
        product_slug:     product.slug,
        sku:              product.slug,
        category:         product.category,
        options:          item.options,
        quantity:         item.quantity,
        unit_price_minor: product.priceMinor,
        line_total_minor: lineTotal,
      });
    }

    // GST is extracted from the inclusive product subtotal (for accounting only).
    // Total = inclusive subtotal + shipping — no extra tax layer.
    if (!isGstoreShippingMethod(data.details.shippingMethod ?? "standard")) {
      throw new Error("Invalid delivery method.");
    }
    const shippingMinor = computeShippingMinor(data.details.shippingMethod ?? "standard", subtotalMinor, hasPhysical);
    const taxMinor      = computeTaxMinor(subtotalMinor, shippingMinor); // extracted, not added
    const totalMinor    = computeOrderTotalMinor(subtotalMinor, shippingMinor, 0);

    // 2. Create DB order via service role (no auth.uid() needed for guests)
    const serviceClient = makeServiceRoleClient();
    const { data: rpcResult, error: rpcError } = await serviceClient.rpc(
      "create_gstore_order_guest",
      {
        p_customer_name:    data.details.customerName,
        p_customer_email:   data.details.customerEmail,
        p_customer_phone:   data.details.customerPhone,
        p_shipping_name:    data.details.shippingName,
        p_shipping_line1:   data.details.shippingLine1,
        p_shipping_line2:   data.details.shippingLine2 ?? "",
        p_shipping_city:    data.details.shippingCity,
        p_shipping_state:   data.details.shippingState,
        p_shipping_pincode: data.details.shippingPincode,
        p_shipping_country: data.details.shippingCountry ?? "India",
        p_delivery_notes:   data.details.deliveryNotes ?? "",
        p_subtotal_minor:   subtotalMinor,
        p_shipping_minor:   shippingMinor,
        p_tax_minor:        taxMinor,
        p_discount_minor:   0,
        p_total_minor:      totalMinor,
        p_shipping_method:  data.details.shippingMethod ?? "standard",
        p_items:            itemRows,
        p_idempotency_key:  data.idempotency_key,
        p_is_mock:          mockEnabled,
      },
    );

    if (rpcError || !rpcResult) {
      throw new Error(rpcError?.message ?? "Failed to create guest order.");
    }

    const r = rpcResult as { order_id: string; order_number: string; payment_id: string; guest_token: string; idempotent: boolean };

    // 3. If mock mode, skip Razorpay
    if (mockEnabled) {
      return {
        order_id:       r.order_id,
        order_number:   r.order_number,
        payment_id:     r.payment_id,
        guest_token:    r.guest_token,
        total_minor:    totalMinor,
        subtotal_minor: subtotalMinor,
        shipping_minor: shippingMinor,
        tax_minor:      taxMinor,
        rzp_order_id:   null,
        rzp_key_id:     keyId,
        mock_enabled:   true,
        idempotent:     r.idempotent,
      };
    }

    const placed = await rzp.placeRazorpayOrder({
      orderId: r.order_id,
      paymentId: r.payment_id,
      orderNumber: r.order_number,
      totalMinor,
      customerEmail: data.details.customerEmail,
      notes: { order_type: "gstore_guest" },
    });
    if (!placed.rzpOrderId) {
      throw new Error("Razorpay keys not configured.");
    }

    await serviceClient.rpc("attach_gstore_razorpay_order_guest", {
      p_order_id: r.order_id,
      p_payment_id: r.payment_id,
      p_guest_token: r.guest_token,
      p_provider_order_id: placed.rzpOrderId,
    });

    return {
      order_id:       r.order_id,
      order_number:   r.order_number,
      payment_id:     r.payment_id,
      guest_token:    r.guest_token,
      total_minor:    totalMinor,
      subtotal_minor: subtotalMinor,
      shipping_minor: shippingMinor,
      tax_minor:      taxMinor,
      rzp_order_id:   placed.rzpOrderId,
      rzp_key_id:     placed.rzpKeyId,
      mock_enabled:   false,
      idempotent:     r.idempotent,
    };
  });

// ── 7. verifyGstoreGuestPaymentFn ─────────────────────────────────────────────

const VerifyGuestPaymentSchema = z.object({
  order_id:        z.string().uuid(),
  payment_id:      z.string().uuid(),
  guest_token:     z.string().uuid(),
  rzp_order_id:    z.string().min(1),
  rzp_payment_id:  z.string().min(1),
  rzp_signature:   z.string().min(1),
});

export const verifyGstoreGuestPaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => VerifyGuestPaymentSchema.parse(raw))
  .handler(async ({ data }) => {
    assertRateLimit(`gstore-guest-verify:${data.guest_token}`, 20, 60_000);
    const svc = makeServiceRoleClient();
    const { data: orderRow, error: orderError } = await svc
      .from("gstore_orders")
      .select("total_minor, currency, payment_status, guest_token")
      .eq("id", data.order_id)
      .eq("guest_token", data.guest_token)
      .single();
    if (orderError || !orderRow) throw new Error("Order not found.");
    const order = orderRow as { total_minor: number; currency: string; payment_status: string };
    if (order.payment_status === "paid") {
      const { schedulePaidGstoreOrderNotifications } = await import(
        "@/lib/notifications/commerceNotifications.server"
      );
      schedulePaidGstoreOrderNotifications(data.order_id);
      return { success: true };
    }

    try {
      const rzp = await import("./gstoreRazorpay.server");
      await rzp.verifyCapturedOrderPayment({
        rzpOrderId: data.rzp_order_id,
        rzpPaymentId: data.rzp_payment_id,
        rzpSignature: data.rzp_signature,
        expectedAmountMinor: Number(order.total_minor),
        expectedCurrency: order.currency || "INR",
      });
    } catch (err) {
      await svc.rpc("confirm_gstore_payment_guest", {
        p_order_id:            data.order_id,
        p_payment_id:          data.payment_id,
        p_guest_token:         data.guest_token,
        p_provider_order_id:   data.rzp_order_id,
        p_provider_payment_id: data.rzp_payment_id,
        p_provider_signature:  data.rzp_signature,
        p_outcome:             "failed",
      });
      throw err instanceof Error ? err : new Error("Payment verification failed.");
    }

    const { error } = await svc.rpc("confirm_gstore_payment_guest", {
      p_order_id:            data.order_id,
      p_payment_id:          data.payment_id,
      p_guest_token:         data.guest_token,
      p_provider_order_id:   data.rzp_order_id,
      p_provider_payment_id: data.rzp_payment_id,
      p_provider_signature:  data.rzp_signature,
      p_outcome:             "success",
    });

    if (error) throw new Error(error.message ?? "Failed to confirm guest payment.");
    const { schedulePaidGstoreOrderNotifications } = await import(
      "@/lib/notifications/commerceNotifications.server"
    );
    schedulePaidGstoreOrderNotifications(data.order_id);
    return { success: true };
  });

// ── 8. confirmMockGstoreGuestPaymentFn ────────────────────────────────────────

const MockGuestPaymentSchema = z.object({
  order_id:    z.string().uuid(),
  payment_id:  z.string().uuid(),
  guest_token: z.string().uuid(),
  outcome:     z.enum(["success", "failed", "cancel"]),
});

export const confirmMockGstoreGuestPaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => MockGuestPaymentSchema.parse(raw))
  .handler(async ({ data }) => {
    if (!isMockEnabled()) throw new Error("Mock payments not enabled.");
    const svc = makeServiceRoleClient();
    const { error } = await svc.rpc("confirm_gstore_payment_guest", {
      p_order_id:            data.order_id,
      p_payment_id:          data.payment_id,
      p_guest_token:         data.guest_token,
      p_provider_order_id:   "mock",
      p_provider_payment_id: `mock_${Date.now()}`,
      p_provider_signature:  "mock",
      p_outcome:             data.outcome === "cancel" ? "cancel" : data.outcome,
    });
    if (error) throw new Error(error.message ?? "Failed to confirm mock guest payment.");
    if (data.outcome === "success") {
      const { schedulePaidGstoreOrderNotifications } = await import(
        "@/lib/notifications/commerceNotifications.server"
      );
      schedulePaidGstoreOrderNotifications(data.order_id);
    }
    return { success: true };
  });

// ── 9. getGuestOrderDetailFn ──────────────────────────────────────────────────

const GuestOrderDetailSchema = z.object({
  order_number: z.string().min(1),
  guest_token:  z.string().uuid(),
});

export type GuestOrderRow = {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  total_minor: number;
  subtotal_minor: number;
  shipping_minor: number;
  tax_minor: number;
  shipping_method: string;
  tracking_number: string | null;
  customer_name: string;
  customer_email: string;
  shipping_name: string;
  shipping_line1: string;
  shipping_line2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  is_mock: boolean;
  created_at: string;
  items: Array<{
    id: string;
    product_name: string;
    product_slug: string;
    options: Record<string, string>;
    quantity: number;
    unit_price_minor: number;
    line_total_minor: number;
  }>;
};

export const getGuestOrderDetailFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => GuestOrderDetailSchema.parse(raw))
  .handler(async ({ data }): Promise<GuestOrderRow | null> => {
    // Uses anon client since get_guest_order_detail is GRANT to anon
    const url     = process.env["VITE_SUPABASE_URL"];
    const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
    if (!url || !anonKey) throw new Error("Supabase not configured.");

    const anonClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: result, error } = await anonClient.rpc("get_guest_order_detail", {
      p_order_number: data.order_number,
      p_guest_token:  data.guest_token,
    });

    if (error) throw new Error(error.message);
    return result as GuestOrderRow | null;
  });

// ── 10. getAdminOrdersFn ──────────────────────────────────────────────────────
//
// Admin-only: returns all orders for the dashboard.
// Verifies the calling user's email is in GSTORE_ADMIN_EMAILS.

const AdminOrdersSchema = z.object({
  access_token: z.string().min(10),
  page:  z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
  status_filter: z.string().optional(),
});

export type AdminOrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_city: string;
  shipping_state: string;
  total_minor: number;
  currency: string;
  order_status: string;
  payment_status: string;
  shipping_method: string;
  tracking_number: string | null;
  is_mock: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
};

export const getAdminOrdersFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => AdminOrdersSchema.parse(raw))
  .handler(async ({ data }): Promise<{ orders: AdminOrderRow[]; total: number }> => {
    const url     = process.env["VITE_SUPABASE_URL"];
    const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
    if (!url || !anonKey) throw new Error("Supabase not configured.");

    // Verify caller is an admin
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${data.access_token}` } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated.");

    const adminEmails = getAdminEmails();
    if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
      throw new Error("Admin access required.");
    }

    // Use service role to query admin view
    const svc = makeServiceRoleClient();
    const offset = (data.page - 1) * (data.limit ?? 50);

    let query = svc
      .from("gstore_orders_admin_view")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + (data.limit ?? 50) - 1);

    if (data.status_filter && data.status_filter !== "all") {
      query = query.eq("order_status", data.status_filter);
    }

    const { data: orders, count, error } = await query;
    if (error) throw new Error(error.message);

    return { orders: (orders ?? []) as AdminOrderRow[], total: count ?? 0 };
  });

// ── 11. adminUpdateOrderFn ────────────────────────────────────────────────────

const AdminUpdateOrderSchema = z.object({
  access_token:    z.string().min(10),
  order_id:        z.string().uuid(),
  order_status:    z.string().optional(),
  tracking_number: z.string().optional(),
});

export const adminUpdateOrderFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => AdminUpdateOrderSchema.parse(raw))
  .handler(async ({ data }) => {
    const url     = process.env["VITE_SUPABASE_URL"];
    const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
    if (!url || !anonKey) throw new Error("Supabase not configured.");

    // Verify caller is admin
    const userClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${data.access_token}` } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated.");

    const adminEmails = getAdminEmails();
    if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
      throw new Error("Admin access required.");
    }

    const svc = makeServiceRoleClient();
    const { error } = await svc.rpc("admin_update_gstore_order", {
      p_order_id:        data.order_id,
      p_order_status:    data.order_status ?? null,
      p_tracking_number: data.tracking_number ?? null,
    });

    if (error) throw new Error(error.message ?? "Failed to update order.");
    return { success: true };
  });


// ── 12. retryGstorePaymentFn ──────────────────────────────────────────────────

const RetryPaymentSchema = z.object({
  access_token: z.string().min(10),
  order_id:     z.string().uuid(),
  payment_id:   z.string().uuid(),
});

export const retryGstorePaymentFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => RetryPaymentSchema.parse(raw))
  .handler(async ({ data }) => {
    assertRateLimit(`gstore-retry:${data.access_token.slice(-24)}`, 8, 60_000);
    const sb = makeSupabaseClient(data.access_token);
    const { data: order, error } = await sb
      .from("gstore_orders")
      .select("id, order_number, total_minor, payment_status, customer_email")
      .eq("id", data.order_id)
      .single();
    if (error || !order) throw new Error("Order not found.");
    const row = order as {
      id: string;
      order_number: string;
      total_minor: number;
      payment_status: string;
      customer_email: string;
    };
    if (row.payment_status === "paid") {
      throw new Error("This order is already paid.");
    }
    if (!["unpaid", "pending", "failed"].includes(row.payment_status)) {
      throw new Error("This order cannot be retried.");
    }
    const rzp = await import("./gstoreRazorpay.server");
    const placed = await rzp.placeRazorpayOrder({
      orderId: row.id,
      paymentId: data.payment_id,
      orderNumber: row.order_number,
      totalMinor: Number(row.total_minor),
      customerEmail: row.customer_email,
      notes: { retry: "true" },
    });
    if (!placed.rzpOrderId) throw new Error("Razorpay is not configured.");
    await sb.rpc("attach_gstore_razorpay_order", {
      p_order_id: row.id,
      p_payment_id: data.payment_id,
      p_provider_order_id: placed.rzpOrderId,
    });
    return {
      order_id: row.id,
      order_number: row.order_number,
      rzp_order_id: placed.rzpOrderId,
      rzp_key_id: placed.rzpKeyId,
      total_minor: Number(row.total_minor),
    };
  });

// ── createGstoreCreditsOrderFn ────────────────────────────────────────────────
//
// Sticker collections paid with GVRZE Credits (not Razorpay).
// Server validates slugs, credit amounts, and calls create_gstore_credits_order.

const CreateCreditsOrderSchema = CreateOrderSchema;

export type CreateGstoreCreditsOrderResult = {
  order_id: string;
  order_number: string;
  credits_total: number;
  new_balance: number;
  idempotent: boolean;
  shipping_minor: number;
  requires_shipping_payment: boolean;
  shipping_payment_id?: string;
  rzp_order_id?: string;
  rzp_key_id?: string;
  mock_enabled?: boolean;
};

export const createGstoreCreditsOrderFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => CreateCreditsOrderSchema.parse(raw))
  .handler(async ({ data }): Promise<CreateGstoreCreditsOrderResult> => {
    const { access_token, items, details, idempotency_key } = data;
    assertRateLimit(`gstore-credits-create:${access_token.slice(-24)}`, 10, 60_000);

    let creditsTotal = 0;
    const pItems: Array<Record<string, unknown>> = [];

    for (const item of items) {
      const product = getProductPrice(item.slug);
      if (!product || !isGstoreCreditsCheckoutSlug(item.slug)) {
        throw new Error(`Credits checkout is not available for: ${item.slug}`);
      }
      if (!isSlugAvailableForSale(item.slug, product.category)) {
        throw new Error(`Product not available: ${item.slug}`);
      }
      if (item.options?.[GSTORE_PAYMENT_OPTION_KEY] !== GSTORE_PAYMENT_CREDITS) {
        throw new Error(`Missing credits payment selection for ${item.slug}`);
      }
      const unitCredits = resolveGstoreCreditPrice(item.slug);
      if (!unitCredits || unitCredits <= 0) {
        throw new Error(`Invalid credits price for ${item.slug}`);
      }
      const lineCredits = unitCredits * item.quantity;
      creditsTotal += lineCredits;
      pItems.push({
        product_id: item.slug,
        product_name: product.name,
        product_slug: item.slug,
        sku: item.slug,
        category: product.category,
        options: item.options,
        quantity: item.quantity,
        unit_credits: unitCredits,
        line_credits: lineCredits,
      });
    }

    if (!isGstoreShippingMethod(details.shippingMethod ?? "standard")) {
      throw new Error("Invalid delivery method.");
    }

    const sb = makeSupabaseClient(access_token);

    const { data: rpcResult, error: rpcError } = await sb.rpc("create_gstore_credits_order", {
      p_customer_name: details.customerName,
      p_customer_email: details.customerEmail,
      p_customer_phone: details.customerPhone,
      p_shipping_name: details.shippingName,
      p_shipping_line1: details.shippingLine1,
      p_shipping_line2: details.shippingLine2 ?? "",
      p_shipping_city: details.shippingCity,
      p_shipping_state: details.shippingState,
      p_shipping_pincode: details.shippingPincode,
      p_shipping_country: details.shippingCountry ?? "India",
      p_delivery_notes: details.deliveryNotes ?? "",
      p_shipping_method: details.shippingMethod ?? "standard",
      p_items: pItems,
      p_idempotency_key: idempotency_key,
      p_credits_total: creditsTotal,
    });

    if (rpcError) {
      const msg = rpcError.message ?? "Credits checkout failed";
      if (msg.toLowerCase().includes("insufficient credit")) {
        throw new Error("Insufficient GVRZE credits for this order.");
      }
      throw new Error(msg);
    }

    const row = rpcResult as Record<string, unknown>;
    const shippingMinor = Number(row["shipping_minor"] ?? 0);
    const requiresShippingPayment = Boolean(row["requires_shipping_payment"]);
    const shippingPaymentId = row["shipping_payment_id"]
      ? String(row["shipping_payment_id"])
      : undefined;

    const base: CreateGstoreCreditsOrderResult = {
      order_id: String(row["order_id"] ?? ""),
      order_number: String(row["order_number"] ?? ""),
      credits_total: Number(row["credits_total"] ?? creditsTotal),
      new_balance: Number(row["new_balance"] ?? 0),
      idempotent: Boolean(row["idempotent"]),
      shipping_minor: shippingMinor,
      requires_shipping_payment: requiresShippingPayment,
      ...(shippingPaymentId ? { shipping_payment_id: shippingPaymentId } : {}),
    };

    if (!requiresShippingPayment || !shippingPaymentId || shippingMinor <= 0) {
      return base;
    }

    const mock = isMockEnabled();
    if (mock) {
      await sb
        .from("gstore_payments")
        .update({ provider: "mock", is_mock: true })
        .eq("id", shippingPaymentId);
      return { ...base, mock_enabled: true };
    }

    const rzp = await import("./gstoreRazorpay.server");
    if (!rzp.isRazorpayServerConfigured()) {
      throw new Error("Razorpay is not configured for express shipping payment.");
    }

    if (!base.idempotent) {
      const placed = await rzp.placeRazorpayOrder({
        orderId: base.order_id,
        paymentId: shippingPaymentId,
        orderNumber: base.order_number,
        totalMinor: shippingMinor,
        customerEmail: details.customerEmail,
        notes: { kind: "gstore_express_shipping", product_payment: "credits" },
      });
      await sb.rpc("attach_gstore_razorpay_order", {
        p_order_id: base.order_id,
        p_payment_id: shippingPaymentId,
        p_provider_order_id: placed.rzpOrderId,
      });
      return {
        ...base,
        rzp_order_id: placed.rzpOrderId,
        rzp_key_id: placed.rzpKeyId,
        mock_enabled: false,
      };
    }

    const { data: existingPay } = await sb
      .from("gstore_payments")
      .select("provider_order_id")
      .eq("id", shippingPaymentId)
      .maybeSingle();
    const existingRzp = (existingPay as { provider_order_id?: string } | null)?.provider_order_id;
    return {
      ...base,
      rzp_order_id: existingRzp ?? undefined,
      rzp_key_id: rzp.getRazorpayKeyId(),
      mock_enabled: false,
    };
  });
