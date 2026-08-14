/**
 * Checkout maths and the placeholder purchase call.
 *
 * `placeOrder` is deliberately the only place that mutates the ledger, so
 * swapping in a real payment provider later touches this module alone.
 */
import type { CartLine } from "@/stores/cartStore";

import type { Order, OrderLine } from "../data/orders";

export const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", note: "7 – 12 business days", amount: 0 },
  { id: "tracked", label: "Tracked worldwide", note: "4 – 7 business days", amount: 690 },
  { id: "express", label: "Express", note: "2 – 3 business days", amount: 1_490 },
] as const;

export type ShippingMethodId = (typeof SHIPPING_METHODS)[number]["id"];

export const TAX_RATE = 0.08;

export type Totals = {
  /** Money value of cash-priced lines, in minor units. */
  subtotal: number;
  shipping: number;
  tax: number;
  /** Money discount from applying credits, in minor units. */
  creditDiscount: number;
  total: number;
  /** Credits required outright (credits-only lines). */
  creditsDue: number;
  /** Credits spent to offset cash lines. */
  creditsApplied: number;
  /** True when anything in the basket has to ship. */
  needsShipping: boolean;
};

/** One credit is worth one US cent when applied against a cash total. */
export const CREDIT_UNIT_VALUE = 1;

export function lineMoney(line: CartLine): number {
  return (line.unitAmount ?? 0) * line.quantity;
}

export function lineCredits(line: CartLine): number {
  return (line.unitCredits ?? 0) * line.quantity;
}

export function computeTotals(
  lines: readonly CartLine[],
  options: {
    shipping: ShippingMethodId;
    /** Credits the shopper is willing to spend on cash lines. */
    creditsToApply: number;
    balance: number;
  },
): Totals {
  const cashLines = lines.filter((l) => l.unitAmount !== null);
  const creditOnly = lines.filter((l) => l.unitAmount === null);

  const subtotal = cashLines.reduce((n, l) => n + lineMoney(l), 0);
  const creditsDue = creditOnly.reduce((n, l) => n + lineCredits(l), 0);
  const needsShipping = cashLines.some((l) => l.category !== "" && isPhysical(l.category));

  const shipping =
    needsShipping && subtotal > 0
      ? (SHIPPING_METHODS.find((m) => m.id === options.shipping)?.amount ?? 0)
      : 0;
  const tax = Math.round(subtotal * TAX_RATE);

  const spendable = Math.max(0, options.balance - creditsDue);
  const creditsApplied = Math.max(0, Math.min(options.creditsToApply, spendable, subtotal));
  const creditDiscount = creditsApplied * CREDIT_UNIT_VALUE;

  return {
    subtotal,
    shipping,
    tax,
    creditDiscount,
    total: Math.max(0, subtotal + shipping + tax - creditDiscount),
    creditsDue,
    creditsApplied,
    needsShipping,
  };
}

const PHYSICAL_CATEGORIES = [
  "tshirts",
  "hoodies",
  "caps",
  "mugs",
  "stickers",
  "posters",
  "accessories",
];

export function isPhysical(category: string): boolean {
  return PHYSICAL_CATEGORIES.includes(category);
}

let counter = 0;

/** Builds an order from a basket. No network call — the ledger is local. */
export function buildOrder(
  lines: readonly CartLine[],
  totals: Totals,
  shipping: ShippingMethodId,
): Order {
  counter += 1;
  const orderLines: OrderLine[] = lines.map((line) => ({
    slug: line.slug,
    name: line.name,
    quantity: line.quantity,
    amount: lineMoney(line),
    credits: line.unitAmount === null ? lineCredits(line) : 0,
    options: line.options,
  }));

  const method = SHIPPING_METHODS.find((m) => m.id === shipping);

  return {
    id: `GV-${25_000 + counter + Math.floor(Math.random() * 400)}`,
    placedAt: new Date().toISOString().slice(0, 10),
    status: totals.needsShipping ? "processing" : "unlocked",
    lines: orderLines,
    total: totals.total,
    credits: totals.creditsDue + totals.creditsApplied,
    shipping: totals.needsShipping ? (method?.label ?? "Standard") : null,
    tracking: totals.needsShipping ? `GVX-${Math.floor(1000 + Math.random() * 8999)}-0001` : null,
  };
}

/** Slugs that should be marked as owned immediately after purchase. */
export function unlockableSlugs(lines: readonly CartLine[]): string[] {
  return lines.filter((l) => !isPhysical(l.category)).map((l) => l.slug);
}
