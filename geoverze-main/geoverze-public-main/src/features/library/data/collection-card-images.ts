/** Static cover art for GEOlibrary collection cards on /geolibrary/collections. */
export const COLLECTION_CARD_IMAGES: Readonly<Record<string, string>> = {
  "countries-of-europe": "/assets/geolibrary/collections/countries-of-europe.jpg",
  "geography-basics": "/assets/geolibrary/collections/geography-basics.jpg",
  "great-rivers": "/assets/geolibrary/collections/great-rivers.jpg",
  "mountain-ranges": "/assets/geolibrary/collections/mountain-ranges.jpg",
  "world-capitals": "/assets/geolibrary/collections/world-capitals.jpg",
  "climate-change": "/assets/geolibrary/collections/climate-change.jpg",
  "natural-wonders": "/assets/geolibrary/collections/natural-wonders.jpg",
  "unesco-heritage": "/assets/geolibrary/collections/unesco-heritage.jpg",
};

export function collectionCardImageSrc(slug: string): string | undefined {
  return COLLECTION_CARD_IMAGES[slug];
}
