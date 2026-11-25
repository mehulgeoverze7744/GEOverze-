/**
 * Idempotent Gstore shipment orchestration (server-only).
 * Never mutates payment_status or marks orders shipped/delivered without a shipment record.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { GSTORE_PRODUCT_PRICES } from "../../features/store/lib/gstoreProductPrices.ts";

import {
  evaluateShipmentEligibility,
  isActiveShipmentStatus,
  type FulfillmentRow,
} from "./shipmentEligibility";
import {
  createAdhocOrder,
  shiprocketLiveEnabled,
  type CreateShipmentOrderInput,
} from "./shiprocketClient.server";

function serviceClient(): SupabaseClient | null {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export type ShipmentOrchestrationResult =
  | { outcome: "created"; shipmentId: string; liveApi: boolean }
  | { outcome: "eligible_pending"; shipmentId: string }
  | { outcome: "ineligible"; code: string; detail?: string }
  | { outcome: "error"; message: string };

function physicalBySlugMap(): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const [slug, row] of Object.entries(GSTORE_PRODUCT_PRICES)) {
    map.set(slug, row.physical);
  }
  return map;
}

function aggregateDimensions(rows: FulfillmentRow[]): {
  weightG: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
} {
  let weightG = 0;
  let maxL = 0;
  let maxB = 0;
  let sumH = 0;
  for (const row of rows) {
    weightG += Number(row.weight_g ?? 0);
    maxL = Math.max(maxL, Number(row.length_cm ?? 0));
    maxB = Math.max(maxB, Number(row.breadth_cm ?? 0));
    sumH += Number(row.height_cm ?? 0);
  }
  return { weightG, lengthCm: maxL, breadthCm: maxB, heightCm: sumH || 10 };
}

export async function createGstoreShipmentIfEligible(orderId: string): Promise<ShipmentOrchestrationResult> {
  const client = serviceClient();
  if (!client) return { outcome: "error", message: "Supabase service client unavailable" };

  const { data: order, error: orderErr } = await client
    .from("gstore_orders")
    .select(
      `
      id, order_number, payment_status, order_status,
      customer_name, customer_email, customer_phone,
      shipping_name, shipping_line1, shipping_line2,
      shipping_city, shipping_state, shipping_pincode, shipping_country,
      subtotal_minor,
      gstore_order_items ( product_slug, product_name, sku, quantity, unit_price_minor )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) return { outcome: "error", message: "Order not found" };

  const { data: existingShipments } = await client
    .from("gstore_shipments")
    .select("id, shipment_status")
    .eq("order_id", orderId);

  const hasActive =
    (existingShipments ?? []).some((s) => isActiveShipmentStatus(String(s.shipment_status))) ?? false;

  const slugs = (order.gstore_order_items ?? []).map((i: { product_slug: string }) => i.product_slug);
  const { data: fulfillmentRows } = await client
    .from("gstore_product_fulfillment")
    .select("product_slug, requires_shipping, logistics_ready, weight_g, length_cm, breadth_cm, height_cm")
    .in("product_slug", slugs.length ? slugs : ["__none__"]);

  const fulfillmentBySlug = new Map<string, FulfillmentRow>();
  for (const row of fulfillmentRows ?? []) {
    fulfillmentBySlug.set(row.product_slug, row as FulfillmentRow);
  }

  const eligibility = evaluateShipmentEligibility({
    order: order,
    lines: (order.gstore_order_items ?? []).map((i: { product_slug: string; quantity: number }) => ({
      product_slug: i.product_slug,
      quantity: i.quantity,
    })),
    physicalBySlug: physicalBySlugMap(),
    fulfillmentBySlug,
    hasActiveShipment: hasActive,
  });

  if (!eligibility.eligible) {
    return {
      outcome: "ineligible",
      code: eligibility.code,
      detail: eligibility.detail,
    };
  }

  const { data: inserted, error: insertErr } = await client
    .from("gstore_shipments")
    .insert({
      order_id: orderId,
      provider: "shiprocket",
      shipment_status: "pending",
    })
    .select("id")
    .single();

  if (insertErr) {
    if (insertErr.code === "23505") {
      return { outcome: "ineligible", code: "active_shipment_exists" };
    }
    return { outcome: "error", message: insertErr.message };
  }

  const shipmentId = inserted.id as string;

  if (!shiprocketLiveEnabled()) {
    return { outcome: "eligible_pending", shipmentId };
  }

  const physicalRows = (fulfillmentRows ?? []).filter((r) => r.requires_shipping) as FulfillmentRow[];
  const dims = aggregateDimensions(physicalRows);

  const lines = (order.gstore_order_items ?? []).map(
    (i: { product_name: string; sku: string; quantity: number; unit_price_minor: number }) => ({
      name: i.product_name,
      sku: i.sku || "gvrze-item",
      units: i.quantity,
      selling_price: Math.round(Number(i.unit_price_minor) / 100),
    }),
  );

  const apiInput: CreateShipmentOrderInput = {
    gstoreOrderId: orderId,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone || order.shipping_name,
    shippingAddress: {
      line1: order.shipping_line1,
      line2: order.shipping_line2 ?? "",
      city: order.shipping_city,
      state: order.shipping_state,
      pincode: order.shipping_pincode,
      country: order.shipping_country || "India",
    },
    lines,
    subtotalRupee: Math.round(Number(order.subtotal_minor) / 100),
    lengthCm: dims.lengthCm,
    breadthCm: dims.breadthCm,
    heightCm: dims.heightCm,
    weightKg: Math.max(dims.weightG / 1000, 0.1),
  };

  const created = await createAdhocOrder(apiInput);
  if (!created.ok) {
    await client
      .from("gstore_shipments")
      .update({
        shipment_status: "failed",
        last_error: created.error.message,
        retry_count: 1,
        raw_last_payload: created.error,
      })
      .eq("id", shipmentId);
    return { outcome: "error", message: created.error.message };
  }

  const raw = created.raw as Record<string, unknown>;
  const providerOrderId =
    raw["order_id"] != null
      ? String(raw["order_id"])
      : raw["shipment_id"] != null
        ? String(raw["shipment_id"])
        : null;
  const providerShipmentId = raw["shipment_id"] != null ? String(raw["shipment_id"]) : null;

  await client
    .from("gstore_shipments")
    .update({
      shipment_status: "created",
      provider_order_id: providerOrderId,
      provider_shipment_id: providerShipmentId,
      raw_last_payload: raw,
      last_error: null,
    })
    .eq("id", shipmentId);

  return { outcome: "created", shipmentId, liveApi: true };
}

export function scheduleGstoreShipmentCreation(orderId: string): void {
  void createGstoreShipmentIfEligible(orderId);
}