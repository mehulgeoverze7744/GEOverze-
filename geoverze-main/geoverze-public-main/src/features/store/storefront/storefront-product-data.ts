/**
 * Product data for the four Gstorefront Signature T-shirts:
 * Midnight Black, Cherry Blossom, Golden Arc, and New Age.
 *
 * These products are the hero "Best Sellers" of the GvrzeStorefront and link
 * to individual product detail pages at /geostore/product/$slug.
 */

const BASE = "/assets/gvrze-storefront/best-sellers";
const CB_BASE = `${BASE}/cherry-blossom`;

export type StorefrontTeeProduct = {
  /** Route slug — also the DOM key. */
  id: string;
  name: string;
  categoryLabel: "T-SHIRT";
  priceLabel: string;
  /** Card background colour (matches the best-sellers tile tone). */
  tone: string;
  /**
   * Primary card image — used in product cards, best-seller tiles, and as the
   * first gallery slide when no `gallery` array is provided.
   */
  image: { src: string; alt: string };
  /**
   * Full ordered gallery for the product detail page.
   * When present, this list is used for the left-column image gallery instead
   * of the single `image` field.  The first item is shown as the main image on
   * load; thumbnail navigation selects the rest.
   */
  gallery?: { src: string; alt: string }[];
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
    name: "Cherry Blossom Oversized Graphic T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: "Rs. 2,999",
    tone: "#e29ecc",
    // cb-2.jpg is the primary card / hero image (front T-shirt design)
    image: {
      src: `${CB_BASE}/cb-2.jpg`,
      alt: "GVRZE Cherry Blossom Oversized Graphic T-Shirt — front design",
    },
    // All 7 gallery images in spec order:
    // 1 — neckline & branding close-up  2 — front design (card image)
    // 3 — full back design              4 — front chest GVRZE logo detail
    // 5 — back graphic detail           6 — front sleeve & graphic detail
    // 7 — model wearing the tee (front)
    gallery: [
      {
        src: `${CB_BASE}/cb-1.jpg`,
        alt: "Cherry Blossom T-Shirt — neckline and GVRZE branding close-up",
      },
      {
        src: `${CB_BASE}/cb-2.jpg`,
        alt: "Cherry Blossom T-Shirt — front design overview",
      },
      {
        src: `${CB_BASE}/cb-3.jpg`,
        alt: "Cherry Blossom T-Shirt — full back graphic design",
      },
      {
        src: `${CB_BASE}/cb-4.jpg`,
        alt: "Cherry Blossom T-Shirt — front chest GVRZE logo detail",
      },
      {
        src: `${CB_BASE}/cb-5.jpg`,
        alt: "Cherry Blossom T-Shirt — back graphic detail close-up",
      },
      {
        src: `${CB_BASE}/cb-6.jpg`,
        alt: "Cherry Blossom T-Shirt — front sleeve and graphic detail",
      },
      {
        src: `${CB_BASE}/cb-7.jpg`,
        alt: "Cherry Blossom T-Shirt — model wearing the tee, front view",
      },
    ],
    description:
      "Inspired by the beauty of cherry blossoms and the spirit of exploration, the Cherry Blossom T-shirt combines expressive artwork with GVRZE's distinctive geographic identity. Designed around a rich cherry-pink color palette, the tee features an abstract map-inspired graphic flowing across the front and back, complemented by compass elements, coordinates, and signature GVRZE branding. The front features a minimal GVRZE chest logo and a bold artistic geographic composition. The back showcases an oversized graphic with exploration-inspired typography and navigation elements.",
    highlights: [
      "Premium oversized streetwear silhouette.",
      "Cherry-pink colorway — distinctive and bold.",
      "Distinctive front and back graphic artwork with GVRZE signature branding.",
      "Geographic coordinates and compass-inspired detailing across the design.",
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
      "Comfortable everyday streetwear — pairs easily with denim, cargo pants, or joggers.",
    ],
    stylingTip:
      "Style the Cherry Blossom Tee with white or cream trousers and minimalist sneakers for a clean contrast look. Layer an open overshirt for transitional weather, or pair with black cargo pants for a bold streetwear fit.",
    washcare: [
      "Machine wash inside out with similar colors, cold water (30°C / 86°F).",
      "Do not bleach.",
      "Do not iron directly over the printed graphics.",
      "Dry inside out or hang dry for best results.",
      "Do not dry clean.",
    ],
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
