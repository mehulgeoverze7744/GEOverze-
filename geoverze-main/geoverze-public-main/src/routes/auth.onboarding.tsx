import { createFileRoute } from "@tanstack/react-router";

import { OnboardingPage } from "@/features/auth/pages/OnboardingPage";

export const Route = createFileRoute("/auth/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your Explorer Profile — GVRZE" },
      {
        name: "description",
        content:
          "Choose your interests, skill level and explorer mark to personalise your GVRZE journey.",
      },
      { property: "og:title", content: "Set Up Your Explorer Profile — GVRZE" },
      {
        property: "og:description",
        content: "Personalise your GVRZE journey in a few guided steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/auth/onboarding" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/auth/onboarding" }],
  }),
  component: OnboardingPage,
});
