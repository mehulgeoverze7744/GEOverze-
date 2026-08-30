import { createFileRoute } from "@tanstack/react-router";

import { CreditHistoryPage } from "@/features/progression";

export const Route = createFileRoute("/play/credit-history")({
  head: () => ({
    meta: [
      { title: "Credit History — GEOverze" },
      {
        name: "description",
        content:
          "Your full credit ledger — wallet balance, gameplay earns, GEOstore spending, and upcoming expiry dates.",
      },
      { property: "og:title", content: "Credit History — GEOverze" },
      {
        property: "og:description",
        content:
          "Your full credit ledger — wallet balance, gameplay earns, GEOstore spending, and upcoming expiry dates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreditHistoryPage,
});
