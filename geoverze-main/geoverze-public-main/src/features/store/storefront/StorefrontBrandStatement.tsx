import { Link } from "@tanstack/react-router";

import { SF_ASSETS } from "./storefront-assets";
import { SF_SHELL } from "./storefront-ui";

/**
 * "The world is your canvas." On md and up the copy sits over the left of the
 * photograph exactly as in Figma; on phones the photograph stacks above the copy.
 */
export function StorefrontBrandStatement() {
  return (
    <section
      aria-labelledby="sf-brand"
      className="rounded-b-[26px] bg-[#f6f6f6] pb-[clamp(24px,4.2vw,60px)] pt-[clamp(24px,4.65vw,67px)]"
    >
      <div className={SF_SHELL}>
        <div className="relative overflow-hidden rounded-[11px] bg-[#ececec] md:aspect-[1334/525]">
          <div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto">
            <img
              src={SF_ASSETS.brand.src}
              width={SF_ASSETS.brand.width}
              height={SF_ASSETS.brand.height}
              alt="Three people in GVRZE streetwear seated in a photo studio"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-[78%_50%] md:absolute md:left-[-6.83%] md:top-0 md:h-[104%] md:w-[109.45%] md:object-fill"
            />
          </div>

          <div className="relative px-5 pb-7 pt-6 md:absolute md:inset-0 md:flex md:flex-col md:justify-center md:p-0 md:pl-[9.5%]">
            <h2
              id="sf-brand"
              className="text-[1.75rem] font-extrabold leading-[1.1] text-[#1a1a1a] md:text-[clamp(1.375rem,2.92vw,2.625rem)]"
            >
              THE WORLD IS
              <br />
              YOUR CANVAS.
            </h2>
            <p className="mt-3 max-w-[340px] text-[0.875rem] leading-snug text-[#555555] md:mt-[2%] md:w-[28.2%] md:min-w-[170px] md:text-[clamp(0.6875rem,0.97vw,0.875rem)]">
              Discover streetwear inspired by distant places, diverse cultures and endless
              exploration.
            </p>
            <div className="mt-5 md:mt-[3.6%]">
              <Link
                to="/geostore/browse"
                className="inline-flex h-11 min-w-[108px] items-center justify-center rounded-lg bg-[#1a1a1a] px-5 text-[14px] text-white transition-colors hover:bg-black md:h-[clamp(30px,2.55vw,34px)]"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
