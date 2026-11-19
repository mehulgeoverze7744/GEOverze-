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

export const SF_ASSETS = {
  logo: { src: "/assets/home/gvrze-wordmark.png", width: 581, height: 85 },
  hero: {
    src: SF_HERO_PICTURE.fallback,
    width: SF_HERO_NATIVE.width,
    height: SF_HERO_NATIVE.height,
  },
  heroFade: { src: `${BASE}/hero-fade.png`, width: 1024, height: 99 },
  heroUnderline: { src: `${BASE}/hero-underline.svg`, width: 83, height: 1 },
  categoryTees: { src: `${BASE}/category-tees.webp`, width: 1816, height: 866 },
  categoryHoodies: { src: `${BASE}/category-hoodies.webp`, width: 1597, height: 985 },
  categoryAccessories: { src: `${BASE}/category-accessories.webp`, width: 720, height: 900 },
  shadowTees: { src: `${BASE}/shadow-tees.svg`, width: 329, height: 269 },
  featured: { src: `${BASE}/featured-collection.webp`, width: 1881, height: 836 },
  shadowFeatured: { src: `${BASE}/shadow-featured.svg`, width: 593, height: 338 },
  brand: { src: `${BASE}/brand-statement.webp`, width: 2050, height: 767 },
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
