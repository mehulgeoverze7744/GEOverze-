import { Link } from "@tanstack/react-router";
import { memo } from "react";

import { money, credits as formatCredits } from "@/features/store/lib/format";
import { cn } from "@/lib/utils";

import type { GeostoreMerchProduct } from "../../data/geostoreMerch";

/** Homepage T-shirt tile — light card, product imagery, title, copy and price. */
export const GeostoreMerchCard = memo(function GeostoreMerchCard({
  product,
  className,
}: {
  product: GeostoreMerchProduct;
  className?: string;
}) {
  return (
    <Link
      to="/geostore/product/$slug"
      params={{ slug: product.id }}
      aria-label={`${product.title}. ${product.tagline}`}
      className={cn("geostore-home-card group", className)}
    >
      <div className="geostore-home-card__media">
        <img src={product.image} alt={product.alt} loading="lazy" decoding="async" />
      </div>
      <div className="geostore-home-card__body">
        <h3 className="geostore-home-card__title">{product.title}</h3>
        <p className="geostore-home-card__copy">{product.tagline}</p>
        <p className="geostore-home-card__price">
          <span>{money(product.price)}</span>
          <span className="geostore-home-card__credits">or {formatCredits(product.credits)}</span>
        </p>
      </div>
    </Link>
  );
});
