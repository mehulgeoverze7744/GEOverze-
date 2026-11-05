import { createFileRoute } from "@tanstack/react-router";

import { TryOnStudio } from "@/features/store/tryon/TryOnStudio";
import { SF_FONTS_HREF } from "@/features/store/storefront/storefront-assets";

export const Route = createFileRoute("/geostore/try-on")({
  head: () => ({
    meta: [
      { title: "Try-On Studio — Gstore | GVRZE" },
      {
        name: "description",
        content:
          "Preview GVRZE T-shirts on the studio model. Select a design, colour and size, then add it to your cart.",
      },
      { property: "og:title", content: "Try-On Studio — Gstore | GVRZE" },
      {
        property: "og:description",
        content: "See GVRZE T-shirts on the studio model before you buy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: SF_FONTS_HREF },
    ],
  }),
  component: TryOnStudioPage,
});

function TryOnStudioPage() {
  return <TryOnStudio mode="page" />;
}
