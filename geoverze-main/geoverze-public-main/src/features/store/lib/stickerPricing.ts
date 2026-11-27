/**
 * Dual INR / GVRZE Credits pricing for live sticker collections.
 * Server checkout must use the same constants via gstoreProductPrices.
 */
import type { CartLine } from "@/stores/cartStore";

import { SHOPPABLE_STICKER_SLUGS } from "../data/catalogAvailability.ts";
import type { Product } from "../data/products.ts";
import {
  GSTORE_STICKER_CREDITS,
  getStickerCreditPrice,
  getProductPrice,
} from "./gstoreProductPrices.ts";
function stickerLineKey(product: Product, options: Record<string, string>): string {
  const signature = Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return signature ? `${product.id}#${signature}` : product.id;
}

export { GSTORE_STICKER_CREDITS };

export const STICKER_PAYMENT_OPTION_KEY = "Payment" as const;
export const STICKER_PAYMENT_INR = "INR" as const;
export const STICKER_PAYMENT_CREDITS = "Credits" as const;

export type StickerPaymentMethod = "inr" | "credits";

export function isShopableStickerSlug(slug: string): boolean {
  return SHOPPABLE_STICKER_SLUGS.has(slug);
}

export function stickerPaymentMethodFromOptions(
  options: Record<string, string>,
): StickerPaymentMethod {
  const raw = options[STICKER_PAYMENT_OPTION_KEY];
  if (raw === STICKER_PAYMENT_CREDITS) return "credits";
  return "inr";
}

export function stickerCartOptions(
  base: Record<string, string>,
  method: StickerPaymentMethod,
): Record<string, string> {
  const next = { ...base };
  next[STICKER_PAYMENT_OPTION_KEY] =
    method === "credits" ? STICKER_PAYMENT_CREDITS : STICKER_PAYMENT_INR;
  return next;
}

/** PDP / card copy — one line for compact surfaces. */
export function formatStickerDualPriceShort(): string {
  return `₹150 OR ${GSTORE_STICKER_CREDITS} CREDITS`;
}

/** Accessories card copy — stacked for narrow tiles. */
export function formatStickerDualPriceStacked(): string {
  return `₹150\nOR\n${GSTORE_STICKER_CREDITS} Credits`;
}

export function formatStickerPdpPriceLabel(): string {
  return `₹150 OR ${GSTORE_STICKER_CREDITS} CREDITS`;
}

export function creditsDueForStickerLines(lines: CartLine[]): number {
  return lines.reduce((sum, line) => {
    if (!isStickerCreditsCartLine(line)) return sum;
    const perUnit = getStickerCreditPrice(line.slug) ?? GSTORE_STICKER_CREDITS;
    return sum + perUnit * line.quantity;
  }, 0);
}

export function isStickerCreditsCartLine(line: CartLine): boolean {
  if (!isShopableStickerSlug(line.slug)) return false;
  if (line.unitAmount === null) return true;
  return stickerPaymentMethodFromOptions(line.options) === "credits";
}

export function isStickerInrCartLine(line: CartLine): boolean {
  return isShopableStickerSlug(line.slug) && !isStickerCreditsCartLine(line);
}

export function cartLineUsesCreditsPayment(line: CartLine): boolean {
  return line.unitAmount === null && (line.unitCredits ?? 0) > 0;
}

export function toStickerCartLine(
  product: Product,
  options: Record<string, string> = {},
  quantity = 1,
  method: StickerPaymentMethod = "inr",
): CartLine {
  const merged = stickerCartOptions(options, method);
  const catalog = getProductPrice(product.slug);
  const credits = product.credits ?? getStickerCreditPrice(product.slug) ?? GSTORE_STICKER_CREDITS;
  if (method === "credits") {
    return {
      id: stickerLineKey(product, merged),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitAmount: null,
      unitCredits: credits,
      quantity,
      options: merged,
      category: product.category,
    };
  }
  const unitAmount = catalog?.priceMinor ?? product.price;
  return {
    id: stickerLineKey(product, merged),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    unitAmount,
    unitCredits: null,
    quantity,
    options: merged,
    category: product.category,
  };
}

export function assertHomogeneousGstoreCheckout(lines: CartLine[]): void {
  const hasCredits = lines.some((l) => isStickerCreditsCartLine(l) || cartLineUsesCreditsPayment(l));
  const hasInr = lines.some((l) => l.unitAmount !== null && l.unitAmount > 0);
  if (hasCredits && hasInr) {
    throw new Error(
      "Mixed payment methods in cart. Check out INR items and credit items separately.",
    );
  }
}