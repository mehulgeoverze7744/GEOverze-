import { Outlet } from "@tanstack/react-router";

import { GeostoreCartButton } from "./GeostoreCartButton";
import { GeostoreWishlistButton } from "./GeostoreWishlistButton";

/** Shared GEOstore shell — persistent wishlist + cart access on every store route. */
export function GeostoreLayout() {
  return (
    <>
      <div
        className="fixed z-40 flex flex-col gap-2 top-[calc(var(--nav-height)+0.35rem)] right-6 md:right-10"
        aria-label="GEOstore actions"
      >
        <GeostoreWishlistButton />
        <GeostoreCartButton />
      </div>
      <Outlet />
    </>
  );
}
