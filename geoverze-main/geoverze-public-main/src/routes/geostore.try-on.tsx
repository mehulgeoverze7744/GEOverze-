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
          "Virtually try on GVRZE clothing with AI. Upload a photo, select a garment and see how it looks — powered by our AI Try-On engine.",
      },
      { property: "og:title", content: "Try-On Studio — Gstore | GVRZE" },
      {
        property: "og:description",
        content: "See GVRZE garments on you before you buy, with AI virtual try-on.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      /**
       * Instruct crawlers not to index this page — it handles user photos
       * and is a transient interactive experience, not static content.
       */
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      // Same typography bundle as the wider storefront.
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: SF_FONTS_HREF },
    ],
  }),
  component: TryOnStudio,
});
