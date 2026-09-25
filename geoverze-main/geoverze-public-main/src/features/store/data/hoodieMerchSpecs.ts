import everyPointBlack from "@/assets/geostore/hoodie-every-point-has-a-story-black.png";
import everyPointWhite from "@/assets/geostore/hoodie-every-point-has-a-story-white.png";
import everyPointPink from "@/assets/geostore/hoodie-every-point-has-a-story-pink.png";
import everyPointBurgundy from "@/assets/geostore/hoodie-every-point-has-a-story-burgundy.png";
import everyPointBrown from "@/assets/geostore/hoodie-every-point-has-a-story-brown.png";
import doodleBlack from "@/assets/geostore/hoodie-doodle-black.png";
import doodleWhite from "@/assets/geostore/hoodie-doodle-white.png";
import doodlePink from "@/assets/geostore/hoodie-doodle-pink.png";
import doodleBurgundy from "@/assets/geostore/hoodie-doodle-burgundy.png";
import doodleBrown from "@/assets/geostore/hoodie-doodle-brown.png";
import typoBlack from "@/assets/geostore/hoodie-geoverze-typo-black.png";
import typoWhite from "@/assets/geostore/hoodie-geoverze-typo-white.png";
import typoPink from "@/assets/geostore/hoodie-geoverze-typo-pink.png";
import typoBurgundy from "@/assets/geostore/hoodie-geoverze-typo-burgundy.png";
import typoBrown from "@/assets/geostore/hoodie-geoverze-typo-brown.png";
import samePlanetBlack from "@/assets/geostore/hoodie-same-planet-black.png";
import samePlanetWhite from "@/assets/geostore/hoodie-same-planet-white.png";
import samePlanetPink from "@/assets/geostore/hoodie-same-planet-pink.png";
import samePlanetBurgundy from "@/assets/geostore/hoodie-same-planet-burgundy.png";
import samePlanetBrown from "@/assets/geostore/hoodie-same-planet-brown.png";
import unfilteredBlack from "@/assets/geostore/hoodie-world-unfiltered-black.png";
import unfilteredWhite from "@/assets/geostore/hoodie-world-unfiltered-white.png";
import unfilteredPink from "@/assets/geostore/hoodie-world-unfiltered-pink.png";
import unfilteredBurgundy from "@/assets/geostore/hoodie-world-unfiltered-burgundy.png";
import unfilteredBrown from "@/assets/geostore/hoodie-world-unfiltered-brown.png";

export type HoodieColorVariant = {
  id: string;
  label: string;
  hex: string;
  /** Bundled photo for this design’s colourway. Null until that asset exists. */
  image: string | null;
};

export type HoodieMerchSpec = {
  title: string;
  breadcrumb: string;
  description: string;
  printLine: string;
  colors: HoodieColorVariant[];
};

export function hoodieColorsWithImages(
  colors: readonly HoodieColorVariant[],
): HoodieColorVariant[] {
  return colors.filter((color): color is HoodieColorVariant & { image: string } =>
    Boolean(color.image),
  );
}

function hoodiePalette(images: {
  white: string;
  pink: string;
  burgundy: string;
  brown: string;
  black: string;
}): HoodieColorVariant[] {
  return [
    { id: "white", label: "White", hex: "#efe6d4", image: images.white },
    { id: "pink", label: "Pink", hex: "#f0c4c8", image: images.pink },
    { id: "burgundy", label: "Burgundy", hex: "#6a1c2c", image: images.burgundy },
    { id: "brown", label: "Brown", hex: "#4a2e22", image: images.brown },
    { id: "black", label: "Black", hex: "#141414", image: images.black },
  ];
}

export const HOODIE_MERCH_SPECS: Record<string, HoodieMerchSpec> = {
  "hoodie-every-point-has-a-story": {
    title: "Every Point Has A Story",
    breadcrumb: "Every Point Has A Story",
    description:
      "A GEOverze hoodie built around the idea that every point on the map carries a story.",
    printLine: "EVERY POINT HAS A STORY",
    colors: [
      { id: "white", label: "White", hex: "#efe6d4", image: everyPointWhite },
      { id: "pink", label: "Pink", hex: "#f0c4c8", image: everyPointPink },
      { id: "burgundy", label: "Burgundy", hex: "#6a1c2c", image: everyPointBurgundy },
      { id: "brown", label: "Brown", hex: "#4a2e22", image: everyPointBrown },
      { id: "black", label: "Black", hex: "#141414", image: everyPointBlack },
    ],
  },
  "hoodie-doodle": {
    title: "GEOverze Doodle",
    breadcrumb: "GEOverze Doodle",
    description: "A GEOverze hoodie with a loose doodle-style graphic across the garment.",
    printLine: "GEOVERZE DOODLE",
    colors: hoodiePalette({
      white: doodleWhite,
      pink: doodlePink,
      burgundy: doodleBurgundy,
      brown: doodleBrown,
      black: doodleBlack,
    }),
  },
  "hoodie-geoverze-typo": {
    title: "GEOverze",
    breadcrumb: "GEOverze",
    description: "A GEOverze hoodie with a typographic wordmark as the main graphic.",
    printLine: "GEOVERZE",
    colors: hoodiePalette({
      white: typoWhite,
      pink: typoPink,
      burgundy: typoBurgundy,
      brown: typoBrown,
      black: typoBlack,
    }),
  },
  "hoodie-same-planet": {
    title: "Same Planet. Different Perspectives.",
    breadcrumb: "Same Planet. Different Perspectives.",
    description: "A GEOverze hoodie about sharing one planet from different viewpoints.",
    printLine: "SAME PLANET. DIFFERENT PERSPECTIVES.",
    colors: hoodiePalette({
      white: samePlanetWhite,
      pink: samePlanetPink,
      burgundy: samePlanetBurgundy,
      brown: samePlanetBrown,
      black: samePlanetBlack,
    }),
  },
  "hoodie-world-unfiltered": {
    title: "The World, Unfiltered.",
    breadcrumb: "The World, Unfiltered.",
    description: "A GEOverze hoodie with a straightforward, unfiltered world graphic.",
    printLine: "THE WORLD, UNFILTERED.",
    colors: hoodiePalette({
      white: unfilteredWhite,
      pink: unfilteredPink,
      burgundy: unfilteredBurgundy,
      brown: unfilteredBrown,
      black: unfilteredBlack,
    }),
  },
};
