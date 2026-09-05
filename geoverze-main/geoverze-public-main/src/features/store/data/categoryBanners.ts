/** Merchandise category banner artwork for GEOstore home tiles. Keyed by category id. */
export type CategoryBanner = {
  src: string;
  alt: string;
};

const CATEGORY_BANNER_BASE = "/assets/store/categories";

export const CATEGORY_BANNERS: Readonly<Record<string, CategoryBanner>> = {
  tshirts: {
    src: `${CATEGORY_BANNER_BASE}/tshirts.jpg`,
    alt: "GEOverze T-shirts",
  },
  hoodies: {
    src: `${CATEGORY_BANNER_BASE}/hoodies.jpg`,
    alt: "GEOverze Hoodies",
  },
  caps: {
    src: `${CATEGORY_BANNER_BASE}/caps.jpg`,
    alt: "GEOverze Caps",
  },
  mugs: {
    src: `${CATEGORY_BANNER_BASE}/mugs.jpg`,
    alt: "GEOverze Mugs",
  },
  stickers: {
    src: `${CATEGORY_BANNER_BASE}/stickers.jpg`,
    alt: "GEOverze Stickers",
  },
  posters: {
    src: `${CATEGORY_BANNER_BASE}/posters.jpg`,
    alt: "GEOverze Posters",
  },
  accessories: {
    src: `${CATEGORY_BANNER_BASE}/accessories.jpg`,
    alt: "GEOverze Accessories",
  },
  "quiz-packs": {
    src: `${CATEGORY_BANNER_BASE}/quiz-packs.jpg`,
    alt: "GEOverze Quiz Packs",
  },
  "learning-packs": {
    src: `${CATEGORY_BANNER_BASE}/learning-packs.jpg`,
    alt: "GEOverze Learning Packs",
  },
  "country-collections": {
    src: `${CATEGORY_BANNER_BASE}/country-collections.jpg`,
    alt: "GEOverze Country Collections",
  },
  "theme-packs": {
    src: `${CATEGORY_BANNER_BASE}/theme-packs.jpg`,
    alt: "GEOverze Theme Packs",
  },
  "premium-resources": {
    src: `${CATEGORY_BANNER_BASE}/premium-resources.jpg`,
    alt: "GEOverze Premium Resources",
  },
};

export function categoryBannerForId(categoryId: string): CategoryBanner | undefined {
  return CATEGORY_BANNERS[categoryId];
}
