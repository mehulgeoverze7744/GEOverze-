/**
 * GEOstore order ledger.
 *
 * Placeholder order history plus the shared order shape. A real backend would
 * return the same fields, so only this module changes when it lands.
 */

export type OrderStatus = "processing" | "shipped" | "delivered" | "unlocked" | "cancelled";

export type OrderLine = {
  slug: string;
  name: string;
  quantity: number;
  /** Money paid for the line, in minor units. */
  amount: number;
  /** Credits used for the line. */
  credits: number;
  options: Record<string, string>;
};

export type Order = {
  id: string;
  placedAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  /** Total money charged, in minor units. */
  total: number;
  /** Total credits redeemed. */
  credits: number;
  /** Shipping method label, or `null` for digital-only orders. */
  shipping: string | null;
  /** Tracking reference, or `null` when nothing physical shipped. */
  tracking: string | null;
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  unlocked: "Unlocked",
  cancelled: "Cancelled",
};

export const SEED_ORDERS: readonly Order[] = [
  {
    id: "GV-24817",
    placedAt: "2026-02-02",
    status: "shipped",
    lines: [
      {
        slug: "explore-the-unknown",
        name: "Atlas Hoodie",
        quantity: 1,
        amount: 7_800,
        credits: 0,
        options: { Size: "L", Colour: "Charcoal" },
      },
      {
        slug: "flag-sticker-pack",
        name: "Flag Sticker Pack",
        quantity: 1,
        amount: 1_200,
        credits: 0,
        options: {},
      },
    ],
    total: 9_000,
    credits: 0,
    shipping: "Tracked worldwide",
    tracking: "GVX-8871-2290",
  },
  {
    id: "GV-24560",
    placedAt: "2026-01-18",
    status: "unlocked",
    lines: [
      {
        slug: "capitals-mastery-pack",
        name: "Capitals Mastery Pack",
        quantity: 1,
        amount: 0,
        credits: 90,
        options: {},
      },
    ],
    total: 0,
    credits: 90,
    shipping: null,
    tracking: null,
  },
  {
    id: "GV-24102",
    placedAt: "2025-12-27",
    status: "delivered",
    lines: [
      {
        slug: "bronze-world-map-poster",
        name: "Bronze World Map Poster",
        quantity: 1,
        amount: 4_500,
        credits: 0,
        options: {},
      },
      {
        slug: "old-world-mug",
        name: "Old World Mug",
        quantity: 2,
        amount: 4_400,
        credits: 0,
        options: {},
      },
    ],
    total: 8_900,
    credits: 0,
    shipping: "Standard",
    tracking: "GVX-7712-0043",
  },
];
