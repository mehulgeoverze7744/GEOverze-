import { createFileRoute } from "@tanstack/react-router";

import { GvrzeStorefront } from "@/features/store/storefront/GvrzeStorefront";
import { SF_FONTS_HREF } from "@/features/store/storefront/storefront-assets";

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
    // Storefront typography (Montserrat + Inter) loads only with this route.
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: SF_FONTS_HREF },
    ],
  }),
  component: GvrzeStorefront,
});
