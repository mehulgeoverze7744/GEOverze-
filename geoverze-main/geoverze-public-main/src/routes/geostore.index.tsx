import { createFileRoute } from "@tanstack/react-router";

import { StoreHome } from "@/features/store/components/StoreHome";

export const Route = createFileRoute("/geostore/")({
  head: () => ({
    meta: [
      { title: "GEOstore — GEOstore | GEOverze" },
      {
        name: "description",
        content: "Redeem credits, unlock digital packs and shop GEOverze merchandise.",
      },
      { property: "og:title", content: "GEOstore — GEOstore | GEOverze" },
      {
        property: "og:description",
        content: "Redeem credits, unlock digital packs and shop GEOverze merchandise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoreHome,
});
