/**
 * Admin-triggered Gstore shipment operations (Shiprocket + DB). Server-only.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { scheduleShipmentLifecycleNotification } from "../notifications/shipmentCommerceNotifications.server.ts";

import { createGstoreShipmentIfEligible } from "./gstoreShipmentOrchestrator.server.ts";
import {
  assignAwb,
  checkServiceability,
  schedulePickup,
  shiprocketLiveEnabled,
  trackByAwb,
} from "./shiprocketClient.server.ts";
import type { GstoreShipmentAction } from "./gstoreShipmentActionTypes";

function serviceClient(): SupabaseClient | null {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export type ShipmentActionResult = {
  ok: boolean;
  code: string;
  message?: string;
  detail?: unknown;
  shipment?: Record<string, unknown> | null;
};

async function latestShipment(client: SupabaseClient, orderId: string) {
  const { data } = await client
    .from("gstore_shipments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

async function loadOrderForServiceability(client: SupabaseClient, orderId: string) {
  const { data: order } = await client
    .from("gstore_orders")
    .select("id, payment_status, shipping_pincode, subtotal_minor, gstore_order_items(product_slug, quantity)")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;
  const slugs =
    (order as { gstore_order_items?: Array<{ product_slug: string }> }).gstore_order_items?.map(
      (i) => i.product_slug,
    ) ?? [];
  const { data: fulfillment } = await client
    .from("gstore_product_fulfillment")
    .select("weight_g")
    .in("product_slug", slugs.length ? slugs : ["__none__"]);
  const weightG = (fulfillment ?? []).reduce((sum, row) => sum + Number(row.weight_g ?? 0), 0);
  return { order, weightKg: Math.max(weightG / 1000, 0.1) };
}

export async function executeGstoreShipmentAdminAction(
  orderId: string,
  action: GstoreShipmentAction,
): Promise<ShipmentActionResult> {
  if (!shiprocketLiveEnabled()) {
    if (action === "create_shipment" || action === "retry_shipment") {
      const pending = await createGstoreShipmentIfEligible(orderId);
      if (pending.outcome === "ineligible") {
        return { ok: false, code: pending.code, message: pending.detail };
      }
      if (pending.outcome === "error") {
        return { ok: false, code: "error", message: pending.message };
      }
      return {
        ok: true,
        code: "pending_only",
        message: "SHIPROCKET_LIVE_ENABLED is not true — shipment row prepared without carrier API calls.",
        shipment: { id: pending.shipmentId },
      };
    }
    return {
      ok: false,
      code: "live_disabled",
      message: "SHIPROCKET_LIVE_ENABLED is not true",
    };
  }

  const client = serviceClient();
  if (!client) return { ok: false, code: "server_config", message: "Service client unavailable" };

  if (action === "create_shipment") {
    const result = await runFullCreatePipeline(orderId, client);
    return result;
  }

  if (action === "retry_shipment") {
    const { data: failedRow } = await client
      .from("gstore_shipments")
      .select("id")
      .eq("order_id", orderId)
      .eq("shipment_status", "failed")
      .maybeSingle();
    if (!failedRow) {
      return { ok: false, code: "no_failed_shipment" };
    }
    await client
      .from("gstore_shipments")
      .update({ shipment_status: "cancelled", last_error: "superseded_by_retry" })
      .eq("id", failedRow.id);
    const result = await runFullCreatePipeline(orderId, client, true);
    return result;
  }

  if (action === "check_serviceability") {
    const ctx = await loadOrderForServiceability(client, orderId);
    if (!ctx) return { ok: false, code: "order_not_found" };
    if (ctx.order.payment_status !== "paid") return { ok: false, code: "unpaid" };
    const pickup = process.env["SHIPROCKET_PICKUP_PINCODE"]?.trim() || "110001";
    const check = await checkServiceability({
      pickupPincode: pickup,
      deliveryPincode: String(ctx.order.shipping_pincode),
      weightKg: ctx.weightKg,
      cod: false,
    });
    if (!check.ok) {
      return { ok: false, code: check.error.code, message: check.error.message };
    }
    return { ok: true, code: "serviceability_ok", detail: check.raw };
  }

  const shipment = await latestShipment(client, orderId);
  if (!shipment) return { ok: false, code: "shipment_not_found" };

  if (action === "assign_awb") {
    const providerId = shipment.provider_shipment_id;
    if (!providerId) return { ok: false, code: "missing_provider_shipment_id" };
    const assigned = await assignAwb(providerId);
    if (!assigned.ok) {
      await client
        .from("gstore_shipments")
        .update({ last_error: assigned.error.message, shipment_status: "failed" })
        .eq("id", shipment.id);
      return { ok: false, code: assigned.error.code, message: assigned.error.message };
    }
    const raw = assigned.raw as Record<string, unknown>;
    const awb = raw["awb_code"] != null ? String(raw["awb_code"]) : raw["awb"] != null ? String(raw["awb"]) : null;
    await client
      .from("gstore_shipments")
      .update({
        shipment_status: "awb_assigned",
        awb,
        courier_name: raw["courier_name"] != null ? String(raw["courier_name"]) : shipment.courier_name,
        courier_id: raw["courier_company_id"] != null ? String(raw["courier_company_id"]) : shipment.courier_id,
        raw_last_payload: raw,
        last_error: null,
      })
      .eq("id", shipment.id);
    if (shipment.id) scheduleShipmentLifecycleNotification(String(shipment.id), "awb_assigned");
    return { ok: true, code: "awb_assigned", detail: raw, shipment: { ...shipment, awb } };
  }

  if (action === "schedule_pickup") {
    const providerId = shipment.provider_shipment_id;
    if (!providerId) return { ok: false, code: "missing_provider_shipment_id" };
    const pickup = await schedulePickup([providerId]);
    if (!pickup.ok) {
      return { ok: false, code: pickup.error.code, message: pickup.error.message };
    }
    await client
      .from("gstore_shipments")
      .update({
        shipment_status: "pickup_scheduled",
        pickup_scheduled_at: new Date().toISOString(),
        raw_last_payload: pickup.raw as Record<string, unknown>,
      })
      .eq("id", shipment.id);
    scheduleShipmentLifecycleNotification(String(shipment.id), "pickup_scheduled");
    return { ok: true, code: "pickup_scheduled", detail: pickup.raw };
  }

  if (action === "refresh_tracking") {
    const awb = shipment.awb;
    if (!awb) return { ok: false, code: "missing_awb" };
    const track = await trackByAwb(String(awb));
    if (!track.ok) {
      return { ok: false, code: track.error.code, message: track.error.message };
    }
    const raw = track.raw as Record<string, unknown>;
    const trackingData = (raw["tracking_data"] ?? raw) as Record<string, unknown>;
    const trackStatus =
      trackingData["shipment_status"] != null
        ? String(trackingData["shipment_status"])
        : trackingData["current_status"] != null
          ? String(trackingData["current_status"])
          : null;
    await client
      .from("gstore_shipments")
      .update({
        raw_last_payload: raw,
        last_tracking_event: trackStatus,
      })
      .eq("id", shipment.id);
    return { ok: true, code: "tracking_refreshed", detail: raw };
  }

  return { ok: false, code: "unknown_action" };
}

async function runFullCreatePipeline(
  orderId: string,
  client: SupabaseClient,
  isRetry = false,
): Promise<ShipmentActionResult> {
  const created = await createGstoreShipmentIfEligible(orderId);
  if (created.outcome === "ineligible") {
    return { ok: false, code: created.code, message: created.detail };
  }
  if (created.outcome === "error") {
    return { ok: false, code: "error", message: created.message };
  }
  if (created.outcome === "eligible_pending") {
    return {
      ok: true,
      code: "pending_only",
      message: "Eligibility passed; live Shiprocket API did not run.",
      shipment: { id: created.shipmentId },
    };
  }

  const shipment = await latestShipment(client, orderId);
  if (!shipment?.provider_shipment_id) {
    return { ok: true, code: "created", shipment, message: "Shiprocket order created without shipment id" };
  }

  const pickupPincode = process.env["SHIPROCKET_PICKUP_PINCODE"]?.trim() || "110001";
  const { data: orderRow } = await client
    .from("gstore_orders")
    .select("shipping_pincode")
    .eq("id", orderId)
    .maybeSingle();
  if (orderRow?.shipping_pincode) {
    const svc = await checkServiceability({
      pickupPincode,
      deliveryPincode: String(orderRow.shipping_pincode),
      weightKg: 0.5,
      cod: false,
    });
    if (!svc.ok) {
      await client
        .from("gstore_shipments")
        .update({ last_error: svc.error.message, shipment_status: "failed" })
        .eq("id", shipment.id);
      return { ok: false, code: "serviceability_failed", message: svc.error.message };
    }
  }

  const awb = await assignAwb(shipment.provider_shipment_id);
  if (!awb.ok) {
    await client
      .from("gstore_shipments")
      .update({ last_error: awb.error.message, shipment_status: "failed", retry_count: isRetry ? 2 : 1 })
      .eq("id", shipment.id);
    return { ok: false, code: "awb_failed", message: awb.error.message };
  }

  const awbRaw = awb.raw as Record<string, unknown>;
  const awbCode = awbRaw["awb_code"] != null ? String(awbRaw["awb_code"]) : null;
  await client
    .from("gstore_shipments")
    .update({
      shipment_status: "awb_assigned",
      awb: awbCode,
      courier_name: awbRaw["courier_name"] != null ? String(awbRaw["courier_name"]) : null,
      raw_last_payload: awbRaw,
      last_error: null,
    })
    .eq("id", shipment.id);

  scheduleShipmentLifecycleNotification(String(shipment.id), "created");
  if (awbCode) scheduleShipmentLifecycleNotification(String(shipment.id), "awb_assigned");

  const pickup = await schedulePickup([shipment.provider_shipment_id]);
  if (pickup.ok) {
    await client
      .from("gstore_shipments")
      .update({
        shipment_status: "pickup_scheduled",
        pickup_scheduled_at: new Date().toISOString(),
      })
      .eq("id", shipment.id);
    scheduleShipmentLifecycleNotification(String(shipment.id), "pickup_scheduled");
  }

  const fresh = await latestShipment(client, orderId);
  return { ok: true, code: "shipment_pipeline_complete", shipment: fresh, detail: { awb: awbRaw, pickup: pickup.ok } };
}

// Re-export type for handler
export type { GstoreShipmentAction };