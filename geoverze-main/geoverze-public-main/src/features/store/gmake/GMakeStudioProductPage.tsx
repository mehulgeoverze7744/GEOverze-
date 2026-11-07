/**
 * GMake Studio product page — Figma Desktop 1 (node 50:74).
 * Kept as a studio-layout reference. Live product detail routes use
 * StorefrontProductPage so each tee shows its own gallery; Try-On Studio
 * remains on `/geostore/try-on`.
 */
import "../storefront/storefront.css";
import "../tryon/try-on.css";
import "./gmake-studio.css";

import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useStoreStore } from "@/stores/storeStore";

import { getProductPrice } from "../lib/gstoreProductPrices";
import { StorefrontFooter } from "../storefront/StorefrontFooter";
import { StorefrontNav } from "../storefront/StorefrontNav";
import { SF_SHELL } from "../storefront/storefront-ui";
import type { StorefrontTeeProduct } from "../storefront/storefront-product-data";
import { TryOnModelPreview } from "../tryon/TryOnModelPreview";
import {
  getTryOnGarmentBySlug,
  TRY_ON_CATEGORY_IDS,
  TRY_ON_CATEGORY_LABELS,
} from "../tryon/tryOnProducts";
import { formatRsPaise, GMAKE_ASSETS, gmakeProductTitle } from "./gmake-assets";
import { GMakeRainbowButton } from "./GMakeRainbowButton";

export function GMakeStudioProductPage({ tee }: { tee: StorefrontTeeProduct }) {
  const garment = useMemo(() => getTryOnGarmentBySlug(tee.id), [tee.id]);
  const colors = garment?.colors ?? [];
  const defaultColorId =
    colors.find((color) => color.id.includes("black"))?.id ??
    garment?.defaultColorId ??
    colors[0]?.id ??
    "";

  const [colorId, setColorId] = useState(defaultColorId);
  const [gender, setGender] = useState<"men" | "women">("men");
  const navigate = useNavigate();
  const wishlist = useStoreStore((state) => state.wishlist);
  const toggleWishlist = useStoreStore((state) => state.toggleWishlist);
  const saved = wishlist.includes(tee.id);

  const catalog = getProductPrice(tee.id);
  const priceLabel = catalog ? formatRsPaise(catalog.priceMinor) : tee.priceLabel.replace(/ or .+$/, "");
  const selectedIndex = Math.max(0, colors.findIndex((color) => color.id === colorId));
  const selectedColor = colors[selectedIndex] ?? colors[0];

  const stepLook = (dir: -1 | 1) => {
    if (colors.length < 2) return;
    const next = colors[(selectedIndex + dir + colors.length) % colors.length];
    if (next) setColorId(next.id);
  };

  const handleBuyNow = () => {
    const search: Record<string, string> = {
      buyNow: "1",
      slug: tee.id,
      qty: "1",
      Size: "M",
    };
    if (selectedColor) search['Colour'] = selectedColor.label;
    void navigate({ to: "/geostore/checkout", search: search as never });
  };

  const openStudio = () => {
    void navigate({
      to: "/geostore/try-on",
      search: {
        slug: tee.id,
        color: colorId || undefined,
      } as never,
    });
  };

  return (
    <div id="gvrze-storefront" className="gvrze-storefront-product">
      <div id="gvrze-gmake-product">
        <StorefrontNav variant="solid" linkSet="gmake" />

        <main className={SF_SHELL}>
          <section className="gmake-hero" aria-label={gmakeProductTitle(tee.name)}>
            <div className="gmake-copy">
              <div>
                <p className="gmake-copy__kicker">GMake Studio</p>
                <h1 className="gmake-copy__title">{gmakeProductTitle(tee.name)}</h1>
                <p className="gmake-copy__price">{priceLabel}</p>
              </div>

              <div className="gmake-cats" role="group" aria-label="Apparel category">
                {TRY_ON_CATEGORY_IDS.map((id) => (
                  <Link
                    key={id}
                    to="/geostore/category/$slug"
                    params={{ slug: id === "tshirts" ? "tshirts" : "hoodies" }}
                    className="gmake-cat"
                    aria-pressed={id === "tshirts"}
                    aria-label={TRY_ON_CATEGORY_LABELS[id]}
                  >
                    <img src={GMAKE_ASSETS.ruler} alt="" width={16} height={16} />
                    {TRY_ON_CATEGORY_LABELS[id]}
                  </Link>
                ))}
              </div>

              <div className="gmake-cta-row">
                <button type="button" className="gmake-cta gmake-cta--solid" onClick={handleBuyNow}>
                  BUY NOW
                </button>
                <button
                  type="button"
                  className="gmake-cta gmake-cta--ghost"
                  aria-pressed={saved}
                  onClick={() => toggleWishlist(tee.id)}
                >
                  WISHLIST
                </button>
              </div>

              <GMakeRainbowButton onClick={openStudio}>Customization</GMakeRainbowButton>
            </div>

            <div className="gmake-preview">
              <div className="gmake-gender" role="group" aria-label="Model">
                <button
                  type="button"
                  aria-pressed={gender === "men"}
                  onClick={() => setGender("men")}
                >
                  Men
                </button>
                <button
                  type="button"
                  aria-pressed={gender === "women"}
                  onClick={() => {
                    toast.message("Women’s studio looks are coming soon.");
                    setGender("men");
                  }}
                >
                  Women
                </button>
              </div>

              {garment ? (
                <div className="gmake-models">
                  <TryOnModelPreview garment={garment} colorId={selectedColor?.id ?? colorId} />
                </div>
              ) : (
                <p className="text-sm text-[#6b6b6b]">Preview is unavailable for this look.</p>
              )}

              <div className="gmake-arrows">
                <button
                  type="button"
                  data-dir="prev"
                  aria-label="Previous colourway"
                  disabled={colors.length < 2}
                  onClick={() => stepLook(-1)}
                >
                  <img src={GMAKE_ASSETS.arrowNext} alt="" />
                </button>
                <button
                  type="button"
                  data-dir="next"
                  aria-label="Next colourway"
                  disabled={colors.length < 2}
                  onClick={() => stepLook(1)}
                >
                  <img src={GMAKE_ASSETS.arrowNext} alt="" />
                </button>
              </div>
            </div>
          </section>
        </main>

        <StorefrontFooter />
      </div>
    </div>
  );
}
