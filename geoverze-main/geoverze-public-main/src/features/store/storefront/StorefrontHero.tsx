import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

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

      {/* CTA row — Shop Now + Try-On Studio */}
      <div className="absolute bottom-[clamp(20px,2.8vw,40px)] left-1/2 flex -translate-x-1/2 items-end gap-6">
        <Link
          to="/geostore/browse"
          className="group/shop inline-flex min-h-11 flex-col items-center justify-center gap-1.5 text-[16px] font-semibold text-white"
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

        {/* divider */}
        <span className="mb-1.5 inline-block h-5 w-px bg-white/30" aria-hidden="true" />

        <Link
          to="/geostore/try-on"
          className="group/tryon inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[14px] font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 motion-reduce:transition-none"
          aria-label="Open Try-On Studio"
        >
          <Sparkles
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className="opacity-80"
          />
          Try-On Studio
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black"
            style={{ background: "#fff", letterSpacing: "0.14em" }}
            aria-hidden="true"
          >
            AI
          </span>
        </Link>
      </div>
    </section>
  );
}
