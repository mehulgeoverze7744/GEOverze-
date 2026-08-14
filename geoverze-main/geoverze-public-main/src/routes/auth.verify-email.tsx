import { createFileRoute } from "@tanstack/react-router";

import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search["email"] === "string" ? (search["email"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify Your Email — GEOverze" },
      {
        name: "description",
        content:
          "Confirm your email address to activate your GEOverze account and carry your progress across devices.",
      },
      { property: "og:title", content: "Verify Your Email — GEOverze" },
      {
        property: "og:description",
        content: "Confirm your email address to activate your GEOverze account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/auth/verify-email" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/auth/verify-email" }],
  }),
  component: VerifyEmailRoute,
});

function VerifyEmailRoute() {
  const { email } = Route.useSearch();
  return <VerifyEmailPage {...(email ? { email } : {})} />;
}
