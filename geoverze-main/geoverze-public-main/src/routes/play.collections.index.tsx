import { createFileRoute } from "@tanstack/react-router";

import { CollectionsPage } from "@/features/play";

const title = "Quiz Collections — GEOverze";
const description =
  "Curated GEOverze collections that chain several quizzes into one guided route across the planet.";

export const Route = createFileRoute("/play/collections/")({
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
  component: CollectionsPage,
});
