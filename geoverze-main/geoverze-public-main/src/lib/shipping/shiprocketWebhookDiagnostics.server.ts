/**
 * Temporary privacy-safe diagnostics for carrier / Shiprocket webhooks.
 * Never log secrets, raw bodies, or customer data.
 */

import { randomUUID } from "node:crypto";

import {
  isShiprocketDownloadedDocumentationSamplePayload,
  isShiprocketOfficialDocumentationDemoPayload,
  type ShiprocketWebhookEnvelope,
} from "./shiprocketWebhookPayload.server.ts";

export type CarrierWebhookAckCategory =
  | "explicit_test"
  | "downloaded_sample"
  | "official_demo"
  | "processed_event"
  | "unauthorized"
  | "unknown_awb"
  | "internal_error";

export type CarrierWebhookRequestLog = {
  event: "carrier_webhook_request";
  correlationId: string;
  method: string;
  pathname: string;
  contentType: string;
  hasApiKey: boolean;
  hasHmac: boolean;
  bodyByteLength: number;
};

export type CarrierWebhookResponseLog = {
  event: "carrier_webhook_response";
  correlationId: string;
  status: number;
  ackCategory: CarrierWebhookAckCategory;
  elapsedMs: number;
  responseBodyByteLength: number;
  httpReason?: string;
};

export type CarrierWebhookProcessingStage =
  | "request_read"
  | "auth_verify"
  | "json_parse"
  | "connectivity_probe"
  | "routing_check"
  | "shipment_process"
  | "response_map"
  | "unhandled";

export type CarrierWebhookStageLog = {
  event: "carrier_webhook_stage";
  correlationId: string;
  stage: CarrierWebhookProcessingStage;
} & Record<string, boolean | number | string | null>;

export type CarrierWebhookExceptionLog = {
  event: "carrier_webhook_exception";
  correlationId: string;
  stage: CarrierWebhookProcessingStage;
  errorName: string;
  errorMessage: string;
  errorStack?: string;
};

const REQUEST_LOG_KEYS: readonly (keyof CarrierWebhookRequestLog)[] = [
  "event",
  "correlationId",
  "method",
  "pathname",
  "contentType",
  "hasApiKey",
  "hasHmac",
  "bodyByteLength",
];

const RESPONSE_LOG_KEYS: readonly (keyof CarrierWebhookResponseLog)[] = [
  "event",
  "correlationId",
  "status",
  "ackCategory",
  "elapsedMs",
  "responseBodyByteLength",
  "httpReason",
];

const STAGE_LOG_ALLOWLIST = new Set([
  "event",
  "correlationId",
  "stage",
  "authOk",
  "connectivityProbe",
  "downloadSampleMatch",
  "officialDemoMatch",
  "explicitTestPayload",
  "routingResolved",
  "scansIsArray",
  "scansLength",
  "awbOk",
  "orderIdOk",
  "currentStatusIdOk",
  "shipmentStatusIdOk",
  "courierNameOk",
  "processOk",
  "processReason",
]);

const FORBIDDEN_LOG_KEY_RE =
  /^(authorization|cookie|x-api-key|x-shiprocket-token|x-shiprocket-hmac|x-signature|rawbody|body|token|signature|hmac|secret|env)$/i;

export function createCarrierWebhookCorrelationId(): string {
  return randomUUID();
}

export function normalizeCarrierWebhookPathname(url: string): string {
  const pathname = new URL(url).pathname;
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function hasCarrierWebhookApiKeyHeader(request: Request): boolean {
  return Boolean(
    request.headers.get("x-api-key")?.trim() || request.headers.get("x-shiprocket-token")?.trim(),
  );
}

export function hasCarrierWebhookHmacHeader(request: Request): boolean {
  return Boolean(
    request.headers.get("x-shiprocket-hmac")?.trim() || request.headers.get("x-signature")?.trim(),
  );
}

export function normalizeCarrierWebhookContentType(request: Request): string {
  const raw = request.headers.get("content-type");
  if (!raw) return "";
  return raw.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function bodyUtf8ByteLength(rawBody: string): number {
  return new TextEncoder().encode(rawBody).length;
}

export function classifyConnectivityProbeAckCategory(
  envelope: ShiprocketWebhookEnvelope,
): CarrierWebhookAckCategory {
  if (isShiprocketDownloadedDocumentationSamplePayload(envelope)) return "downloaded_sample";
  if (isShiprocketOfficialDocumentationDemoPayload(envelope)) return "official_demo";
  return "explicit_test";
}

export function buildCarrierWebhookRequestLog(input: {
  correlationId: string;
  method: string;
  pathname: string;
  contentType: string;
  hasApiKey: boolean;
  hasHmac: boolean;
  bodyByteLength: number;
}): CarrierWebhookRequestLog {
  return {
    event: "carrier_webhook_request",
    correlationId: input.correlationId,
    method: input.method,
    pathname: input.pathname,
    contentType: input.contentType,
    hasApiKey: input.hasApiKey,
    hasHmac: input.hasHmac,
    bodyByteLength: input.bodyByteLength,
  };
}

const SECRET_INLINE_RE =
  /(bearer\s+\S+|x-api-key|authorization|shiprocket_webhook|supabase_service|eyJ[a-zA-Z0-9_-]{10,})/gi;

export function sanitizeExceptionText(value: string, maxLen: number): string {
  return value
    .replace(SECRET_INLINE_RE, "[redacted]")
    .replace(/[a-f0-9]{32,}/gi, "[redacted]")
    .slice(0, maxLen);
}

export function sanitizeExceptionForLog(error: unknown): {
  name: string;
  message: string;
  stack?: string;
} {
  const err = error instanceof Error ? error : new Error("unknown_error");
  const stack = err.stack
    ? sanitizeExceptionText(err.stack, 1200)
    : undefined;
  return {
    name: err.name.slice(0, 80),
    message: sanitizeExceptionText(err.message, 240),
    stack,
  };
}

export function buildCarrierWebhookResponseLog(input: {
  correlationId: string;
  status: number;
  ackCategory: CarrierWebhookAckCategory;
  elapsedMs: number;
  responseBodyByteLength: number;
  httpReason?: string;
}): CarrierWebhookResponseLog {
  return {
    event: "carrier_webhook_response",
    correlationId: input.correlationId,
    status: input.status,
    ackCategory: input.ackCategory,
    elapsedMs: input.elapsedMs,
    responseBodyByteLength: input.responseBodyByteLength,
    ...(input.httpReason ? { httpReason: sanitizeExceptionText(input.httpReason, 80) } : {}),
  };
}

function pickAllowedKeys<T extends Record<string, unknown>>(
  value: T,
  keys: readonly (keyof T)[],
): T {
  const out = {} as T;
  for (const key of keys) {
    if (key in value) out[key] = value[key];
  }
  return out;
}

/** Strip unexpected / sensitive keys before console output (defense in depth). */
export function sanitizeCarrierWebhookLogRecord(
  record: Record<string, unknown>,
): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(record)) {
    if (FORBIDDEN_LOG_KEY_RE.test(key)) continue;
    if (typeof val === "object" && val !== null && !Array.isArray(val)) continue;
    safe[key] = val;
  }
  return safe;
}

export function serializeCarrierWebhookRequestLog(log: CarrierWebhookRequestLog): string {
  const picked = pickAllowedKeys(log, REQUEST_LOG_KEYS);
  return JSON.stringify(sanitizeCarrierWebhookLogRecord(picked as Record<string, unknown>));
}

export function serializeCarrierWebhookResponseLog(log: CarrierWebhookResponseLog): string {
  const picked = pickAllowedKeys(log, RESPONSE_LOG_KEYS);
  return JSON.stringify(sanitizeCarrierWebhookLogRecord(picked as Record<string, unknown>));
}

export function logCarrierWebhookRequestStart(log: CarrierWebhookRequestLog): void {
  console.info("[carrier-webhook-diag]", serializeCarrierWebhookRequestLog(log));
}

export function logCarrierWebhookResponseComplete(log: CarrierWebhookResponseLog): void {
  console.info("[carrier-webhook-diag]", serializeCarrierWebhookResponseLog(log));
}

function pickStageLogFields(record: CarrierWebhookStageLog): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(record)) {
    if (!STAGE_LOG_ALLOWLIST.has(key)) continue;
    if (typeof val === "object" && val !== null) continue;
    safe[key] = val;
  }
  return sanitizeCarrierWebhookLogRecord(safe);
}

export function logCarrierWebhookStage(log: CarrierWebhookStageLog): void {
  console.info("[carrier-webhook-diag]", JSON.stringify(pickStageLogFields(log)));
}

export function logCarrierWebhookException(log: CarrierWebhookExceptionLog): void {
  const safe = sanitizeCarrierWebhookLogRecord({
    event: log.event,
    correlationId: log.correlationId,
    stage: log.stage,
    errorName: log.errorName,
    errorMessage: log.errorMessage,
    ...(log.errorStack ? { errorStack: log.errorStack } : {}),
  });
  console.error("[carrier-webhook-diag]", JSON.stringify(safe));
}