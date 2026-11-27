/**
 * Process Shiprocket tracking webhooks (server-only).
 * Persists idempotent gstore_shipment_events and syncs shipment_status.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { scheduleShipmentLifecycleNotification } from "../notifications/shipmentCommerceNotifications.server.ts";

import { isActiveShipmentStatus } from "./shipmentEligibility.ts";
import {
  primaryTrackingStatus,
  resolveShipmentLookup,
  shiprocketWebhookString,
  type ShiprocketWebhookEnvelope,
} from "./shiprocketWebhookPayload.server.ts";

export type { ShiprocketWebhookEnvelope } from "./shiprocketWebhookPayload.server.ts";

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
  const awb = shiprocketWebhookString(envelope.awb);
  const status = primaryTrackingStatus(envelope) ?? "";
  const scan = envelope.scans?.[0];
  const stamp = scan?.date ?? "";
  if (awb && status && stamp) return `${awb}:${status}:${stamp}`;
  if (awb && status) return `${awb}:${status}`;
  return `payload:${Buffer.from(rawBody).toString("base64url").slice(0, 48)}`;
}

export type WebhookProcessResult =
  | { ok: true; duplicate: boolean; shipmentId?: string }
  | { ok: false; reason: string; retryable?: boolean };

export async function processShiprocketWebhook(
  rawBody: string,
  envelope: ShiprocketWebhookEnvelope,
): Promise<WebhookProcessResult> {
  const client = serviceClient();
  if (!client) return { ok: false, reason: "service_client_unavailable", retryable: true };

  const lookup = resolveShipmentLookup(envelope);
  if (!lookup) return { ok: false, reason: "missing_routing_fields" };

  let shipmentQuery = client.from("gstore_shipments").select("id, shipment_status, order_id");
  switch (lookup.kind) {
    case "awb":
      shipmentQuery = shipmentQuery.eq("awb", lookup.value);
      break;
    case "provider_order_id":
      shipmentQuery = shipmentQuery.eq("provider_order_id", lookup.value);
      break;
    case "provider_shipment_id":
      shipmentQuery = shipmentQuery.eq("provider_shipment_id", lookup.value);
      break;
    case "gstore_order_id":
      shipmentQuery = shipmentQuery.eq("order_id", lookup.value);
      break;
  }

  const { data: shipment, error: shipErr } = await shipmentQuery.maybeSingle();
  if (shipErr) {
    console.error("[shiprocket-webhook] shipment lookup error", shipErr.message);
    return { ok: false, reason: "shipment_lookup_failed", retryable: true };
  }
  if (!shipment) {
    return { ok: false, reason: "shipment_not_found", retryable: true };
  }

  const trackingStatus = primaryTrackingStatus(envelope);
  const providerEventId = resolveProviderEventId(envelope, rawBody);
  const mappedStatus = mapShiprocketStatusToShipmentStatus(trackingStatus);
  const lastEvent = envelope.scans?.[0]?.activity ?? trackingStatus ?? null;
  const awb = shiprocketWebhookString(envelope.awb);

  const { error: insertErr } = await client.from("gstore_shipment_events").insert({
    shipment_id: shipment.id,
    provider_event_id: providerEventId,
    status: mappedStatus ?? trackingStatus ?? null,
    event_description: lastEvent,
    event_timestamp: envelope.scans?.[0]?.date
      ? new Date(envelope.scans[0].date).toISOString()
      : new Date().toISOString(),
    raw_payload: envelope as Record<string, unknown>,
  });

  const duplicateEvent = Boolean(insertErr?.code === "23505");

  if (insertErr && !duplicateEvent) {
    console.error("[shiprocket-webhook] event insert failed", insertErr.message);
    return { ok: false, reason: "event_persist_failed", retryable: true };
  }

  const sync = await applyTrackingUpdateToShipment(client, shipment.id, {
    envelope,
    mappedStatus,
    trackingStatus,
    lastEvent,
    awb,
  });
  if (!sync.ok) return sync;

  return { ok: true, duplicate: duplicateEvent, shipmentId: shipment.id };
}

type TrackingSyncInput = {
  envelope: ShiprocketWebhookEnvelope;
  mappedStatus: string | null;
  trackingStatus: string | undefined;
  lastEvent: string | null;
  awb: string | undefined;
};

/** Idempotent shipment row sync after event row exists (or duplicate event retry). */
export async function applyTrackingUpdateToShipment(
  client: SupabaseClient,
  shipmentId: string,
  input: TrackingSyncInput,
): Promise<{ ok: true } | { ok: false; reason: string; retryable: true }> {
  const { envelope, mappedStatus, trackingStatus, lastEvent, awb } = input;
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

  const { error: updateErr } = await client.from("gstore_shipments").update(patch).eq("id", shipmentId);
  if (updateErr) {
    console.error("[shiprocket-webhook] shipment update failed", updateErr.message);
    return { ok: false, reason: "shipment_update_failed", retryable: true };
  }

  if (mappedStatus) {
    scheduleShipmentLifecycleNotification(shipmentId, mappedStatus);
  }

  return { ok: true };
}