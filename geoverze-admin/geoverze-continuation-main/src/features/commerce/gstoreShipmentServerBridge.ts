import { supabase } from "@/lib/supabase/client";

import type { GstoreShipmentAction } from "@/features/store/shipment-types";

export type GstoreShipmentServerResult = {
  ok: boolean;
  code?: string;
  message?: string;
  detail?: unknown;
  shipment?: Record<string, unknown> | null;
};

const SERVER_ACTIONS = new Set<GstoreShipmentAction>([
  "create_shipment",
  "retry_shipment",
  "check_serviceability",
  "assign_awb",
  "schedule_pickup",
  "refresh_tracking",
]);

function commerceApiOrigin(): string {
  const fromEnv =
    import.meta.env["VITE_GSTORE_COMMERCE_API_URL"] ??
    import.meta.env["VITE_PUBLIC_SITE_URL"] ??
    "";
  return String(fromEnv).replace(/\/$/, "");
}

export function usesGstoreShipmentServer(action: GstoreShipmentAction): boolean {
  return SERVER_ACTIONS.has(action);
}

export async function invokeGstoreShipmentServerAction(
  orderId: string,
  action: GstoreShipmentAction,
): Promise<GstoreShipmentServerResult> {
  const origin = commerceApiOrigin();
  if (!origin) {
    return {
      ok: false,
      code: "missing_api_origin",
      message: "Set VITE_GSTORE_COMMERCE_API_URL to the GVRZE storefront origin (e.g. https://gvrze.com).",
    };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    return { ok: false, code: "unauthorized", message: "Sign in as admin to run shipment actions." };
  }

  const response = await fetch(`${origin}/api/admin/gstore/shipment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId, action }),
  });

  const payload = (await response.json().catch(() => ({}))) as GstoreShipmentServerResult;
  if (!response.ok && payload.ok !== false) {
    return {
      ok: false,
      code: `http_${response.status}`,
      message: "Shipment server request failed",
    };
  }
  return payload;
}