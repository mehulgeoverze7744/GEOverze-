/** Merchandise category banner artwork for GVRZE Store home tiles. Keyed by category id. */
export type CategoryBanner = {
  src: string;
  alt: string;
};

const CATEGORY_BANNER_BASE = "/assets/store/categories";

export const CATEGORY_BANNERS: Readonly<Record<string, CategoryBanner>> = {
  tshirts: {
    src: `${CATEGORY_BANNER_BASE}/tshirts.jpg`,
    alt: "GVRZE T-shirts",
  },
  hoodies: {
    src: `${CATEGORY_BANNER_BASE}/hoodies.jpg`,
    alt: "GVRZE Hoodies",
  },
  caps: {
    src: `${CATEGORY_BANNER_BASE}/caps.jpg`,
    alt: "GVRZE Caps",
  },
  mugs: {
    src: `${CATEGORY_BANNER_BASE}/mugs.jpg`,
    alt: "GVRZE Mugs",
  },
  stickers: {
    src: `${CATEGORY_BANNER_BASE}/stickers.jpg`,
    alt: "GVRZE Stickers",
  },
  posters: {
    src: `${CATEGORY_BANNER_BASE}/posters.jpg`,
    alt: "GVRZE Posters",
  },
  accessories: {
    src: `${CATEGORY_BANNER_BASE}/accessories.jpg`,
    alt: "GVRZE Accessories",
  },
  "quiz-packs": {
    src: `${CATEGORY_BANNER_BASE}/quiz-packs.jpg`,
    alt: "GVRZE Quiz Packs",
  },
  "learning-packs": {
    src: `${CATEGORY_BANNER_BASE}/learning-packs.jpg`,
    alt: "GVRZE Learning Packs",
  },
  "country-collections": {
    src: `${CATEGORY_BANNER_BASE}/country-collections.jpg`,
    alt: "GVRZE Country Collections",
  },
  "theme-packs": {
    src: `${CATEGORY_BANNER_BASE}/theme-packs.jpg`,
    alt: "GVRZE Theme Packs",
  },
  "premium-resources": {
    src: `${CATEGORY_BANNER_BASE}/premium-resources.jpg`,
    alt: "GVRZE Premium Resources",
  },
};

export function categoryBannerForId(categoryId: string): CategoryBanner | undefined {
  return CATEGORY_BANNERS[categoryId];
}
