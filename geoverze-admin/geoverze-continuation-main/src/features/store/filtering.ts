import type {
  Coupon,
  OrderFilterState,
  ProductFilterState,
  RedemptionItem,
  StoreOrder,
  StoreProduct,
} from "@/features/store/types";

function matches(haystack: string[], query: string) {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return haystack.some((value) => value.toLowerCase().includes(needle));
}

export function filterProducts(
  products: StoreProduct[],
  query: string,
  filters: ProductFilterState,
) {
  return products.filter((product) => {
    if (!matches([product.name, product.sku, product.category, product.collection], query))
      return false;
    if (filters.status !== "all" && product.status !== filters.status) return false;
    if (filters.type !== "all" && product.type !== filters.type) return false;
    if (filters.category !== "all" && product.category !== filters.category) return false;
    if (filters.collection !== "all" && product.collection !== filters.collection) return false;
    if (filters.stock !== "all" && product.stockStatus !== filters.stock) return false;
    if (filters.featured === "featured" && !product.featured) return false;
    if (filters.featured === "standard" && product.featured) return false;
    return true;
  });
}

export function filterOrders(orders: StoreOrder[], query: string, filters: OrderFilterState) {
  return orders.filter((order) => {
    if (!matches([order.id, order.customer, order.email, order.channel], query)) return false;
    if (filters.status !== "all" && order.status !== filters.status) return false;
    if (filters.channel !== "all" && order.channel !== filters.channel) return false;
    return true;
  });
}

export function filterCoupons(coupons: Coupon[], query: string, status: string) {
  return coupons.filter((coupon) => {
    if (!matches([coupon.code, coupon.type, coupon.description], query)) return false;
    if (status === "active" && !coupon.active) return false;
    if (status === "inactive" && coupon.active) return false;
    return true;
  });
}

export function filterRedemptions(items: RedemptionItem[], query: string, status: string) {
  return items.filter((item) => {
    if (!matches([item.name, item.category, item.id], query)) return false;
    if (status !== "all" && item.status !== status) return false;
    return true;
  });
}
