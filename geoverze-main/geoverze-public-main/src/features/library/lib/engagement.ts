import type { Article } from "@/features/library/data/articles";

/** Deterministic engagement score from catalogue aggregate fields. */
export function engagementScore(article: Article): number {
  return article.views * 1 + article.likes * 4 + article.bookmarks * 5;
}

/** Popular ranking score (lifetime engagement). */
export function popularScore(article: Article): number {
  return engagementScore(article);
}

function ageInDays(publishedAt: string, now = Date.now()): number {
  const published = Date.parse(publishedAt);
  if (Number.isNaN(published)) return 365;
  return Math.max(0, (now - published) / (1000 * 60 * 60 * 24));
}

/** Bounded recency decay — newer resources get a fair boost without dominating. */
export function recencyFactor(publishedAt: string, now = Date.now()): number {
  const ageDays = ageInDays(publishedAt, now);
  return Math.max(0.25, 1 / (1 + ageDays / 30));
}

/** Trending score — engagement weighted by recency. */
export function trendingScore(article: Article, now = Date.now()): number {
  return engagementScore(article) * recencyFactor(article.publishedAt, now);
}

/** Deterministic tie-breakers for stable ordering. */
export function comparePublishedDesc(a: Article, b: Article): number {
  return b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug);
}

export function comparePopular(a: Article, b: Article): number {
  return popularScore(b) - popularScore(a) || comparePublishedDesc(a, b);
}

export function compareTrending(a: Article, b: Article, now = Date.now()): number {
  return trendingScore(b, now) - trendingScore(a, now) || comparePopular(a, b);
}

export function compareBookmarked(a: Article, b: Article): number {
  return (
    b.bookmarks - a.bookmarks || popularScore(b) - popularScore(a) || comparePublishedDesc(a, b)
  );
}

/** Taxonomy overlap score for related-article ranking. */
export function relatedMatchScore(source: Article, candidate: Article): number {
  return (
    (candidate.category === source.category ? 3 : 0) +
    (candidate.continent === source.continent ? 2 : 0) +
    candidate.tags.filter((tag) => source.tags.includes(tag)).length
  );
}

export function compareRelated(source: Article, a: Article, b: Article): number {
  const scoreA = relatedMatchScore(source, a);
  const scoreB = relatedMatchScore(source, b);
  return scoreB - scoreA || engagementScore(b) - engagementScore(a) || comparePublishedDesc(a, b);
}
