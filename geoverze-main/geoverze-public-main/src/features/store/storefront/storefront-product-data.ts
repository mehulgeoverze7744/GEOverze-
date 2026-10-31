/**
 * Product data for the four Gstorefront Signature T-shirts:
 * Midnight Black, Cherry Blossom, Golden Arc, and New Age.
 *
 * These products are the hero "Best Sellers" of the GvrzeStorefront and link
 * to individual product detail pages at /geostore/product/$slug.
 */

const BASE = "/assets/gvrze-storefront/best-sellers";

export type StorefrontTeeProduct = {
  /** Route slug — also the DOM key. */
  id: string;
  name: string;
  categoryLabel: "T-SHIRT";
  priceLabel: string;
  /** Card background colour (matches the best-sellers tile tone). */
  tone: string;
  image: { src: string; alt: string };
  description: string;
  highlights: string[];
  stylingTip: string;
  washcare: string[];
  /** IDs of the other three signature tees shown in "You may also like". */
  relatedIds: string[];
};

const WASHCARE_STANDARD = [
  "Machine wash cold (30°C / 86°F) with like colours.",
  "Do not bleach.",
  "Tumble dry low or air dry flat.",
  "Iron on low heat. Do not iron directly on the print.",
  "Do not dry clean.",
];

const HIGHLIGHTS_STANDARD = [
  "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
  "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
  "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
  "Versatile Streetwear — pairs easily with denim, cargo pants, or joggers.",
];

export const STOREFRONT_TEES: readonly StorefrontTeeProduct[] = [
  {
    id: "midnight-black-tshirt",
    name: "Midnight Black T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: "Rs. 2,999",
    tone: "#000000",
    image: {
      src: `${BASE}/midnight-black-tshirt.webp`,
      alt: "GVRZE Midnight Black T-Shirt, back view",
    },
    description:
      "Introducing the GVRZE Midnight Black Graphic T-Shirt, crafted from 100% premium cotton. A statement piece built for explorers who wear their story — bold graphics, heavyweight comfort, and a silhouette that goes with everything.",
    highlights: HIGHLIGHTS_STANDARD,
    stylingTip:
      "Pair the Midnight Black Tee with relaxed-fit denim, cargo pants, or baggy trousers. Add white sneakers and a minimal crossbody for a clean streetwear-ready look.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["cherry-blossom-tshirt", "golden-arc-tshirt", "new-age-tshirt"],
  },
  {
    id: "cherry-blossom-tshirt",
    name: "Cherry Blossom T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: "Rs. 2,999",
    tone: "#e29ecc",
    image: {
      src: `${BASE}/cherry-blossom-tshirt.webp`,
      alt: "GVRZE Cherry Blossom T-Shirt, back view",
    },
    description:
      "The GVRZE Cherry Blossom Graphic T-Shirt blends botanical grace with explorer spirit. Crafted from 100% premium cotton — soft against the skin, vivid in presence, and made to be worn with intention.",
    highlights: [
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
      "Seasonal Versatility — works with neutral bottoms, denim, or linen separates.",
    ],
    stylingTip:
      "Style the Cherry Blossom Tee with white or cream trousers and minimalist sneakers. Try layering an open overshirt for transitional weather.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["midnight-black-tshirt", "golden-arc-tshirt", "new-age-tshirt"],
  },
  {
    id: "golden-arc-tshirt",
    name: "Golden Arc T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: "Rs. 2,999",
    tone: "#8c624a",
    image: {
      src: `${BASE}/golden-arc-tshirt.webp`,
      alt: "GVRZE Golden Arc T-Shirt, front view",
    },
    description:
      "The GVRZE Golden Arc Graphic T-Shirt channels earthy warmth and bold cartographic lines. 100% premium cotton with a heavyweight feel and rich screen-print graphics that define any outfit.",
    highlights: [
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
      "Earth-Tone Palette — pairs naturally with olive, tan, and warm-toned bottoms.",
    ],
    stylingTip:
      "Wear the Golden Arc Tee with olive cargo trousers and leather boots for a heritage-meets-modern explorer vibe. Works equally well tucked into high-waist denim.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["midnight-black-tshirt", "cherry-blossom-tshirt", "new-age-tshirt"],
  },
  {
    id: "new-age-tshirt",
    name: "New Age T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: "Rs. 2,999",
    tone: "#6c0036",
    image: {
      src: `${BASE}/new-age-tshirt.webp`,
      alt: "GVRZE New Age T-Shirt, back view",
    },
    description:
      "The GVRZE New Age Graphic T-Shirt is a deep-toned statement built for those who move differently. 100% premium cotton with rich, saturated screen-print graphics that command attention.",
    highlights: [
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
      "Contrast-Forward Design — striking on its own, pairs with black or burgundy bottoms.",
    ],
    stylingTip:
      "Match the New Age Tee with black straight-leg trousers or dark denim and minimal white sneakers for a contrast-forward streetwear fit.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["midnight-black-tshirt", "cherry-blossom-tshirt", "golden-arc-tshirt"],
  },
];

const BY_ID = new Map(STOREFRONT_TEES.map((p) => [p.id, p]));

/** Returns a storefront signature tee by slug, or undefined. */
export function storefrontTeeById(id: string): StorefrontTeeProduct | undefined {
  return BY_ID.get(id);
}

/** Returns the three related storefront tees for a given product id. */
export function relatedStorefrontTees(
  id: string,
): StorefrontTeeProduct[] {
  const product = BY_ID.get(id);
  if (!product) return [];
  return product.relatedIds
    .map((rid) => BY_ID.get(rid))
    .filter((p): p is StorefrontTeeProduct => p !== undefined);
}
