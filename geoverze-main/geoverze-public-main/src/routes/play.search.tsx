import { createFileRoute } from "@tanstack/react-router";

import { CategoryListingPage, SearchPage } from "@/features/play";

const title = "Search Quizzes — GVRZE";
const description =
  "Search the full GVRZE quiz catalog and filter by difficulty, category, length, question count and creator.";

export const Route = createFileRoute("/play/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
    difficulty:
      search["difficulty"] === "Adaptive" ||
      search["difficulty"] === "Easy" ||
      search["difficulty"] === "Medium" ||
      search["difficulty"] === "Hard" ||
      search["difficulty"] === "Expert"
        ? search["difficulty"]
        : undefined,
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
  component: PlaySearchRoute,
});

function PlaySearchRoute() {
  const { category } = Route.useSearch();
  return category ? <CategoryListingPage /> : <SearchPage />;
}
