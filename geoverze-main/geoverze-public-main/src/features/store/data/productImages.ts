import cartographerCap from "@/assets/geostore/cartographer-cap.jpg";
import celestialMeridianMug from "@/assets/geostore/celestial-meridian-mug.jpg";
import continentStickerSet from "@/assets/geostore/continent-sticker-set.jpg";
import deskGlobeMini from "@/assets/geostore/desk-globe-mini.jpg";
import atlasEncyclopedia from "@/assets/geostore/atlas-encyclopedia.jpg";
import beyondTheHorizon from "@/assets/geostore/beyond-the-horizon.jpg";
import expeditionEnamelMug from "@/assets/geostore/expedition-enamel-mug.jpg";
import flagStickerPack from "@/assets/geostore/flag-sticker-pack.jpg";
import goldenAtlasMug from "@/assets/geostore/golden-atlas-mug.jpg";
import hoodieExploreTheUnknown from "@/assets/geostore/hoodie-explore-the-unknown.jpg";
import oldWorldMug from "@/assets/geostore/old-world-mug.jpg";
import orbitalHorizonMug from "@/assets/geostore/orbital-horizon-mug.jpg";
import polarBeanie from "@/assets/geostore/polar-beanie.jpg";
import terraContourMug from "@/assets/geostore/terra-contour-mug.jpg";
import theAtlasArchive from "@/assets/geostore/the-atlas-archive.jpg";
import theCartographersCollection from "@/assets/geostore/the-cartographers-collection.jpg";
import theExplorersTrail from "@/assets/geostore/the-explorers-trail.jpg";
import vintageExpeditionStickerCollection from "@/assets/geostore/vintage-expedition-sticker-collection.jpg";

import { merchProductById } from "@/features/marketing/data/geostoreMerch";

/** Product photography overrides for GEOstore cards (slug-keyed). */
export type ProductImage = {
  src: string;
  alt: string;
};

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
  },
  "celestial-meridian-mug": {
    src: celestialMeridianMug,
    alt: "GEOverze Celestial Meridian Mug — charcoal ceramic with sweeping orbital lines and a star motif",
  },
  "terra-contour-mug": {
    src: terraContourMug,
    alt: "GEOverze Terra Contour Mug — dark ceramic with topographic contour lines and bronze detailing",
  },
  "golden-atlas-mug": {
    src: goldenAtlasMug,
    alt: "GEOverze Golden Atlas Mug — bronze world map on deep charcoal ceramic",
  },
  "flag-sticker-pack": {
    src: flagStickerPack,
    alt: "GEOverze Flag Sticker Pack — fifty die-cut weatherproof vinyl flag stickers",
  },
  "continent-sticker-set": {
    src: continentStickerSet,
    alt: "GEOverze Continent Sticker Set — seven matte-finish landmass stickers",
  },
  "vintage-expedition-sticker-collection": {
    src: vintageExpeditionStickerCollection,
    alt: "GEOverze Vintage Expedition Sticker Collection — explorer badges, maps and navigation emblems",
  },
  "the-explorers-trail": {
    src: theExplorersTrail,
    alt: "GEOverze THE EXPLORER'S TRAIL sticker collection",
  },
  "beyond-the-horizon": {
    src: beyondTheHorizon,
    alt: "GEOverze BEYOND THE HORIZON sticker collection",
  },
  "the-atlas-archive": {
    src: theAtlasArchive,
    alt: "GEOverze THE ATLAS ARCHIVE sticker collection",
  },
  "the-cartographers-collection": {
    src: theCartographersCollection,
    alt: "GEOverze THE CARTOGRAPHER'S COLLECTION sticker collection",
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
    src: "/assets/store/Accessories/Globes/arcylic%20globe%20image.png",
    alt: "GEOverze Crystal Earth Globe — acrylic globe with detailed world map and golden meridian",
  },
  "vintage-world-globe": {
    src: "/assets/store/Accessories/Globes/classic%20desk%20globe%20image.png",
    alt: "GEOverze Vintage World Globe — classic political globe with wooden base",
  },
  "blue-ocean-globe": {
    src: "/assets/store/Accessories/Globes/Floating%20Globe%20image.png",
    alt: "GEOverze Blue Ocean Globe — modern blue ocean globe with wooden base",
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
