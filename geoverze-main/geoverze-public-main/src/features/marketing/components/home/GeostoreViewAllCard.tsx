import { Link } from "@tanstack/react-router";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { MerchStoreCategorySlug } from "../../data/geostoreMerch";

/** Homepage gateway tile — matches the T-shirt product cards. */
export const GeostoreViewAllCard = memo(function GeostoreViewAllCard({
  slug,
  label,
  image,
  imageAlt,
  className,
}: {
  slug: MerchStoreCategorySlug;
  label: string;
  image: string;
  imageAlt: string;
  className?: string;
}) {
  return (
    <Link
      to="/geostore/category/$slug"
      params={{ slug }}
      aria-label={`${label}. ${imageAlt}`}
      className={cn("geostore-home-card group", className)}
    >
      <div className="geostore-home-card__media">
        <img src={image} alt="" aria-hidden loading="lazy" decoding="async" />
      </div>
      <div className="geostore-home-card__body">
        <h3 className="geostore-home-card__title">
          <span className="geostore-home-card__title-row">
            {label}
            <span aria-hidden="true">→</span>
          </span>
        </h3>
      </div>
    </Link>
  );
});
