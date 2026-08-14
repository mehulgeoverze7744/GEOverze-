export type ProductType = "Physical" | "Digital" | "Reward" | "Credit Redemption" | "Gift Card";

export type ProductStatus = "draft" | "published" | "archived";
export type StockStatus = "In stock" | "Low stock" | "Out of stock" | "Preorder";

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface StoreProduct {
  id: string;
  name: string;
  sku: string;
  type: ProductType;
  category: string;
  collection: string;
  description: string;
  price: number;
  compareAtPrice: number;
  discountPercent: number;
  creditPrice: number;
  stock: number;
  stockStatus: StockStatus;
  status: ProductStatus;
  featured: boolean;
  available: boolean;
  images: string[];
  variants: ProductVariant[];
  shippingClass: string;
  unitsSold: number;
  revenue: number;
  revenueSeries: number[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "refunded" | "cancelled";

export interface OrderLine {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface StoreOrder {
  id: string;
  customer: string;
  email: string;
  channel: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode: string | null;
  shippingAddress: string;
  placedAt: string;
  updatedAt: string;
  timeline: OrderEvent[];
}

export type CouponType = "Percentage" | "Flat" | "Credit reward";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  usageLimit: number;
  used: number;
  active: boolean;
  expiresAt: string;
  createdAt: string;
  description: string;
}

export type RedemptionStatus = "available" | "pending" | "redeemed" | "archived";

export interface RedemptionItem {
  id: string;
  name: string;
  category: string;
  creditsRequired: number;
  stock: number;
  available: boolean;
  status: RedemptionStatus;
  redemptions: number;
  lastRedeemedAt: string;
}

export interface ProductFilterState {
  status: string;
  type: string;
  category: string;
  collection: string;
  stock: string;
  featured: string;
}

export const emptyProductFilters: ProductFilterState = {
  status: "all",
  type: "all",
  category: "all",
  collection: "all",
  stock: "all",
  featured: "all",
};

export interface OrderFilterState {
  status: string;
  channel: string;
}

export const emptyOrderFilters: OrderFilterState = { status: "all", channel: "all" };

export const productTypes: ProductType[] = [
  "Physical",
  "Digital",
  "Reward",
  "Credit Redemption",
  "Gift Card",
];

export const productStatuses: ProductStatus[] = ["draft", "published", "archived"];
export const stockStatuses: StockStatus[] = ["In stock", "Low stock", "Out of stock", "Preorder"];
export const orderStatuses: OrderStatus[] = ["pending", "paid", "shipped", "refunded", "cancelled"];
export const couponTypes: CouponType[] = ["Percentage", "Flat", "Credit reward"];
