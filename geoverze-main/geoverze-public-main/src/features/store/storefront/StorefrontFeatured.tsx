import { Link } from "@tanstack/react-router";

import { SF_ASSETS } from "./storefront-assets";

/** Full-bleed featured collection banner. The whole banner is one link into the T-shirt shelf. */
export function StorefrontFeatured() {
  return (
    <section aria-label="Featured collection">
      <Link
        to="/geostore/category/$slug"
        params={{ slug: "tshirts" }}
        aria-label="Featured collection — shop now"
        className="group/featured relative block h-[clamp(340px,39.24vw,565px)] overflow-hidden bg-[#2a6f9e]"
      >
        <img
          src={SF_ASSETS.featured.src}
          width={SF_ASSETS.featured.width}
          height={SF_ASSETS.featured.height}
          alt="A gloved hand holding a beige GVRZE tee printed with a planet graphic"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover/featured:scale-[1.02] motion-reduce:transition-none"
        />

        <div className="absolute left-1/2 top-[70%] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center px-4 text-center">
          <img
            src={SF_ASSETS.shadowFeatured.src}
            width={SF_ASSETS.shadowFeatured.width}
            height={SF_ASSETS.shadowFeatured.height}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[min(593px,95vw)] -translate-x-1/2 -translate-y-1/2"
          />
          <span className="relative text-[clamp(1.25rem,1.95vw,1.75rem)] font-bold text-white">
            FEATURED COLLECTION
          </span>
          <span className="relative mt-3 text-[clamp(1rem,1.4vw,1.25rem)] font-medium text-white">
            Shop Now
          </span>
        </div>
      </Link>
    </section>
  );
}
