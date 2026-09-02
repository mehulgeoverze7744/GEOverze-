import type { ArticleCatalogueMeta } from "../data/fetchPublishedArticles";

const SITE_ORIGIN = "https://geoverze.com";

/** Build TanStack Router head config from catalogue-safe article metadata. */
export function buildArticleRouteHead(meta: ArticleCatalogueMeta | null | undefined) {
  if (!meta) {
    return {
      meta: [{ title: "Entry not found — GEOlibrary" }, { name: "robots", content: "noindex" }],
    };
  }

  const pageTitle = `${meta.title} — GEOlibrary`;
  const canonical = `${SITE_ORIGIN}/geolibrary/article/${meta.slug}`;

  return {
    meta: [
      { title: pageTitle },
      { name: "description", content: meta.dek },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: meta.dek },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: canonical },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
