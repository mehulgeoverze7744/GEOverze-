import type { OrderShippingFields, ShipmentFilterBucket, ShippingSummaryRow } from "./shipment-types";

export function deriveShipmentFilterBucket(row: Pick<ShippingSummaryRow, "payment_status" | "shipment_status" | "logistics_incomplete">): ShipmentFilterBucket {
  if (row.logistics_incomplete && row.payment_status === "paid") {
    return "logistics_incomplete";
  }
  const status = row.shipment_status ?? "none";
  if (status === "failed") return "shipment_failed";
  if (status === "delivered") return "delivered";
  if (status === "out_for_delivery") return "out_for_delivery";
  if (status === "in_transit") return "in_transit";
  if (status === "picked_up") return "picked_up";
  if (status === "pending") return "shipment_pending";
  if (status === "created" || status === "awb_assigned" || status === "pickup_scheduled") {
    return "shipment_created";
  }
  if (row.payment_status === "paid" && (status === "none" || status === "cancelled")) {
    return "awaiting_shipment";
  }
  return "all";
}

export function mergeShippingSummary(
  orderId: string,
  summary: ShippingSummaryRow | undefined,
): OrderShippingFields {
  const paymentStatus = summary?.payment_status ?? "unknown";
  const shipmentStatus = summary?.shipment_status ?? "none";
  const bucket = summary ? deriveShipmentFilterBucket(summary) : "all";
  return {
    orderNumber: summary?.order_number ?? orderId.slice(0, 8),
    paymentStatus,
    shipmentStatus,
    courierName: summary?.courier_name ?? null,
    awb: summary?.awb ?? null,
    trackingAvailable: Boolean(summary?.tracking_available),
    orderEmailStatus: summary?.order_email_status ?? null,
    logisticsIncomplete: Boolean(summary?.logistics_incomplete),
    shipmentFilterBucket: bucket,
  };
}

export function matchesShipmentFilter(
  bucket: ShipmentFilterBucket,
  filter: ShipmentFilterBucket,
): boolean {
  if (filter === "all") return true;
  return bucket === filter;
}