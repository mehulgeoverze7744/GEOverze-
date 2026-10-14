import { createFileRoute } from "@tanstack/react-router";

import { StoreHome } from "@/features/store/components/StoreHome";

export const Route = createFileRoute("/geostore/")({
  head: () => ({
    meta: [
      { title: "GVRZE Store — GVRZE Store | GVRZE" },
      {
        name: "description",
        content: "Redeem credits, unlock digital packs and shop GVRZE merchandise.",
      },
      { property: "og:title", content: "GVRZE Store — GVRZE Store | GVRZE" },
      {
        property: "og:description",
        content: "Redeem credits, unlock digital packs and shop GVRZE merchandise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoreHome,
});
