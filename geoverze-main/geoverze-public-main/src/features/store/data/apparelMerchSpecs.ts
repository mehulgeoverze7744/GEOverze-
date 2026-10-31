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
import bornBlack from "@/assets/geostore/tshirt-gvrze-born-to-roam-black.jpg";
import bornBlue from "@/assets/geostore/tshirt-gvrze-born-to-roam-blue.jpg";
import bornBurgundy from "@/assets/geostore/tshirt-gvrze-born-to-roam-burgundy.jpg";
import bornOlive from "@/assets/geostore/tshirt-gvrze-born-to-roam-olive-green.jpg";
import bornOffWhite from "@/assets/geostore/tshirt-gvrze-born-to-roam-off-white.jpg";
import capitalBlack from "@/assets/geostore/tshirt-gvrze-know-the-capital-black.jpg";
import capitalBlue from "@/assets/geostore/tshirt-gvrze-know-the-capital-blue.jpg";
import capitalBurgundy from "@/assets/geostore/tshirt-gvrze-know-the-capital-burgundy.jpg";
import capitalOlive from "@/assets/geostore/tshirt-gvrze-know-the-capital-olive-green.jpg";
import capitalOffWhite from "@/assets/geostore/tshirt-gvrze-know-the-capital-off-white.jpg";
import tooCloseBlack from "@/assets/geostore/tshirt-gvrze-too-close-perfect-black.jpg";
import tooCloseBlue from "@/assets/geostore/tshirt-gvrze-too-close-perfect-blue.jpg";
import tooCloseBurgundy from "@/assets/geostore/tshirt-gvrze-too-close-perfect-burgundy.jpg";
import tooCloseOlive from "@/assets/geostore/tshirt-gvrze-too-close-perfect-olive-green.jpg";
import tooCloseOffWhite from "@/assets/geostore/tshirt-gvrze-too-close-perfect-off-white.jpg";

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
  "tshirt-born-to-roam": {
    title: "0% Local. 100% Global. Born To Roam.",
    breadcrumb: "Born To Roam.",
    description:
      "For explorers who treat every border as an invitation. The Born To Roam tee is built from 100% premium cotton and printed with GVRZE's boldest declaration yet.",
    printLine: "0% LOCAL. 100% GLOBAL. BORN TO ROAM.",
    colors: fiveColors(bornBlack, bornBlue, bornBurgundy, bornOlive, bornOffWhite),
  },
  "tshirt-know-the-capital": {
    title: "I Know The Capital. You Know The Vibes.",
    breadcrumb: "Know The Capital.",
    description:
      "Capital cities, confident energy. This GVRZE tee is for those who know the difference between geography and guesswork.",
    printLine: "I KNOW THE CAPITAL. YOU KNOW THE VIBES.",
    colors: fiveColors(capitalBlack, capitalBlue, capitalBurgundy, capitalOlive, capitalOffWhite),
  },
  "tshirt-too-close-perfect": {
    title: "Too Close? Perfect.",
    breadcrumb: "Too Close? Perfect.",
    description:
      "Radar-close detail for map obsessives. A GVRZE tee that leans into precision, featuring a radar-inspired graphic and a one-line statement for explorers who get it.",
    printLine: "TOO CLOSE? PERFECT.",
    colors: fiveColors(tooCloseBlack, tooCloseBlue, tooCloseBurgundy, tooCloseOlive, tooCloseOffWhite),
  },
};
