import { createFileRoute } from "@tanstack/react-router";

import { ArticleScreen } from "@/features/library";
import { fetchArticleCatalogueMeta } from "@/features/library/data/fetchPublishedArticles";
import { buildArticleRouteHead } from "@/features/library/lib/article-seo";

export const Route = createFileRoute("/geolibrary/article/$slug")({
  loader: ({ params }) => fetchArticleCatalogueMeta(params.slug),
  head: ({ loaderData }) => buildArticleRouteHead(loaderData),
  component: ArticleScreen,
});
