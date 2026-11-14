import { cn } from "@/lib/utils";

import { resolveTryOnPair, type TryOnModelSlot } from "./tryOnPreview";
import type { TryOnColor, TryOnGarment } from "./tryOnProducts";

type TryOnModelPreviewProps = {
  garment: TryOnGarment;
  colorId: string;
  /** Studio may inject extra swatches (e.g. cream) that are not on the garment record. */
  color?: TryOnColor;
  /** Highlights one plate without dimming the other (studio only). */
  activeView?: "front" | "back";
};

function ModelFigure({
  slot,
  selected,
}: {
  slot: TryOnModelSlot;
  selected: boolean;
}) {
  const mask = `url("${slot.maskSrc}")`;

  return (
    <figure
      className={cn("tryon-model", selected && "is-selected")}
      data-view={slot.view}
      data-tryon-view={slot.view}
    >
      <p className="tryon-model__label">{slot.view === "back" ? "Back" : "Front"}</p>
      <div className="tryon-model__frame">
        <img className="tryon-model__base" src={slot.modelSrc} alt={slot.modelAlt} />

        {slot.shirtHex ? (
          <div
            className="tryon-model__dye"
            style={{
              background: slot.shirtHex,
              WebkitMaskImage: mask,
              maskImage: mask,
            }}
            aria-hidden
          />
        ) : null}
        {slot.shirtHex || (slot.hasArtwork && slot.artMode !== "none") ? (
          <div
            className="tryon-model__shadow"
            style={{ WebkitMaskImage: mask, maskImage: mask }}
            aria-hidden
          >
            <img src={slot.modelSrc} alt="" />
          </div>
        ) : null}
        {slot.hasArtwork && slot.artMode !== "none" ? (
          <div
            className={cn(
              "tryon-model__art-clip",
              `is-${slot.artMode}`,
              slot.lightShirt && "is-light",
            )}
            style={{ WebkitMaskImage: mask, maskImage: mask }}
            data-placement={slot.placement}
            data-view={slot.view}
          >
            <div className="tryon-model__print" data-placement={slot.placement}>
              <img
                key={`${slot.artSrc}-${slot.view}`}
                src={slot.artSrc}
                alt={slot.artAlt}
                className={slot.artLayout === "diptych" ? "is-diptych" : "is-single"}
                data-view={slot.view}
              />
            </div>
          </div>
        ) : null}
      </div>
      {slot.unavailableLabel ? (
        <figcaption className="tryon-model__note">{slot.unavailableLabel}</figcaption>
      ) : null}
    </figure>
  );
}

export function TryOnModelPreview({ garment, colorId, color, activeView }: TryOnModelPreviewProps) {
  const pair = resolveTryOnPair(garment, colorId, color);

  return (
    <div className="tryon-stage__canvas" role="group" aria-label="Front and back model preview">
      <ModelFigure slot={pair.front} selected={activeView !== "back"} />
      <ModelFigure slot={pair.back} selected={activeView !== "front"} />
    </div>
  );
}
