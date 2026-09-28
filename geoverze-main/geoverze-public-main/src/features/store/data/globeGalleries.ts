import { isGlobeProductSlug } from "./productImages";

/** Extra PDP views beyond the primary globe photo. Empty until studio extras land. */
export type GlobeGalleryView = {
  src: string;
  alt: string;
  label: string;
};

const GLOBE_GALLERY_EXTRAS: Readonly<Record<string, readonly GlobeGalleryView[]>> = {
  "crystal-earth-globe": [],
  "vintage-world-globe": [],
  "blue-ocean-globe": [],
};

export function globeGalleryExtras(slug: string): readonly GlobeGalleryView[] {
  if (!isGlobeProductSlug(slug)) return [];
  return GLOBE_GALLERY_EXTRAS[slug] ?? [];
}
