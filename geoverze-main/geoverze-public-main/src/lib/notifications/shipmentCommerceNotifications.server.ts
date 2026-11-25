/**
 * Shipment lifecycle transactional email (Resend) via commerce_notifications ledger.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  deliverCommerceNotice,
  escapeHtmlForEmail,
  formatInrPaise,
  sendResendEmail,
  type CommerceNoticeKind,
} from "./commerceNotificationLedger.server.ts";

const STATUS_TO_KIND: Record<string, CommerceNoticeKind | undefined> = {
  created: "gstore_shipment_created",
  awb_assigned: "gstore_shipment_created",
  pickup_scheduled: "gstore_shipment_created",
  picked_up: "gstore_shipment_picked_up",
  in_transit: "gstore_shipment_in_transit",
  out_for_delivery: "gstore_shipment_out_for_delivery",
  delivered: "gstore_shipment_delivered",
  exception: "gstore_shipment_exception",
};

function serviceClient(): SupabaseClient | null {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
  const serviceRole = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

function siteOrigin(): string {
  return (
    process.env["PUBLIC_SITE_URL"] ??
    process.env["VITE_PUBLIC_SITE_URL"] ??
    "https://gvrze.com"
  ).replace(/\/$/, "");
}

export function scheduleShipmentLifecycleNotification(
  shipmentId: string,
  shipmentStatus: string,
): void {
  void notifyShipmentLifecycle(shipmentId, shipmentStatus);
}

export async function notifyShipmentLifecycle(
  shipmentId: string,
  shipmentStatus: string,
): Promise<void> {
  const kind = STATUS_TO_KIND[shipmentStatus];
  if (!kind) return;

  const client = serviceClient();
  if (!client) return;

  const { data: shipment, error } = await client
    .from("gstore_shipments")
    .select(
      `
      id, awb, tracking_url, courier_name, shipment_status,
      gstore_orders (
        id, order_number, payment_status, customer_email, customer_name, total_minor
      )
    `,
    )
    .eq("id", shipmentId)
    .maybeSingle();

  if (error || !shipment) return;
  const order = shipment.gstore_orders as {
    id: string;
    order_number: string;
    payment_status: string;
    customer_email: string;
    customer_name: string;
    total_minor: number;
  } | null;
  if (!order || order.payment_status !== "paid") return;

  const email = String(order.customer_email ?? "").trim();
  if (!email) return;

  const origin = siteOrigin();
  const tracking = shipment.tracking_url ?? (shipment.awb ? `${origin}/geostore/orders` : origin);
  const subjectByKind: Record<string, string> = {
    gstore_shipment_created: `GVRZE order ${order.order_number} — shipment created`,
    gstore_shipment_picked_up: `GVRZE order ${order.order_number} — picked up`,
    gstore_shipment_in_transit: `GVRZE order ${order.order_number} — in transit`,
    gstore_shipment_out_for_delivery: `GVRZE order ${order.order_number} — out for delivery`,
    gstore_shipment_delivered: `GVRZE order ${order.order_number} — delivered`,
    gstore_shipment_exception: `GVRZE order ${order.order_number} — delivery update`,
  };

  const text = [
    `Hi ${order.customer_name},`,
    `Update for GVRZE order ${order.order_number}: ${shipmentStatus.replace(/_/g, " ")}.`,
    shipment.awb ? `AWB: ${shipment.awb}` : "",
    shipment.courier_name ? `Courier: ${shipment.courier_name}` : "",
    `Track: ${tracking}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Hi ${escapeHtmlForEmail(order.customer_name)},</p>
    <p>Update for order <strong>${escapeHtmlForEmail(order.order_number)}</strong>:
    ${escapeHtmlForEmail(shipmentStatus.replace(/_/g, " "))}.</p>
    ${shipment.awb ? `<p>AWB: ${escapeHtmlForEmail(shipment.awb)}</p>` : ""}
  ${shipment.courier_name ? `<p>Courier: ${escapeHtmlForEmail(shipment.courier_name)}</p>` : ""}
    <p><a href="${tracking}">View tracking</a></p>
  `;

  await deliverCommerceNotice(client, kind, shipmentId, "email", () =>
    sendResendEmail({
      to: email,
      subject: subjectByKind[kind] ?? `GVRZE order ${order.order_number}`,
      html,
      text,
    }),
  );
}

export async function notifyGstoreOrderCancelled(orderId: string): Promise<void> {
  await notifyOrderTerminal(orderId, "gstore_order_cancelled", "cancelled");
}

export async function notifyGstoreOrderRefunded(orderId: string): Promise<void> {
  await notifyOrderTerminal(orderId, "gstore_order_refunded", "refunded");
}

async function notifyOrderTerminal(
  orderId: string,
  kind: CommerceNoticeKind,
  label: string,
): Promise<void> {
  const client = serviceClient();
  if (!client) return;

  const { data: order } = await client
    .from("gstore_orders")
    .select("id, order_number, customer_email, customer_name, payment_status, total_minor")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  const email = String(order.customer_email ?? "").trim();
  if (!email) return;

  const text = `GVRZE order ${order.order_number} was ${label}. Total ${formatInrPaise(Number(order.total_minor))}.`;
  const html = `<p>Your GVRZE order <strong>${escapeHtmlForEmail(order.order_number)}</strong> was ${escapeHtmlForEmail(label)}.</p>`;

  await deliverCommerceNotice(client, kind, orderId, "email", () =>
    sendResendEmail({
      to: email,
      subject: `GVRZE order ${order.order_number} — ${label}`,
      html,
      text,
    }),
  );
}