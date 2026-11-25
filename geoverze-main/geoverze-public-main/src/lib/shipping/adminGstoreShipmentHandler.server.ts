/**
 * POST /api/admin/gstore/shipment — admin-authenticated Shiprocket operations.
 */

import { extractBearerToken, verifyAdminBearerToken } from "./adminGstoreShippingAuth.server.ts";
import {
  executeGstoreShipmentAdminAction,
  type ShipmentActionResult,
} from "./gstoreShipmentOperations.server.ts";
import type { GstoreShipmentAction } from "./gstoreShipmentActionTypes.ts";
import { GSTORE_SHIPMENT_SERVER_ACTIONS } from "./gstoreShipmentActionTypes.ts";

type RequestBody = {
  orderId?: string;
  action?: string;
};

function json(status: number, body: ShipmentActionResult | Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function handleAdminGstoreShipmentRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json(405, { ok: false, code: "method_not_allowed" });
  }

  const token = extractBearerToken(request.headers.get("Authorization"));
  const auth = await verifyAdminBearerToken(token);
  if (!auth.ok) {
    return json(auth.status, { ok: false, code: auth.status === 401 ? "unauthorized" : "forbidden", message: auth.message });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return json(400, { ok: false, code: "invalid_json" });
  }

  const orderId = body.orderId?.trim();
  const action = body.action?.trim() as GstoreShipmentAction | undefined;
  if (!orderId || !action) {
    return json(400, { ok: false, code: "missing_fields" });
  }
  if (!GSTORE_SHIPMENT_SERVER_ACTIONS.has(action)) {
    return json(400, { ok: false, code: "invalid_action" });
  }

  const result = await executeGstoreShipmentAdminAction(orderId, action);
  const status = result.ok ? 200 : result.code === "unpaid" ? 422 : 502;
  return json(status, result);
}