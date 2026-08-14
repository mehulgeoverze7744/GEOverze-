import { createFileRoute } from "@tanstack/react-router";

import { ArticleScreen } from "@/features/library";
import { articleBySlug } from "@/features/library/data/articles";

export const Route = createFileRoute("/geolibrary/article/$slug")({
  head: ({ params }) => {
    const article = articleBySlug(params.slug);
    if (!article) {
      return {
        meta: [{ title: "Entry not found — GEOlibrary" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${article.title} — GEOlibrary`;
    return {
      meta: [
        { title },
        { name: "description", content: article.dek },
        { property: "og:title", content: title },
        { property: "og:description", content: article.dek },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          property: "og:url",
          content: `https://geoverze.com/geolibrary/article/${article.slug}`,
        },
      ],
      links: [
        { rel: "canonical", href: `https://geoverze.com/geolibrary/article/${article.slug}` },
      ],
    };
  },
  component: ArticleScreen,
});
