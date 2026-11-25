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

export async function handleShiprocketWebhookHttpRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, reason: "method_not_allowed" }), { status: 405 });
  }
  const rawBody = await request.text();
  const token = request.headers.get("x-api-key") ?? request.headers.get("x-shiprocket-token");
  const signature = request.headers.get("x-shiprocket-hmac") ?? request.headers.get("x-signature");

  const result = await handleShiprocketWebhookRequest({
    rawBody,
    headers: { token, signature },
  });

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { "content-type": "application/json" },
  });
}