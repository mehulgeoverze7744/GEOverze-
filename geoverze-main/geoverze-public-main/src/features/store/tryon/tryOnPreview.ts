/**
 * Try-On preview resolver — side-by-side studio model plates.
 *
 * Product-specific on-model photographs win when they show this same model.
 * Otherwise garment artwork is composited onto the supplied plates through
 * shirt-shaped masks. Rectangular product photos are never stretched across
 * the body. Phase 2 personal-photo try-on can reuse these garment records.
 */
import { APPAREL_MERCH_SPECS } from "../data/apparelMerchSpecs";

import { tryOnColorById, type TryOnColor, type TryOnGarment } from "./tryOnProducts";

export const GVRZE_MODEL_FRONT = "/assets/gvrze-tryon/gvrze-model-front.jpg";
export const GVRZE_MODEL_BACK = "/assets/gvrze-tryon/gvrze-model-back.jpg";
export const GVRZE_MODEL_FRONT_MASK = "/assets/gvrze-tryon/gvrze-model-front-shirt-mask.png";
export const GVRZE_MODEL_BACK_MASK = "/assets/gvrze-tryon/gvrze-model-back-shirt-mask.png";

export type ModelView = "front" | "back";
export type GarmentLayout = "single" | "diptych";
export type ArtMode = "none" | "print-transfer" | "print-stamp" | "garment-photo";
export type PrintPlacement = "chest-logo" | "back-graphic" | "front-graphic" | "none";

export type OnModelMockup = {
  front: string;
  back: string;
};

const ON_MODEL_MOCKUPS: Record<string, Record<string, OnModelMockup>> = {};

/** Which view the signature catalogue photo actually shows. */
const SIGNATURE_PHOTO_VIEW: Record<string, ModelView> = {
  "midnight-black-tshirt": "back",
  "cherry-blossom-tshirt": "back",
  "golden-arc-tshirt": "front",
  "new-age-tshirt": "back",
};

const SIGNATURE_PRINT: Record<string, string> = {
  "midnight-black-tshirt": "/assets/gvrze-tryon/midnight-black-back-print.webp",
  "cherry-blossom-tshirt": "/assets/gvrze-tryon/cherry-blossom-back-print.webp",
  "golden-arc-tshirt": "/assets/gvrze-tryon/golden-arc-front-print.webp",
  "new-age-tshirt": "/assets/gvrze-tryon/new-age-back-print.webp",
};

const SIGNATURE_DYE: Record<string, string> = {
  "midnight-black-tshirt": "#111111",
  "cherry-blossom-tshirt": "#c45b7a",
  "golden-arc-tshirt": "#d4b08c",
  "new-age-tshirt": "#6b1a32",
};

export function getOnModelMockup(slug: string, colorId: string): OnModelMockup | undefined {
  const byColor = ON_MODEL_MOCKUPS[slug];
  if (!byColor) return undefined;
  return byColor[colorId] ?? byColor["*"];
}

export function isApparelDiptych(slug: string): boolean {
  return Boolean(APPAREL_MERCH_SPECS[slug]);
}

export type TryOnModelSlot = {
  view: ModelView;
  modelSrc: string;
  modelAlt: string;
  maskSrc: string;
  shirtHex: string | null;
  artSrc: string;
  artAlt: string;
  artLayout: GarmentLayout;
  artMode: ArtMode;
  placement: PrintPlacement;
  lightShirt: boolean;
  hasArtwork: boolean;
  unavailableLabel: string | null;
};

export type TryOnPairPreview = {
  front: TryOnModelSlot;
  back: TryOnModelSlot;
};

function garmentLayoutFor(garment: TryOnGarment, color: TryOnColor): GarmentLayout {
  if (color.layout) return color.layout;
  if (isApparelDiptych(garment.slug)) return "diptych";
  return "single";
}

function isLightHex(hex: string): boolean {
  const raw = hex.replace("#", "");
  if (raw.length < 6) return false;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
}

function emptySlot(view: ModelView, garment: TryOnGarment, colorLabel: string): TryOnModelSlot {
  return {
    view,
    modelSrc: view === "back" ? GVRZE_MODEL_BACK : GVRZE_MODEL_FRONT,
    modelAlt: `GVRZE studio model, ${view} view`,
    maskSrc: view === "back" ? GVRZE_MODEL_BACK_MASK : GVRZE_MODEL_FRONT_MASK,
    shirtHex: null,
    artSrc: "",
    artAlt: `${garment.name}${colorLabel ? `, ${colorLabel}` : ""}`,
    artLayout: "single",
    artMode: "none",
    placement: "none",
    lightShirt: false,
    hasArtwork: false,
    unavailableLabel: `${view === "back" ? "Back" : "Front"} mockup is not available for this design.`,
  };
}

function onModelSlot(
  view: ModelView,
  garment: TryOnGarment,
  colorLabel: string,
  src: string,
): TryOnModelSlot {
  return {
    view,
    modelSrc: src,
    modelAlt: `${garment.name}${colorLabel ? `, ${colorLabel}` : ""} on the GVRZE studio model, ${view} view`,
    maskSrc: view === "back" ? GVRZE_MODEL_BACK_MASK : GVRZE_MODEL_FRONT_MASK,
    shirtHex: null,
    artSrc: src,
    artAlt: `${garment.name}${colorLabel ? `, ${colorLabel}` : ""}, ${view} view`,
    artLayout: "single",
    artMode: "none",
    placement: "none",
    lightShirt: false,
    hasArtwork: true,
    unavailableLabel: null,
  };
}

export function resolveTryOnPair(garment: TryOnGarment, colorId: string): TryOnPairPreview {
  const color = tryOnColorById(garment, colorId);
  const colorLabel = color?.label ?? "";
  const layout = color ? garmentLayoutFor(garment, color) : "single";
  const shirtHex = color?.hex ?? SIGNATURE_DYE[garment.slug] ?? "#111111";

  const onModel = getOnModelMockup(garment.slug, colorId);
  if (onModel) {
    return {
      front: onModelSlot("front", garment, colorLabel, onModel.front),
      back: onModelSlot("back", garment, colorLabel, onModel.back),
    };
  }

  if (garment.category !== "tshirts") {
    const src = color?.image ?? "";
    const slot = (view: ModelView): TryOnModelSlot => ({
      ...emptySlot(view, garment, colorLabel),
      modelSrc: src,
      modelAlt: `${garment.name}${colorLabel ? `, ${colorLabel}` : ""}`,
      artSrc: src,
      hasArtwork: Boolean(src),
      unavailableLabel: src
        ? "On-model preview is coming soon for this category."
        : emptySlot(view, garment, colorLabel).unavailableLabel,
    });
    return { front: slot("front"), back: slot("back") };
  }

  const make = (view: ModelView, hasArt: boolean, placement: PrintPlacement): TryOnModelSlot => {
    const printSrc = SIGNATURE_PRINT[garment.slug] ?? color?.image ?? "";
    if (!hasArt || !printSrc) return emptySlot(view, garment, colorLabel);
    return {
      view,
      modelSrc: view === "back" ? GVRZE_MODEL_BACK : GVRZE_MODEL_FRONT,
      modelAlt: `${garment.name}${colorLabel ? `, ${colorLabel}` : ""} on the GVRZE studio model, ${view} view`,
      maskSrc: view === "back" ? GVRZE_MODEL_BACK_MASK : GVRZE_MODEL_FRONT_MASK,
      shirtHex,
      artSrc: printSrc,
      artAlt: `${garment.name}${colorLabel ? `, ${colorLabel}` : ""}, ${view} design`,
      artLayout: layout,
      artMode: layout === "diptych" ? "print-transfer" : "garment-photo",
      placement,
      lightShirt: isLightHex(shirtHex),
      hasArtwork: true,
      unavailableLabel: null,
    };
  };

  if (isApparelDiptych(garment.slug) || layout === "diptych") {
    const stamp = (view: ModelView, placement: PrintPlacement): TryOnModelSlot => {
      const artSrc = `/assets/gvrze-tryon/prints/${garment.slug}-${colorId}-${view}.png`;
      return {
        ...make(view, true, placement),
        artSrc,
        artLayout: "single",
        artMode: "print-stamp",
      };
    };
    return {
      front: stamp("front", "chest-logo"),
      back: stamp("back", "back-graphic"),
    };
  }

  const photoView = SIGNATURE_PHOTO_VIEW[garment.slug];
  const frontHasPrint = photoView === "front";
  const backHasPrint = photoView === "back";
  return {
    front: frontHasPrint
      ? make("front", true, "front-graphic")
      : { ...make("front", true, "chest-logo"), artMode: "none", hasArtwork: false, unavailableLabel: null },
    back: backHasPrint
      ? make("back", true, "back-graphic")
      : { ...make("back", true, "chest-logo"), artMode: "none", hasArtwork: false, unavailableLabel: null },
  };
}
