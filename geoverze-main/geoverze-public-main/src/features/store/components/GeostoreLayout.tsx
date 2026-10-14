import { Outlet } from "@tanstack/react-router";

import { GeostoreCartButton } from "./GeostoreCartButton";
import { GeostoreSearchButton } from "./GeostoreSearchButton";
import { GeostoreWishlistButton } from "./GeostoreWishlistButton";

/** Shared GVRZE Store shell — wishlist, cart, and search in one icon row. */
export function GeostoreLayout() {
  return (
    <>
      <div
        className="fixed z-40 flex flex-nowrap items-center justify-end gap-2 top-[calc(var(--nav-height)+0.35rem)] right-4 sm:right-6 md:right-10"
        aria-label="GVRZE Store actions"
      >
        <GeostoreWishlistButton />
        <GeostoreCartButton />
        <GeostoreSearchButton />
      </div>
      <Outlet />
    </>
  );
}
