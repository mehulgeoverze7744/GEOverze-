/**
 * Image and icon assets for the GVRZE storefront, exported from the
 * "thegvrze" Figma file (frame "Frame 11"). Photos are WebP at the original
 * Figma source resolution; icons are the original Figma SVGs.
 */
const BASE = "/assets/gvrze-storefront";

export const SF_ASSETS = {
  logo: { src: `${BASE}/gvrze-logo.png`, width: 581, height: 85 },
  hero: { src: `${BASE}/hero.webp`, width: 1672, height: 941 },
  heroFade: { src: `${BASE}/hero-fade.png`, width: 1024, height: 99 },
  heroUnderline: { src: `${BASE}/hero-underline.svg`, width: 83, height: 1 },
  categoryTees: { src: `${BASE}/category-tees.webp`, width: 1816, height: 866 },
  categoryHoodies: { src: `${BASE}/category-hoodies.webp`, width: 1597, height: 985 },
  categoryAccessories: { src: `${BASE}/category-accessories.webp`, width: 720, height: 900 },
  shadowTees: { src: `${BASE}/shadow-tees.svg`, width: 329, height: 269 },
  featured: { src: `${BASE}/featured-collection.webp`, width: 1881, height: 836 },
  shadowFeatured: { src: `${BASE}/shadow-featured.svg`, width: 593, height: 338 },
  brand: { src: `${BASE}/brand-statement.webp`, width: 2050, height: 767 },
  bestSellerMidnightBlack: {
    src: `${BASE}/best-sellers/midnight-black-tshirt.webp`,
    width: 1024,
    height: 1536,
  },
  bestSellerCherryBlossom: {
    src: `${BASE}/best-sellers/cherry-blossom-tshirt.webp`,
    width: 1176,
    height: 1338,
  },
  bestSellerGoldenArc: {
    src: `${BASE}/best-sellers/golden-arc-tshirt.webp`,
    width: 1136,
    height: 1384,
  },
  bestSellerNewAge: {
    src: `${BASE}/best-sellers/new-age-tshirt.webp`,
    width: 1121,
    height: 1403,
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
