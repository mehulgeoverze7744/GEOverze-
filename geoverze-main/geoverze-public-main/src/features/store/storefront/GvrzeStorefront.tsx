import "./storefront.css";

import { StorefrontBestSellers } from "./StorefrontBestSellers";
import { StorefrontBrandStatement } from "./StorefrontBrandStatement";
import { StorefrontCategories } from "./StorefrontCategories";
import { StorefrontFeatured } from "./StorefrontFeatured";
import { StorefrontHero } from "./StorefrontHero";
import { StorefrontNav } from "./StorefrontNav";

/**
 * Gstore front page (/geostore), redesigned from the "thegvrze" Figma file.
 *
 * Everything is scoped to #gvrze-storefront. The site-wide navbar and
 * backdrop are hidden only while this page is mounted (see storefront.css);
 * the shared site footer stays visible so the store matches the homepage.
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
    </div>
  );
}
