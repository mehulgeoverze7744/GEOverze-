import { createFileRoute } from "@tanstack/react-router";

import { ContactPage } from "@/features/marketing";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — GEOverze" },
      {
        name: "description",
        content:
          "Get in touch with the GEOverze team about partnerships, institution access, press or support.",
      },
      { property: "og:title", content: "Contact — GEOverze" },
      {
        property: "og:description",
        content: "Reach the GEOverze team about partnerships, access, press or support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/contact" }],
  }),
  component: ContactPage,
});
