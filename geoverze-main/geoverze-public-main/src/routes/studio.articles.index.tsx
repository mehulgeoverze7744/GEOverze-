import { createFileRoute } from "@tanstack/react-router";

import { ArticleListScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/articles/")({
  head: () => ({
    meta: [
      { title: "Articles — GVRZE Creator Studio" },
      {
        name: "description",
        content: "Write and manage long-form geography articles for the GVRZE Library.",
      },
      { property: "og:title", content: "Articles — GVRZE Creator Studio" },
      {
        property: "og:description",
        content: "Write and manage long-form geography articles for the GVRZE Library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticleListScreen,
});
