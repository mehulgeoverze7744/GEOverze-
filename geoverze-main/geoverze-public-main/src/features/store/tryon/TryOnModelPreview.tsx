import { cn } from "@/lib/utils";

import { resolveTryOnPair, type TryOnModelSlot } from "./tryOnPreview";
import type { TryOnGarment } from "./tryOnProducts";

type TryOnModelPreviewProps = {
  garment: TryOnGarment;
  colorId: string;
};

function ModelFigure({ slot }: { slot: TryOnModelSlot }) {
  const mask = `url("${slot.maskSrc}")`;

  return (
    <figure className="tryon-model" data-view={slot.view}>
      <div className="tryon-model__frame">
        <img className="tryon-model__base" src={slot.modelSrc} alt={slot.modelAlt} />

        {slot.hasArtwork && slot.artMode !== "none" ? (
          <>
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
            <div
              className="tryon-model__shadow"
              style={{ WebkitMaskImage: mask, maskImage: mask }}
              aria-hidden
            >
              <img src={slot.modelSrc} alt="" />
            </div>
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
          </>
        ) : null}
      </div>
      {slot.unavailableLabel ? (
        <figcaption className="tryon-model__note">{slot.unavailableLabel}</figcaption>
      ) : null}
    </figure>
  );
}

export function TryOnModelPreview({ garment, colorId }: TryOnModelPreviewProps) {
  const pair = resolveTryOnPair(garment, colorId);

  return (
    <div className="tryon-stage__canvas" role="group" aria-label="Front and back model preview">
      <ModelFigure slot={pair.front} />
      <ModelFigure slot={pair.back} />
    </div>
  );
}
