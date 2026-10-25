import {
  LIBRARY_IMAGE_MANIFEST,
  type LibraryImageEntry,
} from "@/features/library/data/library-image-manifest";

export type LibraryImageSlot = "card" | "hero" | "body";

const SIZES: Record<LibraryImageSlot, string> = {
  card: "(min-width: 1280px) 320px, (min-width: 768px) 46vw, 100vw",
  hero: "(min-width: 1024px) 960px, 100vw",
  body: "(min-width: 768px) 720px, 100vw",
};

export type LibraryResponsive = {
  src: string;
  webpSrcSet: string;
  jpegSrcSet: string;
  sizes: string;
  width: number;
  height: number;
};

export function libraryImageEntry(src: string | undefined): LibraryImageEntry | undefined {
  if (!src) return undefined;
  return LIBRARY_IMAGE_MANIFEST[src];
}

/** Srcset for a library asset. Cards request the small widths; heroes can take the largest. */
export function libraryResponsiveProps(
  src: string | undefined,
  slot: LibraryImageSlot,
): LibraryResponsive | null {
  const entry = libraryImageEntry(src);
  if (!entry || entry.variants.length === 0) return null;
  return {
    src: entry.fallback,
    webpSrcSet: entry.variants.map((variant) => `${variant.webp} ${variant.width}w`).join(", "),
    jpegSrcSet: entry.variants.map((variant) => `${variant.jpeg} ${variant.width}w`).join(", "),
    sizes: SIZES[slot],
    width: entry.width,
    height: entry.height,
  };
}

export function libraryImageCredit(src: string | undefined): string | undefined {
  const entry = libraryImageEntry(src);
  if (!entry) return undefined;
  const credit = entry.credit.trim();
  const license = entry.license.trim();
  if (credit && license && credit !== license) return `${credit} / ${license}`;
  return credit || license || undefined;
}
