/**
 * Dual INR / GVRZE Credits pricing for hybrid Gstore physical products.
 * Server checkout must use the same amounts via gstoreProductPrices.
 */
import type { CartLine } from "@/stores/cartStore";

import type { Product } from "../data/products.ts";
import {
  formatInrPaise,
  getProductPrice,
  resolveGstoreCreditPrice,
} from "./gstoreProductPrices.ts";

function hybridLineKey(product: Product, options: Record<string, string>): string {
  const signature = Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return signature ? `${product.id}#${signature}` : product.id;
}

export const GSTORE_PAYMENT_OPTION_KEY = "Payment" as const;
export const GSTORE_PAYMENT_INR = "INR" as const;
export const GSTORE_PAYMENT_CREDITS = "Credits" as const;

export type GstorePaymentMethod = "inr" | "credits";

/** @deprecated Use GSTORE_PAYMENT_OPTION_KEY */
export const STICKER_PAYMENT_OPTION_KEY = GSTORE_PAYMENT_OPTION_KEY;
/** @deprecated Use GSTORE_PAYMENT_INR */
export const STICKER_PAYMENT_INR = GSTORE_PAYMENT_INR;
/** @deprecated Use GSTORE_PAYMENT_CREDITS */
export const STICKER_PAYMENT_CREDITS = GSTORE_PAYMENT_CREDITS;
/** @deprecated Use GstorePaymentMethod */
export type StickerPaymentMethod = GstorePaymentMethod;

export function productSupportsDualPayment(product: Product): boolean {
  if (product.comingSoon) return false;
  if (product.price === null || product.price <= 0) return false;
  return resolveGstoreCreditPrice(product.slug) !== null;
}

export function gstorePaymentMethodFromOptions(
  options: Record<string, string>,
): GstorePaymentMethod {
  const raw = options[GSTORE_PAYMENT_OPTION_KEY];
  if (raw === GSTORE_PAYMENT_CREDITS) return "credits";
  return "inr";
}

/** @deprecated Use gstorePaymentMethodFromOptions */
export const stickerPaymentMethodFromOptions = gstorePaymentMethodFromOptions;

export function gstoreCartOptions(
  base: Record<string, string>,
  method: GstorePaymentMethod,
): Record<string, string> {
  const next = { ...base };
  next[GSTORE_PAYMENT_OPTION_KEY] =
    method === "credits" ? GSTORE_PAYMENT_CREDITS : GSTORE_PAYMENT_INR;
  return next;
}

/** @deprecated Use gstoreCartOptions */
export const stickerCartOptions = gstoreCartOptions;

export function formatDualPriceShort(inrMinor: number, credits: number): string {
  return `${formatInrPaise(inrMinor)} OR ${credits} CREDITS`;
}

export function formatDualPriceStacked(inrMinor: number, credits: number): string {
  return `${formatInrPaise(inrMinor)}\nOR\n${credits} Credits`;
}

export function formatInrPayButtonLabel(inrMinor: number): string {
  return `Pay ${formatInrPaise(inrMinor)}`;
}

export function dualPriceLabelForProduct(product: Product): string | null {
  const credits = resolveGstoreCreditPrice(product.slug);
  const inrMinor = getProductPrice(product.slug)?.priceMinor ?? product.price;
  if (credits === null || inrMinor === null || inrMinor <= 0) return null;
  return formatDualPriceShort(inrMinor, credits);
}

export function creditsDueForGstoreCreditLines(lines: CartLine[]): number {
  return lines.reduce((sum, line) => {
    if (!isGstoreCreditsCartLine(line)) return sum;
    const perUnit = resolveGstoreCreditPrice(line.slug) ?? line.unitCredits ?? 0;
    return sum + perUnit * line.quantity;
  }, 0);
}

/** @deprecated Use creditsDueForGstoreCreditLines */
export const creditsDueForStickerLines = creditsDueForGstoreCreditLines;

export function isGstoreCreditsCartLine(line: CartLine): boolean {
  if (resolveGstoreCreditPrice(line.slug) === null) return false;
  if (line.unitAmount === null) return true;
  return gstorePaymentMethodFromOptions(line.options) === "credits";
}

/** @deprecated Use isGstoreCreditsCartLine */
export const isStickerCreditsCartLine = isGstoreCreditsCartLine;

export function isGstoreInrCartLine(line: CartLine): boolean {
  return resolveGstoreCreditPrice(line.slug) !== null && !isGstoreCreditsCartLine(line);
}

export function cartLineUsesCreditsPayment(line: CartLine): boolean {
  return line.unitAmount === null && (line.unitCredits ?? 0) > 0;
}

export function toGstoreDualPaymentCartLine(
  product: Product,
  options: Record<string, string> = {},
  quantity = 1,
  method: GstorePaymentMethod = "inr",
): CartLine {
  const merged = gstoreCartOptions(options, method);
  const catalog = getProductPrice(product.slug);
  const credits =
    resolveGstoreCreditPrice(product.slug) ?? product.credits ?? 0;
  if (method === "credits") {
    if (credits <= 0) {
      throw new Error(`Credits payment is not available for ${product.slug}`);
    }
    return {
      id: hybridLineKey(product, merged),
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
    id: hybridLineKey(product, merged),
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

/** @deprecated Use toGstoreDualPaymentCartLine */
export const toStickerCartLine = toGstoreDualPaymentCartLine;

export function assertHomogeneousGstoreCheckout(lines: CartLine[]): void {
  const hasCredits = lines.some(
    (l) => isGstoreCreditsCartLine(l) || cartLineUsesCreditsPayment(l),
  );
  const hasInr = lines.some((l) => l.unitAmount !== null && l.unitAmount > 0);
  if (hasCredits && hasInr) {
    throw new Error(
      "Mixed payment methods in cart. Check out INR items and credit items separately.",
    );
  }
}