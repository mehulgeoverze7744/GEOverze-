/** Turns catalogue products into cart lines. */
import type { CartLine } from "@/stores/cartStore";

import { productBySlug, type Product } from "../data/products";

/** Stable line key so the same variant merges instead of duplicating. */
export function lineKey(product: Product, options: Record<string, string>): string {
  const signature = Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return signature ? `${product.id}#${signature}` : product.id;
}

export function toCartLine(
  product: Product,
  options: Record<string, string> = {},
  quantity = 1,
): CartLine {
  return {
    id: lineKey(product, options),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    unitAmount: product.price,
    unitCredits: product.credits,
    quantity,
    options,
    category: product.category,
  };
}

/** Default variant selection — the first value of every option. */
export function defaultOptions(product: Product): Record<string, string> {
  const out: Record<string, string> = {};
  for (const option of product.options) {
    const first = option.values[0];
    if (first) out[option.label] = first;
  }
  return out;
}

/** Cart line id for a catalogue product with optional variant selection. */
export function cartLineIdForProduct(product: Product, options?: Record<string, string>): string {
  return lineKey(product, options ?? defaultOptions(product));
}

export function isCartLinePresent(lines: CartLine[], lineId: string): boolean {
  return lines.some((line) => line.id === lineId);
}

/** Live catalogue name/slug for renamed products (e.g. New Age → ORBIT). */
export function resolveCartLine(line: CartLine): CartLine {
  const product = productBySlug(line.slug);
  if (!product) return line;
  return { ...line, slug: product.slug, name: product.name };
}
