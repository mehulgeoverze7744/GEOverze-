import { createFileRoute } from "@tanstack/react-router";

import { CategoryScreen } from "@/features/store/components/CatalogueScreens";

export const Route = createFileRoute("/geostore/category/$slug")({
  head: () => ({
    meta: [
      { title: "Category — Gstore | GVRZE" },
      { name: "description", content: "Explore a curated Gstore category shelf." },
      { property: "og:title", content: "Category — Gstore | GVRZE" },
      { property: "og:description", content: "Explore a curated Gstore category shelf." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoryScreen,
});
