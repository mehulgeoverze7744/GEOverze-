/**
 * POST /api/webhooks/shiprocket
 * POST /api/webhooks/carrier  — same handler (neutral public URL)
 */

import { handleShiprocketWebhookRequest } from "./shiprocketWebhookHandler.server.ts";
import {
  bodyUtf8ByteLength,
  buildCarrierWebhookRequestLog,
  buildCarrierWebhookResponseLog,
  createCarrierWebhookCorrelationId,
  hasCarrierWebhookApiKeyHeader,
  hasCarrierWebhookHmacHeader,
  logCarrierWebhookException,
  logCarrierWebhookRequestStart,
  logCarrierWebhookResponseComplete,
  logCarrierWebhookStage,
  normalizeCarrierWebhookContentType,
  normalizeCarrierWebhookPathname,
  sanitizeExceptionForLog,
  type CarrierWebhookAckCategory,
} from "./shiprocketWebhookDiagnostics.server.ts";

/** Both paths invoke the same authenticated webhook processor. */
export const CARRIER_WEBHOOK_PATHNAMES = [
  "/api/webhooks/shiprocket",
  "/api/webhooks/carrier",
] as const;

export function matchesCarrierWebhookRoute(method: string, pathname: string): boolean {
  return (
    method === "POST" &&
    (CARRIER_WEBHOOK_PATHNAMES as readonly string[]).includes(pathname)
  );
}

function shiprocketWebhookJsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function elapsedMsSince(startedAt: number): number {
  return Math.max(0, Math.round(performance.now() - startedAt));
}

export async function handleShiprocketWebhookHttpRequest(request: Request): Promise<Response> {
  const startedAt = performance.now();
  const correlationId = createCarrierWebhookCorrelationId();
  const pathname = normalizeCarrierWebhookPathname(request.url);
  const contentType = normalizeCarrierWebhookContentType(request);

  let rawBody = "";
  let bodyByteLength = 0;
  if (request.method === "POST") {
    rawBody = await request.text();
    bodyByteLength = bodyUtf8ByteLength(rawBody);
  }

  logCarrierWebhookRequestStart(
    buildCarrierWebhookRequestLog({
      correlationId,
      method: request.method,
      pathname,
      contentType,
      hasApiKey: hasCarrierWebhookApiKeyHeader(request),
      hasHmac: hasCarrierWebhookHmacHeader(request),
      bodyByteLength,
    }),
  );

  const complete = (
    status: number,
    body: Record<string, unknown>,
    ackCategory: CarrierWebhookAckCategory,
  ) => {
    const responseBody = JSON.stringify(body);
    const httpReason = typeof body.reason === "string" ? body.reason : undefined;
    logCarrierWebhookResponseComplete(
      buildCarrierWebhookResponseLog({
        correlationId,
        status,
        ackCategory,
        elapsedMs: elapsedMsSince(startedAt),
        responseBodyByteLength: bodyUtf8ByteLength(responseBody),
        httpReason,
      }),
    );
    return shiprocketWebhookJsonResponse(status, body);
  };

  if (request.method !== "POST") {
    return complete(405, { ok: false, reason: "method_not_allowed" }, "internal_error");
  }

  try {
    logCarrierWebhookStage({
      event: "carrier_webhook_stage",
      correlationId,
      stage: "request_read",
      authOk: false,
    });

    const token = request.headers.get("x-api-key") ?? request.headers.get("x-shiprocket-token");
    const signature = request.headers.get("x-shiprocket-hmac") ?? request.headers.get("x-signature");

    const result = await handleShiprocketWebhookRequest({
      rawBody,
      headers: { token, signature },
      diagnostics: { correlationId },
    });

    logCarrierWebhookStage({
      event: "carrier_webhook_stage",
      correlationId,
      stage: "response_map",
      authOk: true,
      processOk: result.status < 400,
    });

    return complete(result.status, result.body, result.ackCategory);
  } catch (error) {
    const sanitized = sanitizeExceptionForLog(error);
    logCarrierWebhookException({
      event: "carrier_webhook_exception",
      correlationId,
      stage: "unhandled",
      errorName: sanitized.name,
      errorMessage: sanitized.message,
      errorStack: sanitized.stack,
    });
    return complete(
      503,
      {
        ok: false,
        reason: "internal_error",
        retryable: true,
      },
      "internal_error",
    );
  }
}