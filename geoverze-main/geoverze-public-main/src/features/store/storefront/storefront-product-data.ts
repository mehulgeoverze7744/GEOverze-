/**
 * Product data for the four Gstorefront Signature T-shirts:
 * Midnight Black, Cherry Blossom, Golden Arc, and New Age.
 *
 * These products are the hero "Best Sellers" of the GvrzeStorefront and link
 * to individual product detail pages at /geostore/product/$slug.
 */

const BASE = "/assets/gvrze-storefront/best-sellers";
const CB_BASE = `${BASE}/cherry-blossom`;
const MB_BASE = `${BASE}/midnight-black`;
const SG_BASE = `${BASE}/starlight-grey`;
const NA_BASE  = `${BASE}/new-age`;
const NM_BASE  = `${BASE}/new-age-mulberry`;
const NB_BASE  = `${BASE}/new-age-midnight-black`;
const GA_BASE  = `${BASE}/golden-arc`;

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
   * Full ordered gallery for the product detail page (single-colour products).
   * Ignored when `colors` is present — each colour carries its own `gallery`.
   */
  gallery?: { src: string; alt: string }[];
  /**
   * Colour variants for multi-colour products.
   * When present, the product page renders colour swatches and switches the
   * entire gallery when the customer selects a different colour.
   * The first colour in the array is selected by default.
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
    // Default card image = Cherry Blossom Pink primary (cb-2.jpg).
    // The product detail page gallery is driven by `colors` below.
    image: {
      src: `${CB_BASE}/cb-2.jpg`,
      alt: "GVRZE Cherry Blossom Oversized Graphic T-Shirt — Cherry Blossom Pink front design",
    },

    // ── Colour variants ──────────────────────────────────────────────────────
    // Two colours share the same product page, name, description, price, and
    // size options.  Selecting a colour switches the entire gallery.
    colors: [
      // ── 1. Cherry Blossom Pink (default) ──────────────────────────────────
      {
        id: "cherry-blossom-pink",
        label: "Cherry Blossom Pink",
        hex: "#e29ecc",
        image: {
          src: `${CB_BASE}/cb-2.jpg`,
          alt: "Cherry Blossom T-Shirt in Cherry Blossom Pink — front design",
        },
        // Gallery order:
        // cb-1 neckline/branding  cb-2 front (PRIMARY)  cb-3 full back
        // cb-4 chest logo detail  cb-5 back graphic      cb-6 sleeve detail
        // cb-7 model wearing (front)
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
      },

      // ── 2. Midnight Black ─────────────────────────────────────────────────
      {
        id: "midnight-black",
        label: "Midnight Black",
        hex: "#1a1a1a",
        image: {
          src: `${MB_BASE}/mb-1.jpg`,
          alt: "Cherry Blossom T-Shirt in Midnight Black — front design",
        },
        // Gallery order:
        // mb-1 front product (PRIMARY)  mb-2 back product
        // mb-3 chest branding detail    mb-4 sleeve/graphic detail
        // mb-5 neck label & collar      mb-6 model front  mb-7 model back
        gallery: [
          {
            src: `${MB_BASE}/mb-1.jpg`,
            alt: "Midnight Black — front T-shirt product image",
          },
          {
            src: `${MB_BASE}/mb-2.jpg`,
            alt: "Midnight Black — back T-shirt product image",
          },
          {
            src: `${MB_BASE}/mb-3.png`,
            alt: "Midnight Black — front GVRZE chest branding detail",
          },
          {
            src: `${MB_BASE}/mb-4.jpg`,
            alt: "Midnight Black — sleeve and graphic detail",
          },
          {
            src: `${MB_BASE}/mb-5.png`,
            alt: "Midnight Black — neck label and collar detail",
          },
          {
            src: `${MB_BASE}/mb-6.jpg`,
            alt: "Midnight Black — model wearing the tee, front view",
          },
          {
            src: `${MB_BASE}/mb-7.jpg`,
            alt: "Midnight Black — model wearing the tee, back view",
          },
        ],
      },

      // ── 3. Starlight Grey ─────────────────────────────────────────────────
      {
        id: "starlight-grey",
        label: "Starlight Grey",
        hex: "#6b6b6b",
        image: {
          src: `${SG_BASE}/sg-1.jpg`,
          alt: "Cherry Blossom T-Shirt in Starlight Grey — front design",
        },
        // Gallery order:
        // sg-1 front product (PRIMARY)  sg-2 back product
        // sg-3 chest branding detail    sg-4 collar & label close-up
        // sg-5 sleeve / back graphic    sg-6 model back  sg-7 model front
        gallery: [
          {
            src: `${SG_BASE}/sg-1.jpg`,
            alt: "Starlight Grey — front T-shirt product image",
          },
          {
            src: `${SG_BASE}/sg-2.jpg`,
            alt: "Starlight Grey — back T-shirt product image",
          },
          {
            src: `${SG_BASE}/sg-3.jpg`,
            alt: "Starlight Grey — front GVRZE chest branding detail",
          },
          {
            src: `${SG_BASE}/sg-4.jpg`,
            alt: "Starlight Grey — collar and GVRZE label close-up",
          },
          {
            src: `${SG_BASE}/sg-5.jpg`,
            alt: "Starlight Grey — sleeve and back graphic detail",
          },
          {
            src: `${SG_BASE}/sg-6.jpg`,
            alt: "Starlight Grey — model wearing the tee, back view",
          },
          {
            src: `${SG_BASE}/sg-7.jpg`,
            alt: "Starlight Grey — model wearing the tee, front view",
          },
        ],
      },
    ],

    description:
      "Inspired by the beauty of cherry blossoms and the spirit of exploration, the Cherry Blossom T-shirt combines expressive artwork with GVRZE's distinctive geographic identity. The tee features an abstract map-inspired graphic flowing across the front and back, complemented by compass elements, coordinates, and signature GVRZE branding. The front carries a minimal GVRZE chest logo and bold artistic geographic composition; the back showcases an oversized graphic with exploration-inspired typography and navigation elements. Available in three colourways — Cherry Blossom Pink, Midnight Black, and Starlight Grey.",
    highlights: [
      "Premium oversized streetwear silhouette.",
      "Available in Cherry Blossom Pink, Midnight Black, and Starlight Grey colourways.",
      "Distinctive front and back graphic artwork with GVRZE signature branding.",
      "Geographic coordinates and compass-inspired detailing across the design.",
      "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
      "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
      "Comfortable everyday streetwear — pairs easily with denim, cargo pants, or joggers.",
    ],
    stylingTip:
      "Cherry Blossom Pink: style with white or cream trousers and minimalist sneakers for a clean contrast look. Midnight Black: pair with black cargo pants or dark denim for a bold monochrome fit. Starlight Grey: wear with beige chinos or olive trousers for an effortless tonal look. Layer an open overshirt over any colourway for transitional weather.",
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
    tone: "#8cc8e8",
    // Default card image = Skyblue front shot (ga-1.jpg).
    // Gallery is driven by the `colors` array below.
    image: {
      src: `${GA_BASE}/ga-1.jpg`,
      alt: "GVRZE Golden Arc T-Shirt in Skyblue — front product view",
    },

    // ── Colour variants ──────────────────────────────────────────────────────
    // Currently one colourway; additional colours can be appended here when
    // their images are ready — the UI swatch selector appears automatically
    // once two or more colours are present.
    colors: [
      {
        id: "skyblue",
        label: "Skyblue",
        hex: "#a8d4f0",
        image: {
          src: `${GA_BASE}/ga-1.jpg`,
          alt: "Golden Arc T-Shirt in Skyblue — front design",
        },
        // Gallery order:
        // ga-1 front product (PRIMARY)   ga-2 back product
        // ga-3 front + back presentation ga-4 collar / fabric close-up
        // ga-5 model back                ga-6 model front
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
      },
      // Add further colourways here when ready, e.g.:
      // { id: "...", label: "...", hex: "...", image: {...}, gallery: [...] },
    ],

    description:
      "A statement piece inspired by celestial geometry and cosmic exploration. The Golden Arc T-Shirt in Skyblue combines a relaxed oversized silhouette with a distinctive planetary graphic composition. Its soft sky-blue base creates a clean contrast against deep blue celestial artwork, orbital lines, and the signature GVRZE wordmark. Designed for everyday wear with a premium streetwear aesthetic, this tee brings together minimal branding and expressive cosmic detailing.",
    highlights: [
      "Skyblue colourway — soft and distinctive against the deep blue artwork.",
      "Signature GVRZE wordmark on the front chest.",
      "Large celestial planetary artwork on the back — globe, orbital lines, star elements.",
      "Abstract topographic artwork on the front for a layered graphic composition.",
      "Oversized relaxed silhouette — premium streetwear fit.",
      "Premium-looking ribbed crew neckline with GVRZE label.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
    ],
    stylingTip:
      "Style the Golden Arc Skyblue Tee with white or off-white trousers for a tonal look, or contrast with dark denim and black sneakers. The sky-blue colourway pairs naturally with navy, ecru, and light grey for a clean, understated summer aesthetic.",
    washcare: WASHCARE_STANDARD,
    relatedIds: ["midnight-black-tshirt", "cherry-blossom-tshirt", "new-age-tshirt"],
  },
  {
    id: "new-age-tshirt",
    name: "New Age T-Shirt",
    categoryLabel: "T-SHIRT",
    priceLabel: "Rs. 2,999",
    tone: "#6c0036",
    // Default card image = Rose Wine Burgundy front shot (na-1.jpg).
    // Gallery is driven by the `colors` array below.
    image: {
      src: `${NA_BASE}/na-1.jpg`,
      alt: "GVRZE New Age T-Shirt in Rose Wine Burgundy — front product view",
    },

    // ── Colour variants ──────────────────────────────────────────────────────
    // Currently one colourway; additional colours can be appended here when
    // their images are ready — the UI swatch selector appears automatically
    // once two or more colours are present.
    colors: [
      {
        id: "rose-wine-burgundy",
        label: "Rose Wine Burgundy",
        hex: "#6c0036",
        image: {
          src: `${NA_BASE}/na-1.jpg`,
          alt: "New Age T-Shirt in Rose Wine Burgundy — front design",
        },
        // Gallery order:
        // na-1 front product (PRIMARY)   na-2 back product
        // na-3 additional back design    na-4 collar & chest close-up
        // na-5 model front               na-6 model angled
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
      },
      // ── 2. Mulberry ───────────────────────────────────────────────────────
      {
        id: "mulberry",
        label: "Mulberry",
        hex: "#4a0e4e",
        image: {
          src: `${NM_BASE}/nm-1.jpg`,
          alt: "New Age T-Shirt in Mulberry — front design",
        },
        // Gallery order:
        // nm-1 front product (PRIMARY)  nm-2 back product
        // nm-3 back/sleeve design       nm-4 collar & neck detail
        // nm-5 model front              nm-6 lifestyle / editorial
        gallery: [
          {
            src: `${NM_BASE}/nm-1.jpg`,
            alt: "Mulberry — front T-shirt product image",
          },
          {
            src: `${NM_BASE}/nm-2.jpg`,
            alt: "Mulberry — back T-shirt product image",
          },
          {
            src: `${NM_BASE}/nm-3.png`,
            alt: "Mulberry — back and sleeve graphic design detail",
          },
          {
            src: `${NM_BASE}/nm-4.jpg`,
            alt: "Mulberry — collar and GVRZE label close-up",
          },
          {
            src: `${NM_BASE}/nm-5.jpg`,
            alt: "Mulberry — model wearing the tee, front view",
          },
          {
            src: `${NM_BASE}/nm-6.jpg`,
            alt: "Mulberry — lifestyle editorial, front and back views",
          },
        ],
      },

      // ── 3. Midnight Black ─────────────────────────────────────────────────
      {
        id: "new-age-midnight-black",
        label: "Midnight Black",
        hex: "#1a1a1a",
        image: {
          src: `${NB_BASE}/nb-1.jpg`,
          alt: "New Age T-Shirt in Midnight Black — front design",
        },
        // Gallery order:
        // nb-1 front product (PRIMARY)  nb-2 back product full
        // nb-3 back / sleeve detail     nb-4 collar & label close-up
        // nb-5 lifestyle / dual model
        gallery: [
          {
            src: `${NB_BASE}/nb-1.jpg`,
            alt: "Midnight Black — front T-shirt product image",
          },
          {
            src: `${NB_BASE}/nb-2.png`,
            alt: "Midnight Black — back T-shirt product image",
          },
          {
            src: `${NB_BASE}/nb-3.png`,
            alt: "Midnight Black — back and sleeve graphic design detail",
          },
          {
            src: `${NB_BASE}/nb-4.png`,
            alt: "Midnight Black — collar and GVRZE label close-up",
          },
          {
            src: `${NB_BASE}/nb-5.jpg`,
            alt: "Midnight Black — lifestyle editorial, front and back views",
          },
        ],
      },
    ],

    description:
      "The New Age T-shirt is a statement piece inspired by cosmic exploration, celestial navigation and contemporary streetwear. It features intricate multicolour celestial artwork across the sleeve and shoulder, a minimal star emblem on the front, and a clean GVRZE chest wordmark. The back showcases an expressive celestial composition with a half-globe illustration, orbital detailing, star elements and vertical GVRZE typography. Combining understated front branding with an elaborate back graphic, New Age brings together modern streetwear aesthetics and the GVRZE universe. Available in Rose Wine Burgundy, Mulberry, and Midnight Black.",
    highlights: [
      "Available in Rose Wine Burgundy, Mulberry, and Midnight Black — three deep-tone colourways.",
      "Intricate celestial sleeve and shoulder artwork in multicolour print.",
      "Minimal star emblem and GVRZE chest wordmark on the front.",
      "Expressive back graphic: half-globe, orbital detailing and vertical GVRZE type.",
      "Premium oversized streetwear silhouette for a relaxed, modern fit.",
      "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
      "Comfortable everyday streetwear — pairs easily with dark denim, black cargo pants, or slim trousers.",
    ],
    stylingTip:
      "Rose Wine Burgundy: style with black straight-leg trousers or dark denim for a tonal contrast-forward fit. Mulberry: works with charcoal cargo pants, olive trousers or dark denim. Midnight Black: a true all-rounder — pairs with any bottom; white sneakers add contrast, all-black keeps it monochrome. All three colourways work equally well layered under an open overshirt.",
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
