/** Static cover art for GEOlibrary article cards, keyed by article slug. */
const ARTICLE_BASE = "/assets/geolibrary/articles";
const COLLECTION_BASE = "/assets/geolibrary/collections";

export const ARTICLE_CARD_IMAGES: Readonly<Record<string, string>> = {
  "reading-a-flag-in-thirty-seconds": `${ARTICLE_BASE}/reading-a-flag-in-thirty-seconds.jpg`,
  "how-to-read-a-topographic-map": `${ARTICLE_BASE}/how-to-read-a-topographic-map.jpg`,
  "languages-that-cross-the-most-borders": `${ARTICLE_BASE}/languages-that-cross-the-most-borders.jpg`,
  "how-the-himalayas-keep-growing": `${ARTICLE_BASE}/how-the-himalayas-keep-growing.jpg`,
  "the-sahel-explained": `${ARTICLE_BASE}/the-sahel-explained.jpg`,
  "why-some-countries-have-two-capitals": `${ARTICLE_BASE}/why-some-countries-have-two-capitals.jpg`,
  "the-straightest-borders-on-earth": `${ARTICLE_BASE}/languages-that-cross-the-most-borders.jpg`,
  "the-nile-and-the-amazon": `${COLLECTION_BASE}/great-rivers.jpg`,
  "how-unesco-picks-a-world-heritage-site": `${COLLECTION_BASE}/unesco-heritage.jpg`,
  "why-there-are-five-oceans-now": `${COLLECTION_BASE}/climate-change.jpg`,
  "what-a-currency-tells-you-about-a-country": `${COLLECTION_BASE}/world-capitals.jpg`,
  "the-landmarks-everyone-misplaces": `${COLLECTION_BASE}/natural-wonders.jpg`,
  "europes-smallest-states": `${COLLECTION_BASE}/countries-of-europe.jpg`,
  "megacities-and-the-limits-of-growth": `${COLLECTION_BASE}/world-capitals.jpg`,
};

export function articleCardImageSrc(slug: string): string | undefined {
  return ARTICLE_CARD_IMAGES[slug];
}
