import { Link } from "@tanstack/react-router";
import { memo } from "react";

import { SectionContainer } from "@/components/shared";
import { SpecialColourBadge } from "@/features/store/storefront/SpecialColourBadge";
import {
  storefrontTeeById,
  teeHasSpecialColourBadge,
} from "@/features/store/storefront/storefront-product-data";

const HOMEPAGE_TEE_IDS = [
  "eclipse",
  "cherry-blossom-tshirt",
  "golden-arc-tshirt",
] as const;

const HOMEPAGE_TEES = HOMEPAGE_TEE_IDS.map((id) => storefrontTeeById(id)).filter(
  (product): product is NonNullable<typeof product> => product != null,
);

/** Homepage coordinates section — three GStore signature tees, names only. */
export const GeostoreSignatureTeeRow = memo(function GeostoreSignatureTeeRow() {
  return (
    <SectionContainer size="wide" className="geostore-tee-row">
      <ul className="geostore-tee-row__grid">
        {HOMEPAGE_TEES.map((tee) => (
          <li key={tee.id} className="geostore-tee-row__item">
            <Link
              to="/geostore/product/$slug"
              params={{ slug: tee.id }}
              className="geostore-tee-card"
              aria-label={tee.name}
            >
              <span className="geostore-tee-card__media relative">
                <img
                  src={tee.image.src}
                  alt={tee.image.alt}
                  loading="lazy"
                  decoding="async"
                />
                {teeHasSpecialColourBadge(tee.id) ? <SpecialColourBadge /> : null}
              </span>
              <span className="geostore-tee-card__name">{tee.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
});
