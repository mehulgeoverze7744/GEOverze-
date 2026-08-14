import { createFileRoute } from "@tanstack/react-router";

import { CategoryScreen } from "@/features/store/components/CatalogueScreens";

export const Route = createFileRoute("/geostore/category/$slug")({
  head: () => ({
    meta: [
      { title: "Category — GEOstore | GEOverze" },
      { name: "description", content: "Explore a curated GEOstore category shelf." },
      { property: "og:title", content: "Category — GEOstore | GEOverze" },
      { property: "og:description", content: "Explore a curated GEOstore category shelf." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoryScreen,
});
