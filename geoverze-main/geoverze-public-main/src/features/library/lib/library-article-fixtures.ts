import { ARTICLES, articleBySlug } from "@/features/library/data/articles";
import type { Article, ArticleBlock } from "@/features/library/data/articles";

/** Canonical seed blocks keyed by slug (includes expanded editorial content). */
const SEED_BLOCKS_BY_SLUG: Record<string, readonly ArticleBlock[]> = Object.fromEntries(
  ARTICLES.map((a) => [a.slug, a.blocks]),
);

function looksLegacyRemoteBlocks(article: Article, seedBlocks: readonly ArticleBlock[]): boolean {
  const remoteCount = article.blocks.length;
  const seedCount = seedBlocks.length;
  if (remoteCount === 0) return true;
  if (remoteCount < seedCount - 3) return true;
  if (remoteCount <= 8 && seedCount >= 20) return true;
  if (article.blocks.some((b) => b.kind === "map") && seedCount >= 15) return true;
  return false;
}

/**
 * Prefer expanded local seed blocks when Supabase still has legacy short seed rows.
 */
export function applyPublishedArticleBlockFixtures(article: Article): Article {
  const seedBlocks = SEED_BLOCKS_BY_SLUG[article.slug] ?? articleBySlug(article.slug)?.blocks;
  if (!seedBlocks?.length) return article;

  if (!looksLegacyRemoteBlocks(article, seedBlocks)) return article;

  if (import.meta.env.DEV) {
    console.info(
      `[GEOlibrary] "${article.slug}": using local seed blocks (${seedBlocks.length} blocks). ` +
        `Remote had ${article.blocks.length} block(s).`,
    );
  }

  const seedMeta = articleBySlug(article.slug);
  return {
    ...article,
    blocks: seedBlocks,
    minutes: seedMeta?.minutes ?? article.minutes,
    dek: seedMeta?.dek ?? article.dek,
    title: seedMeta?.title ?? article.title,
  };
}
