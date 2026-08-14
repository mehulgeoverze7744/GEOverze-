import {
  catalogDaysAgo,
  orderChannels,
  pickFrom,
  rng,
  storeCategories,
  storeCollections,
} from "@/lib/catalog";
import {
  couponTypes,
  orderStatuses,
  productTypes,
  type Coupon,
  type OrderEvent,
  type OrderLine,
  type ProductStatus,
  type ProductVariant,
  type RedemptionItem,
  type RedemptionStatus,
  type StockStatus,
  type StoreOrder,
  type StoreProduct,
} from "@/features/store/types";

const productLead = [
  "Explorer",
  "Cartographer",
  "Summit",
  "Meridian",
  "Compass",
  "Atlas",
  "Voyager",
  "Terrain",
];

const productTail = [
  "Hoodie",
  "Wall Map",
  "Notebook",
  "Sticker Pack",
  "Poster Set",
  "Enamel Pin",
  "Credit Pack",
  "Gift Card",
  "Field Guide",
  "Tote Bag",
];

const customers = [
  "Ada Whitfield",
  "Marco Silva",
  "Hana Ito",
  "Yusuf Demir",
  "Clara Nowak",
  "Peter Nyong",
  "Ines Duarte",
  "Ravi Menon",
  "Greta Lindqvist",
  "Tomás Rivera",
];

const statuses: ProductStatus[] = ["published", "published", "published", "draft", "archived"];

function stockStatusFor(stock: number, type: string): StockStatus {
  if (type === "Digital" || type === "Gift Card") return "In stock";
  if (stock === 0) return "Out of stock";
  if (stock < 15) return "Low stock";
  return "In stock";
}

function buildVariants(rand: () => number, sku: string, price: number): ProductVariant[] {
  const names = ["Small", "Medium", "Large", "A2", "A1", "Standard"];
  const count = 1 + Math.floor(rand() * 3);
  return Array.from({ length: count }, (_, index) => {
    const name = names[(index + Math.floor(rand() * 3)) % names.length] ?? "Standard";
    return {
      id: `${sku}-V${index + 1}`,
      name,
      sku: `${sku}-${index + 1}`,
      price: Math.round(price * (1 + index * 0.12)),
      stock: Math.floor(rand() * 120),
    };
  });
}

function buildProduct(index: number): StoreProduct {
  const rand = rng(4400 + index * 53);
  const type = pickFrom(rand, productTypes);
  const name = `${pickFrom(rand, productLead)} ${pickFrom(rand, productTail)}`;
  const sku = `GS-${String(2000 + index)}`;
  const price = type === "Credit Redemption" ? 0 : 8 + Math.floor(rand() * 120);
  const stock = type === "Digital" || type === "Gift Card" ? 999 : Math.floor(rand() * 220);
  const status = pickFrom(rand, statuses);
  const unitsSold = Math.floor(rand() * 1800);

  return {
    id: sku,
    name,
    sku,
    type,
    category: pickFrom(rand, storeCategories),
    collection: pickFrom(rand, storeCollections),
    description: `${name} from the GEOverze store — designed for map lovers and classrooms.`,
    price,
    compareAtPrice: price > 0 ? price + Math.floor(rand() * 30) : 0,
    discountPercent: Math.floor(rand() * 4) * 5,
    creditPrice:
      type === "Credit Redemption" || type === "Reward" ? 200 + Math.floor(rand() * 4000) : 0,
    stock,
    stockStatus: stockStatusFor(stock, type),
    status,
    featured: rand() > 0.85 && status === "published",
    available: status === "published" && rand() > 0.1,
    images: Array.from({ length: 1 + Math.floor(rand() * 3) }, (_, i) => `${sku}-image-${i + 1}`),
    variants: buildVariants(rand, sku, Math.max(price, 5)),
    shippingClass:
      type === "Physical" ? pickFrom(rand, ["Standard", "Oversized", "Letter"]) : "None",
    unitsSold,
    revenue: unitsSold * price,
    revenueSeries: Array.from({ length: 12 }, () => 10 + Math.floor(rand() * 90)),
    createdAt: catalogDaysAgo(60 + Math.floor(rand() * 500), 9),
    updatedAt: catalogDaysAgo(Math.floor(rand() * 40), 11),
  };
}

export const storeProducts: StoreProduct[] = Array.from({ length: 80 }, (_, index) =>
  buildProduct(index),
);

function buildTimeline(rand: () => number, status: string, placedDays: number): OrderEvent[] {
  const flow = ["placed the order", "captured payment for", "packed", "shipped", "delivered"];
  const stop = status === "pending" ? 1 : status === "paid" ? 2 : status === "shipped" ? 4 : 5;
  const events: OrderEvent[] = flow.slice(0, stop).map((action, index) => ({
    id: `evt-${index}`,
    actor: index === 0 ? "Customer" : "Fulfilment",
    action,
    target: "the order",
    time: catalogDaysAgo(Math.max(0, placedDays - index), 10),
  }));
  if (status === "refunded")
    events.push({
      id: "evt-refund",
      actor: "Support",
      action: "refunded",
      target: "the order",
      time: catalogDaysAgo(Math.max(0, placedDays - 5), 12),
    });
  if (status === "cancelled")
    events.push({
      id: "evt-cancel",
      actor: "Support",
      action: "cancelled",
      target: "the order",
      time: catalogDaysAgo(Math.max(0, placedDays - 2), 12),
    });
  return events;
}

function buildOrder(index: number): StoreOrder {
  const rand = rng(7700 + index * 41);
  const status = pickFrom(rand, orderStatuses);
  const lineCount = 1 + Math.floor(rand() * 3);
  const lines: OrderLine[] = Array.from({ length: lineCount }, (_, i) => {
    const product = storeProducts[Math.floor(rand() * storeProducts.length)] as StoreProduct;
    return {
      id: `line-${i}`,
      productId: product.id,
      name: product.name,
      quantity: 1 + Math.floor(rand() * 3),
      unitPrice: Math.max(5, product.price),
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const shipping = rand() > 0.5 ? 6 : 0;
  const discount = rand() > 0.7 ? Math.round(subtotal * 0.1) : 0;
  const placedDays = Math.floor(rand() * 90);
  const customer = pickFrom(rand, customers);

  return {
    id: `ORD-${String(50000 + index)}`,
    customer,
    email: `${customer.split(" ")[0]?.toLowerCase()}@example.com`,
    channel: pickFrom(rand, orderChannels),
    status,
    lines,
    subtotal,
    shipping,
    discount,
    total: subtotal + shipping - discount,
    couponCode: discount > 0 ? "GEO10" : null,
    shippingAddress: `${10 + Math.floor(rand() * 90)} Meridian Street, Lisbon, PT`,
    placedAt: catalogDaysAgo(placedDays, 9),
    updatedAt: catalogDaysAgo(Math.max(0, placedDays - 2), 15),
    timeline: buildTimeline(rand, status, placedDays),
  };
}

export const storeOrders: StoreOrder[] = Array.from({ length: 140 }, (_, index) =>
  buildOrder(index),
);

function buildCoupon(index: number): Coupon {
  const rand = rng(3300 + index * 29);
  const type = pickFrom(rand, couponTypes);
  const limit = 50 + Math.floor(rand() * 950);
  return {
    id: `CPN-${String(300 + index)}`,
    code: `GEO${type === "Percentage" ? "SAVE" : type === "Flat" ? "OFF" : "CRED"}${10 + index}`,
    type,
    value: type === "Percentage" ? 5 + Math.floor(rand() * 5) * 5 : 5 + Math.floor(rand() * 40),
    usageLimit: limit,
    used: Math.floor(rand() * limit),
    active: rand() > 0.3,
    expiresAt: catalogDaysAgo(-(10 + Math.floor(rand() * 200)), 9),
    createdAt: catalogDaysAgo(20 + Math.floor(rand() * 300), 9),
    description:
      type === "Credit reward"
        ? "Grants bonus GEOcredits at checkout."
        : "Storewide checkout discount.",
  };
}

export const storeCoupons: Coupon[] = Array.from({ length: 24 }, (_, index) => buildCoupon(index));

const redemptionStatuses: RedemptionStatus[] = [
  "available",
  "available",
  "pending",
  "redeemed",
  "archived",
];

function buildRedemption(index: number): RedemptionItem {
  const rand = rng(6100 + index * 31);
  const source = storeProducts[index * 3] ?? (storeProducts[0] as StoreProduct);
  return {
    id: `RWD-${String(700 + index)}`,
    name: `${source.name} (credits)`,
    category: source.category,
    creditsRequired: 250 + Math.floor(rand() * 5000),
    stock: Math.floor(rand() * 90),
    available: rand() > 0.25,
    status: pickFrom(rand, redemptionStatuses),
    redemptions: Math.floor(rand() * 600),
    lastRedeemedAt: catalogDaysAgo(Math.floor(rand() * 45), 13),
  };
}

export const redemptionItems: RedemptionItem[] = Array.from({ length: 20 }, (_, index) =>
  buildRedemption(index),
);

export interface StoreStatsSummary {
  totalProducts: number;
  published: number;
  outOfStock: number;
  featured: number;
  orders: number;
  revenue: number;
  refunded: number;
  averageOrder: number;
}

export function summarizeStore(products: StoreProduct[], orders: StoreOrder[]): StoreStatsSummary {
  const revenue = orders
    .filter((order) => order.status === "paid" || order.status === "shipped")
    .reduce((sum, order) => sum + order.total, 0);
  return {
    totalProducts: products.length,
    published: products.filter((product) => product.status === "published").length,
    outOfStock: products.filter((product) => product.stockStatus === "Out of stock").length,
    featured: products.filter((product) => product.featured).length,
    orders: orders.length,
    revenue,
    refunded: orders.filter((order) => order.status === "refunded").length,
    averageOrder: orders.length ? Math.round(revenue / Math.max(1, orders.length)) : 0,
  };
}

function normalize(values: number[]) {
  const max = Math.max(1, ...values);
  return values.map((value) => Math.round((value / max) * 100));
}

export function storeRevenueSeries(products: StoreProduct[]) {
  const totals = Array.from({ length: 12 }, (_, month) =>
    products.reduce((sum, product) => sum + (product.revenueSeries[month] ?? 0), 0),
  );
  return normalize(totals);
}

export function storeCategorySeries(products: StoreProduct[]) {
  const labels = [...storeCategories];
  const counts = labels.map(
    (label) => products.filter((product) => product.category === label).length,
  );
  return { labels: labels.map((label) => label.split(" ")[0] ?? label), series: normalize(counts) };
}

export function orderStatusSeries(orders: StoreOrder[]) {
  const labels = [...orderStatuses];
  const counts = labels.map((label) => orders.filter((order) => order.status === label).length);
  return { labels: labels.map((label) => label.slice(0, 4)), series: normalize(counts) };
}

export function topProducts(products: StoreProduct[], limit = 5) {
  return [...products].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function findProduct(list: StoreProduct[], id: string) {
  return list.find((product) => product.id === id || product.sku === id);
}

export function findOrder(list: StoreOrder[], id: string) {
  return list.find((order) => order.id === id);
}
