import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { isComingSoonCategory, type StoreCategoryId } from "../data/taxonomy";
import { SF_ASSETS } from "./storefront-assets";
import { ExploreMoreLink, SF_SHELL, SF_UI_FONT } from "./storefront-ui";

const LABEL = "text-[clamp(1.25rem,2vw,1.75rem)] font-bold leading-tight text-white";

function CategoryCard({
  id,
  name,
  className,
  children,
}: {
  id: StoreCategoryId;
  /** Accessible name, e.g. "Hoodies & Sweatshirts". */
  name: string;
  className?: string;
  children: (soon: boolean) => ReactNode;
}) {
  const soon = isComingSoonCategory(id);
  const classes = cn(
    "group/cat relative block aspect-[438/347] overflow-hidden rounded-[11px] bg-[#1a1a1a]",
    className,
  );

  if (soon) {
    return (
      <div className={classes} role="group" aria-label={`${name}, coming soon`}>
        {children(true)}
      </div>
    );
  }

  return (
    <Link to="/geostore/category/$slug" params={{ slug: id }} aria-label={name} className={classes}>
      {children(false)}
    </Link>
  );
}

/** Shop by category — the three Figma category cards, wired to the existing category shelves. */
export function StorefrontCategories() {
  return (
    <section
      id="collections"
      aria-labelledby="sf-categories"
      className="bg-white py-[clamp(40px,6vw,88px)]"
    >
      <div className={SF_SHELL}>
        <div className="flex items-center justify-between gap-4">
          <h2
            id="sf-categories"
            className={`text-[18px] font-semibold text-black md:text-[20px] ${SF_UI_FONT}`}
          >
            Shop By Category
          </h2>
          <ExploreMoreLink />
        </div>

        <div className="mt-[clamp(20px,3.2vw,46px)] grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          <CategoryCard id="tshirts" name="Tees">
            {() => (
              <>
                <span
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(231.17deg, rgb(2, 0, 34) 2.82%, rgb(6, 0, 97) 100%)",
                  }}
                />
                <span className="absolute inset-x-0 bottom-0 block h-[83.6%] overflow-hidden">
                  <img
                    src={SF_ASSETS.categoryTees.src}
                    width={SF_ASSETS.categoryTees.width}
                    height={SF_ASSETS.categoryTees.height}
                    alt="Back of a beige GVRZE tee with a topographic print"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-[53%_0] transition-transform duration-500 ease-out group-hover/cat:scale-[1.03] motion-reduce:transition-none"
                  />
                </span>
                <img
                  src={SF_ASSETS.shadowTees.src}
                  width={SF_ASSETS.shadowTees.width}
                  height={SF_ASSETS.shadowTees.height}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[18%] top-[79%] w-[75%] -translate-x-1/2 -translate-y-1/2"
                />
                <span className={cn(LABEL, "absolute bottom-[9.8%] left-[8%]")}>TEES</span>
              </>
            )}
          </CategoryCard>

          <CategoryCard id="hoodies" name="Hoodies & Sweatshirts">
            {() => (
              <>
                <img
                  src={SF_ASSETS.categoryHoodies.src}
                  width={SF_ASSETS.categoryHoodies.width}
                  height={SF_ASSETS.categoryHoodies.height}
                  alt="Model in a cream GVRZE hoodie against a grey studio backdrop"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full -translate-y-[3.6%] scale-[1.098] object-cover transition-transform duration-500 ease-out group-hover/cat:scale-[1.13] motion-reduce:transition-none"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/35 to-transparent"
                />
                <span className={cn(LABEL, "absolute bottom-[8.9%] left-[9%]")}>
                  HOODIES &amp;
                  <br />
                  SWEATSHIRTS
                </span>
              </>
            )}
          </CategoryCard>

          <CategoryCard
            id="accessories"
            name="Accessories"
            className="sm:col-span-2 sm:aspect-[876/347] lg:col-span-1 lg:aspect-[438/347]"
          >
            {(soon) => (
              <>
                <img
                  src={SF_ASSETS.categoryAccessories.src}
                  width={SF_ASSETS.categoryAccessories.width}
                  height={SF_ASSETS.categoryAccessories.height}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[rgba(196,196,196,0.11)] backdrop-blur-[21px]"
                />
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                  <span className={LABEL}>ACCESSORIES</span>
                  {soon ? (
                    <span className="text-[clamp(0.9rem,1.4vw,1.25rem)] font-bold text-white">
                      COMING SOON
                    </span>
                  ) : null}
                </span>
              </>
            )}
          </CategoryCard>
        </div>
      </div>
    </section>
  );
}
