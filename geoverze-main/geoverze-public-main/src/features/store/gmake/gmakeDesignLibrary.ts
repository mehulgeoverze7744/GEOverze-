import { getProductPrice } from "../lib/gstoreProductPrices";

import { GMAKE_ASSETS, GMAKE_PRINTS } from "./gmake-assets";

export type GmakeDesignPlacement = "chest-logo" | "back-graphic" | "front-graphic";

export type GmakeLibraryDesign = {
  id: string;
  name: string;
  thumb: string;
  art: string;
  placement: GmakeDesignPlacement;
  /** Optional catalog slug — when present, its price is added to the total. */
  priceSlug?: string;
};

/**
 * GVRZE artwork shown in the Try-On Design Library.
 * Thumbnails are real wordmark / print assets already on the site.
 */
export const GMAKE_DESIGN_LIBRARY: readonly GmakeLibraryDesign[] = [
  {
    id: "gvrze-wordmark",
    name: "Logo Design",
    thumb: GMAKE_ASSETS.wordmark,
    art: GMAKE_ASSETS.wordmark,
    placement: "chest-logo",
  },
  {
    id: "cherry-blossom-tshirt",
    name: "Cherry Blossom",
    thumb: GMAKE_PRINTS["cherry-blossom-tshirt"],
    art: GMAKE_PRINTS["cherry-blossom-tshirt"],
    placement: "back-graphic",
  },
  {
    id: "midnight-black-tshirt",
    name: "Midnight Black",
    thumb: GMAKE_PRINTS["midnight-black-tshirt"],
    art: GMAKE_PRINTS["midnight-black-tshirt"],
    placement: "back-graphic",
  },
  {
    id: "golden-arc-tshirt",
    name: "Golden Arc",
    thumb: GMAKE_PRINTS["golden-arc-tshirt"],
    art: GMAKE_PRINTS["golden-arc-tshirt"],
    placement: "front-graphic",
  },
  {
    id: "new-age-tshirt",
    name: "New Age",
    thumb: GMAKE_PRINTS["new-age-tshirt"],
    art: GMAKE_PRINTS["new-age-tshirt"],
    placement: "back-graphic",
  },
];

export function designPriceMinor(design: GmakeLibraryDesign | null): number {
  if (!design?.priceSlug) return 0;
  return getProductPrice(design.priceSlug)?.priceMinor ?? 0;
}

export function libraryDesignById(id: string | null): GmakeLibraryDesign | undefined {
  if (!id) return undefined;
  return GMAKE_DESIGN_LIBRARY.find((item) => item.id === id);
}

/** Figma mockups (front|back diptych unless noted) keyed by colour id. */
export const GMAKE_COLOR_MOCKUPS: Record<
  string,
  { src: string; layout: "diptych" | "single" }
> = {
  cream: { src: GMAKE_ASSETS.creamTee, layout: "single" },
  "midnight-black": { src: GMAKE_ASSETS.blackTee, layout: "diptych" },
  black: { src: GMAKE_ASSETS.blackTee, layout: "diptych" },
  "cherry-blossom-pink": { src: GMAKE_ASSETS.creamPrinted, layout: "diptych" },
  mulberry: { src: GMAKE_ASSETS.maroonTee, layout: "diptych" },
  "rose-wine-burgundy": { src: GMAKE_ASSETS.maroonTee, layout: "diptych" },
};

export const GMAKE_CREAM_COLOR = {
  id: "cream",
  label: "Cream",
  hex: "#E8DCC8",
  image: GMAKE_ASSETS.creamTee,
} as const;
