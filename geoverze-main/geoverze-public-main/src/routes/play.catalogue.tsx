import { createFileRoute } from "@tanstack/react-router";

import { CataloguePage } from "@/features/play";

const title = "Explore All Categories — Let's Play — GVRZE";
const description =
  "Browse every GVRZE geography category — countries, capitals, flags, maps and more.";

export const Route = createFileRoute("/play/catalogue")({
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
  component: CataloguePage,
});
