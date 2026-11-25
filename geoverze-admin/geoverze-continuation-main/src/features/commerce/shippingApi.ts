import { supabase } from "@/lib/supabase/client";
import { throwOnError } from "@/lib/supabase/query";

import {
  invokeGstoreShipmentServerAction,
  usesGstoreShipmentServer,
} from "@/features/commerce/gstoreShipmentServerBridge";
import type {
  GstoreShipmentAction,
  OrderShippingDetail,
  ShippingSummaryRow,
} from "@/features/store/shipment-types";

function parseJsonArray<T>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  return [];
}

export async function fetchGstoreShippingSummaries(): Promise<ShippingSummaryRow[]> {
  const data = throwOnError(
    await supabase.rpc("admin_list_gstore_shipping_summaries"),
    "Failed to load shipment summaries",
  );
  return parseJsonArray<ShippingSummaryRow>(data);
}

export async function fetchGstoreOrderShippingDetail(orderId: string): Promise<OrderShippingDetail> {
  const data = throwOnError(
    await supabase.rpc("admin_get_gstore_order_shipping_detail", { p_order_id: orderId }),
    "Failed to load order shipping detail",
  );
  return data as OrderShippingDetail;
}

export async function runGstoreShipmentAction(orderId: string, action: GstoreShipmentAction) {
  if (usesGstoreShipmentServer(action)) {
    return invokeGstoreShipmentServerAction(orderId, action);
  }
  return throwOnError(
    await supabase.rpc("admin_gstore_shipment_action", {
      p_order_id: orderId,
      p_action: action,
      p_payload: {},
    }),
    `Shipment action failed (${action})`,
  ) as {
    ok: boolean;
    code?: string;
    message?: string;
    shipment?: Record<string, unknown>;
  };
}

export async function upsertGstoreProductFulfillment(input: {
  product_slug: string;
  weight_g: number | null;
  length_cm: number | null;
  breadth_cm: number | null;
  height_cm: number | null;
  hsn_code: string | null;
  requires_shipping?: boolean;
  admin_notes?: string;
}) {
  return throwOnError(
    await supabase.rpc("admin_upsert_gstore_product_fulfillment", {
      p_product_slug: input.product_slug,
      p_weight_g: input.weight_g,
      p_length_cm: input.length_cm,
      p_breadth_cm: input.breadth_cm,
      p_height_cm: input.height_cm,
      p_hsn_code: input.hsn_code,
      p_requires_shipping: input.requires_shipping ?? true,
      p_admin_notes: input.admin_notes ?? "",
    }),
    "Failed to save fulfillment metadata",
  );
}