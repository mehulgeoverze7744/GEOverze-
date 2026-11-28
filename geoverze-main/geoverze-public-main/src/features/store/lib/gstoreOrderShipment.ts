/**
 * Customer-facing shipping / tracking presentation for Gstore orders.
 * Does not invent tracking URLs — only uses persisted tracking_url values.
 */

export type GstoreShipmentSnapshot = {
  awb: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  shipment_status: string | null;
};

export type GstoreShippingCustomerView = {
  headline: string;
  detail: string | null;
  trackingUrl: string | null;
  awbLabel: string | null;
  courierName: string | null;
  showTrackButton: boolean;
};

function normalizedHttpUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

function isPaid(paymentStatus: string): boolean {
  return paymentStatus === "paid";
}

const PRE_SHIP_STATUSES = new Set([
  "pending",
  "created",
  "awb_assigned",
  "pickup_scheduled",
]);

export function buildGstoreShippingCustomerView(input: {
  payment_status: string;
  order_status: string;
  tracking_number: string | null;
  shipment: GstoreShipmentSnapshot | null;
}): GstoreShippingCustomerView {
  const trackingUrl = normalizedHttpUrl(input.shipment?.tracking_url);
  const legacyAwb = input.tracking_number?.trim() || null;
  const shipmentAwb = input.shipment?.awb?.trim() || null;
  const awbLabel = shipmentAwb || legacyAwb;
  const courierName = input.shipment?.courier_name?.trim() || null;
  const shipmentStatus = input.shipment?.shipment_status?.trim() || null;

  if (trackingUrl) {
    return {
      headline: "Your order is on the way",
      detail: courierName ? `Shipped via ${courierName}` : null,
      trackingUrl,
      awbLabel,
      courierName,
      showTrackButton: true,
    };
  }

  if (!isPaid(input.payment_status)) {
    return {
      headline: "Shipping updates after payment",
      detail: "Complete payment to start fulfillment.",
      trackingUrl: null,
      awbLabel: null,
      courierName: null,
      showTrackButton: false,
    };
  }

  if (!input.shipment) {
    return {
      headline: "Preparing your order",
      detail: "Shipment pending — we'll email you when your package ships.",
      trackingUrl: null,
      awbLabel: null,
      courierName: null,
      showTrackButton: false,
    };
  }

  if (!awbLabel && !trackingUrl) {
    return {
      headline: "Shipment preparation in progress",
      detail: "Your order is being prepared for dispatch. Tracking will appear once the carrier AWB is assigned.",
      trackingUrl: null,
      awbLabel: null,
      courierName,
      showTrackButton: false,
    };
  }

  if (shipmentStatus && PRE_SHIP_STATUSES.has(shipmentStatus)) {
    return {
      headline: "Preparing your order",
      detail: "Your shipment is being prepared with our courier partner.",
      trackingUrl: null,
      awbLabel,
      courierName,
      showTrackButton: false,
    };
  }

  if (awbLabel && !trackingUrl) {
    return {
      headline: "Shipment in progress",
      detail: courierName
        ? `Shipped via ${courierName}. Tracking link will appear when available from the carrier.`
        : "Tracking link will appear when available from the carrier.",
      trackingUrl: null,
      awbLabel,
      courierName,
      showTrackButton: false,
    };
  }

  return {
    headline: "Preparing your order",
    detail: "Shipment pending — tracking will appear here when available.",
    trackingUrl: null,
    awbLabel: null,
    courierName,
    showTrackButton: false,
  };
}