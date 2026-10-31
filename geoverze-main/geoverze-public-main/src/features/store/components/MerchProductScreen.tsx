/**
 * Routes every GeostoreMerchProduct to the unified StorefrontProductPage.
 *
 * This single component replaces the old per-product specialised pages
 * (BornToRoamProductPage, KnowTheCapitalProductPage, etc.) and the dark-theme
 * ApparelMerchProductPage / HoodieMerchProductPage. All merch product detail
 * pages now share the clean white storefront design from the Figma reference.
 */

import { memo } from "react";

import type { GeostoreMerchProduct } from "@/features/marketing/data/geostoreMerch";

import { APPAREL_MERCH_SPECS } from "../data/apparelMerchSpecs";
import { HOODIE_MERCH_SPECS, hoodieColorsWithImages } from "../data/hoodieMerchSpecs";
import {
  StorefrontProductPage,
  type SFColorOption,
} from "../storefront/StorefrontProductPage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert minor-unit USD cents to a display string, e.g. 3700 → "$37.00". */
function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Main component ───────────────────────────────────────────────────────────

/** Presentation-only merchandise detail page (uses the storefront white design). */
export const MerchProductScreen = memo(function MerchProductScreen({
  product,
}: {
  product: GeostoreMerchProduct;
}) {
  const categorySlug = product.category === "t-shirt" ? "tshirts" : "hoodies";
  const priceLabel = formatPrice(product.price);

  // ── Apparel (T-shirt) products ────────────────────────────────────────────
  const apparelSpec = APPAREL_MERCH_SPECS[product.id];
  if (apparelSpec) {
    const colors: SFColorOption[] = apparelSpec.colors.map((c) => ({
      id: c.id,
      label: c.label,
      hex: c.hex,
      image: c.image,
    }));

    return (
      <StorefrontProductPage
        key={product.id}
        slug={product.id}
        name={apparelSpec.title}
        categoryLabel={product.categoryLabel}
        priceLabel={priceLabel}
        images={[{ src: colors[0]?.image ?? product.image, alt: product.alt }]}
        colors={colors}
        description={apparelSpec.description}
        highlights={[
          "100% Cotton Comfort — breathable, pre-shrunk fabric built for all-day wear.",
          "260 GSM Heavyweight Quality — substantial feel with structure that holds its shape.",
          "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
          "Versatile Streetwear — pairs easily with denim, cargo pants, or joggers.",
        ]}
        categorySlug={categorySlug}
      />
    );
  }

  // ── Hoodie products ───────────────────────────────────────────────────────
  const hoodieSpec = HOODIE_MERCH_SPECS[product.id];
  if (hoodieSpec) {
    const allColors = hoodieColorsWithImages(hoodieSpec.colors);
    const colors: SFColorOption[] = allColors.map((c) => ({
      id: c.id,
      label: c.label,
      hex: c.hex,
      image: c.image as string,
    }));

    return (
      <StorefrontProductPage
        key={product.id}
        slug={product.id}
        name={hoodieSpec.title}
        categoryLabel={product.categoryLabel}
        priceLabel={priceLabel}
        images={[{ src: colors[0]?.image ?? product.image, alt: product.alt }]}
        colors={colors}
        description={hoodieSpec.description}
        highlights={[
          "Premium French Terry fleece — thick, warm, and built for all-season wear.",
          "Heavyweight construction — structured hood, ribbed cuffs and hem.",
          "Premium Screen Printing — sharp, fade-resistant graphics that last wash after wash.",
          "Streetwear essential — pairs with joggers, cargo trousers, or denim.",
        ]}
        categorySlug={categorySlug}
      />
    );
  }

  // ── Fallback: product with no spec (single hero image) ───────────────────
  return (
    <StorefrontProductPage
      key={product.id}
      slug={product.id}
      name={product.title}
      categoryLabel={product.categoryLabel}
      priceLabel={priceLabel}
      images={[{ src: product.image, alt: product.alt }]}
      description={product.tagline}
      categorySlug={categorySlug}
    />
  );
});
