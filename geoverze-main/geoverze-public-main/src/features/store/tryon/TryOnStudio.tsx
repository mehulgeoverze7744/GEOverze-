/**
 * GVRZE Try-On Studio — GMake customization layout (Figma Desktop 11).
 */
import "./try-on.css";
import "../storefront/storefront.css";
import "../gmake/gmake-studio.css";

import { useNavigate } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { formatRsPaise, GMAKE_ASSETS } from "../gmake/gmake-assets";
import { GMakeRainbowButton } from "../gmake/GMakeRainbowButton";
import { GMakeTeePreview } from "../gmake/GMakeTeePreview";
import {
  designPriceMinor,
  GMAKE_CREAM_COLOR,
  GMAKE_DESIGN_LIBRARY,
  libraryDesignById,
  type GmakeLibraryDesign,
} from "../gmake/gmakeDesignLibrary";
import { computeShippingMinor, getProductPrice } from "../lib/gstoreProductPrices";
import { StorefrontFooter } from "../storefront/StorefrontFooter";
import { StorefrontNav } from "../storefront/StorefrontNav";
import { fileToTryOnPayload } from "./tryOnImage";
import {
  getTryOnGarments,
  tryOnColorById,
  type TryOnColor,
  type TryOnGarment,
} from "./tryOnProducts";

const DEFAULT_SLUG = "cherry-blossom-tshirt";
const STUDIO_SIZES = ["S", "M", "L", "XL"] as const;

type StudioMode = "page" | "overlay";

type TryOnStudioProps = {
  mode?: StudioMode;
  onClose?: () => void;
  initialSlug?: string;
  initialColor?: string;
  initialSize?: string;
};

function studioColors(garment: TryOnGarment): TryOnColor[] {
  const colors = [...garment.colors];
  if (garment.category === "tshirts" && !colors.some((color) => color.id === "cream")) {
    colors.splice(Math.min(1, colors.length), 0, {
      id: GMAKE_CREAM_COLOR.id,
      label: GMAKE_CREAM_COLOR.label,
      hex: GMAKE_CREAM_COLOR.hex,
      image: GMAKE_CREAM_COLOR.image,
    });
  }
  return colors;
}

export function TryOnStudio({
  mode = "page",
  onClose,
  initialSlug,
  initialColor,
  initialSize,
}: TryOnStudioProps) {
  const garments = useMemo(() => getTryOnGarments(), []);
  const [selectedSlug, setSelectedSlug] = useState(() => {
    if (initialSlug && garments.some((item) => item.slug === initialSlug)) return initialSlug;
    if (garments.some((item) => item.slug === DEFAULT_SLUG)) return DEFAULT_SLUG;
    return garments.find((item) => item.category === "tshirts")?.slug ?? garments[0]?.slug ?? "";
  });

  useEffect(() => {
    if (initialSlug && garments.some((item) => item.slug === initialSlug)) {
      setSelectedSlug(initialSlug);
    }
  }, [garments, initialSlug]);

  const selected: TryOnGarment | undefined =
    garments.find((item) => item.slug === selectedSlug) ?? garments[0];
  const colors = selected ? studioColors(selected) : [];

  const [colorId, setColorId] = useState(() => {
    if (initialColor && colors.some((color) => color.id === initialColor)) return initialColor;
    if (colors.some((color) => color.id === "cream")) return "cream";
    return selected?.defaultColorId ?? colors[0]?.id ?? "";
  });
  const [size, setSize] = useState(
    initialSize && STUDIO_SIZES.includes(initialSize as (typeof STUDIO_SIZES)[number])
      ? initialSize
      : "S",
  );
  const [view, setView] = useState<"front" | "back">("front");
  const [designId, setDesignId] = useState<string>("");
  const [customSrc, setCustomSrc] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [approvalOpen, setApprovalOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const selectedColor = selected ? (tryOnColorById(
    { ...selected, colors },
    colorId,
  ) ?? colors.find((color) => color.id === colorId) ?? colors[0]) : undefined;
  const selectedDesign: GmakeLibraryDesign | null = customSrc
    ? null
    : (libraryDesignById(designId) ?? null);
  const canPurchase = Boolean(selected && !selected.comingSoon && selected.stock !== "sold-out");

  useEffect(() => {
    if (!selected) return;
    const nextColors = studioColors(selected);
    if (!nextColors.some((color) => color.id === colorId)) {
      setColorId(
        nextColors.some((color) => color.id === "cream")
          ? "cream"
          : (selected.defaultColorId ?? nextColors[0]?.id ?? ""),
      );
    }
  }, [selected, colorId]);

  useEffect(() => {
    if (mode !== "overlay" || !onClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  const catalog = selected ? getProductPrice(selected.slug) : null;
  const apparelMinor = catalog?.priceMinor ?? 0;
  const addOnMinor = designPriceMinor(selectedDesign);
  const subtotalMinor = apparelMinor + addOnMinor;
  const shippingMinor = catalog
    ? computeShippingMinor("standard", subtotalMinor, catalog.physical)
    : 0;
  const totalMinor = subtotalMinor + shippingMinor;
  const includedNote =
    shippingMinor === 0 ? "(GST + Shipping Included)" : "(GST included)";

  const buildSearch = () => {
    const search: Record<string, string> = {
      buyNow: "1",
      slug: selected?.slug ?? "",
      qty: "1",
    };
    if (size) search['Size'] = size;
    if (selectedColor) search['Colour'] = selectedColor.label;
    if (selectedDesign) search['Design'] = selectedDesign.name;
    if (customName) search['CustomDesign'] = `Uploaded (${customName}) — pending approval`;
    if (instructions.trim()) search['Instructions'] = instructions.trim();
    return search;
  };

  const handleBuyNow = () => {
    if (!selected || !canPurchase) {
      toast.error("This look is not available to purchase.");
      return;
    }
    void navigate({ to: "/geostore/checkout", search: buildSearch() as never });
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const payload = await fileToTryOnPayload(file);
      setCustomSrc(payload.objectUrl);
      setCustomName(file.name);
      setDesignId("");
      setApprovalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload that file.");
    }
  };

  const scrollLibrary = (dir: 1 | -1) => {
    const node = carouselRef.current;
    if (!node) return;
    node.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  return (
    <div
      id="gvrze-tryon-studio"
      className={cn(mode === "overlay" && "tryon--overlay")}
      data-tryon-mode={mode}
    >
      <div id={mode === "page" ? "gvrze-storefront" : undefined} className="gvrze-tryon-page">
        <StorefrontNav variant="solid" linkSet="gmake" />

        {mode === "overlay" && onClose ? (
          <button type="button" className="tryon-close" onClick={onClose} aria-label="Close Try-On Studio">
            <X size={18} strokeWidth={1.8} aria-hidden />
          </button>
        ) : null}

        <div className="gmake-studio">
          <aside className="gmake-panel" aria-label="Customization">
            <section className="gmake-section">
              <h1 className="gmake-section__title">GVRZE Design Library</h1>
              <div className="gmake-library">
                <div className="gmake-library__scroller" ref={carouselRef}>
                  {GMAKE_DESIGN_LIBRARY.map((item) => {
                    const active = !customSrc && designId === item.id;
                    const price = designPriceMinor(item);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={cn("gmake-library__card", active && "is-active")}
                        aria-pressed={active}
                        onClick={() => {
                          setDesignId(item.id);
                          setCustomSrc(null);
                          setCustomName(null);
                          const match = garments.find((garment) => garment.slug === item.id);
                          if (match) {
                            setSelectedSlug(match.slug);
                            const printed =
                              match.colors.find((entry) => entry.id !== "cream") ?? match.colors[0];
                            if (printed) setColorId(printed.id);
                          }
                          if (item.placement === "back-graphic") setView("back");
                          else setView("front");
                        }}
                      >
                        <span className="gmake-library__thumb">
                          <img src={item.thumb} alt="" />
                        </span>
                        <span className="gmake-library__name">
                          {item.name}
                          {price > 0 ? ` (${formatRsPaise(price)})` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="gmake-library__next"
                  aria-label="More designs"
                  onClick={() => scrollLibrary(1)}
                >
                  <img src={GMAKE_ASSETS.chevron} alt="" />
                </button>
              </div>
            </section>

            <section className="gmake-section">
              <h2 className="gmake-section__title">Color</h2>
              <div className="gmake-swatches" role="group" aria-label="Colour">
                {colors.map((color) => {
                  const active = color.id === selectedColor?.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      className={cn("gmake-swatch", active && "is-active")}
                      style={{ background: color.hex }}
                      aria-pressed={active}
                      aria-label={color.label}
                      title={color.label}
                      onClick={() => setColorId(color.id)}
                    >
                      {active ? <Check size={16} strokeWidth={2.4} color={isDark(color.hex) ? "#fff" : "#111"} /> : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="gmake-section">
              <div className="gmake-section__head">
                <h2 className="gmake-section__title">Custom Design</h2>
                <p className="gmake-section__hint">
                  <img src={GMAKE_ASSETS.infoIcon} alt="" width={15} height={15} />
                  Submitted Design(s) will go through an approval process
                </p>
              </div>
              <button
                type="button"
                className="gmake-upload"
                onClick={() => fileRef.current?.click()}
              >
                {customSrc ? (
                  <>
                    <img src={customSrc} alt="" className="gmake-upload__preview" />
                    <span>Replace uploaded design</span>
                  </>
                ) : (
                  <>
                    <img src={GMAKE_ASSETS.uploadCloud} alt="" width={46} height={41} />
                    <span>Upload from my Device</span>
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  void handleUpload(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </section>

            <section className="gmake-section">
              <h2 className="gmake-section__title">Size</h2>
              <div className="gmake-sizes" role="group" aria-label="Size">
                {STUDIO_SIZES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="gmake-size"
                    aria-pressed={size === value}
                    onClick={() => setSize(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </section>

            <div className="gmake-footer-block">
              <button
                type="button"
                className="gmake-instructions"
                aria-expanded={instructionsOpen}
                onClick={() => setInstructionsOpen((open) => !open)}
              >
                <span>Design Instructions</span>
                <img src={GMAKE_ASSETS.plusCircle} alt="" width={28} height={28} />
              </button>
              {instructionsOpen ? (
                <textarea
                  className="gmake-instructions__field"
                  rows={3}
                  placeholder="Tell us where to place the print, size, or any other notes."
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                />
              ) : null}

              <p className="gmake-total">
                <strong>Total: {formatRsPaise(totalMinor)}</strong>
                <span> {includedNote}</span>
              </p>

              <GMakeRainbowButton disabled={!canPurchase} onClick={handleBuyNow}>
                BUY NOW
              </GMakeRainbowButton>
            </div>
          </aside>

          <section className="gmake-stage" aria-label="Product preview">
            <div className="gmake-gender" role="group" aria-label="Garment view">
              <button type="button" aria-pressed={view === "front"} onClick={() => setView("front")}>
                Front
              </button>
              <button type="button" aria-pressed={view === "back"} onClick={() => setView("back")}>
                Back
              </button>
            </div>

            {selected ? (
              <GMakeTeePreview
                color={selectedColor}
                view={view}
                design={selectedDesign}
                customSrc={customSrc}
                productName={selected.name}
              />
            ) : (
              <p className="tryon-empty">No looks in this category yet.</p>
            )}
          </section>
        </div>

        {mode === "page" ? <StorefrontFooter /> : null}
      </div>

      {approvalOpen ? (
        <div className="gmake-modal" role="dialog" aria-labelledby="gmake-approval-title">
          <div className="gmake-modal__card">
            <img src={GMAKE_ASSETS.uploadCloud} alt="" width={64} height={64} />
            <h2 id="gmake-approval-title">Order Received</h2>
            <p>
              Thank you, we have received your design. Our team is working on it and will notify
              you regarding your design approval status.
            </p>
            <button type="button" className="gmake-cta gmake-cta--solid" onClick={() => setApprovalOpen(false)}>
              Continue
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function isDark(hex: string): boolean {
  const raw = hex.replace("#", "");
  if (raw.length < 6) return true;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}
