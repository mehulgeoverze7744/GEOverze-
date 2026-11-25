/**
 * Pure eligibility checks for Gstore physical shipment creation.
 * Used by the orchestrator and unit tests — no I/O.
 */

export type ShipmentAddress = {
  shipping_pincode: string;
  shipping_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
};

export type ShipmentOrderSnapshot = {
  payment_status: string;
  order_status: string;
  shipping_pincode: string;
  shipping_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
};

export type ShipmentLineItem = {
  product_slug: string;
  quantity: number;
};

export type FulfillmentRow = {
  product_slug: string;
  requires_shipping: boolean;
  logistics_ready: boolean;
  weight_g: number | null;
  length_cm: number | null;
  breadth_cm: number | null;
  height_cm: number | null;
};

export type PhysicalProductFlag = {
  slug: string;
  physical: boolean;
};

export type EligibilityFailureCode =
  | "unpaid"
  | "order_terminal"
  | "invalid_pincode"
  | "missing_address"
  | "not_physical"
  | "missing_fulfillment_row"
  | "logistics_incomplete"
  | "active_shipment_exists";

export type ShipmentEligibilityResult =
  | { eligible: true }
  | { eligible: false; code: EligibilityFailureCode; detail?: string };

const TERMINAL_ORDER_STATUSES = new Set(["cancelled", "refunded"]);

export function isValidIndiaPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode.trim());
}

export function orderRequiresPhysicalFulfillment(
  lines: ShipmentLineItem[],
  physicalBySlug: Map<string, boolean>,
): boolean {
  return lines.some((line) => physicalBySlug.get(line.product_slug) !== false);
}

export function evaluateShipmentEligibility(input: {
  order: ShipmentOrderSnapshot;
  lines: ShipmentLineItem[];
  physicalBySlug: Map<string, boolean>;
  fulfillmentBySlug: Map<string, FulfillmentRow>;
  hasActiveShipment: boolean;
}): ShipmentEligibilityResult {
  const { order, lines, physicalBySlug, fulfillmentBySlug, hasActiveShipment } = input;

  if (order.payment_status !== "paid") {
    return { eligible: false, code: "unpaid" };
  }
  if (TERMINAL_ORDER_STATUSES.has(order.order_status)) {
    return { eligible: false, code: "order_terminal", detail: order.order_status };
  }
  if (hasActiveShipment) {
    return { eligible: false, code: "active_shipment_exists" };
  }
  if (!order.shipping_line1?.trim() || !order.shipping_city?.trim() || !order.shipping_state?.trim()) {
    return { eligible: false, code: "missing_address" };
  }
  if (!isValidIndiaPincode(order.shipping_pincode ?? "")) {
    return { eligible: false, code: "invalid_pincode" };
  }

  const needsShip = orderRequiresPhysicalFulfillment(lines, physicalBySlug);
  if (!needsShip) {
    return { eligible: false, code: "not_physical" };
  }

  for (const line of lines) {
    if (physicalBySlug.get(line.product_slug) === false) continue;
    const row = fulfillmentBySlug.get(line.product_slug);
    if (!row) {
      return { eligible: false, code: "missing_fulfillment_row", detail: line.product_slug };
    }
    if (row.requires_shipping && !row.logistics_ready) {
      return { eligible: false, code: "logistics_incomplete", detail: line.product_slug };
    }
  }

  return { eligible: true };
}

export const ACTIVE_SHIPMENT_STATUSES = new Set([
  "pending",
  "created",
  "awb_assigned",
  "pickup_scheduled",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "exception",
]);

export function isActiveShipmentStatus(status: string): boolean {
  return ACTIVE_SHIPMENT_STATUSES.has(status);
}