import { Outlet } from "@tanstack/react-router";

import { GeostoreCartButton } from "./GeostoreCartButton";
import { GeostoreSearchButton } from "./GeostoreSearchButton";
import { GeostoreWishlistButton } from "./GeostoreWishlistButton";

/** Shared GEOstore shell — wishlist, cart, then search stacked below the navbar. */
export function GeostoreLayout() {
  return (
    <>
      <div
        className="fixed z-40 flex flex-col items-end gap-2 top-[calc(var(--nav-height)+0.35rem)] right-6 md:right-10"
        aria-label="GEOstore actions"
      >
        <div className="flex flex-wrap items-center justify-end gap-2">
          <GeostoreWishlistButton />
          <GeostoreCartButton />
        </div>
        <GeostoreSearchButton />
      </div>
      <Outlet />
    </>
  );
}
