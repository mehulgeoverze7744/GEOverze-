/**
 * GEOlibrary collections.
 *
 * Curated shelves of articles. Article membership is by slug so a backend can
 * return the same join later without touching the UI.
 */
import type { CategoryId, ContinentId } from "./taxonomy";
import { ARTICLES, type Article } from "./articles";

export type Collection = {
  slug: string;
  title: string;
  description: string;
  /** Procedural art key. */
  art: string;
  category: CategoryId;
  continent: ContinentId;
  curator: string;
  featured: boolean;
  articles: readonly string[];
  followers: number;
};

export const COLLECTIONS: readonly Collection[] = [
  {
    slug: "countries-of-europe",
    title: "Countries of Europe",
    description:
      "Forty-four states, their capitals, borders and the treaties that drew them. Start with the microstates and work outward.",
    art: "collection-countries-of-europe",
    category: "countries",
    continent: "europe",
    curator: "atlas-studio",
    featured: true,
    articles: [
      "europes-smallest-states",
      "the-straightest-borders-on-earth",
      "reading-a-flag-in-thirty-seconds",
    ],
    followers: 12_400,
  },
  {
    slug: "world-capitals",
    title: "World Capitals",
    description:
      "Seats of government, why they sit where they do, and the handful of countries that could not settle on one.",
    art: "collection-world-capitals",
    category: "capitals",
    continent: "global",
    curator: "atlas-studio",
    featured: true,
    articles: ["why-some-countries-have-two-capitals", "megacities-and-the-limits-of-growth"],
    followers: 9_860,
  },
  {
    slug: "great-rivers",
    title: "Great Rivers",
    description:
      "Basins, discharge, deltas and disputes. The systems that decide where civilisations sit.",
    art: "collection-great-rivers",
    category: "oceans",
    continent: "global",
    curator: "delta-notes",
    featured: true,
    articles: ["the-nile-and-the-amazon", "why-there-are-five-oceans-now"],
    followers: 6_310,
  },
  {
    slug: "mountain-ranges",
    title: "Mountain Ranges",
    description: "Uplift, erosion and the ranges that manufacture their own weather systems.",
    art: "collection-mountain-ranges",
    category: "physical",
    continent: "global",
    curator: "meridian",
    featured: true,
    articles: ["how-the-himalayas-keep-growing", "how-to-read-a-topographic-map"],
    followers: 7_720,
  },
  {
    slug: "unesco-heritage",
    title: "UNESCO Heritage",
    description:
      "How places earn protection, what protection actually means, and which sites are currently at risk.",
    art: "collection-unesco-heritage",
    category: "heritage",
    continent: "global",
    curator: "heritage-desk",
    featured: false,
    articles: ["how-unesco-picks-a-world-heritage-site", "the-landmarks-everyone-misplaces"],
    followers: 4_180,
  },
  {
    slug: "geography-basics",
    title: "Geography Basics",
    description:
      "The starting shelf: reading maps, reading flags, and the vocabulary everything else assumes.",
    art: "collection-geography-basics",
    category: "basics",
    continent: "global",
    curator: "terra-lingua",
    featured: true,
    articles: [
      "how-to-read-a-topographic-map",
      "reading-a-flag-in-thirty-seconds",
      "why-there-are-five-oceans-now",
    ],
    followers: 15_930,
  },
  {
    slug: "climate-change",
    title: "Climate Change",
    description: "Where the climate signal is already visible on the map, region by region.",
    art: "collection-climate-change",
    category: "climate",
    continent: "global",
    curator: "terra-lingua",
    featured: false,
    articles: ["the-sahel-explained", "megacities-and-the-limits-of-growth"],
    followers: 8_450,
  },
  {
    slug: "natural-wonders",
    title: "Natural Wonders",
    description:
      "Landforms and phenomena that draw people from every continent, and the geology behind them.",
    art: "collection-natural-wonders",
    category: "landmarks",
    continent: "global",
    curator: "heritage-desk",
    featured: false,
    articles: [
      "the-landmarks-everyone-misplaces",
      "how-the-himalayas-keep-growing",
      "the-nile-and-the-amazon",
    ],
    followers: 10_240,
  },
] as const;

const BY_SLUG = new Map(COLLECTIONS.map((c) => [c.slug, c]));
const ARTICLE_BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

export const collectionBySlug = (slug: string): Collection | undefined => BY_SLUG.get(slug);

/** Resolve a collection's article slugs into articles, dropping unknown ones. */
export function collectionArticles(collection: Collection): Article[] {
  return collection.articles
    .map((slug) => ARTICLE_BY_SLUG.get(slug))
    .filter((a): a is Article => Boolean(a));
}

/** Total reading time of a collection, in minutes. */
export function collectionMinutes(collection: Collection): number {
  return collectionArticles(collection).reduce((sum, a) => sum + a.minutes, 0);
}

export function collectionsByCurator(handle: string): Collection[] {
  return COLLECTIONS.filter((c) => c.curator === handle);
}
