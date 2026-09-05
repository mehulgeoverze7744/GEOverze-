/** Presentation-only imagery for dashboard cards. */
import continentStickers from "@/assets/geostore/continent-sticker-set.jpg";
import earthFragments from "@/assets/geostore/hoodie-fragments-of-earth.jpg";
import earthIntelligence from "@/assets/geostore/hoodie-earth-intelligence.jpg";
import explorersCompass from "@/assets/geostore/explorers-compass.jpg";
import flagStickers from "@/assets/geostore/flag-sticker-pack.jpg";
import oldWorldMap from "@/assets/geostore/old-world-mug.jpg";

import type { LinkedItem } from "@/features/dashboard/data/dashboard";
import { articleCardImageSrc } from "@/features/library/data/article-card-images";

/** Dashboard page-level Earth background (served from /public). */
export const DASHBOARD_EARTH_SRC = "/assets/dashboard-earth.jpg";

export const FEATURED_EXPEDITION_IMAGE = earthIntelligence;

export const RECOMMENDED_IMAGES: Record<string, string> = {
  rec1: oldWorldMap,
  rec2: earthFragments,
  rec3: flagStickers,
};

/** Non-GEOlibrary dashboard thumbnails (GEOstore, Let's Play, etc.). */
const DASHBOARD_NON_GEOLIBRARY_THUMBNAILS: Readonly<Record<string, string>> = {
  r2: explorersCompass,
  r3: continentStickers,
};

/** Resolve a dashboard linked-item thumbnail from its article slug or fixed non-library asset. */
export function dashboardLinkedItemThumbnail(item: LinkedItem): string | undefined {
  if (item.articleSlug) {
    return articleCardImageSrc(item.articleSlug);
  }
  return DASHBOARD_NON_GEOLIBRARY_THUMBNAILS[item.id];
}
