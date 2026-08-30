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
};

export function categoryBannerForId(categoryId: string): CategoryBanner | undefined {
  return CATEGORY_BANNERS[categoryId];
}
