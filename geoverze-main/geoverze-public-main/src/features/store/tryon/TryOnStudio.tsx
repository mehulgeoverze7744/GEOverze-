/**
 * GVRZE Try-On Studio — Phase 1
 *
 * Editorial layout:
 *   left  — product, colours, sizes, bag / buy
 *   stage — fixed GVRZE studio model + product-specific preview
 *
 * Personal photo upload and AI generation are reserved for Phase 2.
 */
import "./try-on.css";
import "../storefront/storefront.css";

import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

import { toCartLine } from "../lib/cart";
import { StorefrontNav } from "../storefront/StorefrontNav";
import { TryOnModelPreview } from "./TryOnModelPreview";
import {
  getTryOnGarments,
  TRY_ON_CATEGORY_IDS,
  TRY_ON_CATEGORY_LABELS,
  tryOnColorById,
  type TryOnCategoryId,
  type TryOnGarment,
} from "./tryOnProducts";

const DEFAULT_SLUG = "midnight-black-tshirt";

type StudioMode = "page" | "overlay";

type TryOnStudioProps = {
  mode?: StudioMode;
  onClose?: () => void;
};

export function TryOnStudio({ mode = "page", onClose }: TryOnStudioProps) {
  const garments = useMemo(() => getTryOnGarments(), []);
  const [category, setCategory] = useState<TryOnCategoryId>("tshirts");
  const filtered = useMemo(
    () => garments.filter((item) => item.category === category),
    [garments, category],
  );

  const [selectedSlug, setSelectedSlug] = useState(() => {
    if (garments.some((item) => item.slug === DEFAULT_SLUG)) return DEFAULT_SLUG;
    return garments.find((item) => item.category === "tshirts")?.slug ?? garments[0]?.slug ?? "";
  });

  const selected: TryOnGarment | undefined =
    filtered.find((item) => item.slug === selectedSlug) ?? filtered[0];

  const [colorId, setColorId] = useState(selected?.defaultColorId ?? "");
  const [size, setSize] = useState(
    selected?.sizes.includes("M") ? "M" : (selected?.sizes[0] ?? "M"),
  );

  const addLine = useCartStore((state) => state.add);
  const navigate = useNavigate();

  useEffect(() => {
    const next = garments.find((item) => item.slug === selectedSlug);
    if (!next) return;
    setColorId(next.defaultColorId);
    setSize(next.sizes.includes("M") ? "M" : (next.sizes[0] ?? "M"));
  }, [garments, selectedSlug]);

  useEffect(() => {
    if (mode !== "overlay" || !onClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  const selectedColor = selected ? tryOnColorById(selected, colorId) : undefined;
  const selectedIndex = selected ? filtered.findIndex((item) => item.slug === selected.slug) : -1;
  const canPurchase = Boolean(selected && !selected.comingSoon && selected.stock !== "sold-out");

  const selectCategory = (next: TryOnCategoryId) => {
    setCategory(next);
    const first = garments.find((item) => item.category === next);
    if (first) setSelectedSlug(first.slug);
  };

  const stepProduct = (dir: -1 | 1) => {
    if (!filtered.length || selectedIndex < 0) return;
    const next = filtered[selectedIndex + dir];
    if (next) setSelectedSlug(next.slug);
  };

  const buildOptions = () => {
    const options: Record<string, string> = {};
    if (size) options.Size = size;
    if (selectedColor) options.Colour = selectedColor.label;
    return options;
  };

  const handleAddToBag = () => {
    if (!selected || !canPurchase) {
      toast.error("This look is not available to purchase.");
      return;
    }
    addLine(toCartLine(selected.product, buildOptions(), 1));
    toast.success(`${selected.name} added`, {
      description: "Waiting in your cart.",
      action: { label: "View cart", onClick: () => void navigate({ to: "/geostore/cart" }) },
    });
  };

  const handleBuyNow = () => {
    if (!selected || !canPurchase) {
      toast.error("This look is not available to purchase.");
      return;
    }
    addLine(toCartLine(selected.product, buildOptions(), 1));
    toast.success(`${selected.name} added`, { description: "Taking you to checkout." });
    void navigate({ to: "/geostore/cart" });
  };

  const emptyCopy =
    category === "sweatshirts"
      ? "Sweatshirts are coming soon."
      : category === "hoodies"
        ? "Hoodie try-on mockups are coming soon."
        : "No looks in this category yet.";

  return (
    <div
      id="gvrze-tryon-studio"
      className={cn(mode === "overlay" && "tryon--overlay")}
      data-tryon-mode={mode}
      data-tryon-phase="1"
    >
      <div id={mode === "page" ? "gvrze-storefront" : undefined} className="gvrze-tryon-page">
        <StorefrontNav variant="solid" showTryOn />
        <div className="tryon-shell">
          {mode === "overlay" && onClose ? (
            <button
              type="button"
              className="tryon-close"
              onClick={onClose}
              aria-label="Close Try-On Studio"
            >
              <X size={18} strokeWidth={1.8} aria-hidden />
            </button>
          ) : null}

          <main className="tryon-layout" aria-label="Try-On Studio">
            <aside className="tryon-info">
              <div>
                <p className="tryon-info__kicker">Try-On Studio</p>
                <h1 className="tryon-info__name">{selected?.name ?? "Select a look"}</h1>
                {selected ? <p className="tryon-info__price">{selected.priceLabel}</p> : null}
              </div>

              <div className="tryon-pills" role="group" aria-label="Product category">
                {TRY_ON_CATEGORY_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="tryon-pill"
                    aria-pressed={category === id}
                    onClick={() => selectCategory(id)}
                  >
                    {TRY_ON_CATEGORY_LABELS[id]}
                  </button>
                ))}
              </div>

              {filtered.length > 0 ? (
                <label className="tryon-look-select">
                  <span className="tryon-field-label">Product</span>
                  <select
                    value={selected?.slug ?? ""}
                    onChange={(event) => setSelectedSlug(event.target.value)}
                  >
                    {filtered.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {selected && selected.colors.length ? (
                <div>
                  <p className="tryon-field-label">Colour — {selectedColor?.label}</p>
                  <div className="tryon-swatches" role="group" aria-label="Colour">
                    {selected.colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        className="tryon-swatch"
                        style={{ background: color.hex }}
                        aria-pressed={color.id === selectedColor?.id}
                        aria-label={color.label}
                        title={color.label}
                        onClick={() => setColorId(color.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {selected && selected.sizes.length ? (
                <div>
                  <p className="tryon-field-label">Size</p>
                  <div className="tryon-sizes" role="group" aria-label="Size">
                    {selected.sizes.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className="tryon-size"
                        aria-pressed={size === value}
                        onClick={() => setSize(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="tryon-actions">
                <button
                  type="button"
                  className="tryon-btn tryon-btn--ghost"
                  disabled={!canPurchase}
                  onClick={handleAddToBag}
                >
                  Add to Bag
                </button>
                <button
                  type="button"
                  className="tryon-btn tryon-btn--solid"
                  disabled={!canPurchase}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </aside>

            <section className="tryon-stage" aria-label="Model preview">
              {!selected || filtered.length === 0 ? (
                <div className="tryon-empty">{emptyCopy}</div>
              ) : (
                <TryOnModelPreview garment={selected} colorId={colorId} />
              )}
            </section>
          </main>

          <div className="tryon-arrows">
            <button
              type="button"
              className="tryon-arrow"
              aria-label="Previous look"
              disabled={selectedIndex <= 0}
              onClick={() => stepProduct(-1)}
            >
              <ArrowLeft size={18} strokeWidth={1.8} aria-hidden />
            </button>
            <button
              type="button"
              className="tryon-arrow"
              aria-label="Next look"
              disabled={selectedIndex < 0 || selectedIndex >= filtered.length - 1}
              onClick={() => stepProduct(1)}
            >
              <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
