import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/features/auth/pages/LoginPage";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign In — GEOverze" },
      {
        name: "description",
        content: "Sign in to GEOverze to continue your progress across the geography universe.",
      },
      { property: "og:title", content: "Sign In — GEOverze" },
      { property: "og:description", content: "Sign in to GEOverze to continue your progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/auth/login" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/auth/login" }],
  }),
  component: LoginPage,
});
