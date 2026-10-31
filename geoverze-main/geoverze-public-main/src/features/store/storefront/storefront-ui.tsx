import { Link } from "@tanstack/react-router";

import { SF_ASSETS } from "./storefront-assets";

/** Page gutter: 54px at the 1440px Figma width, fluid below, capped above. */
export const SF_SHELL = "mx-auto w-full max-w-[1440px] px-[clamp(16px,3.75vw,54px)]";

/** Inter, used for section headings and navigation in the design. */
export const SF_UI_FONT = "[font-family:var(--sf-font-ui)]";

/** Section heading row link, "Explore More →". */
export function ExploreMoreLink() {
  return (
    <Link
      to="/geostore/browse"
      className={`group/explore inline-flex min-h-11 items-center gap-2.5 text-[16px] font-semibold text-black md:text-[20px] ${SF_UI_FONT}`}
    >
      Explore More
      <img
        src={SF_ASSETS.iconArrow.src}
        width={SF_ASSETS.iconArrow.width}
        height={SF_ASSETS.iconArrow.height}
        alt=""
        aria-hidden="true"
        className="h-[15px] w-auto transition-transform duration-200 group-hover/explore:translate-x-1 motion-reduce:transition-none"
      />
    </Link>
  );
}
