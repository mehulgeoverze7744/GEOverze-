export type GstoreShipmentAction =
  | "create_shipment"
  | "retry_shipment"
  | "check_serviceability"
  | "assign_awb"
  | "schedule_pickup"
  | "refresh_tracking";

export const GSTORE_SHIPMENT_SERVER_ACTIONS = new Set<GstoreShipmentAction>([
  "create_shipment",
  "retry_shipment",
  "check_serviceability",
  "assign_awb",
  "schedule_pickup",
  "refresh_tracking",
]);