import { cn } from "@/lib/utils";

import type { TryOnColor } from "../tryon/tryOnProducts";
import { GMAKE_ASSETS } from "./gmake-assets";
import { GMAKE_COLOR_MOCKUPS, type GmakeLibraryDesign } from "./gmakeDesignLibrary";

type GMakeTeePreviewProps = {
  color: TryOnColor | undefined;
  view: "front" | "back";
  design: GmakeLibraryDesign | null;
  customSrc: string | null;
  productName: string;
};

export function GMakeTeePreview({
  color,
  view,
  design,
  customSrc,
  productName,
}: GMakeTeePreviewProps) {
  const mockup = color ? GMAKE_COLOR_MOCKUPS[color.id] : undefined;
  const productSrc = view === "back" ? (color?.backImage ?? color?.image) : color?.image;
  const src = mockup?.src ?? productSrc ?? "";
  const isDiptychFile = mockup?.layout === "diptych";
  const blankShirt = mockup?.layout === "single" || !mockup;

  const artSrc = customSrc ?? (blankShirt ? design?.art : null);
  const placement = customSrc
    ? view === "back"
      ? "back-graphic"
      : "chest-logo"
    : (design?.placement ?? "chest-logo");
  const artMatchesView =
    placement === "back-graphic" ? view === "back" : view === "front";
  const showArt = Boolean(artSrc) && artMatchesView;
  const showPlus = view === "front" && !showArt;

  return (
    <figure className={cn("gmake-tee", isDiptychFile && "is-diptych")} aria-label={`${productName}, ${view} view`}>
      {src ? (
        <img
          src={src}
          alt={`${productName} — ${color?.label ?? ""} ${view}`}
          className={cn(
            "gmake-tee__img",
            isDiptychFile && view === "front" && "is-diptych-front",
            isDiptychFile && view === "back" && "is-diptych-back",
          )}
        />
      ) : (
        <div className="gmake-tee__empty">Preview unavailable</div>
      )}

      {showArt && artSrc ? (
        <div className={cn("gmake-tee__art", `is-${placement}`)}>
          <img src={artSrc} alt="" />
        </div>
      ) : null}

      {showPlus ? (
        <img
          src={GMAKE_ASSETS.placementPlus}
          alt=""
          className="gmake-tee__plus"
          width={42}
          height={42}
        />
      ) : null}
    </figure>
  );
}
