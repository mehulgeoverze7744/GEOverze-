import { fetchGstoreOrders, fetchStoreProducts } from "@/features/commerce/api";
import type { OrderStatus, StoreOrder, StoreProduct } from "@/features/store/types";

function productStatus(active: boolean): StoreProduct["status"] {
  return active ? "published" : "archived";
}

export async function fetchMappedStoreProducts(): Promise<StoreProduct[]> {
  const rows = await fetchStoreProducts();
  return rows.map((row) => {
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
      price: 0,
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
