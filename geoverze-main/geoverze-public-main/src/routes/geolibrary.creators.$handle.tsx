import { createFileRoute } from "@tanstack/react-router";

import { CreatorScreen } from "@/features/library";
import { creatorByHandle } from "@/features/library/data/creators";

export const Route = createFileRoute("/geolibrary/creators/$handle")({
  head: ({ params }) => {
    const creator = creatorByHandle(params.handle);
    if (!creator) {
      return {
        meta: [{ title: "Creator not found — GEOlibrary" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${creator.name} — GEOlibrary creator`;
    return {
      meta: [
        { title },
        { name: "description", content: creator.bio },
        { property: "og:title", content: title },
        { property: "og:description", content: creator.bio },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          property: "og:url",
          content: `https://geoverze.com/geolibrary/creators/${creator.handle}`,
        },
      ],
      links: [
        { rel: "canonical", href: `https://geoverze.com/geolibrary/creators/${creator.handle}` },
      ],
    };
  },
  component: CreatorScreen,
});
