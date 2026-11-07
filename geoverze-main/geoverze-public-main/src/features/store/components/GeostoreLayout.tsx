import { Outlet, useRouterState } from "@tanstack/react-router";

import { GeostoreCartButton } from "./GeostoreCartButton";
import { GeostoreSearchButton } from "./GeostoreSearchButton";
import { GeostoreWishlistButton } from "./GeostoreWishlistButton";

function isFashionStorefront(pathname: string) {
  return (
    pathname === "/geostore" ||
    pathname === "/geostore/" ||
    pathname.startsWith("/geostore/browse") ||
    pathname.startsWith("/geostore/category") ||
    pathname.startsWith("/geostore/product") ||
    pathname.startsWith("/geostore/try-on") ||
    pathname.startsWith("/geostore/order")
  );
}

/** Shared Gstore shell — wishlist, cart, and search in one icon row. */
export function GeostoreLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fashion = isFashionStorefront(pathname);

  return (
    <>
      <div
        className="fixed z-40 flex flex-nowrap items-center justify-end gap-2 top-[calc(var(--nav-height)+0.35rem)] right-4 sm:right-6 md:right-10"
        aria-label="Gstore actions"
      >
        <GeostoreWishlistButton />
        <GeostoreCartButton />
        <GeostoreSearchButton />
      </div>
      {fashion ? (
        <Outlet />
      ) : (
        <div id="gvrze-store-flow">
          <Outlet />
        </div>
      )}
    </>
  );
}
