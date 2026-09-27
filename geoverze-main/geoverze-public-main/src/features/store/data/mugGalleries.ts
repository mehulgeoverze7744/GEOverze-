import celestialMeridianMugMain from "@/assets/geostore/celestial-meridian-mug-studio-main.jpg";
import celestialMeridianMugCm1 from "@/assets/geostore/celestial-meridian-mug-studio-cm1.jpg";
import celestialMeridianMugCm2 from "@/assets/geostore/celestial-meridian-mug-studio-cm2.jpg";
import celestialMeridianMugCm3 from "@/assets/geostore/celestial-meridian-mug-studio-cm3.jpg";
import celestialMeridianMugCm4 from "@/assets/geostore/celestial-meridian-mug-studio-cm4.jpg";
import goldenAtlasMugMain from "@/assets/geostore/golden-atlas-mug-studio-main.jpg";
import goldenAtlasMugGa1 from "@/assets/geostore/golden-atlas-mug-studio-ga1.jpg";
import goldenAtlasMugGa2 from "@/assets/geostore/golden-atlas-mug-studio-ga2.jpg";
import goldenAtlasMugGa3 from "@/assets/geostore/golden-atlas-mug-studio-ga3.jpg";
import goldenAtlasMugGa4 from "@/assets/geostore/golden-atlas-mug-studio-ga4.jpg";
import orbitalHorizonMugFront from "@/assets/geostore/orbital-horizon-mug-studio-front.jpg";
import orbitalHorizonMugHandle from "@/assets/geostore/orbital-horizon-mug-studio-handle.jpg";
import orbitalHorizonMugOrbit from "@/assets/geostore/orbital-horizon-mug-studio-orbit.jpg";
import orbitalHorizonMugPlanet from "@/assets/geostore/orbital-horizon-mug-studio-planet.jpg";
import orbitalHorizonMugStar from "@/assets/geostore/orbital-horizon-mug-studio-star.jpg";
import terraContourMugMain from "@/assets/geostore/terra-contour-mug-studio-main.jpg";
import terraContourMugTc1 from "@/assets/geostore/terra-contour-mug-studio-tc1.jpg";
import terraContourMugTc2 from "@/assets/geostore/terra-contour-mug-studio-tc2.jpg";
import terraContourMugTc3 from "@/assets/geostore/terra-contour-mug-studio-tc3.jpg";
import terraContourMugTc4 from "@/assets/geostore/terra-contour-mug-studio-tc4.jpg";

export type MugGalleryView = {
  src: string;
  alt: string;
  label: string;
  /** Used by Celestial / Terra / Golden to fit HD photos in the fixed 3:2 card. */
  objectPosition?: string;
};

const FILL_FRAME_SLUGS = new Set([
  "orbital-horizon-mug",
  "celestial-meridian-mug",
  "terra-contour-mug",
  "golden-atlas-mug",
]);

const FILL_FRAME_ASPECT: Readonly<Record<string, string>> = {
  "orbital-horizon-mug": "aspect-[3/2]",
  "celestial-meridian-mug": "aspect-[3/2]",
  "terra-contour-mug": "aspect-[3/2]",
  "golden-atlas-mug": "aspect-[3/2]",
};

export function mugGalleryFillsFrame(slug: string): boolean {
  return FILL_FRAME_SLUGS.has(slug);
}

export function mugGalleryFrameAspect(slug: string): string {
  return FILL_FRAME_ASPECT[slug] ?? "aspect-[16/10]";
}

export const MUG_GALLERIES: Readonly<Record<string, readonly MugGalleryView[]>> = {
  "orbital-horizon-mug": [
    {
      src: orbitalHorizonMugFront,
      alt: "Orbital Horizon Mug — front view with GEOverze wordmark",
      label: "Front view",
    },
    {
      src: orbitalHorizonMugHandle,
      alt: "Orbital Horizon Mug — handle view with planetary design",
      label: "Handle view",
    },
    {
      src: orbitalHorizonMugPlanet,
      alt: "Orbital Horizon Mug — planetary surface angle",
      label: "Planetary view",
    },
    {
      src: orbitalHorizonMugStar,
      alt: "Orbital Horizon Mug — centered star emblem",
      label: "Star view",
    },
    {
      src: orbitalHorizonMugOrbit,
      alt: "Orbital Horizon Mug — orbital line and bronze sphere",
      label: "Orbital view",
    },
  ],
  "celestial-meridian-mug": [
    {
      src: celestialMeridianMugMain,
      alt: "Celestial Meridian Mug — full mug with handle and GEOverze mark",
      label: "Front view",
      objectPosition: "50% 50%",
    },
    {
      src: celestialMeridianMugCm1,
      alt: "Celestial Meridian Mug — handle view",
      label: "Handle view",
      objectPosition: "50% 42%",
    },
    {
      src: celestialMeridianMugCm2,
      alt: "Celestial Meridian Mug — orbital sphere and lines",
      label: "Orbital view",
      objectPosition: "50% 50%",
    },
    {
      src: celestialMeridianMugCm3,
      alt: "Celestial Meridian Mug — Different Skies Same Horizon",
      label: "Wordmark view",
      objectPosition: "50% 50%",
    },
    {
      src: celestialMeridianMugCm4,
      alt: "Celestial Meridian Mug — bronze sphere on orbital lines",
      label: "Sphere view",
      objectPosition: "50% 50%",
    },
  ],
  "terra-contour-mug": [
    {
      src: terraContourMugMain,
      alt: "Terra Contour Mug — full mug with handle and GEOverze mark",
      label: "Front view",
      objectPosition: "50% 50%",
    },
    {
      src: terraContourMugTc1,
      alt: "Terra Contour Mug — handle view",
      label: "Handle view",
      objectPosition: "50% 42%",
    },
    {
      src: terraContourMugTc2,
      alt: "Terra Contour Mug — topographic contour lines",
      label: "Contour view",
      objectPosition: "50% 50%",
    },
    {
      src: terraContourMugTc3,
      alt: "Terra Contour Mug — Explore Create Belong",
      label: "Wordmark view",
      objectPosition: "50% 50%",
    },
    {
      src: terraContourMugTc4,
      alt: "Terra Contour Mug — bronze contour path",
      label: "Terrain view",
      objectPosition: "50% 50%",
    },
  ],
  "golden-atlas-mug": [
    {
      src: goldenAtlasMugMain,
      alt: "Golden Atlas Mug — full mug with handle and Americas",
      label: "Front view",
      objectPosition: "50% 50%",
    },
    {
      src: goldenAtlasMugGa1,
      alt: "Golden Atlas Mug — handle view",
      label: "Handle view",
      objectPosition: "50% 42%",
    },
    {
      src: goldenAtlasMugGa2,
      alt: "Golden Atlas Mug — Asia and Australia",
      label: "Asia view",
      objectPosition: "50% 50%",
    },
    {
      src: goldenAtlasMugGa3,
      alt: "Golden Atlas Mug — Asia and Australia closer",
      label: "Pacific view",
      objectPosition: "50% 50%",
    },
    {
      src: goldenAtlasMugGa4,
      alt: "Golden Atlas Mug — Americas and Africa",
      label: "Atlantic view",
      objectPosition: "50% 50%",
    },
  ],
};

export function mugGalleryForSlug(slug: string): readonly MugGalleryView[] | undefined {
  return MUG_GALLERIES[slug];
}
