import { Link } from "@tanstack/react-router";

import { ComingSoonImageOverlay } from "./ComingSoonImageOverlay";
import { StorefrontNav } from "./StorefrontNav";
import { SF_SHELL, SF_UI_FONT } from "./storefront-ui";

import "./storefront.css";

export function ComingSoonProductPage({
  name,
  image,
  imageAlt,
  categoryLabel,
  categorySlug,
}: {
  name: string;
  image: string;
  imageAlt: string;
  categoryLabel: string;
  categorySlug: string;
}) {
  return (
    <div id="gvrze-storefront" className="bg-white text-black">
      <StorefrontNav variant="solid" />
      <main className={`${SF_SHELL} py-12 sm:py-16`}>
        <p
          className={`${SF_UI_FONT} text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40`}
        >
          {categoryLabel}
        </p>
        <h1 className={`${SF_UI_FONT} mt-2 text-3xl font-semibold tracking-tight sm:text-4xl`}>
          {name}
        </h1>

        <div className="relative mx-auto mt-10 aspect-[4/5] w-full max-w-xl overflow-hidden rounded-[11px] bg-[#d8d8d8] sm:aspect-square">
          {image ? (
            <img
              src={image}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full scale-[1.14] object-cover blur-[12px]"
            />
          ) : null}
          <ComingSoonImageOverlay />
        </div>

        <p className={`${SF_UI_FONT} mt-8 text-center text-sm text-black/55`}>
          This piece is in the lookbook and is not available to purchase yet.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/geostore/browse"
            className={`${SF_UI_FONT} rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white`}
          >
            Back to browse
          </Link>
          <Link
            to="/geostore/category/$slug"
            params={{ slug: categorySlug }}
            className={`${SF_UI_FONT} rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold text-black`}
          >
            View {categoryLabel}
          </Link>
        </div>
      </main>
    </div>
  );
}
