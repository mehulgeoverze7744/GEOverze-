/**
 * Product data for the four Gstorefront Signature T-shirts:
 * Midnight Black, Cherry Blossom, Golden Arc, and New Age.
 *
 * These products are the hero "Best Sellers" of the GvrzeStorefront and link
 * to individual product detail pages at /geostore/product/$slug.
 */

const BASE = "/assets/gvrze-storefront/best-sellers";
const CB_BASE = `${BASE}/cherry-blossom`;
const NA_BASE = `${BASE}/new-age`;
const GA_BASE = `${BASE}/golden-arc`;

/**
 * A single colour variant for a storefront tee.
 * Maps to `SFColorOption` in `StorefrontProductPage.tsx`.
 */
export type StorefrontTeeColorVariant = {
  /** Machine id — stored in cart options as the Colour value. */
  id: string;
  /** Human-readable label shown on the product page and in the cart. */
  label: string;
  /** CSS hex colour for the swatch circle. */
  hex: string;
  /**
   * Primary swatch / card image for this colour.
   * Used as the swatch preview and as a fallback if `gallery` is empty.
   */
  image: { src: string; alt: string };
  /**
   * Full ordered gallery for this colour's product detail view.
   * The first item is loaded as the main image; thumbnails select the rest.
   */
  gallery: { src: string; alt: string }[];
};

/** Credit redemption price shown beside the rupee price on every live T-shirt. */
export const STOREFRONT_TEE_CREDIT_PRICE = 499;

/** Existing rupee label plus the credit option — same string used on every tee surface. */
export const STOREFRONT_TEE_PRICE_LABEL = "Rs. 2,999 or 499 credits";

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
   * first gallery slide when no `gallery` array or `colors` are provided.
   * When `colors` is present this is used as the default card thumbnail but
   * the product page gallery is driven by the active colour's `gallery`.
   */
  image: { src: string; alt: string };
  /**
   * Full ordered gallery for the product detail page.
   * Always the approved default colour's images unless a colour picker is
   * explicitly enabled below.
   */
  gallery?: { src: string; alt: string }[];
  /**
   * Locked default colour for cart, checkout, and browse filters.
   * Not shown as a picker — every Gstore product ships as one colour.
   */
  defaultColour?: { id: string; label: string; hex: string };
  /**
   * Opt-in colour picker. Default is off. Set this to true AND provide two or
   * more `colors` only when a product is explicitly approved for variants.
   */
  enableColorSelector?: boolean;
  /**
   * Extra colour variants. Ignored by the product page unless
   * `enableColorSelector` is true and this array has more than one entry.
   */
  colors?: StorefrontTeeColorVariant[];
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
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
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
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#e29ecc",
    defaultColour: { id: "cherry-blossom-pink", label: "Cherry Blossom Pink", hex: "#e29ecc" },
    image: {
      src: `${CB_BASE}/cb-2.jpg`,
      alt: "GVRZE Cherry Blossom Oversized Graphic T-Shirt — Cherry Blossom Pink front design",
    },
    gallery: [
      {
        src: `${CB_BASE}/cb-1.jpg`,
        alt: "Cherry Blossom Pink — neckline and GVRZE branding close-up",
      },
      {
        src: `${CB_BASE}/cb-2.jpg`,
        alt: "Cherry Blossom Pink — front design overview",
      },
      {
        src: `${CB_BASE}/cb-3.jpg`,
        alt: "Cherry Blossom Pink — full back graphic design",
      },
      {
        src: `${CB_BASE}/cb-4.jpg`,
        alt: "Cherry Blossom Pink — front chest GVRZE logo detail",
      },
      {
        src: `${CB_BASE}/cb-5.jpg`,
        alt: "Cherry Blossom Pink — back graphic detail close-up",
      },
      {
        src: `${CB_BASE}/cb-6.jpg`,
        alt: "Cherry Blossom Pink — front sleeve and graphic detail",
      },
      {
        src: `${CB_BASE}/cb-7.jpg`,
        alt: "Cherry Blossom Pink — model wearing the tee, front view",
      },
    ],

    description:
      "Inspired by the beauty of cherry blossoms and the spirit of exploration, the Cherry Blossom T-shirt combines expressive artwork with GVRZE's distinctive geographic identity. The tee features an abstract map-inspired graphic flowing across the front and back, complemented by compass elements, coordinates, and signature GVRZE branding. The front carries a minimal GVRZE chest logo and bold artistic geographic composition; the back showcases an oversized graphic with exploration-inspired typography and navigation elements. Offered in Cherry Blossom Pink.",
    highlights: [
      "Premium oversized streetwear silhouette.",
      "Cherry Blossom Pink colourway.",
      "Distinctive front and back graphic artwork with GVRZE signature branding.",
      "Geographic coordinates and compass-inspired detailing across the design.",
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
      "Comfortable everyday streetwear — pairs easily with denim, cargo pants, or joggers.",
    ],
    stylingTip:
      "Style with white or cream trousers and minimalist sneakers for a clean contrast look. Layer an open overshirt for transitional weather.",
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
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#8cc8e8",
    defaultColour: { id: "skyblue", label: "Skyblue", hex: "#a8d4f0" },
    image: {
      src: `${GA_BASE}/ga-1.jpg`,
      alt: "GVRZE Golden Arc T-Shirt in Skyblue — front product view",
    },
    gallery: [
      {
        src: `${GA_BASE}/ga-1.jpg`,
        alt: "Skyblue — front T-shirt product image",
      },
      {
        src: `${GA_BASE}/ga-2.jpg`,
        alt: "Skyblue — back T-shirt product image",
      },
      {
        src: `${GA_BASE}/ga-3.jpg`,
        alt: "Skyblue — front and back product presentation",
      },
      {
        src: `${GA_BASE}/ga-4.jpg`,
        alt: "Skyblue — collar, fabric and GVRZE label close-up",
      },
      {
        src: `${GA_BASE}/ga-5.jpg`,
        alt: "Skyblue — model wearing the tee, back view",
      },
      {
        src: `${GA_BASE}/ga-6.jpg`,
        alt: "Skyblue — model wearing the tee, front view",
      },
    ],

    description:
      "A statement piece inspired by celestial geometry and cosmic exploration. The Golden Arc T-Shirt combines a relaxed oversized silhouette with a distinctive planetary graphic composition — intricate celestial artwork, orbital lines, and the signature GVRZE wordmark. Offered in Skyblue. Designed for everyday wear with a premium streetwear aesthetic.",
    highlights: [
      "Skyblue colourway.",
      "Signature GVRZE wordmark on the front chest.",
      "Large celestial planetary artwork on the back — globe, orbital lines, star elements.",
      "Abstract topographic artwork on the front for a layered graphic composition.",
      "Oversized relaxed silhouette — premium streetwear fit.",
      "Premium-looking ribbed crew neckline with GVRZE label.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
    ],
    stylingTip:
      "Style with white or off-white trousers for a tonal look, or contrast with dark denim. Layer an open overshirt for transitional weather.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["midnight-black-tshirt", "cherry-blossom-tshirt", "new-age-tshirt"],
  },
  {
    id: "new-age-tshirt",
    name: "New Age T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#6c0036",
    defaultColour: { id: "rose-wine-burgundy", label: "Rose Wine Burgundy", hex: "#6c0036" },
    image: {
      src: `${NA_BASE}/na-1.jpg`,
      alt: "GVRZE New Age T-Shirt in Rose Wine Burgundy — front product view",
    },
    gallery: [
      {
        src: `${NA_BASE}/na-1.jpg`,
        alt: "Rose Wine Burgundy — front T-shirt product image",
      },
      {
        src: `${NA_BASE}/na-2.jpg`,
        alt: "Rose Wine Burgundy — back T-shirt product image",
      },
      {
        src: `${NA_BASE}/na-3.jpg`,
        alt: "Rose Wine Burgundy — additional back graphic design",
      },
      {
        src: `${NA_BASE}/na-4.jpg`,
        alt: "Rose Wine Burgundy — collar, chest star and graphic close-up",
      },
      {
        src: `${NA_BASE}/na-5.jpg`,
        alt: "Rose Wine Burgundy — model wearing the tee, front view",
      },
      {
        src: `${NA_BASE}/na-6.jpg`,
        alt: "Rose Wine Burgundy — model wearing the tee, angled view",
      },
    ],

    description:
      "The New Age T-shirt is a statement piece inspired by cosmic exploration, celestial navigation and contemporary streetwear. It features intricate celestial artwork across the sleeve and shoulder, a minimal star emblem on the front, and a clean GVRZE chest wordmark. The back showcases an expressive celestial composition with a half-globe illustration, orbital detailing, star elements and vertical GVRZE typography. Combining understated front branding with an elaborate back graphic, New Age brings together modern streetwear aesthetics and the GVRZE universe. Offered in Rose Wine Burgundy.",
    highlights: [
      "Rose Wine Burgundy colourway.",
      "Intricate celestial sleeve and shoulder artwork.",
      "Minimal star emblem and GVRZE chest wordmark on the front.",
      "Expressive back graphic: half-globe, orbital detailing and vertical GVRZE type.",
      "Premium oversized streetwear silhouette for a relaxed, modern fit.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
      "Comfortable everyday streetwear — pairs easily with dark denim, black cargo pants, or slim trousers.",
    ],
    stylingTip:
      "Style with black straight-leg trousers or dark denim for a tonal contrast-forward fit. Layer an open overshirt for transitional weather.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["midnight-black-tshirt", "cherry-blossom-tshirt", "golden-arc-tshirt"],
  },
];

const BY_ID = new Map(STOREFRONT_TEES.map((p) => [p.id, p]));

/** Returns a storefront signature tee by slug, or undefined. */
export function storefrontTeeById(id: string): StorefrontTeeProduct | undefined {
  return BY_ID.get(id);
}

/**
 * Colour swatches are off unless a product is explicitly approved for variants
 * (`enableColorSelector`) and actually has more than one colour.
 */
export function teeShowsColorSelector(tee: StorefrontTeeProduct): boolean {
  return tee.enableColorSelector === true && (tee.colors?.length ?? 0) > 1;
}

/** Gallery for the product page — always the approved default colour. */
export function teeDefaultGallery(tee: StorefrontTeeProduct): { src: string; alt: string }[] {
  if (tee.gallery?.length) return tee.gallery;
  if (tee.colors?.[0]?.gallery?.length) return tee.colors[0].gallery;
  return [tee.image];
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
