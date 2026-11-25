/**
 * Process Shiprocket tracking webhooks (server-only).
 * Persists idempotent gstore_shipment_events and syncs shipment_status.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { scheduleShipmentLifecycleNotification } from "../notifications/shipmentCommerceNotifications.server.ts";

import { isActiveShipmentStatus } from "./shipmentEligibility.ts";

export type ShiprocketWebhookEnvelope = {
  awb?: string;
  shipment_id?: string | number;
  order_id?: string;
  current_status?: string;
  current_status_id?: number;
  scans?: Array<{ activity?: string; date?: string; location?: string }>;
  etd?: string;
  channel_order_id?: string;
  [key: string]: unknown;
};

function serviceClient(): SupabaseClient | null {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function mapShiprocketStatusToShipmentStatus(raw: string | undefined): string | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase().replace(/\s+/g, "_");
  const table: Record<string, string> = {
    pickup_scheduled: "pickup_scheduled",
    picked_up: "picked_up",
    shipped: "in_transit",
    in_transit: "in_transit",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    rto: "exception",
    rto_initiated: "exception",
    rto_delivered: "exception",
    lost: "exception",
    canceled: "cancelled",
    cancelled: "cancelled",
    undelivered: "exception",
  };
  return table[normalized] ?? (isActiveShipmentStatus(normalized) ? normalized : null);
}

export function resolveProviderEventId(
  envelope: ShiprocketWebhookEnvelope,
  rawBody: string,
): string {
  const awb = envelope.awb ?? "";
  const status = envelope.current_status ?? "";
  const scan = envelope.scans?.[0];
  const stamp = scan?.date ?? "";
  if (awb && status && stamp) return `${awb}:${status}:${stamp}`;
  if (awb && status) return `${awb}:${status}`;
  return `payload:${Buffer.from(rawBody).toString("base64url").slice(0, 48)}`;
}

export type WebhookProcessResult =
  | { ok: true; duplicate: boolean; shipmentId?: string }
  | { ok: false; reason: string };

export async function processShiprocketWebhook(
  rawBody: string,
  envelope: ShiprocketWebhookEnvelope,
): Promise<WebhookProcessResult> {
  const client = serviceClient();
  if (!client) return { ok: false, reason: "service_client_unavailable" };

  const gstoreOrderId = envelope.channel_order_id ?? envelope.order_id;
  const awb = envelope.awb?.trim();

  let shipmentQuery = client.from("gstore_shipments").select("id, shipment_status, order_id");
  if (awb) {
    shipmentQuery = shipmentQuery.eq("awb", awb);
  } else if (gstoreOrderId) {
    shipmentQuery = shipmentQuery.eq("order_id", gstoreOrderId);
  } else {
    return { ok: false, reason: "missing_awb_or_order_id" };
  }

  const { data: shipment, error: shipErr } = await shipmentQuery.maybeSingle();
  if (shipErr || !shipment) return { ok: false, reason: "shipment_not_found" };

  const providerEventId = resolveProviderEventId(envelope, rawBody);
  const mappedStatus = mapShiprocketStatusToShipmentStatus(envelope.current_status);
  const lastEvent =
    envelope.scans?.[0]?.activity ?? envelope.current_status ?? null;

  const { error: insertErr } = await client.from("gstore_shipment_events").insert({
    shipment_id: shipment.id,
    provider_event_id: providerEventId,
    status: mappedStatus ?? envelope.current_status ?? null,
    event_description: lastEvent,
    event_timestamp: envelope.scans?.[0]?.date
      ? new Date(envelope.scans[0].date).toISOString()
      : new Date().toISOString(),
    raw_payload: envelope as Record<string, unknown>,
  });

  if (insertErr) {
    if (insertErr.code === "23505") return { ok: true, duplicate: true, shipmentId: shipment.id };
    return { ok: false, reason: insertErr.message };
  }

  const patch: Record<string, unknown> = {
    raw_last_payload: envelope,
    last_tracking_event: lastEvent,
  };
  if (mappedStatus) patch["shipment_status"] = mappedStatus;
  if (awb) patch["awb"] = awb;
  if (envelope.shipment_id != null) patch["provider_shipment_id"] = String(envelope.shipment_id);
  if (envelope.etd) {
    const d = new Date(envelope.etd);
    if (!Number.isNaN(d.getTime())) patch["estimated_delivery_date"] = d.toISOString().slice(0, 10);
  }

  await client.from("gstore_shipments").update(patch).eq("id", shipment.id);

  if (mappedStatus) {
    scheduleShipmentLifecycleNotification(shipment.id, mappedStatus);
  }

  return { ok: true, duplicate: false, shipmentId: shipment.id };
}