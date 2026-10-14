import recalculatingBlack from "@/assets/geostore/tshirt-gvrze-recalculating-black.jpg";
import recalculatingBlue from "@/assets/geostore/tshirt-gvrze-recalculating-blue.jpg";
import recalculatingBurgundy from "@/assets/geostore/tshirt-gvrze-recalculating-burgundy.jpg";
import recalculatingOlive from "@/assets/geostore/tshirt-gvrze-recalculating-olive-green.jpg";
import recalculatingOffWhite from "@/assets/geostore/tshirt-gvrze-recalculating-off-white.jpg";
import gpsBlack from "@/assets/geostore/tshirt-gvrze-gps-trust-issues-black.jpg";
import gpsBlue from "@/assets/geostore/tshirt-gvrze-gps-trust-issues-blue.jpg";
import gpsBurgundy from "@/assets/geostore/tshirt-gvrze-gps-trust-issues-burgundy.jpg";
import gpsOlive from "@/assets/geostore/tshirt-gvrze-gps-trust-issues-olive-green.jpg";
import gpsOffWhite from "@/assets/geostore/tshirt-gvrze-gps-trust-issues-off-white.jpg";

export type ApparelColorVariant = {
  id: string;
  label: string;
  hex: string;
  image: string;
};

export type ApparelMerchSpec = {
  title: string;
  breadcrumb: string;
  description: string;
  printLine: string;
  colors: ApparelColorVariant[];
};

const SWATCH = {
  black: "#111111",
  blue: "#2d4a6e",
  burgundy: "#6b1f2a",
  olive: "#4a5240",
  offwhite: "#e8e4dc",
} as const;

function fiveColors(
  black: string,
  blue: string,
  burgundy: string,
  olive: string,
  offwhite: string,
): ApparelColorVariant[] {
  return [
    { id: "black", label: "Black", hex: SWATCH.black, image: black },
    { id: "blue", label: "Blue", hex: SWATCH.blue, image: blue },
    { id: "burgundy", label: "Burgundy", hex: SWATCH.burgundy, image: burgundy },
    { id: "olive", label: "Olive Green", hex: SWATCH.olive, image: olive },
    { id: "offwhite", label: "Off White", hex: SWATCH.offwhite, image: offwhite },
  ];
}

export const APPAREL_MERCH_SPECS: Record<string, ApparelMerchSpec> = {
  "tshirt-recalculating": {
    title: "Recalculating Since 2024.",
    breadcrumb: "Recalculating Since 2024.",
    description:
      "A GVRZE tee built around the idea of recalculating your route, featuring a navigation-inspired graphic on the back.",
    printLine: "RECALCULATING SINCE 2024.",
    colors: fiveColors(
      recalculatingBlack,
      recalculatingBlue,
      recalculatingBurgundy,
      recalculatingOlive,
      recalculatingOffWhite,
    ),
  },
  "tshirt-gps-trust-issues": {
    title: "Your GPS Has Trust Issues.",
    breadcrumb: "Your GPS Has Trust Issues.",
    description:
      "A GVRZE tee for questionable directions, featuring a navigation-inspired graphic built around getting lost.",
    printLine: "YOUR GPS HAS TRUST ISSUES.",
    colors: fiveColors(gpsBlack, gpsBlue, gpsBurgundy, gpsOlive, gpsOffWhite),
  },
};
