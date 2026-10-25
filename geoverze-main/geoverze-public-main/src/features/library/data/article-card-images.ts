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
};

export function articleCardImageSrc(slug: string): string | undefined {
  return ARTICLE_CARD_IMAGES[slug];
}
