/**
 * Shiprocket tracking webhook payload helpers (official sample shape).
 * @see https://apidocs.shiprocket.in/
 */

/** Shiprocket JSON may send numeric AWB codes; always coerce before string ops. */
export function shiprocketWebhookString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

export type ShiprocketWebhookEnvelope = {
  awb?: string | number;
  shipment_id?: string | number;
  sr_order_id?: string | number;
  order_id?: string;
  current_status?: string;
  shipment_status?: string;
  current_status_id?: number;
  shipment_status_id?: number;
  current_timestamp?: string;
  scans?: Array<{ activity?: string; date?: string; location?: string; status?: string }>;
  etd?: string;
  channel_order_id?: string;
  channel?: string;
  courier_name?: string;
  test?: boolean;
  webhook_test?: boolean;
  event?: string;
  event_type?: string;
  status?: string;
  [key: string]: unknown;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Shiprocket API documentation sample webhook identifiers (apidocs.shiprocket.in / Postman).
 * All three must match together — never match on AWB alone.
 */
export const SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS = {
  awb: "19041424751540",
  order_id: "1373900_150876814",
  sr_order_id: "348456385",
} as const;

/** Exact documentation sample used in Shiprocket dashboard / API docs connectivity probes. */
export function isShiprocketOfficialDocumentationDemoPayload(
  envelope: ShiprocketWebhookEnvelope,
): boolean {
  const awb = shiprocketWebhookString(envelope.awb);
  const orderId = shiprocketWebhookString(envelope.order_id);
  const srOrderId = envelope.sr_order_id != null ? String(envelope.sr_order_id).trim() : "";
  return (
    awb === SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.awb &&
    orderId === SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.order_id &&
    srOrderId === SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.sr_order_id
  );
}

/** Numeric status ids in live JSON may arrive as strings; coerced before comparison. */
export function shiprocketWebhookStatusIdMatches(value: unknown, expected: number): boolean {
  if (value === expected) return true;
  if (typeof value === "number" && Number.isFinite(value)) return value === expected;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return false;
    const n = Number(trimmed);
    return Number.isFinite(n) && n === expected;
  }
  return false;
}

export type DownloadedSampleMatchDiagnostics = {
  matches: boolean;
  awbOk: boolean;
  orderIdOk: boolean;
  currentStatusOk: boolean;
  shipmentStatusOk: boolean;
  currentStatusIdOk: boolean;
  shipmentStatusIdOk: boolean;
  channelOrderIdOk: boolean;
  channelOk: boolean;
  courierNameOk: boolean;
  scansIsArray: boolean;
  scansLength: number;
};

/** Privacy-safe field-level match flags for dashboard / carrier diagnostics (no field values). */
export function downloadedSampleMatchDiagnostics(
  envelope: ShiprocketWebhookEnvelope,
): DownloadedSampleMatchDiagnostics {
  const awb = shiprocketWebhookString(envelope.awb);
  const orderId = shiprocketWebhookString(envelope.order_id);
  const currentStatus = shiprocketWebhookString(envelope.current_status);
  const shipmentStatus = shiprocketWebhookString(envelope.shipment_status);
  const channelOrderId = shiprocketWebhookString(envelope.channel_order_id);
  const channel = shiprocketWebhookString(envelope.channel);
  const courierName = shiprocketWebhookString(envelope.courier_name);
  const scans = envelope.scans;
  const scansIsArray = Array.isArray(scans);
  const scansLength = scansIsArray ? scans.length : 0;

  const awbOk = awb === SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.awb;
  const orderIdOk = orderId === SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.order_id;
  const currentStatusOk =
    currentStatus === SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.current_status;
  const shipmentStatusOk =
    shipmentStatus === SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.shipment_status;
  const currentStatusIdOk = shiprocketWebhookStatusIdMatches(
    envelope.current_status_id,
    SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.current_status_id,
  );
  const shipmentStatusIdOk = shiprocketWebhookStatusIdMatches(
    envelope.shipment_status_id,
    SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.shipment_status_id,
  );
  const channelOrderIdOk =
    channelOrderId === SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.channel_order_id;
  const channelOk = channel === SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.channel;
  const courierNameOk =
    courierName === SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.courier_name;
  const scansOk = scansIsArray && scansLength > 0;

  const matches =
    awbOk &&
    orderIdOk &&
    currentStatusOk &&
    shipmentStatusOk &&
    currentStatusIdOk &&
    shipmentStatusIdOk &&
    channelOrderIdOk &&
    channelOk &&
    courierNameOk &&
    scansOk;

  return {
    matches,
    awbOk,
    orderIdOk,
    currentStatusOk,
    shipmentStatusOk,
    currentStatusIdOk,
    shipmentStatusIdOk,
    channelOrderIdOk,
    channelOk,
    courierNameOk,
    scansIsArray,
    scansLength,
  };
}

/**
 * Shiprocket dashboard "download sample" webhook (placeholder fields + scan history array).
 * Every identifying field must match — not AWB/status alone. Live dashboard tests may send
 * fewer scan rows than the static API doc export (length is not used for identification).
 */
export const SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS = {
  awb: "59629792084",
  order_id: "13905312",
  current_status: "Delivered",
  current_status_id: 7,
  shipment_status: "Delivered",
  shipment_status_id: 7,
  channel_order_id: "enter your channel order id",
  channel: "enter your channel name",
  courier_name: "enter courier_name",
  scansLength: 11,
} as const;

export function isShiprocketDownloadedDocumentationSamplePayload(
  envelope: ShiprocketWebhookEnvelope,
): boolean {
  return downloadedSampleMatchDiagnostics(envelope).matches;
}

/** Authenticated connectivity probes that must not touch the database. */
export function isShiprocketConnectivityProbe(envelope: ShiprocketWebhookEnvelope): boolean {
  // Evaluate strict doc samples before generic test routing (numeric awb must not throw in routing helpers).
  return (
    isShiprocketDownloadedDocumentationSamplePayload(envelope) ||
    isShiprocketOfficialDocumentationDemoPayload(envelope) ||
    isShiprocketWebhookTestPayload(envelope)
  );
}

/** Dashboard / connectivity test bodies without shipment routing fields. */
export function isShiprocketWebhookTestPayload(envelope: ShiprocketWebhookEnvelope): boolean {
  if (envelope.test === true) return true;
  if (envelope.webhook_test === true) return true;
  if (envelope.event === "test" || envelope.event_type === "test") return true;

  const routing = shipmentRoutingFields(envelope);
  if (routing.length > 0) return false;

  const keys = Object.keys(envelope).filter((k) => envelope[k] !== undefined && envelope[k] !== null);
  if (keys.length === 0) return true;
  if (keys.length <= 2 && keys.every((k) => k === "test" || k === "webhook_test")) return true;

  return false;
}

export function shipmentRoutingFields(envelope: ShiprocketWebhookEnvelope): string[] {
  const fields: string[] = [];
  if (shiprocketWebhookString(envelope.awb)) fields.push("awb");
  if (shiprocketWebhookString(envelope.order_id)) fields.push("order_id");
  if (shiprocketWebhookString(envelope.channel_order_id)) fields.push("channel_order_id");
  if (envelope.sr_order_id != null && String(envelope.sr_order_id).trim()) fields.push("sr_order_id");
  if (envelope.shipment_id != null && String(envelope.shipment_id).trim()) fields.push("shipment_id");
  return fields;
}

export type ShipmentLookup =
  | { kind: "awb"; value: string }
  | { kind: "provider_order_id"; value: string }
  | { kind: "provider_shipment_id"; value: string }
  | { kind: "gstore_order_id"; value: string };

export function resolveShipmentLookup(envelope: ShiprocketWebhookEnvelope): ShipmentLookup | null {
  const awb = shiprocketWebhookString(envelope.awb);
  if (awb) return { kind: "awb", value: awb };

  const srOrder = envelope.sr_order_id != null ? String(envelope.sr_order_id).trim() : "";
  const shipmentId = envelope.shipment_id != null ? String(envelope.shipment_id).trim() : "";
  if (srOrder) return { kind: "provider_shipment_id", value: srOrder };
  if (shipmentId) return { kind: "provider_shipment_id", value: shipmentId };

  const channel = shiprocketWebhookString(envelope.channel_order_id);
  const order = shiprocketWebhookString(envelope.order_id);
  if (channel && UUID_RE.test(channel)) return { kind: "gstore_order_id", value: channel };
  if (order && UUID_RE.test(order)) return { kind: "gstore_order_id", value: order };

  const providerOrder = channel || order;
  if (providerOrder) return { kind: "provider_order_id", value: providerOrder };

  return null;
}

export function primaryTrackingStatus(envelope: ShiprocketWebhookEnvelope): string | undefined {
  return (
    envelope.current_status ??
    envelope.shipment_status ??
    (typeof envelope.status === "string" ? envelope.status : undefined)
  );
}