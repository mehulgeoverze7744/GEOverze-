import { articleBySlug } from "@/features/library/data/articles";
import type { Article, ArticleBlock } from "@/features/library/data/articles";
import { EUROPES_SMALLEST_STATES_BLOCKS } from "@/features/library/data/europes-smallest-states-blocks";

/** Local block fixtures keyed by slug — used when Supabase still has legacy seed rows. */
const BLOCK_FIXTURES_BY_SLUG: Record<string, readonly ArticleBlock[]> = {
  "europes-smallest-states": EUROPES_SMALLEST_STATES_BLOCKS,
};

/** Legacy GL-4 seed shipped six blocks including a map placeholder. */
const LEGACY_EUROPES_BLOCK_COUNT = 6;

/**
 * Prefer expanded local blocks when remote content is still the old seed
 * (migration `20260919120000_europes_smallest_states_parchment.sql` not applied).
 */
export function applyPublishedArticleBlockFixtures(article: Article): Article {
  const fixtureBlocks = BLOCK_FIXTURES_BY_SLUG[article.slug];
  if (!fixtureBlocks?.length) return article;

  const remoteCount = article.blocks.length;
  const fixtureCount = fixtureBlocks.length;
  const looksLegacy =
    article.slug === "europes-smallest-states" &&
    (remoteCount <= LEGACY_EUROPES_BLOCK_COUNT ||
      remoteCount < fixtureCount - 5 ||
      article.blocks.some((b) => b.kind === "map"));

  if (!looksLegacy) return article;

  if (import.meta.env.DEV) {
    console.info(
      `[GEOlibrary] "${article.slug}": using local block fixture (${fixtureCount} blocks). ` +
        `Remote Supabase had ${remoteCount} block(s). Apply migration ` +
        `20260919120000_europes_smallest_states_parchment.sql for production parity.`,
    );
  }

  const seedMeta = articleBySlug(article.slug);
  return {
    ...article,
    blocks: fixtureBlocks,
    minutes: seedMeta?.minutes ?? article.minutes,
    dek: seedMeta?.dek ?? article.dek,
    title: seedMeta?.title ?? article.title,
  };
}
