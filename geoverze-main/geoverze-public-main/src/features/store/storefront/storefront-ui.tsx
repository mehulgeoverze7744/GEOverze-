import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { SF_ASSETS } from "./storefront-assets";

/** Page gutter: 54px at the 1440px Figma width, fluid below, capped above. */
export const SF_SHELL = "mx-auto w-full max-w-[1440px] px-[clamp(16px,3.75vw,54px)]";

/** Inter, used for section headings and navigation in the design. */
export const SF_UI_FONT = "[font-family:var(--sf-font-ui)]";

type StorefrontCardPriceProps = {
  children: ReactNode;
  className?: string;
  /** Best Sellers and PDP related cards — slightly larger type from `sm` upward. */
  variant?: "editorial" | "promo";
};

/**
 * Shared hybrid price line for Gstore product cards (BASICS + PRIME).
 * Mobile: smaller type, single line; tablet/desktop: prior sizing.
 */
export function StorefrontCardPrice({ children, className, variant = "editorial" }: StorefrontCardPriceProps) {
  return (
    <p
      className={cn(
        "gvrze-card-price min-w-0 max-w-full",
        variant === "editorial" ? "mt-0.5 text-[#555555]" : "mt-1 text-[#353535] sm:mt-1.5 gvrze-card-price--promo",
        className,
      )}
    >
      {children}
    </p>
  );
}

type ExploreMoreLinkProps = {
  /** Compact pill — Best Sellers section reference; default is plain text link. */
  variant?: "default" | "compact";
};

/** Section heading row link, "Explore More →". */
export function ExploreMoreLink({ variant = "default" }: ExploreMoreLinkProps) {
  const arrow = (
    <img
      src={SF_ASSETS.iconArrow.src}
      width={SF_ASSETS.iconArrow.width}
      height={SF_ASSETS.iconArrow.height}
      alt=""
      aria-hidden="true"
      className={
        variant === "compact"
          ? "h-[10px] w-auto transition-transform duration-200 group-hover/explore:translate-x-0.5 motion-reduce:transition-none"
          : "h-[15px] w-auto transition-transform duration-200 group-hover/explore:translate-x-1 motion-reduce:transition-none"
      }
    />
  );

  if (variant === "compact") {
    return (
      <Link
        to="/geostore/browse"
        className={`group/explore inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-black/20 bg-white px-3 py-1.5 text-[12px] font-medium leading-none text-black transition-colors hover:border-black/35 md:min-h-9 md:px-3.5 md:text-[13px] ${SF_UI_FONT}`}
      >
        Explore More
        {arrow}
      </Link>
    );
  }

  return (
    <Link
      to="/geostore/browse"
      className={`group/explore inline-flex min-h-11 items-center gap-2.5 text-[16px] font-semibold text-black md:text-[20px] ${SF_UI_FONT}`}
    >
      Explore More
      {arrow}
    </Link>
  );
}
