import { createFileRoute } from "@tanstack/react-router";

import { CollectionDetailPage } from "@/features/play";
import { collectionBySlug } from "@/features/play/data/collections";

export const Route = createFileRoute("/play/collections/$slug")({
  head: ({ params }) => {
    const collection = collectionBySlug(params.slug);
    const title = collection
      ? `${collection.title} — Collections — GVRZE`
      : "Collection — GVRZE";
    const description = collection ? collection.description : "Curated GVRZE quiz collections.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollectionDetailPage,
});
