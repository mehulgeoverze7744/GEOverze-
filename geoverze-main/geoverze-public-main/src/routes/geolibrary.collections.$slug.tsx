import { createFileRoute } from "@tanstack/react-router";

import { CollectionScreen } from "@/features/library";
import { collectionBySlug } from "@/features/library/data/collections";

export const Route = createFileRoute("/geolibrary/collections/$slug")({
  head: ({ params }) => {
    const collection = collectionBySlug(params.slug);
    if (!collection) {
      return {
        meta: [
          { title: "Collection not found — GEOlibrary" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${collection.title} — GEOlibrary collection`;
    return {
      meta: [
        { title },
        { name: "description", content: collection.description },
        { property: "og:title", content: title },
        { property: "og:description", content: collection.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          property: "og:url",
          content: `https://geoverze.com/geolibrary/collections/${collection.slug}`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://geoverze.com/geolibrary/collections/${collection.slug}`,
        },
      ],
    };
  },
  component: CollectionScreen,
});
