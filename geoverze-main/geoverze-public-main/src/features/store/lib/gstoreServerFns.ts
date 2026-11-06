/**
 * Gstore One-Time Checkout — Server Functions
 *
 * SECURITY MODEL:
 *   - All price calculations happen server-side from the authoritative
 *     price catalog (gstoreProductPrices.ts). Client prices are never trusted.
 *   - Razorpay secret key (RAZORPAY_KEY_SECRET) is never sent to the browser.
 *   - Payment verification uses HMAC-SHA256 (Razorpay signature verification).
 *   - All DB writes go through SECURITY DEFINER RPCs that check auth.uid().
 *   - Mock mode requires MOCK_PAYMENTS_ENABLED=true in Vercel env vars.
 *
 * ENVIRONMENT VARIABLES (all server-side only except VITE_ ones):
 *   RAZORPAY_KEY_ID        — Razorpay Key ID (also readable as VITE_RAZORPAY_KEY_ID)
 *   RAZORPAY_KEY_SECRET    — Razorpay Key Secret (NEVER expose to client)
 *   VITE_SUPABASE_URL      — Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — Supabase anon key (for authenticated RPC calls)
 *   MOCK_PAYMENTS_ENABLED  — Set to "true" for testing without real payments
 */

import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";
import { z } from "zod";

import {
  getProductPrice,
  computeShippingMinor,
  computeTaxMinor,
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
  return (
    process.env["MOCK_PAYMENTS_ENABLED"] === "true" ||
    process.env["VITE_MOCK_PAYMENTS"] === "true"
  );
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
  total_minor:      number;
  currency:         string;
  /** Present when Razorpay is configured. */
  rzp_order_id?:    string;
  /** Present when mock mode is active. */
  mock_mode?:       boolean;
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
    const subtotalMinor = validatedItems.reduce(
      (sum, i) => sum + i.line_total_minor, 0,
    );
    const hasPhysical = validatedItems.some((i) => i.physical);
    const shippingMinor = computeShippingMinor(
      details.shippingMethod,
      subtotalMinor,
      hasPhysical,
    );
    const taxMinor     = computeTaxMinor(subtotalMinor, shippingMinor);
    const totalMinor   = subtotalMinor + shippingMinor + taxMinor;

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
        mock_mode:    true,
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
