import antiqueExpeditionMug from "@/assets/geostore/antique-expedition-mug.jpg";
import cartographerCap from "@/assets/geostore/cartographer-cap.jpg";
import continentStickerSet from "@/assets/geostore/continent-sticker-set.jpg";
import deskGlobeMini from "@/assets/geostore/desk-globe-mini.jpg";
import expeditionEnamelMug from "@/assets/geostore/expedition-enamel-mug.jpg";
import expeditionKeychain from "@/assets/geostore/expedition-keychain.jpg";
import explorersCompass from "@/assets/geostore/explorers-compass.jpg";
import fieldNotebook from "@/assets/geostore/field-notebook.jpg";
import flagStickerPack from "@/assets/geostore/flag-sticker-pack.jpg";
import hoodieExploreTheUnknown from "@/assets/geostore/hoodie-explore-the-unknown.jpg";
import latitudeLongitudeMug from "@/assets/geostore/latitude-longitude-mug.jpg";
import navigatorCompassMug from "@/assets/geostore/navigator-compass-mug.jpg";
import oldWorldMug from "@/assets/geostore/old-world-mug.jpg";
import polarBeanie from "@/assets/geostore/polar-beanie.jpg";
import tshirtKnowTheCapital from "@/assets/geostore/tshirt-i-know-the-capital.jpg";
import vintageExpeditionStickerCollection from "@/assets/geostore/vintage-expedition-sticker-collection.jpg";
import worldMapMug from "@/assets/geostore/world-map-mug.jpg";

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
  "navigator-compass-mug": {
    src: navigatorCompassMug,
    alt: "GEOverze Navigator Compass Mug — dark ceramic with bronze compass emblem",
  },
  "world-map-mug": {
    src: worldMapMug,
    alt: "GEOverze World Map Mug — antique bronze world map on deep charcoal ceramic",
  },
  "latitude-longitude-mug": {
    src: latitudeLongitudeMug,
    alt: "GEOverze Latitude Longitude Mug — bronze geographic grid on matte charcoal ceramic",
  },
  "antique-expedition-mug": {
    src: antiqueExpeditionMug,
    alt: "GEOverze Antique Expedition Mug — vintage map glaze inspired by old-world exploration",
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
  "field-notebook": {
    src: fieldNotebook,
    alt: "GEOverze Field Notebook — dot-grid field notebook with a bronze GEOverze emblem",
  },
  "desk-globe-mini": {
    src: deskGlobeMini,
    alt: "GEOverze Mini Desk Globe — 12 cm desk globe with a bronze meridian",
  },
  "expedition-keychain": {
    src: expeditionKeychain,
    alt: "GEOverze Expedition Keychain — bronze-finished explorer keychain with compass and globe emblem",
  },
  "explorers-compass": {
    src: explorersCompass,
    alt: "GEOverze Explorer's Compass — vintage-style pocket compass with an antique world map dial",
  },
  "i-know-the-capital-you-know-the-vibes": {
    src: tshirtKnowTheCapital,
    alt: "GEOverze I Know The Capital You Know The Vibes T-shirt — black tee with capital-city artwork",
  },
  "explore-the-unknown": {
    src: hoodieExploreTheUnknown,
    alt: "GEOverze Explore The Unknown Hoodie — black hoodie with world map and compass artwork",
  },
};

export function productImageForSlug(slug: string): ProductImage | undefined {
  return PRODUCT_IMAGES[slug];
}
