import { Link } from "@tanstack/react-router";

import { SF_ASSETS } from "./storefront-assets";

/**
 * Editorial hero. The Figma frame is 1440x858; the height tracks that ratio and
 * is capped to the viewport. The photograph is centred, so on narrow portrait
 * screens the three models stay in frame.
 */
export function StorefrontHero() {
  return (
    <section
      aria-label="GVRZE collection"
      className="relative isolate h-[clamp(520px,59.58vw,100svh)] overflow-hidden bg-[#d4d4d4]"
    >
      <h1 className="sr-only">Gstore — premium streetwear</h1>

      <img
        src={SF_ASSETS.hero.src}
        width={SF_ASSETS.hero.width}
        height={SF_ASSETS.hero.height}
        alt="Three models in GVRZE streetwear: a black tee, a pink tee seen from behind, and a white hoodie"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-center md:scale-[1.127]"
      />

      <img
        src={SF_ASSETS.heroFade.src}
        width={SF_ASSETS.heroFade.width}
        height={SF_ASSETS.heroFade.height}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[16%] min-h-24 w-full object-cover"
      />

      <Link
        to="/geostore/browse"
        className="group/shop absolute bottom-[clamp(24px,3.05vw,44px)] left-1/2 inline-flex min-h-11 -translate-x-1/2 flex-col items-center justify-center gap-1.5 text-[16px] font-semibold text-white"
      >
        <span>Shop Now</span>
        <img
          src={SF_ASSETS.heroUnderline.src}
          width={SF_ASSETS.heroUnderline.width}
          height={SF_ASSETS.heroUnderline.height}
          alt=""
          aria-hidden="true"
          className="h-px w-[83px] transition-[width] duration-300 group-hover/shop:w-[110px] motion-reduce:transition-none"
        />
      </Link>
    </section>
  );
}
