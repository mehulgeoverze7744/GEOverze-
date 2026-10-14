import { createFileRoute } from "@tanstack/react-router";

import { ArticleEditorScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/articles/new")({
  head: () => ({
    meta: [
      { title: "New Article — GVRZE Creator Studio" },
      {
        name: "description",
        content:
          "Draft a new long-form geography article in blocks: headings, paragraphs, tables, fact boxes and references.",
      },
      { property: "og:title", content: "New Article — GVRZE Creator Studio" },
      {
        property: "og:description",
        content: "Draft a new long-form geography article for the GVRZE Library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewArticleRoute,
});

function NewArticleRoute() {
  return <ArticleEditorScreen articleId="new" />;
}
