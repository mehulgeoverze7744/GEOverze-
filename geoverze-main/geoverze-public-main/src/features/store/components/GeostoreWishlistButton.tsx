import { Link, useRouterState } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { selectWishlist, useStoreStore } from "@/stores/storeStore";

import { geostoreActionLinkClass } from "./geostore-action-link";

/** Fixed GEOstore wishlist icon — first control in the header action row. */
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
      className={cn("relative", geostoreActionLinkClass(onWishlistPage), className)}
    >
      <Heart
        className={cn("h-4 w-4", onWishlistPage && "fill-current")}
        strokeWidth={1.8}
        aria-hidden
      />
      {wishlistCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[0.58rem] font-semibold leading-none text-charcoal">
          {wishlistCount > 99 ? "99+" : wishlistCount}
        </span>
      ) : null}
    </Link>
  );
}
