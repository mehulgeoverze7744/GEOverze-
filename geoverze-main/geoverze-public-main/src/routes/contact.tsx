import { createFileRoute } from "@tanstack/react-router";

import { ContactPage } from "@/features/marketing";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — GVRZE" },
      {
        name: "description",
        content:
          "Get in touch with the GVRZE team about partnerships, institution access, press or support.",
      },
      { property: "og:title", content: "Contact — GVRZE" },
      {
        property: "og:description",
        content: "Reach the GVRZE team about partnerships, access, press or support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/contact" }],
  }),
  component: ContactPage,
});
