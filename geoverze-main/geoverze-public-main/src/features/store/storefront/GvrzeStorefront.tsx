import "./storefront.css";

import { StorefrontBestSellers } from "./StorefrontBestSellers";
import { StorefrontBrandStatement } from "./StorefrontBrandStatement";
import { StorefrontCategories } from "./StorefrontCategories";
import { StorefrontFeatured } from "./StorefrontFeatured";
import { StorefrontFooter } from "./StorefrontFooter";
import { StorefrontHero } from "./StorefrontHero";
import { StorefrontNav } from "./StorefrontNav";

/**
 * GVRZE Store front page (/geostore), redesigned from the "thegvrze" Figma file.
 *
 * Everything is scoped to #gvrze-storefront. The site-wide navbar, footer and
 * backdrop are hidden only while this page is mounted (see storefront.css);
 * every other route keeps the normal chrome.
 */
export function GvrzeStorefront() {
  return (
    <div id="gvrze-storefront">
      <StorefrontNav />
      <StorefrontHero />
      <StorefrontBestSellers />
      <StorefrontCategories />
      <StorefrontFeatured />
      <StorefrontBrandStatement />
      <StorefrontFooter />
    </div>
  );
}
