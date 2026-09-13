import { Link, useRouterState } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { selectWishlist, useStoreStore } from "@/stores/storeStore";

import { geostoreActionLinkClass } from "./geostore-action-link";

/** Fixed GEOstore wishlist control — stacked above the cart on the right. */
export function GeostoreWishlistButton({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const wishlistCount = useStoreStore((state) => selectWishlist(state).length);
  const onWishlistPage = pathname === "/geostore/wishlist";

  return (
    <Link
      to="/geostore/wishlist"
      aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : "Wishlist"}
      aria-current={onWishlistPage ? "page" : undefined}
      title="Wishlist"
      className={cn(geostoreActionLinkClass(onWishlistPage), className)}
    >
      <span className="relative inline-flex">
        <Heart
          className={cn("h-4 w-4", onWishlistPage && "fill-current")}
          strokeWidth={1.8}
          aria-hidden
        />
        {wishlistCount > 0 ? (
          <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[0.58rem] font-semibold leading-none text-charcoal">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        ) : null}
      </span>
      <span className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.18em] sm:inline">
        Wishlist
      </span>
    </Link>
  );
}
