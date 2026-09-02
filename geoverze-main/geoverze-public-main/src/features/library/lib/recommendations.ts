import type { Article } from "@/features/library/data/articles";
import type { CategoryId, ContinentId, DifficultyId } from "@/features/library/data/taxonomy";

import { comparePublishedDesc, compareTrending, engagementScore } from "./engagement";
import { sortArticles } from "./filter";

export type UserLibrarySignals = {
  signedIn: boolean;
  bookmarks: readonly string[];
  likes: readonly string[];
  completed: readonly string[];
  progress: Readonly<Record<string, number>>;
};

type TaxonomyProfile = {
  categories: Map<CategoryId, number>;
  continents: Map<ContinentId, number>;
  difficulties: Map<DifficultyId, number>;
};

function interactedSlugs(signals: UserLibrarySignals): Set<string> {
  const slugs = new Set<string>([...signals.bookmarks, ...signals.likes, ...signals.completed]);

  for (const [slug, percent] of Object.entries(signals.progress)) {
    if ((percent ?? 0) > 0) slugs.add(slug);
  }

  return slugs;
}

function buildTaxonomyProfile(articles: readonly Article[]): TaxonomyProfile {
  const categories = new Map<CategoryId, number>();
  const continents = new Map<ContinentId, number>();
  const difficulties = new Map<DifficultyId, number>();

  for (const article of articles) {
    categories.set(article.category, (categories.get(article.category) ?? 0) + 1);
    continents.set(article.continent, (continents.get(article.continent) ?? 0) + 1);
    difficulties.set(article.difficulty, (difficulties.get(article.difficulty) ?? 0) + 1);
  }

  return { categories, continents, difficulties };
}

function taxonomyAffinity(article: Article, profile: TaxonomyProfile): number {
  const categoryWeight = profile.categories.get(article.category) ?? 0;
  const continentWeight = profile.continents.get(article.continent) ?? 0;
  const difficultyWeight = profile.difficulties.get(article.difficulty) ?? 0;

  return categoryWeight * 3 + continentWeight * 2 + difficultyWeight * 1;
}

function signedOutFallback(source: readonly Article[], limit: number): Article[] {
  const popular = sortArticles(source, "popular").slice(0, Math.ceil(limit * 0.6));
  const recent = sortArticles(source, "newest").slice(0, Math.ceil(limit * 0.6));
  const trending = [...source].sort(compareTrending).slice(0, Math.ceil(limit * 0.4));

  const seen = new Set<string>();
  const merged: Article[] = [];

  for (const article of [...trending, ...popular, ...recent]) {
    if (seen.has(article.slug)) continue;
    seen.add(article.slug);
    merged.push(article);
    if (merged.length >= limit) break;
  }

  return merged;
}

/** Deterministic recommendations — catalogue metadata only, no AI. */
export function rankRecommendedArticles(
  source: readonly Article[],
  signals: UserLibrarySignals,
  limit = 6,
  exclude: readonly string[] = [],
): Article[] {
  const skip = new Set(exclude);
  const candidates = source.filter((article) => !skip.has(article.slug));

  if (candidates.length === 0) return [];

  const interacted = interactedSlugs(signals);
  if (!signals.signedIn || interacted.size === 0) {
    return signedOutFallback(candidates, limit);
  }

  const profileArticles = candidates.filter((article) => interacted.has(article.slug));
  if (profileArticles.length === 0) {
    return signedOutFallback(candidates, limit);
  }

  const profile = buildTaxonomyProfile(profileArticles);
  const unseen = candidates.filter((article) => !interacted.has(article.slug));

  if (unseen.length === 0) {
    return signedOutFallback(candidates, limit);
  }

  return [...unseen]
    .sort((a, b) => {
      const affinityA = taxonomyAffinity(a, profile);
      const affinityB = taxonomyAffinity(b, profile);
      return (
        affinityB - affinityA ||
        engagementScore(b) - engagementScore(a) ||
        comparePublishedDesc(a, b)
      );
    })
    .slice(0, limit);
}
