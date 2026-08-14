import { createFileRoute } from "@tanstack/react-router";

import { ArticleListScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/articles/")({
  head: () => ({
    meta: [
      { title: "Articles — GEOverze Creator Studio" },
      {
        name: "description",
        content: "Write and manage long-form geography articles for the GEOverze GEOlibrary.",
      },
      { property: "og:title", content: "Articles — GEOverze Creator Studio" },
      {
        property: "og:description",
        content: "Write and manage long-form geography articles for the GEOverze GEOlibrary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticleListScreen,
});
