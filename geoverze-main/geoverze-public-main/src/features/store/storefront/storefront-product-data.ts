/**
 * Product data for the Gstorefront Signature T-shirts:
 * BLOOM, TERRA, ORBIT, IGNITE, EDEN, PACE, and ECLIPSE.
 *
 * These products are the hero "Best Sellers" of the GvrzeStorefront and link
 * to individual product detail pages at /geostore/product/$slug.
 */

const BASE = "/assets/gvrze-storefront/best-sellers";
const CB_BASE = `${BASE}/cherry-blossom`;
const OR_BASE = `${BASE}/orbit`;
const GA_BASE = `${BASE}/golden-arc`;
const IG_BASE = `${BASE}/ignite`;
const ED_BASE = `${BASE}/eden`;
const PA_BASE = `${BASE}/pace`;
const EC_BASE = `${BASE}/eclipse`;

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
  /** IDs of related signature tees shown in "You may also like". */
  relatedIds: string[];
  /** Exclusive colourway badge on product cards and the detail gallery. */
  specialColour?: boolean;
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
    id: "cherry-blossom-tshirt",
    name: "BLOOM T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#e29ecc",
    defaultColour: { id: "cherry-blossom-pink", label: "Cherry Blossom Pink", hex: "#e29ecc" },
    specialColour: true,
    image: {
      src: `${CB_BASE}/cb-2.jpg`,
      alt: "GVRZE BLOOM T-Shirt — Cherry Blossom Pink front design",
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
      "Inspired by the beauty of cherry blossoms and the spirit of exploration, BLOOM combines expressive artwork with GVRZE's distinctive geographic identity. The tee features an abstract map-inspired graphic flowing across the front and back, complemented by compass elements, coordinates, and signature GVRZE branding. The front carries a minimal GVRZE chest logo and bold artistic geographic composition; the back showcases an oversized graphic with exploration-inspired typography and navigation elements. Offered in Cherry Blossom Pink.",
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
    relatedIds: ["eclipse", "golden-arc-tshirt", "orbit-tshirt"],
  },
  {
    id: "golden-arc-tshirt",
    name: "TERRA T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#8cc8e8",
    defaultColour: { id: "skyblue", label: "Sky Blue", hex: "#a8d4f0" },
    image: {
      src: `${GA_BASE}/ga-3.jpg`,
      alt: "GVRZE TERRA T-Shirt in Sky Blue — front and back product photograph",
    },
    gallery: [
      {
        src: `${GA_BASE}/ga-3.jpg`,
        alt: "Sky Blue — front and back product presentation",
      },
      {
        src: `${GA_BASE}/ga-1.jpg`,
        alt: "Sky Blue — front T-shirt product image",
      },
      {
        src: `${GA_BASE}/ga-2.jpg`,
        alt: "Sky Blue — back T-shirt product image",
      },
      {
        src: `${GA_BASE}/ga-4.jpg`,
        alt: "Sky Blue — collar, fabric and GVRZE label close-up",
      },
      {
        src: `${GA_BASE}/ga-5.jpg`,
        alt: "Sky Blue — model wearing the tee, back view",
      },
      {
        src: `${GA_BASE}/ga-6.jpg`,
        alt: "Sky Blue — model wearing the tee, front view",
      },
    ],

    description:
      "A statement piece inspired by celestial geometry and cosmic exploration. The TERRA T-Shirt combines a relaxed oversized silhouette with a distinctive planetary graphic composition — intricate celestial artwork, orbital lines, and the signature GVRZE wordmark. Offered in Sky Blue. Designed for everyday wear with a premium streetwear aesthetic.",
    highlights: [
      "Sky Blue colourway.",
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
    relatedIds: ["eclipse", "cherry-blossom-tshirt", "orbit-tshirt"],
  },
  {
    id: "orbit-tshirt",
    name: "ORBIT T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#6c0036",
    defaultColour: { id: "rose-wine-burgundy", label: "Rose Wine Burgundy", hex: "#6c0036" },
    image: {
      src: `${OR_BASE}/or-1.jpg`,
      alt: "GVRZE ORBIT T-Shirt in Rose Wine Burgundy — front product view with sleeve artwork, star emblem and chest wordmark",
    },
    gallery: [
      {
        src: `${OR_BASE}/or-1.jpg`,
        alt: "Rose Wine Burgundy — front T-shirt product photograph with sleeve artwork, star emblem and GVRZE chest branding",
      },
      {
        src: `${OR_BASE}/or-2.jpg`,
        alt: "Rose Wine Burgundy — full back product photograph with celestial globe artwork and vertical GVRZE typography",
      },
      {
        src: `${OR_BASE}/or-3.jpg`,
        alt: "Rose Wine Burgundy — back design close-up of the detailed globe illustration",
      },
      {
        src: `${OR_BASE}/or-4.jpg`,
        alt: "Rose Wine Burgundy — collar and chest branding close-up with GVRZE label and star emblem",
      },
      {
        src: `${OR_BASE}/or-5.jpg`,
        alt: "Rose Wine Burgundy — model wearing ORBIT, front view showing sleeve artwork and fit",
      },
      {
        src: `${OR_BASE}/or-6.jpg`,
        alt: "Rose Wine Burgundy — model wearing ORBIT, side angle showing sleeve graphic and silhouette",
      },
    ],
    description:
      "ORBIT is inspired by the endless movement of celestial bodies and the beauty of the universe. Designed in a deep Rose Wine Burgundy shade, this statement piece combines intricate cosmic artwork with contemporary streetwear aesthetics. The front features an expressive multicoloured graphic flowing across one sleeve and shoulder, complemented by a minimal GVRZE chest logo and a subtle celestial star emblem. The back showcases a striking half-globe illustration surrounded by celestial detailing, orbital elements and vertical GVRZE typography. A distinctive combination of cosmic exploration and modern streetwear, ORBIT is designed for those who move beyond boundaries.",
    highlights: [
      "Rose Wine Burgundy colourway.",
      "Premium oversized streetwear silhouette.",
      "Intricate multicoloured cosmic artwork across one sleeve and shoulder.",
      "Minimal GVRZE chest branding and a celestial star emblem on the front.",
      "Large celestial globe artwork on the back with vertical GVRZE typography.",
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
    ],
    stylingTip:
      "Style ORBIT with black straight-leg trousers or dark denim for a tonal contrast-forward fit. Layer an open overshirt for transitional weather.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["eclipse", "cherry-blossom-tshirt", "golden-arc-tshirt"],
  },
  {
    id: "ignite",
    name: "IGNITE",
    categoryLabel: "T-SHIRT",
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#111111",
    defaultColour: { id: "midnight-black", label: "Midnight Black", hex: "#111111" },
    image: {
      src: `${IG_BASE}/ig-1.png`,
      alt: "GVRZE IGNITE oversized T-shirt in Midnight Black — front product view with chest logo",
    },
    gallery: [
      {
        src: `${IG_BASE}/ig-1.png`,
        alt: "Midnight Black — front T-shirt product image with GVRZE chest logo",
      },
      {
        src: `${IG_BASE}/ig-2.png`,
        alt: "Midnight Black — back T-shirt product image with orange 3D mesh artwork",
      },
      {
        src: `${IG_BASE}/ig-3.png`,
        alt: "Midnight Black — neck-label close-up with GVRZE branding",
      },
      {
        src: `${IG_BASE}/ig-4.png`,
        alt: "Midnight Black — model wearing IGNITE, front view",
      },
      {
        src: `${IG_BASE}/ig-5.png`,
        alt: "Midnight Black — model wearing IGNITE, back view with complete orange artwork",
      },
    ],
    description:
      "Built around movement, energy and expression, IGNITE brings an entirely different dimension to everyday streetwear. Featuring an intricate, flowing orange 3D mesh artwork across the back, accented by subtle orbital elements and the signature GVRZE wordmark, this design creates a striking contrast against its deep black base. The front keeps things minimal with a refined GVRZE chest logo, while the back makes the statement. Minimal from the front. Unmistakable from the back. IGNITE is made for those who aren't afraid to stand apart.",
    highlights: [
      "Midnight Black colourway.",
      "Premium oversized streetwear silhouette.",
      "Intricate flowing orange 3D mesh artwork across the back.",
      "Subtle orbital elements and signature GVRZE wordmark.",
      "Minimal GVRZE chest logo on the front.",
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
    ],
    stylingTip:
      "Pair IGNITE with black cargo trousers or washed denim. Keep jewellery minimal so the back artwork stays the statement.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["eclipse", "cherry-blossom-tshirt", "golden-arc-tshirt"],
  },
  {
    id: "eden",
    name: "EDEN",
    categoryLabel: "T-SHIRT",
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#efe6d4",
    defaultColour: { id: "ivory-cream", label: "Ivory / Cream", hex: "#efe6d4" },
    image: {
      src: `${ED_BASE}/ed-1.png`,
      alt: "GVRZE EDEN oversized T-shirt in Ivory / Cream — front product view with GVRZE chest wordmark",
    },
    gallery: [
      {
        src: `${ED_BASE}/ed-1.png`,
        alt: "Ivory / Cream — front T-shirt product image with black GVRZE chest wordmark",
      },
      {
        src: `${ED_BASE}/ed-2.jpg`,
        alt: "Ivory / Cream — back T-shirt product image with Earth, flowers and butterflies artwork",
      },
      {
        src: `${ED_BASE}/ed-3.png`,
        alt: "Ivory / Cream — neck-label close-up with GVRZE branding",
      },
      {
        src: `${ED_BASE}/ed-4.png`,
        alt: "Ivory / Cream — model wearing EDEN, front view",
      },
      {
        src: `${ED_BASE}/ed-5.png`,
        alt: "Ivory / Cream — model wearing EDEN, back view with complete Earth and floral artwork",
      },
    ],
    description:
      "EDEN — A WORLD IN BLOOM. Inspired by the beauty of our planet and the life it holds, EDEN brings nature and creativity together in a distinctive wearable design. The back features an expressive Earth illustration surrounded by vibrant flowers, botanical elements and butterflies, symbolising the connection between nature, life and the world we share. A clean ivory base and minimal GVRZE wordmark keep the front understated, allowing the artwork on the back to take centre stage. A reminder of the beauty around us. A statement worth wearing. Discover EDEN by GVRZE.",
    highlights: [
      "Ivory / Cream colourway.",
      "Premium oversized streetwear silhouette.",
      "Expressive Earth illustration on the back, surrounded by flowers, botanical elements and butterflies.",
      "Minimal black GVRZE chest wordmark on the front.",
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
    ],
    stylingTip:
      "Style EDEN with black cargo trousers or washed denim so the ivory base and back artwork stay the focus.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["ignite", "cherry-blossom-tshirt", "eclipse"],
  },
  {
    id: "pace",
    name: "PACE",
    categoryLabel: "T-SHIRT",
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#c41e3a",
    defaultColour: { id: "racing-red", label: "Racing Red", hex: "#c41e3a" },
    image: {
      src: `${PA_BASE}/pa-1.png`,
      alt: "GVRZE PACE oversized T-shirt in Racing Red — front product view with cream GVRZE chest wordmark and checkerboard sleeves",
    },
    gallery: [
      {
        src: `${PA_BASE}/pa-1.png`,
        alt: "Racing Red — front T-shirt product image with cream GVRZE chest wordmark and checkerboard sleeve detailing",
      },
      {
        src: `${PA_BASE}/pa-2.png`,
        alt: "Racing Red — back T-shirt product image with cream racing flag, GVRZE branding and MOTION WITHOUT BORDERS",
      },
      {
        src: `${PA_BASE}/pa-3.jpg`,
        alt: "Racing Red — collar and neck-label close-up with GVRZE branding",
      },
      {
        src: `${PA_BASE}/pa-4.png`,
        alt: "Racing Red — model wearing PACE, front view",
      },
      {
        src: `${PA_BASE}/pa-5.png`,
        alt: "Racing Red — model wearing PACE, back view with complete racing flag artwork",
      },
    ],
    description:
      "PACE — MOTION WITHOUT BORDERS. Inspired by the energy of racing and the spirit of movement, PACE brings speed and streetwear together in a bold statement design. Featuring a dynamic cream checkerboard flag across the back, signature GVRZE typography and matching checkerboard sleeve detailing, every element is designed to create a distinctive racing-inspired aesthetic. The vibrant red base and clean front wordmark balance bold graphics with minimal styling. Made for those who move differently, think freely and never stand still. Find your pace. Define your direction.",
    highlights: [
      "Racing Red colourway.",
      "Premium oversized streetwear silhouette.",
      "Dynamic cream checkerboard racing flag across the back.",
      "Matching checkerboard sleeve detailing.",
      "Minimal cream GVRZE chest wordmark on the front.",
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
    ],
    stylingTip:
      "Style PACE with black cargo trousers or washed denim so the racing red base and checkerboard artwork stay the statement.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["eden", "ignite", "cherry-blossom-tshirt"],
  },
  {
    id: "eclipse",
    name: "ECLIPSE T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: STOREFRONT_TEE_PRICE_LABEL,
    tone: "#2b2b2b",
    defaultColour: { id: "charcoal-black", label: "Charcoal Black", hex: "#2b2b2b" },
    image: {
      src: `${EC_BASE}/ec-5.jpg`,
      alt: "GVRZE ECLIPSE T-Shirt in Charcoal Black — model wearing the tee, front view with monochrome world-map artwork",
    },
    gallery: [
      {
        src: `${EC_BASE}/ec-5.jpg`,
        alt: "Charcoal Black — model wearing ECLIPSE, front view",
      },
      {
        src: `${EC_BASE}/ec-1.jpg`,
        alt: "Charcoal Black — full front T-shirt product image with monochrome world-map artwork",
      },
      {
        src: `${EC_BASE}/ec-2.jpg`,
        alt: "Charcoal Black — back T-shirt product image with monochromatic Earth, orbital paths, stars and mountain landscape",
      },
      {
        src: `${EC_BASE}/ec-3.png`,
        alt: "Charcoal Black — close-up of the monochromatic world-map artwork on the front",
      },
      {
        src: `${EC_BASE}/ec-4.png`,
        alt: "Charcoal Black — collar and neck-label close-up with GVRZE branding",
      },
      {
        src: `${EC_BASE}/ec-6.png`,
        alt: "Charcoal Black — model wearing ECLIPSE, back view with planetary Earth artwork",
      },
    ],
    description:
      "ECLIPSE — BEYOND THE KNOWN. Inspired by the vastness of space and the beauty of our planet, ECLIPSE transforms celestial imagery into a statement of understated streetwear. The design features a detailed monochromatic Earth, surrounded by orbital paths, distant celestial bodies and luminous star details. A sculpted mountain landscape completes the composition, creating a visual connection between the cosmos and the world beneath us. The front showcases a striking monochrome world-map composition, while the back reveals an expansive planetary scene. Dark, detailed and deliberately understated. Look beyond. Wear the unknown.",
    highlights: [
      "Charcoal Black colourway.",
      "Premium oversized streetwear silhouette.",
      "Monochrome world-map artwork across the front.",
      "Expansive monochromatic Earth illustration on the back, with orbital paths, stars and a mountain landscape.",
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
    ],
    stylingTip:
      "Style ECLIPSE with black cargo trousers or washed charcoal denim so the monochrome artwork stays the statement.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["pace", "eden", "ignite"],
  },
];

const BY_ID = new Map(STOREFRONT_TEES.map((p) => [p.id, p]));

/**
 * Retired storefront slugs that still resolve to the live product.
 * Old cart lines, wishlists, and shared links keep working.
 */
export const STOREFRONT_TEE_SLUG_ALIASES: Readonly<Record<string, string>> = {
  "new-age-tshirt": "orbit-tshirt",
};

/** Canonical storefront tee slug (aliases collapse to the live product). */
export function canonicalStorefrontTeeSlug(id: string): string {
  return STOREFRONT_TEE_SLUG_ALIASES[id] ?? id;
}

/** Returns a storefront signature tee by slug, or undefined. */
export function storefrontTeeById(id: string): StorefrontTeeProduct | undefined {
  return BY_ID.get(canonicalStorefrontTeeSlug(id));
}

/** Exclusive colourway badge — currently BLOOM only. */
export function teeHasSpecialColourBadge(id: string): boolean {
  return storefrontTeeById(id)?.specialColour === true;
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

/** Returns related storefront tees for a given product id. */
export function relatedStorefrontTees(
  id: string,
): StorefrontTeeProduct[] {
  const product = storefrontTeeById(id);
  if (!product) return [];
  return product.relatedIds
    .map((rid) => storefrontTeeById(rid))
    .filter((p): p is StorefrontTeeProduct => p !== undefined);
}
