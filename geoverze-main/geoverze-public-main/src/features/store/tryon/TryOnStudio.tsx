/**
 * GVRZE Virtual Try-On Studio
 *
 * Editorial Figma layout:
 *   left  — product, categories, colours, upload, bag / buy
 *   stage — garment preview or generated try-on
 *
 * Photos stay in memory. AI calls go through the server function so keys
 * never ship to the browser.
 */
import "./try-on.css";
import "../storefront/storefront.css";

import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ShieldCheck, Upload, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

import { toCartLine } from "../lib/cart";
import { StorefrontNav } from "../storefront/StorefrontNav";
import { getTryOnStatus, runVirtualTryOn } from "./tryOnApi";
import { ACCEPTED_MIME_TYPES, fileToTryOnPayload, urlToTryOnPayload } from "./tryOnImage";
import {
  getTryOnGarments,
  TRY_ON_CATEGORY_IDS,
  TRY_ON_CATEGORY_LABELS,
  tryOnColorById,
  tryOnGarmentImage,
  type TryOnCategoryId,
  type TryOnGarment,
} from "./tryOnProducts";

const CONSENT_KEY = "gvrze-tryon-consent";
const DEFAULT_SLUG = "cherry-blossom-tshirt";

type StudioMode = "page" | "overlay";

type PhotoState = {
  objectUrl: string;
  base64: string;
  mime: "image/jpeg" | "image/png" | "image/webp";
};

type GenerateState =
  | { phase: "idle" }
  | { phase: "generating"; view: "front" | "back" }
  | { phase: "error"; message: string; unconfigured?: boolean };

type TryOnStudioProps = {
  mode?: StudioMode;
  onClose?: () => void;
};

function hasConsent(): boolean {
  try {
    return sessionStorage.getItem(CONSENT_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberConsent() {
  try {
    sessionStorage.setItem(CONSENT_KEY, "1");
  } catch {
    /* session-only; ignore quota / private mode */
  }
}

function ConsentDialog({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div
      className="tryon-consent"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tryon-consent-title"
    >
      <div className="tryon-consent__card">
        <ShieldCheck size={22} strokeWidth={1.7} aria-hidden />
        <h2 id="tryon-consent-title" className="tryon-consent__title">
          Photo consent
        </h2>
        <p className="tryon-consent__body">
          Your photo is sent securely to the try-on service so we can show the selected garment on
          you. It is processed in memory and is not stored on GVRZE after the session unless you
          save the result yourself.
        </p>
        <ul className="tryon-consent__list">
          <li>Use a front-facing, well-lit full-body photo.</li>
          <li>JPEG, PNG or WebP, up to 10 MB.</li>
          <li>You can replace or remove the photo at any time.</li>
        </ul>
        <div className="tryon-consent__actions">
          <button type="button" className="tryon-btn tryon-btn--solid" onClick={onAccept}>
            I understand — continue
          </button>
          <button type="button" className="tryon-btn tryon-btn--ghost" onClick={onDecline}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function TryOnStudio({ mode = "page", onClose }: TryOnStudioProps) {
  const garments = useMemo(() => getTryOnGarments(), []);
  const [category, setCategory] = useState<TryOnCategoryId>("tshirts");
  const filtered = useMemo(
    () => garments.filter((item) => item.category === category),
    [garments, category],
  );

  const [selectedSlug, setSelectedSlug] = useState(() => {
    if (garments.some((item) => item.slug === DEFAULT_SLUG)) return DEFAULT_SLUG;
    return garments[0]?.slug ?? "";
  });

  const selected: TryOnGarment | undefined =
    filtered.find((item) => item.slug === selectedSlug) ?? filtered[0];

  const [colorId, setColorId] = useState(selected?.defaultColorId ?? "");
  const [size, setSize] = useState(
    selected?.sizes.includes("M") ? "M" : (selected?.sizes[0] ?? "M"),
  );
  const [view, setView] = useState<"front" | "back">("front");
  const [photo, setPhoto] = useState<PhotoState | null>(null);
  const [results, setResults] = useState<{ front?: string; back?: string }>({});
  const [generate, setGenerate] = useState<GenerateState>({ phase: "idle" });
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFile = useRef<File | null>(null);

  const addLine = useCartStore((state) => state.add);
  const navigate = useNavigate();

  useEffect(() => {
    void getTryOnStatus().then((status) => setConfigured(status.configured));
  }, []);

  useEffect(() => {
    const next = garments.find((item) => item.slug === selectedSlug);
    if (!next) return;
    setColorId(next.defaultColorId);
    setSize(next.sizes.includes("M") ? "M" : (next.sizes[0] ?? "M"));
    setView("front");
    setResults({});
    setGenerate({ phase: "idle" });
  }, [garments, selectedSlug]);

  useEffect(() => {
    if (mode !== "overlay" || !onClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  useEffect(() => {
    return () => {
      if (photo?.objectUrl) URL.revokeObjectURL(photo.objectUrl);
    };
  }, [photo?.objectUrl]);

  const selectedColor = selected ? tryOnColorById(selected, colorId) : undefined;
  const frontSrc = selected ? tryOnGarmentImage(selected, colorId, "front") : "";
  const backSrc = selected ? tryOnGarmentImage(selected, colorId, "back") : "";
  const hasDistinctBack = Boolean(
    selectedColor?.backImage && selectedColor.backImage !== selectedColor.image,
  );
  const selectedIndex = selected ? filtered.findIndex((item) => item.slug === selected.slug) : -1;

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

  const processFile = useCallback(async (file: File) => {
    try {
      const payload = await fileToTryOnPayload(file);
      setPhoto((prev) => {
        if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
        return payload;
      });
      setResults({});
      setGenerate({ phase: "idle" });
    } catch (error) {
      setGenerate({
        phase: "error",
        message: error instanceof Error ? error.message : "Could not read that photo.",
      });
    }
  }, []);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleUploadClick = () => {
    if (!hasConsent()) {
      setShowConsent(true);
      return;
    }
    openFilePicker();
  };

  const handleConsentAccept = () => {
    rememberConsent();
    setShowConsent(false);
    if (pendingFile.current) {
      void processFile(pendingFile.current);
      pendingFile.current = null;
    } else {
      openFilePicker();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void processFile(file);
  };

  const clearPhoto = () => {
    setPhoto((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
    setResults({});
    setGenerate({ phase: "idle" });
  };

  const handleGenerate = async () => {
    if (!selected || !photo) return;
    if (configured === false) {
      setGenerate({
        phase: "error",
        unconfigured: true,
        message:
          "AI try-on is not configured yet. Add TRYON_API_KEY to the server environment (optional TRYON_PROVIDER=fal|fashn) and reload. Your photo was not sent.",
      });
      return;
    }

    const garmentUrl = tryOnGarmentImage(selected, colorId, view);
    if (!garmentUrl) {
      setGenerate({ phase: "error", message: "This look has no garment image to try on." });
      return;
    }

    setGenerate({ phase: "generating", view });
    try {
      const garment = await urlToTryOnPayload(garmentUrl);
      const result = await runVirtualTryOn({
        data: {
          modelPhotoBase64: photo.base64,
          modelPhotoMime: photo.mime,
          garmentImageBase64: garment.base64,
          garmentImageMime: garment.mime,
          garmentDescription: `${selected.name} — ${selectedColor?.label ?? ""} ${view}`,
          view,
        },
      });

      if (!result.ok) {
        setGenerate({
          phase: "error",
          unconfigured: result.code === "not_configured",
          message: result.error,
        });
        return;
      }

      setResults((prev) => ({ ...prev, [result.view]: result.resultUrl }));
      setGenerate({ phase: "idle" });
    } catch (error) {
      setGenerate({
        phase: "error",
        message: error instanceof Error ? error.message : "Try-on failed. Please try again.",
      });
    }
  };

  const buildOptions = () => {
    const options: Record<string, string> = {};
    if (size) options.Size = size;
    if (selectedColor) options.Colour = selectedColor.label;
    return options;
  };

  const handleAddToBag = () => {
    if (!selected) return;
    if (selected.comingSoon || selected.stock === "sold-out") {
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
    if (!selected) return;
    if (selected.comingSoon || selected.stock === "sold-out") {
      toast.error("This look is not available to purchase.");
      return;
    }
    addLine(toCartLine(selected.product, buildOptions(), 1));
    toast.success(`${selected.name} added`, { description: "Taking you to checkout." });
    void navigate({ to: "/geostore/cart" });
  };

  const resultFront = results.front;
  const resultBack = results.back;
  const showingResult = Boolean(resultFront || resultBack);
  const isGenerating = generate.phase === "generating";

  const shellClass = mode === "page" ? "gvrze-tryon-page" : undefined;

  return (
    <div
      id="gvrze-tryon-studio"
      className={cn(mode === "overlay" && "tryon--overlay")}
      data-tryon-mode={mode}
    >
      <div id={mode === "page" ? "gvrze-storefront" : undefined} className={shellClass}>
        <StorefrontNav variant="solid" showTryOn />
        <div className="tryon-shell">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME_TYPES.join(",")}
            className="sr-only"
            aria-label="Upload your photo for try-on"
            onChange={handleFileChange}
          />

          {showConsent ? (
            <ConsentDialog
              onAccept={handleConsentAccept}
              onDecline={() => {
                setShowConsent(false);
                pendingFile.current = null;
              }}
            />
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

              {filtered.length > 1 ? (
                <label className="tryon-look-select">
                  <span className="sr-only">Choose a look</span>
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

              {selected && selected.colors.length > 1 ? (
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
                        onClick={() => {
                          setColorId(color.id);
                          setResults({});
                        }}
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

              <div className="tryon-upload">
                {photo ? (
                  <div className="tryon-upload__row">
                    <img
                      src={photo.objectUrl}
                      alt="Your uploaded photo"
                      className="tryon-upload__thumb"
                    />
                    <div>
                      <button
                        type="button"
                        className="tryon-upload__link"
                        onClick={handleUploadClick}
                      >
                        Replace photo
                      </button>
                      <br />
                      <button type="button" className="tryon-upload__link" onClick={clearPhoto}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="tryon-upload__link" onClick={handleUploadClick}>
                    <Upload size={13} strokeWidth={2} aria-hidden /> Upload your photo
                  </button>
                )}
                <p className="tryon-upload__hint">
                  Front-facing, well-lit, full body. JPEG, PNG or WebP.
                </p>
                {photo ? (
                  <button
                    type="button"
                    className="tryon-btn tryon-btn--ghost"
                    disabled={isGenerating}
                    onClick={() => void handleGenerate()}
                  >
                    {isGenerating ? "Generating…" : "Generate try-on"}
                  </button>
                ) : null}
                {photo && configured === false ? (
                  <p className="tryon-upload__hint">
                    AI try-on needs TRYON_API_KEY on the server. Your photo stays on this device
                    until then.
                  </p>
                ) : null}
              </div>

              <div className="tryon-actions">
                <button
                  type="button"
                  className="tryon-btn tryon-btn--ghost"
                  disabled={!selected}
                  onClick={handleAddToBag}
                >
                  Add to Bag
                </button>
                <button
                  type="button"
                  className="tryon-btn tryon-btn--solid"
                  disabled={!selected}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </aside>

            <section className="tryon-stage" aria-label="Try-on preview">
              {!selected || filtered.length === 0 ? (
                <div className="tryon-empty">
                  {category === "sweatshirts"
                    ? "Sweatshirts are coming soon."
                    : "No looks in this category yet."}
                </div>
              ) : showingResult ? (
                <div className="tryon-models">
                  {resultFront ? (
                    <div className="tryon-result">
                      <img src={resultFront} alt={`${selected.name} try-on, front`} />
                    </div>
                  ) : null}
                  {resultBack ? (
                    <div className="tryon-result">
                      <img src={resultBack} alt={`${selected.name} try-on, back`} />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="tryon-models">
                  <div className="tryon-model">
                    {frontSrc ? (
                      <img
                        key={`${selected.slug}-${colorId}-front`}
                        src={frontSrc}
                        alt={`${selected.name}${selectedColor ? `, ${selectedColor.label}` : ""}`}
                      />
                    ) : null}
                  </div>
                  {hasDistinctBack && backSrc ? (
                    <div className="tryon-model">
                      <img
                        key={`${selected.slug}-${colorId}-back`}
                        src={backSrc}
                        alt={`${selected.name}, back view`}
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {isGenerating ? (
                <div className="tryon-stage__loading" aria-live="polite">
                  <div className="tryon-spinner" aria-hidden />
                  <p className="tryon-stage__title">Fitting your look…</p>
                  <p className="tryon-stage__body">
                    The garment is being placed on your photo. This usually takes a few seconds.
                  </p>
                </div>
              ) : null}

              {generate.phase === "error" ? (
                <div className="tryon-stage__message" role="alert">
                  <X size={16} strokeWidth={2} aria-hidden />
                  <p className="tryon-stage__body">{generate.message}</p>
                </div>
              ) : null}

              {hasDistinctBack || showingResult ? (
                <div className="tryon-views" role="group" aria-label="View">
                  <button
                    type="button"
                    className="tryon-view"
                    aria-pressed={view === "front"}
                    onClick={() => setView("front")}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    className="tryon-view"
                    aria-pressed={view === "back"}
                    onClick={() => setView("back")}
                  >
                    Back
                  </button>
                </div>
              ) : null}
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
