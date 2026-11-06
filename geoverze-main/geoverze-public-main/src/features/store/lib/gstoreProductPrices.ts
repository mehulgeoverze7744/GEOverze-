/**
 * Server-authoritative Gstore product price catalog.
 *
 * SECURITY: This module is imported by server functions to validate prices.
 * The server NEVER trusts prices sent by the client — it always looks up
 * the price here using the product slug.
 *
 * All prices are in INR minor units (paise). ₹1 = 100 paise.
 *
 * HOW TO ADD A NEW PRODUCT:
 *   1. Add the slug → priceMinor entry here.
 *   2. Update the product page / catalogue to match.
 *   3. No other changes required for checkout to work.
 */

export type GstoreProductPrice = {
  slug: string;
  name: string;
  /** Price in INR paise (₹1 = 100 paise). */
  priceMinor: number;
  /** Whether the product requires shipping (physical). */
  physical: boolean;
  /** Category for shipping calculation. */
  category: string;
};

/**
 * Map of slug → product price data.
 * Used server-side to validate cart items before creating an order.
 */
export const GSTORE_PRODUCT_PRICES: Record<string, GstoreProductPrice> = {
  // ── Storefront Signature Tees ─────────────────────────────────────────
  "midnight-black-tshirt": {
    slug: "midnight-black-tshirt",
    name: "Midnight Black T-Shirt",
    priceMinor: 299_900,   // ₹2,999
    physical: true,
    category: "tshirts",
  },
  "cherry-blossom-tshirt": {
    slug: "cherry-blossom-tshirt",
    name: "Cherry Blossom T-Shirt",
    priceMinor: 299_900,   // ₹2,999
    physical: true,
    category: "tshirts",
  },
  "golden-arc-tshirt": {
    slug: "golden-arc-tshirt",
    name: "Golden Arc T-Shirt",
    priceMinor: 299_900,   // ₹2,999
    physical: true,
    category: "tshirts",
  },
  "new-age-tshirt": {
    slug: "new-age-tshirt",
    name: "New Age T-Shirt",
    priceMinor: 299_900,   // ₹2,999
    physical: true,
    category: "tshirts",
  },

  // ── Catalogue T-Shirts ────────────────────────────────────────────────
  "tshirt-know-the-capital": {
    slug: "tshirt-know-the-capital",
    name: "I KNOW THE CAPITAL. YOU KNOW THE VIBES.",
    priceMinor: 370_000,   // ₹3,700
    physical: true,
    category: "tshirts",
  },
  "meridian-tee": {
    slug: "meridian-tee",
    name: "Meridian Tee",
    priceMinor: 340_000,   // ₹3,400
    physical: true,
    category: "tshirts",
  },
  "continents-tee": {
    slug: "continents-tee",
    name: "Seven Continents Tee",
    priceMinor: 340_000,   // ₹3,400
    physical: true,
    category: "tshirts",
  },
  "latitude-longitude-tee": {
    slug: "latitude-longitude-tee",
    name: "Lat/Long Coordinates Tee",
    priceMinor: 320_000,   // ₹3,200
    physical: true,
    category: "tshirts",
  },
  "country-silhouette-tee": {
    slug: "country-silhouette-tee",
    name: "Country Silhouette Tee",
    priceMinor: 320_000,   // ₹3,200
    physical: true,
    category: "tshirts",
  },

  // ── Hoodies ───────────────────────────────────────────────────────────
  "hoodie-every-point-has-a-story": {
    slug: "hoodie-every-point-has-a-story",
    name: "Every Point Has a Story Hoodie",
    priceMinor: 549_900,   // ₹5,499
    physical: true,
    category: "hoodies",
  },
  "atlas-hoodie": {
    slug: "atlas-hoodie",
    name: "Atlas Hoodie",
    priceMinor: 499_900,   // ₹4,999
    physical: true,
    category: "hoodies",
  },
  "expedition-hoodie": {
    slug: "expedition-hoodie",
    name: "Expedition Hoodie",
    priceMinor: 549_900,   // ₹5,499
    physical: true,
    category: "hoodies",
  },
  "born-to-roam-hoodie": {
    slug: "born-to-roam-hoodie",
    name: "Born to Roam Hoodie",
    priceMinor: 499_900,   // ₹4,999
    physical: true,
    category: "hoodies",
  },

  // ── Accessories ───────────────────────────────────────────────────────
  "flag-sticker-pack": {
    slug: "flag-sticker-pack",
    name: "Flag Sticker Pack",
    priceMinor: 120_000,   // ₹1,200
    physical: true,
    category: "accessories",
  },
  "continent-sticker-set": {
    slug: "continent-sticker-set",
    name: "Continent Sticker Set",
    priceMinor: 99_900,    // ₹999
    physical: true,
    category: "accessories",
  },
  "vintage-expedition-sticker-collection": {
    slug: "vintage-expedition-sticker-collection",
    name: "Vintage Expedition Sticker Collection",
    priceMinor: 149_900,   // ₹1,499
    physical: true,
    category: "accessories",
  },
  "old-world-mug": {
    slug: "old-world-mug",
    name: "Old World Mug",
    priceMinor: 220_000,   // ₹2,200
    physical: true,
    category: "accessories",
  },
  "expedition-enamel-mug": {
    slug: "expedition-enamel-mug",
    name: "Expedition Enamel Mug",
    priceMinor: 199_900,   // ₹1,999
    physical: true,
    category: "accessories",
  },
  "desk-globe-mini": {
    slug: "desk-globe-mini",
    name: "Mini Desk Globe",
    priceMinor: 349_900,   // ₹3,499
    physical: true,
    category: "accessories",
  },
  "bronze-world-map-poster": {
    slug: "bronze-world-map-poster",
    name: "Bronze World Map Poster",
    priceMinor: 450_000,   // ₹4,500
    physical: true,
    category: "accessories",
  },
};

/**
 * Returns the server-authoritative price for a product slug.
 * Returns null if the product is not found (treat as unavailable).
 */
export function getProductPrice(slug: string): GstoreProductPrice | null {
  return GSTORE_PRODUCT_PRICES[slug] ?? null;
}

/**
 * Shipping method costs in INR paise.
 * Free above FREE_SHIPPING_THRESHOLD_MINOR.
 */
export const GSTORE_SHIPPING_COSTS: Record<string, number> = {
  standard: 0,          // Free standard shipping
  tracked: 69_000,      // ₹690
  express: 149_900,     // ₹1,499
};

export const FREE_SHIPPING_THRESHOLD_MINOR = 399_900; // ₹3,999

/** GST rate for physical products (%). */
export const GSTORE_GST_RATE = 0.18;

/**
 * Compute the INR shipping cost for a given method and subtotal.
 * Standard shipping is free above FREE_SHIPPING_THRESHOLD_MINOR.
 */
export function computeShippingMinor(
  method: string,
  subtotalMinor: number,
  hasPhysical: boolean,
): number {
  if (!hasPhysical) return 0;
  if (method === "standard" && subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR) return 0;
  return GSTORE_SHIPPING_COSTS[method] ?? 0;
}

/**
 * Compute GST (18%) on the subtotal + shipping (tax-exclusive: added on top).
 * Products sold in India require GST for physical goods.
 */
export function computeTaxMinor(subtotalMinor: number, shippingMinor: number): number {
  const taxable = subtotalMinor + shippingMinor;
  return Math.round(taxable * GSTORE_GST_RATE);
}

/** Format paise as a rupee string: ₹2,999 */
export function formatInrPaise(paise: number): string {
  const rupees = paise / 100;
  return rupees.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
