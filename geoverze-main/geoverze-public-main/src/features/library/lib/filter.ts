/**
 * Article filtering and sorting for the browse surface.
 * Pure functions over the local article list.
 */
import { compareBookmarked, comparePopular, compareTrending } from "./engagement";
import { ARTICLES, type Article } from "../data/articles";
import {
  READING_TIMES,
  readingTimeBucket,
  type CategoryId,
  type ContinentId,
  type DifficultyId,
  type ReadingTimeId,
  type SortId,
} from "../data/taxonomy";

export type LibraryQuery = {
  q: string;
  continent: ContinentId | "all";
  difficulty: DifficultyId | "all";
  time: ReadingTimeId | "all";
  category: CategoryId | "all";
  sort: SortId;
  saved: boolean;
};

export const EMPTY_QUERY: LibraryQuery = {
  q: "",
  continent: "all",
  difficulty: "all",
  time: "all",
  category: "all",
  sort: "popular",
  saved: false,
};

function matchesText(article: Article, q: string) {
  if (q.length === 0) return true;
  const needle = q.toLowerCase();
  return (
    article.title.toLowerCase().includes(needle) ||
    article.dek.toLowerCase().includes(needle) ||
    article.tags.some((t) => t.toLowerCase().includes(needle))
  );
}

/** Filter, then sort. `savedIds` is only consulted when `saved` is on. */
export function filterArticles(
  query: LibraryQuery,
  savedIds: readonly string[] = [],
  source: readonly Article[] = ARTICLES,
): Article[] {
  const saved = new Set(savedIds);

  const filtered = source.filter((article) => {
    if (!matchesText(article, query.q)) return false;
    if (query.continent !== "all" && article.continent !== query.continent) return false;
    if (query.difficulty !== "all" && article.difficulty !== query.difficulty) return false;
    if (query.time !== "all" && readingTimeBucket(article.minutes) !== query.time) return false;
    if (query.category !== "all" && article.category !== query.category) return false;
    if (query.saved && !saved.has(article.slug)) return false;
    return true;
  });

  return sortArticles(filtered, query.sort);
}

export function sortArticles(articles: readonly Article[], sort: SortId): Article[] {
  const list = [...articles];
  switch (sort) {
    case "newest":
      return list.sort(
        (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
      );
    case "bookmarked":
      return list.sort(compareBookmarked);
    case "quickest":
      return list.sort((a, b) => a.minutes - b.minutes || a.slug.localeCompare(b.slug));
    case "popular":
    default:
      return list.sort(comparePopular);
  }
}

/** Human label for a reading-time bucket. */
export const readingTimeLabel = (id: ReadingTimeId) =>
  READING_TIMES.find((t) => t.id === id)?.label ?? "Any length";

/** Newest first, for the "Recently added" rail. */
export const recentArticles = (limit = 6, source: readonly Article[] = ARTICLES) =>
  sortArticles(source, "newest").slice(0, limit);

/** Engagement-weighted recency ranking for the Home Trending rail. */
export const trendingArticles = (limit = 6, source: readonly Article[] = ARTICLES) =>
  [...source].sort(compareTrending).slice(0, limit);

/** @deprecated Use rankRecommendedArticles via useRecommendedArticles instead. */
export function recommendedArticles(
  limit = 6,
  source: readonly Article[] = ARTICLES,
  exclude: readonly string[] = [],
): Article[] {
  const skip = new Set(exclude);
  return sortArticles(
    source.filter((article) => !skip.has(article.slug)),
    "popular",
  ).slice(0, limit);
}

/** Articles by a creator handle. */
export const articlesByCreator = (handle: string, source: readonly Article[] = ARTICLES) =>
  sortArticles(
    source.filter((a) => a.creator === handle),
    "newest",
  );
