import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — GVRZE" },
      {
        name: "description",
        content: "Request a secure password reset link for your GVRZE account.",
      },
      { property: "og:title", content: "Forgot Password — GVRZE" },
      {
        property: "og:description",
        content: "Request a secure password reset link for your GVRZE account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/auth/forgot-password" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/auth/forgot-password" }],
  }),
  component: ForgotPasswordPage,
});
