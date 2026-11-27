/**
 * Image and icon assets for the Gstorefront, exported from the
 * "thegvrze" Figma file (frame "Frame 11"). Photos are WebP at the original
 * Figma source resolution; icons are the original Figma SVGs.
 */
const BASE = "/assets/gvrze-storefront";

const HERO_STEM = "gvrze-graphic-tees-studio-trio";
/** Ultra HD campaign master (4K) — intrinsic size for CLS; Figma frame ≈ 1440×858. */
export const SF_HERO_NATIVE = { width: 3840, height: 2161 } as const;
export const SF_HERO_WIDTHS = [640, 960, 1280, 1920, 2560, 3840] as const;
export const SF_HERO_SIZES = "100vw";

function heroAssetPath(width: number, ext: "avif" | "webp" | "jpg"): string {
  const file =
    width === SF_HERO_NATIVE.width ? `${HERO_STEM}.${ext}` : `${HERO_STEM}-${width}w.${ext}`;
  return `${BASE}/${file}`;
}

function heroSrcSet(ext: "avif" | "webp" | "jpg"): string {
  return SF_HERO_WIDTHS.map((w) => `${heroAssetPath(w, ext)} ${w}w`).join(", ");
}

/** Responsive hero artwork — AVIF / WebP / JPEG generated from the campaign master PNG. */
export const SF_HERO_PICTURE = {
  ...SF_HERO_NATIVE,
  sizes: SF_HERO_SIZES,
  fallback: heroAssetPath(SF_HERO_NATIVE.width, "jpg"),
  srcSetAvif: heroSrcSet("avif"),
  srcSetWebp: heroSrcSet("webp"),
  srcSetJpg: heroSrcSet("jpg"),
  /** LCP preload candidate (responsive). */
  preload: {
    href: heroAssetPath(1920, "avif"),
    type: "image/avif",
    imageSrcSet: heroSrcSet("avif"),
    imageSizes: SF_HERO_SIZES,
  },
} as const;

const FEATURED_STEM = "featured-collection";
export const SF_FEATURED_NATIVE = { width: 1672, height: 941 } as const;
export const SF_FEATURED_WIDTHS = [640, 960, 1280, 1672] as const;
export const SF_FEATURED_SIZES = "100vw";

function featuredAssetPath(width: number, ext: "avif" | "webp" | "jpg"): string {
  const file =
    width === SF_FEATURED_NATIVE.width
      ? `${FEATURED_STEM}.${ext}`
      : `${FEATURED_STEM}-${width}w.${ext}`;
  return `${BASE}/${file}`;
}

function featuredSrcSet(ext: "avif" | "webp" | "jpg"): string {
  return SF_FEATURED_WIDTHS.map((w) => `${featuredAssetPath(w, ext)} ${w}w`).join(", ");
}

const BRAND_STEM = "brand-statement";
export const SF_BRAND_NATIVE = { width: 2051, height: 767 } as const;
export const SF_BRAND_WIDTHS = [640, 960, 1280, 2051] as const;
export const SF_BRAND_SIZES = "(min-width: 768px) 1334px, 100vw";

function brandAssetPath(width: number, ext: "avif" | "webp" | "jpg"): string {
  const file =
    width === SF_BRAND_NATIVE.width ? `${BRAND_STEM}.${ext}` : `${BRAND_STEM}-${width}w.${ext}`;
  return `${BASE}/${file}`;
}

function brandSrcSet(ext: "avif" | "webp" | "jpg"): string {
  return SF_BRAND_WIDTHS.map((w) => `${brandAssetPath(w, ext)} ${w}w`).join(", ");
}

/** “The world is your canvas” — GVRZE studio trio (cream tee) photograph. */
export const SF_BRAND_PICTURE = {
  ...SF_BRAND_NATIVE,
  sizes: SF_BRAND_SIZES,
  fallback: brandAssetPath(SF_BRAND_NATIVE.width, "jpg"),
  srcSetAvif: brandSrcSet("avif"),
  srcSetWebp: brandSrcSet("webp"),
  srcSetJpg: brandSrcSet("jpg"),
} as const;

/** Featured collection banner — burgundy GVRZE studio photograph. */
export const SF_FEATURED_PICTURE = {
  ...SF_FEATURED_NATIVE,
  sizes: SF_FEATURED_SIZES,
  fallback: featuredAssetPath(SF_FEATURED_NATIVE.width, "jpg"),
  srcSetAvif: featuredSrcSet("avif"),
  srcSetWebp: featuredSrcSet("webp"),
  srcSetJpg: featuredSrcSet("jpg"),
} as const;

export const SF_ASSETS = {
  logo: { src: "/assets/home/gvrze-wordmark.png", width: 581, height: 85 },
  hero: {
    src: SF_HERO_PICTURE.fallback,
    width: SF_HERO_NATIVE.width,
    height: SF_HERO_NATIVE.height,
  },
  heroFade: { src: `${BASE}/hero-fade.png`, width: 1024, height: 99 },
  heroUnderline: { src: `${BASE}/hero-underline.svg`, width: 83, height: 1 },
  categoryTees: {
    src: `${BASE}/best-sellers/ignite/ig-2.png`,
    width: 819,
    height: 1024,
  },
  categoryHoodies: { src: `${BASE}/category-hoodies.webp`, width: 1597, height: 985 },
  categoryAccessories: { src: `${BASE}/category-accessories.webp`, width: 720, height: 900 },
  shadowTees: { src: `${BASE}/shadow-tees.svg`, width: 329, height: 269 },
  featured: {
    src: featuredAssetPath(SF_FEATURED_NATIVE.width, "webp"),
    width: SF_FEATURED_NATIVE.width,
    height: SF_FEATURED_NATIVE.height,
  },
  shadowFeatured: { src: `${BASE}/shadow-featured.svg`, width: 593, height: 338 },
  brand: {
    src: brandAssetPath(SF_BRAND_NATIVE.width, "webp"),
    width: SF_BRAND_NATIVE.width,
    height: SF_BRAND_NATIVE.height,
  },
  bestSellerEclipse: {
    src: `${BASE}/best-sellers/eclipse/ec-5.jpg`,
    width: 819,
    height: 1024,
  },
  bestSellerCherryBlossom: {
    src: `${BASE}/best-sellers/cherry-blossom/cb-7.jpg`,
    width: 819,
    height: 1024,
  },
  bestSellerGoldenArc: {
    src: `${BASE}/best-sellers/golden-arc/ga-3.jpg`,
    width: 819,
    height: 1024,
  },
  bestSellerOrbit: {
    src: `${BASE}/best-sellers/orbit/or-1.jpg`,
    width: 819,
    height: 1024,
  },
  footerDivider: { src: `${BASE}/footer-divider.svg`, width: 1334, height: 2 },
  iconSearch: { src: `${BASE}/icon-search.svg`, width: 17, height: 17 },
  iconWishlist: { src: `${BASE}/icon-wishlist.svg`, width: 16, height: 20 },
  iconCart: { src: `${BASE}/icon-cart.svg`, width: 26, height: 23 },
  iconAccount: { src: `${BASE}/icon-account.svg`, width: 19, height: 19 },
  iconMenu: { src: `${BASE}/icon-menu.svg`, width: 20, height: 9 },
  iconPlus: { src: `${BASE}/icon-plus.svg`, width: 18, height: 18 },
  iconArrow: { src: `${BASE}/icon-arrow.svg`, width: 17, height: 16 },
} as const;

/** Montserrat (body) and Inter (section headings, navigation). */
export const SF_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@300;400;500;600;700;800&display=swap";
