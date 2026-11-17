/** Static cover art for GVRZE Library article cards, keyed by article slug. */
const ARTICLE_BASE = "/assets/geolibrary/articles";

export const ARTICLE_CARD_IMAGES: Readonly<Record<string, string>> = {
  "reading-a-flag-in-thirty-seconds": `${ARTICLE_BASE}/reading-a-flag-in-thirty-seconds.jpg`,
  "how-to-read-a-topographic-map": `${ARTICLE_BASE}/how-to-read-a-topographic-map.jpg`,
  "languages-that-cross-the-most-borders": `${ARTICLE_BASE}/languages-that-cross-the-most-borders.jpg`,
  "how-the-himalayas-keep-growing": `${ARTICLE_BASE}/how-the-himalayas-keep-growing.jpg`,
  "the-sahel-explained": `${ARTICLE_BASE}/the-sahel-explained.jpg`,
  "why-some-countries-have-two-capitals": `${ARTICLE_BASE}/why-some-countries-have-two-capitals.jpg`,
  "the-straightest-borders-on-earth": `${ARTICLE_BASE}/the-straightest-borders-on-earth.jpg`,
  "the-nile-and-the-amazon": `${ARTICLE_BASE}/the-nile-and-the-amazon.jpg`,
  "how-unesco-picks-a-world-heritage-site": `${ARTICLE_BASE}/how-unesco-picks-a-world-heritage-site.jpg`,
  "why-there-are-five-oceans-now": `${ARTICLE_BASE}/why-there-are-five-oceans-now.jpg`,
  "what-a-currency-tells-you-about-a-country": `${ARTICLE_BASE}/what-a-currency-tells-you-about-a-country.jpg`,
  "the-landmarks-everyone-misplaces": `${ARTICLE_BASE}/the-landmarks-everyone-misplaces.jpg`,
  "europes-smallest-states": `${ARTICLE_BASE}/europes-smallest-states.jpg`,
  "megacities-and-the-limits-of-growth": `${ARTICLE_BASE}/megacities-and-the-limits-of-growth.jpg`,
  "introduction-to-world-geography": `${ARTICLE_BASE}/how-to-read-a-topographic-map.jpg`,
  "understanding-continents-and-oceans": `${ARTICLE_BASE}/why-there-are-five-oceans-now.jpg`,
  "countries-and-their-capitals": `${ARTICLE_BASE}/why-some-countries-have-two-capitals.jpg`,
  "introduction-to-world-flags": `${ARTICLE_BASE}/reading-a-flag-in-thirty-seconds.jpg`,
  "major-rivers-of-the-world": `${ARTICLE_BASE}/the-nile-and-the-amazon.jpg`,
  "mountain-ranges-and-their-geography": `${ARTICLE_BASE}/how-the-himalayas-keep-growing.jpg`,
  "understanding-time-zones": `${ARTICLE_BASE}/languages-that-cross-the-most-borders.jpg`,
  "introduction-to-climate-zones": `${ARTICLE_BASE}/the-sahel-explained.jpg`,
  "famous-world-landmarks": `${ARTICLE_BASE}/the-landmarks-everyone-misplaces.jpg`,
  "geography-of-india": `${ARTICLE_BASE}/how-the-himalayas-keep-growing.jpg`,
  "the-geopolitics-of-global-trade-routes": `${ARTICLE_BASE}/megacities-and-the-limits-of-growth.jpg`,
  "the-worlds-most-extreme-geographical-locations": `${ARTICLE_BASE}/how-unesco-picks-a-world-heritage-site.jpg`,
  "hidden-geography-unexplored-regions": `${ARTICLE_BASE}/the-sahel-explained.jpg`,
  "how-tectonic-plates-shape-our-planet": `${ARTICLE_BASE}/how-the-himalayas-keep-growing.jpg`,
  "the-geography-of-global-power": `${ARTICLE_BASE}/europes-smallest-states.jpg`,
  "advanced-oceanography-and-deep-sea-geography": `${ARTICLE_BASE}/why-there-are-five-oceans-now.jpg`,
  "the-worlds-most-complex-border-systems": `${ARTICLE_BASE}/the-straightest-borders-on-earth.jpg`,
  "climate-change-and-the-future-of-earths-geography": `${ARTICLE_BASE}/the-sahel-explained.jpg`,
  "the-geography-of-natural-disasters": `${ARTICLE_BASE}/how-the-himalayas-keep-growing.jpg`,
  "satellite-mapping-and-modern-geospatial-intelligence": `${ARTICLE_BASE}/how-to-read-a-topographic-map.jpg`,
  "the-evolution-of-earths-continents": `${ARTICLE_BASE}/why-there-are-five-oceans-now.jpg`,
  "advanced-atlas-and-regional-geography": `${ARTICLE_BASE}/how-to-read-a-topographic-map.jpg`,
};

export function articleCardImageSrc(slug: string): string | undefined {
  return ARTICLE_CARD_IMAGES[slug];
}
