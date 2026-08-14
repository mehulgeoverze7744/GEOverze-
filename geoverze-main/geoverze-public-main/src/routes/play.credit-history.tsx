import { createFileRoute } from "@tanstack/react-router";

import { CreditHistoryPage } from "@/features/progression";

export const Route = createFileRoute("/play/credit-history")({
  head: () => ({
    meta: [
      { title: "Credit History — GEOverze" },
      {
        name: "description",
        content: "A transparent ledger of every credit earned from duel victories this month.",
      },
      { property: "og:title", content: "Credit History — GEOverze" },
      {
        property: "og:description",
        content: "A transparent ledger of every credit earned from duel victories this month.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreditHistoryPage,
});
