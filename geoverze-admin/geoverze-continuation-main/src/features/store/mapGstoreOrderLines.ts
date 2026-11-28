import type { OrderLine } from "@/features/store/types";

export type GstoreOrderItemRow = {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  options: unknown;
  quantity: number;
  unit_price_minor: number | string;
};

function coerceOptions(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (val == null) continue;
    out[key] = String(val).trim();
  }
  return out;
}

export function mapGstoreOrderItemRow(row: GstoreOrderItemRow): OrderLine {
  const options = coerceOptions(row.options);
  return {
    id: row.id,
    productId: row.product_slug,
    name: row.product_name,
    quantity: Number(row.quantity) || 0,
    unitPrice: Number(row.unit_price_minor) / 100,
    productSlug: row.product_slug,
    options,
  };
}

export function groupGstoreOrderLinesByOrderId(rows: GstoreOrderItemRow[]): Map<string, OrderLine[]> {
  const map = new Map<string, OrderLine[]>();
  for (const row of rows) {
    const line = mapGstoreOrderItemRow(row);
    const list = map.get(row.order_id) ?? [];
    list.push(line);
    map.set(row.order_id, list);
  }
  return map;
}