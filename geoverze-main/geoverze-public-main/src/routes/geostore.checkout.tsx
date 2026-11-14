import { createFileRoute } from "@tanstack/react-router";

import { GstoreCheckoutScreen } from "@/features/store/screens/GstoreCheckoutScreen";

function asSearchString(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed || undefined;
}

export const Route = createFileRoute("/geostore/checkout")({
  validateSearch: (search: Record<string, unknown>) => {
    const buyNowRaw = asSearchString(search["buyNow"]);
    const qtyRaw = asSearchString(search["qty"]);
    return {
      buyNow: buyNowRaw === "1" || buyNowRaw === "true" ? "1" : undefined,
      slug: asSearchString(search["slug"]),
      qty: qtyRaw,
      Size: asSearchString(search["Size"]),
      Colour: asSearchString(search["Colour"]),
      Design: asSearchString(search["Design"]),
      CustomDesign: asSearchString(search["CustomDesign"]),
      Instructions: asSearchString(search["Instructions"]),
    };
  },
  head: () => ({
    meta: [
      { title: "Checkout — Gstore | GVRZE" },
      { name: "description", content: "Complete your Gstore order." },
      { property: "og:title", content: "Checkout — Gstore | GVRZE" },
      { property: "og:description", content: "Complete your Gstore order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GstoreCheckoutScreen,
});
