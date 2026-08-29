import { createFileRoute } from "@tanstack/react-router";

import { SearchPage } from "@/features/play";

const title = "Search Quizzes — GEOverze";
const description =
  "Search the full GEOverze quiz catalog and filter by difficulty, category, length, question count and creator.";

export const Route = createFileRoute("/play/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});
