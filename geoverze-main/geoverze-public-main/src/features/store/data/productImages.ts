import cartographerCap from "@/assets/geostore/cartographer-cap.jpg";
import celestialMeridianMug from "@/assets/geostore/celestial-meridian-mug-studio-main.jpg";
import continentStickerSet from "@/assets/geostore/continent-sticker-set.jpg";
import crystalEarthGlobe from "@/assets/geostore/crystal-earth-globe-studio.jpg";
import deskGlobeMini from "@/assets/geostore/desk-globe-mini.jpg";
import atlasEncyclopedia from "@/assets/geostore/atlas-encyclopedia.jpg";
import beyondTheHorizon from "@/assets/geostore/beyond-the-horizon.jpg";
import blueOceanGlobe from "@/assets/geostore/blue-ocean-globe-studio.jpg";
import expeditionEnamelMug from "@/assets/geostore/expedition-enamel-mug.jpg";
import flagStickerPack from "@/assets/geostore/flag-sticker-pack.jpg";
import goldenAtlasMug from "@/assets/geostore/golden-atlas-mug-studio-main.jpg";
import hoodieExploreTheUnknown from "@/assets/geostore/hoodie-explore-the-unknown.jpg";
import oldWorldMug from "@/assets/geostore/old-world-mug.jpg";
import orbitalHorizonMug from "@/assets/geostore/orbital-horizon-mug-studio-front.jpg";
import polarBeanie from "@/assets/geostore/polar-beanie.jpg";
import terraContourMug from "@/assets/geostore/terra-contour-mug-studio-main.jpg";
import theAtlasArchive from "@/assets/geostore/the-atlas-archive.jpg";
import theCartographersCollection from "@/assets/geostore/the-cartographers-collection.jpg";
import theExplorersTrail from "@/assets/geostore/the-explorers-trail.jpg";
import vintageExpeditionStickerCollection from "@/assets/geostore/vintage-expedition-sticker-collection.jpg";
import vintageWorldGlobe from "@/assets/geostore/vintage-world-globe-studio.jpg";

import { merchProductById } from "@/features/marketing/data/geostoreMerch";

/** Product photography overrides for GEOstore cards (slug-keyed). */
export type ProductImage = {
  src: string;
  alt: string;
  /** When true, catalogue cards cover the frame instead of letterboxing. */
  fillFrame?: boolean;
  objectPosition?: string;
};

export const GLOBE_PRODUCT_SLUGS = [
  "crystal-earth-globe",
  "vintage-world-globe",
  "blue-ocean-globe",
] as const;

export function isGlobeProductSlug(slug: string): boolean {
  return (GLOBE_PRODUCT_SLUGS as readonly string[]).includes(slug);
}

const PRODUCT_IMAGES: Readonly<Record<string, ProductImage>> = {
  "cartographer-cap": {
    src: cartographerCap,
    alt: "GEOverze Cartographer Cap — charcoal six-panel cap with bronze compass emblem",
  },
  "polar-beanie": {
    src: polarBeanie,
    alt: "GEOverze Polar Beanie — black ribbed wool beanie with bronze emblem",
  },
  "old-world-mug": {
    src: oldWorldMug,
    alt: "GEOverze Old World Mug — glazed ceramic with antique world map projection",
  },
  "expedition-enamel-mug": {
    src: expeditionEnamelMug,
    alt: "GEOverze Expedition Enamel Mug — camp-grade enamel with bronze rim",
  },
  "orbital-horizon-mug": {
    src: orbitalHorizonMug,
    alt: "GEOverze Orbital Horizon Mug — deep charcoal ceramic with a planetary arc and orbital lines",
    fillFrame: true,
  },
  "celestial-meridian-mug": {
    src: celestialMeridianMug,
    alt: "GEOverze Celestial Meridian Mug — charcoal ceramic with sweeping orbital lines and a star motif",
    fillFrame: true,
  },
  "terra-contour-mug": {
    src: terraContourMug,
    alt: "GEOverze Terra Contour Mug — dark ceramic with topographic contour lines and bronze detailing",
    fillFrame: true,
  },
  "golden-atlas-mug": {
    src: goldenAtlasMug,
    alt: "GEOverze Golden Atlas Mug — bronze world map on deep charcoal ceramic",
    fillFrame: true,
  },
  "flag-sticker-pack": {
    src: flagStickerPack,
    alt: "GEOverze Flag Sticker Pack — fifty die-cut weatherproof vinyl flag stickers",
    fillFrame: true,
  },
  "continent-sticker-set": {
    src: continentStickerSet,
    alt: "GEOverze Continent Sticker Set — seven matte-finish landmass stickers",
    fillFrame: true,
  },
  "vintage-expedition-sticker-collection": {
    src: vintageExpeditionStickerCollection,
    alt: "GEOverze Vintage Expedition Sticker Collection — explorer badges, maps and navigation emblems",
    fillFrame: true,
  },
  "the-explorers-trail": {
    src: theExplorersTrail,
    alt: "GEOverze THE EXPLORER'S TRAIL sticker collection",
    fillFrame: true,
  },
  "beyond-the-horizon": {
    src: beyondTheHorizon,
    alt: "GEOverze BEYOND THE HORIZON sticker collection",
    fillFrame: true,
  },
  "the-atlas-archive": {
    src: theAtlasArchive,
    alt: "GEOverze THE ATLAS ARCHIVE sticker collection",
    fillFrame: true,
  },
  "the-cartographers-collection": {
    src: theCartographersCollection,
    alt: "GEOverze THE CARTOGRAPHER'S COLLECTION sticker collection",
    fillFrame: true,
  },
  "field-notebook": {
    src: atlasEncyclopedia,
    alt: "GEOverze Atlas Encyclopedia — black hardcover atlas with gold world map",
  },
  "desk-globe-mini": {
    src: deskGlobeMini,
    alt: "GEOverze Mini Desk Globe — 12 cm desk globe with a bronze meridian",
  },
  "crystal-earth-globe": {
    src: crystalEarthGlobe,
    alt: "GEOverze Crystal Earth Globe — acrylic globe with detailed world map and golden meridian",
    fillFrame: true,
    objectPosition: "50% 50%",
  },
  "vintage-world-globe": {
    src: vintageWorldGlobe,
    alt: "GEOverze Vintage World Globe — classic political globe with wooden base",
    fillFrame: true,
    objectPosition: "50% 50%",
  },
  "blue-ocean-globe": {
    src: blueOceanGlobe,
    alt: "GEOverze Blue Ocean Globe — modern blue ocean globe with wooden base",
    fillFrame: true,
    objectPosition: "50% 50%",
  },
  "explore-the-unknown": {
    src: hoodieExploreTheUnknown,
    alt: "GEOverze Explore The Unknown Hoodie — black hoodie with world map and compass artwork",
  },
};

export function productImageForSlug(slug: string): ProductImage | undefined {
  const mapped = PRODUCT_IMAGES[slug];
  if (mapped) return mapped;
  const merch = merchProductById(slug);
  if (merch) return { src: merch.image, alt: merch.alt };
  return undefined;
}
