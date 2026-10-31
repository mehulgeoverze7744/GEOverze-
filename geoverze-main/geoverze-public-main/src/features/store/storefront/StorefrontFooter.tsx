import { Link } from "@tanstack/react-router";

import type { NavLink } from "@/config/site";

import { SF_ASSETS } from "./storefront-assets";
import { SF_SHELL } from "./storefront-ui";

const linkClass =
  "inline-flex min-h-8 items-center text-[16px] text-black transition-opacity duration-200 hover:opacity-60 motion-reduce:transition-none md:text-[clamp(1rem,1.39vw,1.25rem)]";
const headingClass = "text-[16px] font-semibold text-black md:text-[clamp(1rem,1.39vw,1.25rem)]";
const legalClass =
  "inline-flex min-h-8 items-center text-[13px] font-light text-black transition-opacity duration-200 hover:opacity-60 motion-reduce:transition-none md:text-base";

const SUPPORT_LINKS: { label: string; to: NavLink }[] = [
  { label: "Track Order", to: "/geostore/orders" },
  { label: "Shipping", to: "/shipping-policy" },
  { label: "Returns", to: "/refund-policy" },
  { label: "FAQ", to: "/support" },
];

const COMPANY_LINKS: { label: string; to: NavLink }[] = [
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/** Minimal footer: brand message, Shop / Support / Company, legal. */
export function StorefrontFooter() {
  return (
    <footer className="bg-white">
      <div className={`${SF_SHELL} pt-[clamp(40px,4.9vw,71px)]`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div>
            <Link to="/geostore" aria-label="Gstore home" className="inline-block rounded-sm">
              <img
                src={SF_ASSETS.logo.src}
                width={SF_ASSETS.logo.width}
                height={SF_ASSETS.logo.height}
                alt="GVRZE"
                loading="lazy"
                className="h-auto w-[clamp(180px,18vw,259px)]"
              />
            </Link>
            <p className="mt-4 text-[16px] text-black md:text-[clamp(1rem,1.39vw,1.25rem)]">
              Know Earth. Explore More.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-[clamp(48px,11.9vw,172px)]"
          >
            <div>
              <h2 className={headingClass}>Shop</h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                <li>
                  <Link to="/geostore/browse" className={linkClass}>
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/geostore/category/$slug"
                    params={{ slug: "tshirts" }}
                    className={linkClass}
                  >
                    T-Shirts
                  </Link>
                </li>
                <li>
                  <Link
                    to="/geostore/category/$slug"
                    params={{ slug: "hoodies" }}
                    className={linkClass}
                  >
                    Hoodies
                  </Link>
                </li>
                <li>
                  <Link
                    to="/geostore/category/$slug"
                    params={{ slug: "accessories" }}
                    className={linkClass}
                  >
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link to="/geostore/rewards" className={linkClass}>
                    Rewards
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={headingClass}>Support</h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {SUPPORT_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className={headingClass}>Company</h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {COMPANY_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <img
          src={SF_ASSETS.footerDivider.src}
          width={SF_ASSETS.footerDivider.width}
          height={SF_ASSETS.footerDivider.height}
          alt=""
          aria-hidden="true"
          className="mt-[clamp(32px,3.6vw,52px)] h-[1.6px] w-full"
        />

        <div className="flex flex-col gap-3 pb-[clamp(24px,2.1vw,30px)] pt-[clamp(14px,1.5vw,22px)] md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] font-light text-black md:text-base">
            {new Date().getFullYear()} GVRZE. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 md:gap-x-[clamp(24px,4.4vw,64px)]">
            <li>
              <Link to="/privacy-policy" className={legalClass}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-of-service" className={legalClass}>
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/disclaimer" className={legalClass}>
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
