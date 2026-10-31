/**
 * GVRZE Virtual Try-On Studio
 *
 * Three-panel layout:
 *  LEFT   — product catalogue (filtered to apparel eligible for try-on)
 *  CENTRE — AI try-on preview (upload → generate → result)
 *  RIGHT  — view controls, size/colour selection, Add to Bag / Buy Now
 *
 * AI calls are routed through the server function in tryOnApi.ts so that
 * API credentials never appear in the browser bundle.
 *
 * Privacy: user photos are processed in memory and sent only to the
 * server-side AI endpoint; they are never persisted unless the user
 * explicitly downloads their result.
 */
import "./try-on.css";

import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { useCartStore } from "@/stores/cartStore";

import { productImageForSlug } from "../data/productImages";
import { toCartLine } from "../lib/cart";
import { useStoreActions } from "../lib/useStoreActions";
import { runVirtualTryOn, type TryOnResult } from "./tryOnApi";
import {
  formatTryOnPrice,
  getTryOnProducts,
  TRY_ON_CATEGORY_LABELS,
  type TryOnCategoryId,
} from "./tryOnProducts";

// ─── constants ───────────────────────────────────────────────────────────────

const SWATCH_COLOURS: Record<string, string> = {
  Charcoal: "#4a4a4a",
  "Deep space": "#1c2a3a",
  "Bronze sand": "#c9a96e",
  White: "#f5f5f0",
  Black: "#111111",
  "Olive green": "#6b7c52",
  "Off-white": "#f0ede6",
  Burgundy: "#7c2d3b",
  Blue: "#2b5a8a",
  Brown: "#7a5c3a",
  Pink: "#e8a0a0",
};

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AcceptedMime = (typeof ACCEPTED_MIME_TYPES)[number];

// ─── types ───────────────────────────────────────────────────────────────────

type TryOnState =
  | { phase: "idle" }
  | { phase: "ready"; userPhotoUrl: string; userPhotoBase64: string; userPhotoMime: AcceptedMime }
  | { phase: "generating"; userPhotoUrl: string; userPhotoBase64: string; userPhotoMime: AcceptedMime }
  | { phase: "result"; resultUrl: string; view: "front" | "back"; userPhotoUrl: string; userPhotoBase64: string; userPhotoMime: AcceptedMime }
  | { phase: "error"; message: string; userPhotoUrl?: string; userPhotoBase64?: string; userPhotoMime?: AcceptedMime };

// ─── privacy consent overlay ─────────────────────────────────────────────────

function ConsentOverlay({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="tryon-consent-overlay" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div className="tryon-consent-modal">
        <div className="tryon-consent-modal__icon">
          <ShieldCheck size={28} strokeWidth={1.8} aria-hidden />
        </div>
        <h2 id="consent-title" className="tryon-consent-modal__title">
          Your Privacy Matters
        </h2>
        <p className="tryon-consent-modal__body">
          To try on GVRZE clothing virtually, you&apos;ll upload a photo of yourself.
          Please review how we handle it:
        </p>
        <ul className="tryon-consent-modal__points">
          <li className="tryon-consent-modal__point">
            <BadgeCheck size={16} strokeWidth={2} className="tryon-consent-modal__point-icon" aria-hidden />
            Your photo is sent securely to our AI service for processing only.
          </li>
          <li className="tryon-consent-modal__point">
            <BadgeCheck size={16} strokeWidth={2} className="tryon-consent-modal__point-icon" aria-hidden />
            We do not permanently store your photo unless you save the result yourself.
          </li>
          <li className="tryon-consent-modal__point">
            <BadgeCheck size={16} strokeWidth={2} className="tryon-consent-modal__point-icon" aria-hidden />
            Your photo is never shared with third parties beyond our AI provider.
          </li>
          <li className="tryon-consent-modal__point">
            <BadgeCheck size={16} strokeWidth={2} className="tryon-consent-modal__point-icon" aria-hidden />
            You can reset your session at any time to clear all uploaded data.
          </li>
        </ul>
        <div className="tryon-consent-actions">
          <button type="button" className="tryon-consent-accept" onClick={onAccept}>
            I understand — continue
          </button>
          <button type="button" className="tryon-consent-decline" onClick={onDecline}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function TryOnStudio() {
  // catalogue state
  const allProducts = getTryOnProducts();
  const [categoryFilter, setCategoryFilter] = useState<TryOnCategoryId | "all">("all");
  const filteredProducts =
    categoryFilter === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === categoryFilter);

  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const selectedProduct = filteredProducts[selectedProductIdx] ?? filteredProducts[0];

  // option selection
  const sizeOption = selectedProduct?.options.find((o) => o.label === "Size");
  const colourOption = selectedProduct?.options.find((o) => o.label === "Colour");
  const [selectedSize, setSelectedSize] = useState<string>(() => sizeOption?.values[0] ?? "M");
  const [selectedColour, setSelectedColour] = useState<string>(() => colourOption?.values[0] ?? "Charcoal");

  // studio state
  const [tryOnState, setTryOnState] = useState<TryOnState>({ phase: "idle" });
  const [view, setView] = useState<"front" | "back">("front");
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  // pending file waiting for consent
  const pendingFile = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // cart
  const { addProduct } = useStoreActions();
  const add = useCartStore((s) => s.add);

  // ── product selection ──────────────────────────────────────────────────────

  const handleSelectProduct = useCallback(
    (idx: number) => {
      setSelectedProductIdx(idx);
      const p = filteredProducts[idx];
      if (p) {
        const sz = p.options.find((o) => o.label === "Size")?.values[0] ?? "M";
        const cl = p.options.find((o) => o.label === "Colour")?.values[0] ?? "Charcoal";
        setSelectedSize(sz);
        setSelectedColour(cl);
      }
      // reset result when product changes but keep photo
      setTryOnState((prev) =>
        prev.phase === "result"
          ? {
              phase: "ready",
              userPhotoUrl: prev.userPhotoUrl,
              userPhotoBase64: prev.userPhotoBase64,
              userPhotoMime: prev.userPhotoMime,
            }
          : prev,
      );
    },
    [filteredProducts],
  );

  const handleCategoryFilter = (cat: TryOnCategoryId | "all") => {
    setCategoryFilter(cat);
    setSelectedProductIdx(0);
  };

  // ── photo upload ───────────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (!ACCEPTED_MIME_TYPES.includes(file.type as AcceptedMime)) {
      setTryOnState({ phase: "error", message: "Please upload a JPEG, PNG or WebP image." });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setTryOnState({ phase: "error", message: "Image is too large. Maximum file size is 10 MB." });
      return;
    }

    const url = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // strip the "data:image/…;base64," prefix
      const base64 = dataUrl.split(",")[1] ?? "";
      setTryOnState({
        phase: "ready",
        userPhotoUrl: url,
        userPhotoBase64: base64,
        userPhotoMime: file.type as AcceptedMime,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUploadClick = () => {
    if (!consentGiven) {
      setShowConsent(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleConsentAccept = () => {
    setConsentGiven(true);
    setShowConsent(false);
    if (pendingFile.current) {
      processFile(pendingFile.current);
      pendingFile.current = null;
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleConsentDecline = () => {
    setShowConsent(false);
    pendingFile.current = null;
  };

  // drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!consentGiven) {
      pendingFile.current = file;
      setShowConsent(true);
    } else {
      processFile(file);
    }
  };

  // ── generate try-on ────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    const photoState =
      tryOnState.phase === "ready" ||
      tryOnState.phase === "result" ||
      (tryOnState.phase === "error" && tryOnState.userPhotoBase64)
        ? tryOnState
        : null;

    if (!photoState || !("userPhotoBase64" in photoState) || !photoState.userPhotoBase64) return;

    const productImageUrl = selectedProduct
      ? productImageForSlug(selectedProduct.slug)?.src ?? ""
      : "";

    setTryOnState({
      phase: "generating",
      userPhotoUrl: photoState.userPhotoUrl ?? "",
      userPhotoBase64: photoState.userPhotoBase64,
      userPhotoMime: photoState.userPhotoMime ?? "image/jpeg",
    });

    let result: TryOnResult;
    try {
      result = await runVirtualTryOn({
        data: {
          modelPhotoBase64: photoState.userPhotoBase64,
          modelPhotoMime: photoState.userPhotoMime ?? "image/jpeg",
          garmentImageUrl: productImageUrl,
          garmentDescription: `${selectedProduct.name} — ${selectedProduct.tagline}`,
          view,
        },
      });
    } catch (err) {
      result = {
        ok: false,
        error: err instanceof Error ? err.message : "Unexpected error during try-on generation.",
      };
    }

    if (result.ok) {
      setTryOnState({
        phase: "result",
        resultUrl: result.resultUrl,
        view: result.view,
        userPhotoUrl: photoState.userPhotoUrl ?? "",
        userPhotoBase64: photoState.userPhotoBase64,
        userPhotoMime: photoState.userPhotoMime ?? "image/jpeg",
      });
    } else {
      const errState: TryOnState = {
        phase: "error",
        message: result.error,
      };
      if ("userPhotoUrl" in photoState && photoState.userPhotoUrl) {
        (errState as { userPhotoUrl?: string }).userPhotoUrl = photoState.userPhotoUrl;
      }
      if (photoState.userPhotoBase64) {
        (errState as { userPhotoBase64?: string }).userPhotoBase64 = photoState.userPhotoBase64;
      }
      if (photoState.userPhotoMime) {
        (errState as { userPhotoMime?: AcceptedMime }).userPhotoMime = photoState.userPhotoMime;
      }
      setTryOnState(errState);
    }
  };

  const handleReset = () => {
    setTryOnState({ phase: "idle" });
    setView("front");
  };

  // ── add to bag / buy now ───────────────────────────────────────────────────

  const buildOptions = () => {
    const opts: Record<string, string> = {};
    if (sizeOption && selectedSize) opts[sizeOption.label] = selectedSize;
    if (colourOption && selectedColour) opts[colourOption.label] = selectedColour;
    return opts;
  };

  const handleAddToBag = () => {
    if (!selectedProduct) return;
    addProduct(selectedProduct, buildOptions());
  };

  const handleBuyNow = () => {
    if (!selectedProduct) return;
    add(toCartLine(selectedProduct, buildOptions(), 1));
    void (window.location.href = "/geostore/cart");
  };

  // ── download result ────────────────────────────────────────────────────────

  const handleDownload = () => {
    if (tryOnState.phase !== "result") return;
    const a = document.createElement("a");
    a.href = tryOnState.resultUrl;
    a.download = `gvrze-tryon-${selectedProduct?.slug ?? "result"}.jpg`;
    a.click();
  };

  // ─── computed booleans ─────────────────────────────────────────────────────

  const hasPhoto =
    tryOnState.phase === "ready" ||
    tryOnState.phase === "generating" ||
    tryOnState.phase === "result" ||
    (tryOnState.phase === "error" && Boolean(tryOnState.userPhotoBase64));

  const canGenerate =
    hasPhoto && selectedProduct !== undefined && tryOnState.phase !== "generating";

  const isGenerating = tryOnState.phase === "generating";

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div id="gvrze-tryon-studio">
      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(",")}
        className="sr-only"
        aria-label="Upload your photo for try-on"
        onChange={handleFileChange}
      />

      {/* privacy consent overlay */}
      {showConsent ? (
        <ConsentOverlay onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
      ) : null}

      {/* ── top bar ── */}
      <header className="tryon-topbar">
        <Link to="/geostore" className="tryon-topbar__back" aria-label="Back to Gstore">
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          <span>Gstore</span>
        </Link>
        <span className="tryon-topbar__title">Try-On Studio</span>
        <span className="tryon-topbar__badge">AI-powered</span>
      </header>

      {/* ── three-panel workspace ── */}
      <main className="tryon-workspace" aria-label="Try-On Studio workspace">

        {/* ── LEFT: catalogue ── */}
        <aside className="tryon-catalogue" aria-label="Product catalogue">
          <div className="tryon-catalogue__header">
            <p className="tryon-catalogue__heading">Select garment</p>
            <div className="tryon-catalogue__filters" role="group" aria-label="Category filter">
              <button
                type="button"
                className="tryon-catalogue__filter"
                aria-pressed={categoryFilter === "all"}
                onClick={() => handleCategoryFilter("all")}
              >
                All
              </button>
              {(Object.keys(TRY_ON_CATEGORY_LABELS) as TryOnCategoryId[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="tryon-catalogue__filter"
                  aria-pressed={categoryFilter === cat}
                  onClick={() => handleCategoryFilter(cat)}
                >
                  {TRY_ON_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <ul className="tryon-catalogue__list" aria-label="Eligible garments">
            {filteredProducts.map((product, idx) => {
              const img = productImageForSlug(product.slug);
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    className="tryon-catalogue__item"
                    aria-selected={idx === selectedProductIdx}
                    onClick={() => handleSelectProduct(idx)}
                  >
                    <img
                      src={img?.src ?? ""}
                      alt={img?.alt ?? product.name}
                      className="tryon-catalogue__item-img"
                      width={56}
                      height={64}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="tryon-catalogue__item-info">
                      <span className="tryon-catalogue__item-tag">
                        {TRY_ON_CATEGORY_LABELS[product.category as TryOnCategoryId] ??
                          product.category}
                      </span>
                      <span className="tryon-catalogue__item-name">{product.name}</span>
                      <span className="tryon-catalogue__item-price">
                        {formatTryOnPrice(product)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── CENTRE: preview ── */}
        <section
          className="tryon-preview"
          aria-label="Try-on preview"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="tryon-preview__stage">
            {/* generating overlay */}
            {isGenerating ? (
              <div className="tryon-preview__loading" aria-live="polite" aria-label="Generating try-on">
                <div className="tryon-spinner" aria-hidden="true" />
                <p className="tryon-preview__loading-title">Generating your look…</p>
                <p className="tryon-preview__loading-body">
                  Our AI is fitting the garment to your photo.
                  <br />
                  This usually takes 10–30 seconds.
                </p>
              </div>
            ) : null}

            {/* result view */}
            {tryOnState.phase === "result" ? (
              <div className="tryon-preview__result">
                <div className="tryon-preview__result-img-wrap">
                  <img
                    src={tryOnState.resultUrl}
                    alt={`Virtual try-on result: ${selectedProduct?.name ?? "garment"}`}
                    className="tryon-preview__result-img"
                  />
                </div>
              </div>
            ) : null}

            {/* split view: user photo + product (ready / idle) */}
            {(tryOnState.phase === "ready" ||
              tryOnState.phase === "idle" ||
              (tryOnState.phase === "error" && tryOnState.userPhotoBase64)) &&
            !isGenerating ? (
              <div className="tryon-preview__split">
                {/* user photo */}
                <div className="tryon-preview__frame">
                  <span className="tryon-preview__frame-label">Your photo</span>
                  <div className="tryon-preview__frame-img-wrap">
                    {hasPhoto && "userPhotoUrl" in tryOnState && tryOnState.userPhotoUrl ? (
                      <img
                        src={tryOnState.userPhotoUrl}
                        alt="Your uploaded photo"
                        className="tryon-preview__frame-img"
                      />
                    ) : (
                      <div
                        className="tryon-preview__frame-placeholder"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}
                        aria-hidden
                      >
                        <Upload size={32} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </div>

                {/* product flat */}
                <div className="tryon-preview__frame">
                  <span className="tryon-preview__frame-label">
                    {selectedProduct?.name ?? "Select a product"}
                  </span>
                  <div className="tryon-preview__frame-img-wrap">
                    {selectedProduct ? (
                      <ProductImage product={selectedProduct} />
                    ) : (
                      <div
                        className="tryon-preview__frame-placeholder"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}
                        aria-hidden
                      >
                        <Eye size={32} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* empty / upload prompt (truly idle — no photo) */}
            {tryOnState.phase === "idle" && !hasPhoto ? (
              <div className="tryon-preview__empty">
                <div className="tryon-preview__empty-icon" aria-hidden>
                  <Sparkles size={28} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="tryon-preview__empty-title">Upload your photo</p>
                  <p className="tryon-preview__empty-body">
                    Select a garment from the left, then upload a photo of yourself to see
                    how it looks with our AI Try-On engine.
                    <br />
                    <br />
                    Drop an image here or click the button below.
                  </p>
                </div>
                <button type="button" className="tryon-upload-btn" onClick={handleUploadClick}>
                  <Upload size={16} strokeWidth={2} aria-hidden />
                  Upload photo
                </button>
              </div>
            ) : null}

            {/* error state */}
            {tryOnState.phase === "error" ? (
              <div className="tryon-error-banner" role="alert">
                <X size={16} strokeWidth={2} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{tryOnState.message}</span>
              </div>
            ) : null}

            {/* navigation arrows (previous / next product) */}
            {filteredProducts.length > 1 ? (
              <>
                <div className="tryon-preview__nav tryon-preview__nav--prev">
                  <button
                    type="button"
                    className="tryon-preview__nav-btn"
                    aria-label="Previous garment"
                    disabled={selectedProductIdx === 0 || isGenerating}
                    onClick={() => handleSelectProduct(selectedProductIdx - 1)}
                  >
                    <ChevronLeft size={20} strokeWidth={2} aria-hidden />
                  </button>
                </div>
                <div className="tryon-preview__nav tryon-preview__nav--next">
                  <button
                    type="button"
                    className="tryon-preview__nav-btn"
                    aria-label="Next garment"
                    disabled={selectedProductIdx >= filteredProducts.length - 1 || isGenerating}
                    onClick={() => handleSelectProduct(selectedProductIdx + 1)}
                  >
                    <ChevronRight size={20} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </>
            ) : null}
          </div>

          {/* action bar */}
          <div className="tryon-preview__actions">
            {!hasPhoto ? (
              <button type="button" className="tryon-upload-btn" onClick={handleUploadClick}>
                <Upload size={16} strokeWidth={2} aria-hidden />
                Upload your photo
              </button>
            ) : null}

            {hasPhoto && tryOnState.phase !== "result" ? (
              <>
                <button
                  type="button"
                  className="tryon-upload-btn"
                  onClick={handleUploadClick}
                  disabled={isGenerating}
                  aria-label="Change your photo"
                >
                  <RefreshCw size={15} strokeWidth={2} aria-hidden />
                  Change photo
                </button>
                <button
                  type="button"
                  className="tryon-generate-btn"
                  disabled={!canGenerate}
                  onClick={() => void handleGenerate()}
                  aria-label="Generate virtual try-on"
                >
                  <Sparkles size={16} strokeWidth={2} aria-hidden />
                  {isGenerating ? "Generating…" : "Try it on"}
                </button>
              </>
            ) : null}

            {tryOnState.phase === "result" ? (
              <>
                <button
                  type="button"
                  className="tryon-reset-btn"
                  onClick={handleReset}
                  aria-label="Reset try-on session"
                >
                  <RefreshCw size={14} strokeWidth={2} aria-hidden />
                  Reset
                </button>
                <button
                  type="button"
                  className="tryon-generate-btn"
                  disabled={!canGenerate}
                  onClick={() => void handleGenerate()}
                  aria-label="Regenerate try-on"
                >
                  <Sparkles size={16} strokeWidth={2} aria-hidden />
                  Regenerate
                </button>
              </>
            ) : null}
          </div>
        </section>

        {/* ── RIGHT: controls ── */}
        <aside className="tryon-controls" aria-label="Product controls and actions">

          {/* selected product info */}
          {selectedProduct ? (
            <div className="tryon-controls__section">
              <p className="tryon-controls__label">Selected garment</p>
              <span className="tryon-controls__product-category">
                {TRY_ON_CATEGORY_LABELS[selectedProduct.category as TryOnCategoryId] ??
                  selectedProduct.category}
              </span>
              <p className="tryon-controls__product-name">{selectedProduct.name}</p>
              <p className="tryon-controls__product-price">{formatTryOnPrice(selectedProduct)}</p>
            </div>
          ) : (
            <div className="tryon-controls__section">
              <p className="tryon-controls__label">Selected garment</p>
              <p style={{ fontSize: 13, color: "#aaa" }}>No product selected yet.</p>
            </div>
          )}

          <hr className="tryon-controls__divider" />

          {/* view toggle */}
          <div className="tryon-controls__section">
            <p className="tryon-controls__label">View</p>
            <div className="tryon-view-toggle" role="group" aria-label="Garment view">
              <button
                type="button"
                className="tryon-view-toggle__btn"
                aria-pressed={view === "front"}
                onClick={() => setView("front")}
              >
                Front
              </button>
              <button
                type="button"
                className="tryon-view-toggle__btn"
                aria-pressed={view === "back"}
                onClick={() => setView("back")}
              >
                Back
              </button>
            </div>
          </div>

          {/* colour swatches */}
          {colourOption ? (
            <div className="tryon-controls__section">
              <p className="tryon-controls__label">
                Colour — <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{selectedColour}</span>
              </p>
              <div className="tryon-swatches" role="group" aria-label="Colour selection">
                {colourOption.values.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="tryon-swatch"
                    style={{ background: SWATCH_COLOURS[c] ?? "#888" }}
                    aria-pressed={selectedColour === c}
                    aria-label={c}
                    title={c}
                    onClick={() => setSelectedColour(c)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* size */}
          {sizeOption ? (
            <div className="tryon-controls__section">
              <p className="tryon-controls__label">Size</p>
              <div className="tryon-sizes" role="group" aria-label="Size selection">
                {sizeOption.values.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className="tryon-size-btn"
                    aria-pressed={selectedSize === sz}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <hr className="tryon-controls__divider" />

          {/* add to bag / buy now */}
          <div className="tryon-controls__section">
            <p className="tryon-controls__label">Add to your order</p>
            <div className="tryon-controls__cta-row">
              <button
                type="button"
                className="tryon-cta-primary"
                disabled={!selectedProduct}
                onClick={handleAddToBag}
                aria-label={`Add ${selectedProduct?.name ?? "product"} to bag`}
              >
                <ShoppingBag size={16} strokeWidth={2} aria-hidden />
                Add to Bag
              </button>
              <button
                type="button"
                className="tryon-cta-secondary"
                disabled={!selectedProduct}
                onClick={handleBuyNow}
                aria-label={`Buy ${selectedProduct?.name ?? "product"} now`}
              >
                <Zap size={16} strokeWidth={2} aria-hidden />
                Buy Now
              </button>
            </div>
          </div>

          {/* result actions */}
          {tryOnState.phase === "result" ? (
            <>
              <hr className="tryon-controls__divider" />
              <div className="tryon-controls__section">
                <p className="tryon-controls__label">Your result</p>
                <div className="tryon-result-actions">
                  <button
                    type="button"
                    className="tryon-result-action"
                    onClick={handleDownload}
                    aria-label="Download try-on result"
                  >
                    <Download size={15} strokeWidth={2} aria-hidden />
                    Download result
                  </button>
                  <Link
                    to="/geostore/product/$slug"
                    params={{ slug: selectedProduct?.slug ?? "" }}
                    className="tryon-result-action"
                    style={{ textDecoration: "none" }}
                    aria-label={`View full product page for ${selectedProduct?.name ?? ""}`}
                  >
                    <ArrowRight size={15} strokeWidth={2} aria-hidden />
                    View product page
                  </Link>
                </div>
              </div>
            </>
          ) : null}

          <hr className="tryon-controls__divider" />

          <p className="tryon-privacy-note">
            Photos are processed securely and never stored permanently without your consent.{" "}
            <Link to="/geostore" style={{ color: "inherit", textDecoration: "underline" }}>
              Privacy info
            </Link>
          </p>
        </aside>
      </main>
    </div>
  );
}

// ─── tiny helper: product image in centre panel ───────────────────────────────

function ProductImage({ product }: { product: { slug: string; name: string } }) {
  const img = productImageForSlug(product.slug);

  if (!img?.src) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ccc",
        }}
        aria-hidden
      >
        <Eye size={32} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={img.src}
      alt={img.alt}
      className="tryon-preview__frame-img"
      width={320}
      height={427}
      loading="lazy"
      decoding="async"
    />
  );
}
