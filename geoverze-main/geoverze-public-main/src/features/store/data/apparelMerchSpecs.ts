import recalculatingBlack from "@/assets/geostore/tshirt-recalculating-black.jpg";
import recalculatingBlue from "@/assets/geostore/tshirt-recalculating-blue.png";
import recalculatingBurgundy from "@/assets/geostore/tshirt-recalculating-burgundy.png";
import recalculatingOlive from "@/assets/geostore/tshirt-recalculating-olive-green.png";
import recalculatingOffWhite from "@/assets/geostore/tshirt-recalculating-off-white.png";
import gpsBlack from "@/assets/geostore/tshirt-gps-trust-issues-black.jpg";
import gpsBlue from "@/assets/geostore/tshirt-gps-trust-issues-blue.png";
import gpsBurgundy from "@/assets/geostore/tshirt-gps-trust-issues-burgundy.png";
import gpsOlive from "@/assets/geostore/tshirt-gps-trust-issues-olive-green.png";
import gpsOffWhite from "@/assets/geostore/tshirt-gps-trust-issues-off-white.png";

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
      "A GEOverze tee built around the idea of recalculating your route, featuring a navigation-inspired graphic on the back.",
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
      "A GEOverze tee for questionable directions, featuring a navigation-inspired graphic built around getting lost.",
    printLine: "YOUR GPS HAS TRUST ISSUES.",
    colors: fiveColors(gpsBlack, gpsBlue, gpsBurgundy, gpsOlive, gpsOffWhite),
  },
};
