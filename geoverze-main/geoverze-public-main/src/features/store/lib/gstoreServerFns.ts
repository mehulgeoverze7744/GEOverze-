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
import { createHmac } from "crypto";
import { z } from "zod";

import {
  getProductPrice,
  computeShippingMinor,
  computeTaxMinor,
  computeOrderTotalMinor,
} from "./gstoreProductPrices";

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

function getRazorpayKeyId(): string {
  return (
    process.env["RAZORPAY_KEY_ID"] ??
    process.env["VITE_RAZORPAY_KEY_ID"] ??
    ""
  );
}

function getRazorpaySecret(): string {
  return process.env["RAZORPAY_KEY_SECRET"] ?? "";
}

function isMockEnabled(): boolean {
  // Explicit opt-in (Vercel env var or .env.local for preview/production testing)
  if (
    process.env["MOCK_PAYMENTS_ENABLED"] === "true" ||
    process.env["VITE_MOCK_PAYMENTS"] === "true"
  ) return true;

  // Auto-enable on local dev when Razorpay is not configured.
  // NODE_ENV=development is set by Vite/TanStack Start during `npm run dev`.
  // This never fires on Vercel (NODE_ENV=production there).
  const razorpayConfigured =
    Boolean(process.env["RAZORPAY_KEY_ID"]) ||
    Boolean(process.env["VITE_RAZORPAY_KEY_ID"]);
  if (process.env["NODE_ENV"] === "development" && !razorpayConfigured) return true;

  return false;
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
  shippingMethod: "standard" | "tracked" | "express";
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
    shippingMethod:  z.enum(["standard", "tracked", "express"]).optional().default("standard"),
  }),
  idempotency_key: z.string().min(1).max(256),
});

export type CreateGstoreOrderInput  = z.infer<typeof CreateOrderSchema>;
export type CreateGstoreOrderResult = {
  order_id:         string;
  order_number:     string;
  payment_id:       string;
  /** GST-inclusive total = subtotal + shipping. */
  total_minor:      number;
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
      const product = getProductPrice(item.slug);
      if (!product) {
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
    const shippingMinor = computeShippingMinor(
      details.shippingMethod,
      subtotalMinor,
      hasPhysical,
    );
    const taxMinor   = computeTaxMinor(subtotalMinor, shippingMinor); // extracted, not added
    const totalMinor = computeOrderTotalMinor(subtotalMinor, shippingMinor, 0);

    // ── Create DB order via RPC ───────────────────────────────────────────
    const sb = makeSupabaseClient(access_token);
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
      p_discount_minor:   0,
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
    const result = rpcResult as {
      order_id: string; order_number: string; payment_id: string; idempotent: boolean;
    };

    // ── Mock mode: skip Razorpay ──────────────────────────────────────────
    if (mock) {
      return {
        order_id:     result.order_id,
        order_number: result.order_number,
        payment_id:   result.payment_id,
        total_minor:  totalMinor,
        currency:     "INR",
        rzp_key_id:   "",
        mock_enabled: true,
        idempotent:   result.idempotent,
      };
    }

    // ── Create Razorpay one-time order ────────────────────────────────────
    const keyId     = getRazorpayKeyId();
    const keySecret = getRazorpaySecret();

    if (!keyId || !keySecret) {
      // Razorpay not configured — return order without rzp_order_id.
      // Client will show "payment unavailable" state.
      return {
        order_id:     result.order_id,
        order_number: result.order_number,
        payment_id:   result.payment_id,
        total_minor:  totalMinor,
        currency:     "INR",
        rzp_key_id:   "",
        mock_enabled: false,
        idempotent:   result.idempotent,
      };
    }

    // POST to Razorpay /v1/orders
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount:          totalMinor,
        currency:        "INR",
        receipt:         result.order_number,
        notes: {
          gvrze_order_id: result.order_id,
          customer_email: details.customerEmail,
        },
      }),
    });

    if (!rzpResponse.ok) {
      const rzpBody = await rzpResponse.text();
      throw new Error(
        `Razorpay order creation failed (${rzpResponse.status}): ${rzpBody}`,
      );
    }

    const rzpOrder = (await rzpResponse.json()) as { id: string };

    return {
      order_id:     result.order_id,
      order_number: result.order_number,
      payment_id:   result.payment_id,
      total_minor:  totalMinor,
      currency:     "INR",
      rzp_order_id: rzpOrder.id,
      rzp_key_id:   keyId,
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
    const keySecret = getRazorpaySecret();
    if (!keySecret) throw new Error("Payment configuration error.");

    // ── Verify Razorpay HMAC-SHA256 signature ─────────────────────────────
    // Razorpay signs: "<rzp_order_id>|<rzp_payment_id>"
    const expectedBody    = `${data.rzp_order_id}|${data.rzp_payment_id}`;
    const expectedSig     = createHmac("sha256", keySecret)
      .update(expectedBody)
      .digest("hex");

    if (expectedSig !== data.rzp_signature) {
      throw new Error("Payment signature verification failed. Do not trust this payment.");
    }

    // ── Confirm in DB ──────────────────────────────────────────────────────
    const sb = makeSupabaseClient(data.access_token);
    const { data: confirmResult, error: confirmError } = await sb.rpc(
      "confirm_gstore_payment",
      {
        p_order_id:            data.order_id,
        p_payment_id:          data.payment_id,
        p_provider_order_id:   data.rzp_order_id,
        p_provider_payment_id: data.rzp_payment_id,
        p_provider_signature:  data.rzp_signature,
        p_outcome:             "success",
      },
    );

    if (confirmError) throw new Error(`Failed to confirm payment: ${confirmError.message}`);

    // Fetch order number for the confirmation page
    const { data: order } = await sb
      .from("gstore_orders")
      .select("order_number")
      .eq("id", data.order_id)
      .single();

    return {
      success:      true,
      order_id:     data.order_id,
      order_number: (order as { order_number: string } | null)?.order_number ?? "",
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
    shippingMethod:  z.enum(["standard", "tracked", "express"]).optional().default("standard"),
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
    const keyId       = getRazorpayKeyId();
    const keySecret   = getRazorpaySecret();

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
      if (!product) throw new Error(`Unknown product: ${item.slug}`);
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

    // 4. Create Razorpay order
    if (!keyId || !keySecret) {
      throw new Error("Razorpay keys not configured.");
    }

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount:          totalMinor,
        currency:        "INR",
        receipt:         r.order_number,
        notes:           {
          order_id:    r.order_id,
          payment_id:  r.payment_id,
          order_type:  "gstore_guest",
        },
      }),
    });

    if (!rzpRes.ok) {
      const errText = await rzpRes.text();
      throw new Error(`Razorpay order creation failed: ${errText}`);
    }

    const rzpOrder = (await rzpRes.json()) as { id: string };

    return {
      order_id:       r.order_id,
      order_number:   r.order_number,
      payment_id:     r.payment_id,
      guest_token:    r.guest_token,
      total_minor:    totalMinor,
      subtotal_minor: subtotalMinor,
      shipping_minor: shippingMinor,
      tax_minor:      taxMinor,
      rzp_order_id:   rzpOrder.id,
      rzp_key_id:     keyId,
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
    const keySecret = getRazorpaySecret();
    if (!keySecret) throw new Error("Razorpay not configured.");

    // HMAC-SHA256 verification
    const expectedBody = `${data.rzp_order_id}|${data.rzp_payment_id}`;
    const expectedSig  = createHmac("sha256", keySecret)
      .update(expectedBody)
      .digest("hex");

    if (expectedSig !== data.rzp_signature) {
      // Confirm as failed so order is not left dangling
      const svc = makeServiceRoleClient();
      await svc.rpc("confirm_gstore_payment_guest", {
        p_order_id:            data.order_id,
        p_payment_id:          data.payment_id,
        p_guest_token:         data.guest_token,
        p_provider_order_id:   data.rzp_order_id,
        p_provider_payment_id: data.rzp_payment_id,
        p_provider_signature:  data.rzp_signature,
        p_outcome:             "failed",
      });
      throw new Error("Payment signature verification failed — payment not confirmed.");
    }

    const svc = makeServiceRoleClient();
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
