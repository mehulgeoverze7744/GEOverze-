/**
 * POST /api/webhooks/shiprocket
 * POST /api/webhooks/carrier  — same handler (neutral public URL)
 */

import { handleShiprocketWebhookRequest } from "./shiprocketWebhookHandler.server.ts";

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

export async function handleShiprocketWebhookHttpRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return shiprocketWebhookJsonResponse(405, { ok: false, reason: "method_not_allowed" });
  }

  try {
    const rawBody = await request.text();
    const token = request.headers.get("x-api-key") ?? request.headers.get("x-shiprocket-token");
    const signature = request.headers.get("x-shiprocket-hmac") ?? request.headers.get("x-signature");

    const result = await handleShiprocketWebhookRequest({
      rawBody,
      headers: { token, signature },
    });

    return shiprocketWebhookJsonResponse(result.status, result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    console.error("[shiprocket-webhook] unhandled handler error", message);
    return shiprocketWebhookJsonResponse(503, {
      ok: false,
      reason: "internal_error",
      retryable: true,
    });
  }
}