import { createFileRoute } from "@tanstack/react-router";

import { ArticleEditorScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/articles/$articleId")({
  head: () => ({
    meta: [
      { title: "Article Editor — GEOverze Creator Studio" },
      {
        name: "description",
        content:
          "Structure and refine one of your GEOverze articles block by block before submitting it for review.",
      },
      { property: "og:title", content: "Article Editor — GEOverze Creator Studio" },
      {
        property: "og:description",
        content: "Structure and refine a GEOverze article block by block.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticleEditorRoute,
});

function ArticleEditorRoute() {
  const { articleId } = Route.useParams();
  return <ArticleEditorScreen articleId={articleId} />;
}
