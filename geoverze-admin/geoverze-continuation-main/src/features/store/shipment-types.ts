export type ShipmentFilterBucket =
  | "all"
  | "awaiting_shipment"
  | "shipment_pending"
  | "shipment_created"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "shipment_failed"
  | "logistics_incomplete";

export const shipmentFilterOptions: { label: string; value: ShipmentFilterBucket }[] = [
  { label: "All shipments", value: "all" },
  { label: "Awaiting shipment", value: "awaiting_shipment" },
  { label: "Shipment pending", value: "shipment_pending" },
  { label: "Shipment created", value: "shipment_created" },
  { label: "Picked up", value: "picked_up" },
  { label: "In transit", value: "in_transit" },
  { label: "Out for delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Shipment failed", value: "shipment_failed" },
  { label: "Logistics incomplete", value: "logistics_incomplete" },
];

export type ShippingSummaryRow = {
  order_id: string;
  order_number: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  shipment_id: string | null;
  shipment_status: string;
  courier_name: string | null;
  awb: string | null;
  tracking_url: string | null;
  tracking_available: boolean;
  order_email_status: string | null;
  logistics_incomplete: boolean;
};

export type GstoreShipmentAction =
  | "create_shipment"
  | "retry_shipment"
  | "check_serviceability"
  | "assign_awb"
  | "schedule_pickup"
  | "refresh_tracking";

export type FulfillmentRow = {
  product_slug: string;
  requires_shipping: boolean;
  weight_g: number | null;
  length_cm: number | null;
  breadth_cm: number | null;
  height_cm: number | null;
  hsn_code: string | null;
  logistics_ready: boolean;
  admin_notes?: string;
};

export type ShipmentEventRow = {
  id: string;
  shipment_id: string;
  provider_event_id: string;
  status: string | null;
  event_description: string | null;
  event_timestamp: string | null;
  created_at: string;
};

export type CommerceNotificationRow = {
  id: string;
  kind: string;
  source_id: string;
  channel: string;
  status: string;
  error: string | null;
  sent_at: string | null;
  provider_message_id: string | null;
  attempt_count: number | null;
  created_at: string;
};

export type OrderShippingDetail = {
  order: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  shipment: Record<string, unknown> | null;
  shipment_events: ShipmentEventRow[];
  notifications: CommerceNotificationRow[];
  fulfillment: FulfillmentRow[];
};

export type OrderShippingFields = {
  orderNumber: string;
  paymentStatus: string;
  shipmentStatus: string;
  courierName: string | null;
  awb: string | null;
  trackingAvailable: boolean;
  orderEmailStatus: string | null;
  logisticsIncomplete: boolean;
  shipmentFilterBucket: ShipmentFilterBucket;
};