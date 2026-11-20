import { fetchGstoreOrders, fetchGstorePrices, fetchStoreProducts } from "@/features/commerce/api";
import type { OrderStatus, StoreOrder, StoreProduct } from "@/features/store/types";

function productStatus(active: boolean): StoreProduct["status"] {
  return active ? "published" : "archived";
}

function activePriceBySlug(
  prices: Awaited<ReturnType<typeof fetchGstorePrices>>,
): Map<string, number> {
  const map = new Map<string, number>();
  const active = prices
    .filter((entry) => entry.is_active)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  for (const entry of active) {
    if (!map.has(entry.product_slug)) {
      map.set(entry.product_slug, Number(entry.price_minor));
    }
  }
  return map;
}

export async function fetchMappedStoreProducts(): Promise<StoreProduct[]> {
  const [rows, prices] = await Promise.all([fetchStoreProducts(), fetchGstorePrices()]);
  const priceMinorBySlug = activePriceBySlug(prices);
  return rows.map((row) => {
    const priceMinor = priceMinorBySlug.get(row.slug) ?? 0;
    const metadata = (row.metadata ?? {}) as {
      category?: string;
      group?: string;
      featured?: boolean;
      stock?: string;
    };
    return {
      id: row.id,
      name: row.name,
      sku: row.slug,
      type: row.fulfillment_type === "physical" ? "Physical" : "Digital",
      category: metadata.category ?? "rewards",
      collection: metadata.group ?? "GEOstore",
      description: row.description,
      price: priceMinor / 100,
      compareAtPrice: 0,
      discountPercent: 0,
      creditPrice: row.credit_price,
      stock: metadata.stock === "sold-out" ? 0 : 99,
      stockStatus: metadata.stock === "sold-out" ? "Out of stock" : metadata.stock === "low" ? "Low stock" : "In stock",
      status: productStatus(row.active),
      featured: Boolean(metadata.featured),
      available: row.active,
      images: [],
      variants: [],
      shippingClass: row.fulfillment_type,
      unitsSold: 0,
      revenue: 0,
      revenueSeries: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

function mapOrderStatus(value: string): OrderStatus {
  if (value === "shipped" || value === "delivered") return "shipped";
  if (value === "cancelled") return "cancelled";
  if (value === "refunded") return "refunded";
  if (value === "confirmed" || value === "processing" || value === "paid") return "paid";
  return "pending";
}

export async function fetchMappedGstoreOrders(): Promise<StoreOrder[]> {
  const rows = await fetchGstoreOrders();
  return rows.map((row) => ({
    id: row.id,
    customer: row.customer_name,
    email: row.customer_email,
    channel: "Gstore",
    status: mapOrderStatus(row.order_status),
    lines: [],
    subtotal: Number(row.subtotal_minor) / 100,
    shipping: Number(row.shipping_minor) / 100,
    discount: Number(row.discount_minor) / 100,
    total: Number(row.total_minor) / 100,
    couponCode: null,
    shippingAddress: `${row.shipping_line1}, ${row.shipping_city}`,
    placedAt: row.created_at,
    updatedAt: row.updated_at,
    timeline: [
      {
        id: `${row.id}-created`,
        actor: "system",
        action: `Order ${row.order_status}`,
        target: row.order_number,
        time: row.created_at,
      },
    ],
  }));
}
