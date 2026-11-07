import { createFileRoute } from "@tanstack/react-router";

import { ProductScreen } from "@/features/store/components/CatalogueScreens";
import { storefrontTeeById } from "@/features/store/storefront/storefront-product-data";

/** Build product-specific SEO meta when the slug is known at route-eval time. */
function buildProductMeta(slug: string) {
  const tee = storefrontTeeById(slug);
  if (tee) {
    const title = `${tee.name} — Gstore | GVRZE`;
    const description = tee.description.slice(0, 160);
    const image = tee.gallery?.[0]?.src ?? tee.image.src;
    return [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ];
  }
  return [
    { title: "Product — Gstore | GVRZE" },
    { name: "description", content: "Product details, variants and pricing in the Gstore." },
    { property: "og:title", content: "Product — Gstore | GVRZE" },
    {
      property: "og:description",
      content: "Product details, variants and pricing in the Gstore.",
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export const Route = createFileRoute("/geostore/product/$slug")({
  head: ({ params }) => ({
    meta: buildProductMeta(params.slug),
  }),
  component: ProductScreen,
});
