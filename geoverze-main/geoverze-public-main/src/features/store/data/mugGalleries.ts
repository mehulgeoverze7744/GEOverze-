import celestialMeridianMug from "@/assets/geostore/celestial-meridian-mug.jpg";
import celestialMeridianMugBack from "@/assets/geostore/celestial-meridian-mug-back.jpg";
import celestialMeridianMugHandle from "@/assets/geostore/celestial-meridian-mug-handle.jpg";
import celestialMeridianMugLeft from "@/assets/geostore/celestial-meridian-mug-left.jpg";
import celestialMeridianMugRight from "@/assets/geostore/celestial-meridian-mug-right.jpg";
import goldenAtlasMug from "@/assets/geostore/golden-atlas-mug.jpg";
import goldenAtlasMugBack from "@/assets/geostore/golden-atlas-mug-back.jpg";
import goldenAtlasMugHandle from "@/assets/geostore/golden-atlas-mug-handle.jpg";
import goldenAtlasMugLeft from "@/assets/geostore/golden-atlas-mug-left.jpg";
import goldenAtlasMugRight from "@/assets/geostore/golden-atlas-mug-right.jpg";
import orbitalHorizonMug from "@/assets/geostore/orbital-horizon-mug.jpg";
import orbitalHorizonMugBack from "@/assets/geostore/orbital-horizon-mug-back.jpg";
import orbitalHorizonMugHandle from "@/assets/geostore/orbital-horizon-mug-handle.jpg";
import orbitalHorizonMugLeft from "@/assets/geostore/orbital-horizon-mug-left.jpg";
import orbitalHorizonMugRight from "@/assets/geostore/orbital-horizon-mug-right.jpg";
import terraContourMug from "@/assets/geostore/terra-contour-mug.jpg";
import terraContourMugBack from "@/assets/geostore/terra-contour-mug-back.jpg";
import terraContourMugHandle from "@/assets/geostore/terra-contour-mug-handle.jpg";
import terraContourMugLeft from "@/assets/geostore/terra-contour-mug-left.jpg";
import terraContourMugRight from "@/assets/geostore/terra-contour-mug-right.jpg";

export type MugGalleryView = {
  src: string;
  alt: string;
  label: string;
};

function views(
  name: string,
  images: readonly [string, string, string, string, string],
): readonly MugGalleryView[] {
  const labels = ["Front view", "Right view", "Back view", "Left view", "Handle view"] as const;
  return labels.map((label, index) => ({
    src: images[index],
    alt: `${name} — ${label.toLowerCase()}`,
    label,
  }));
}

export const MUG_GALLERIES: Readonly<Record<string, readonly MugGalleryView[]>> = {
  "orbital-horizon-mug": views("Orbital Horizon Mug", [
    orbitalHorizonMug,
    orbitalHorizonMugRight,
    orbitalHorizonMugBack,
    orbitalHorizonMugLeft,
    orbitalHorizonMugHandle,
  ]),
  "celestial-meridian-mug": views("Celestial Meridian Mug", [
    celestialMeridianMug,
    celestialMeridianMugRight,
    celestialMeridianMugBack,
    celestialMeridianMugLeft,
    celestialMeridianMugHandle,
  ]),
  "terra-contour-mug": views("Terra Contour Mug", [
    terraContourMug,
    terraContourMugRight,
    terraContourMugBack,
    terraContourMugLeft,
    terraContourMugHandle,
  ]),
  "golden-atlas-mug": views("Golden Atlas Mug", [
    goldenAtlasMug,
    goldenAtlasMugRight,
    goldenAtlasMugBack,
    goldenAtlasMugLeft,
    goldenAtlasMugHandle,
  ]),
};

export function mugGalleryForSlug(slug: string): readonly MugGalleryView[] | undefined {
  return MUG_GALLERIES[slug];
}
