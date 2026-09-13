import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import { selectCartCount, useCartStore } from "@/stores/cartStore";

import { geostoreActionLinkClass } from "./geostore-action-link";

/** Fixed GEOstore cart control — stacked below wishlist on the right. */
export function GeostoreCartButton({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const cartCount = useCartStore(selectCartCount);
  const onCartPage = pathname === "/geostore/cart" || pathname === "/geostore/checkout";

  return (
    <Link
      to="/geostore/cart"
      aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
      aria-current={onCartPage ? "page" : undefined}
      title="Cart"
      className={cn(geostoreActionLinkClass(onCartPage), className)}
    >
      <span className="relative inline-flex">
        <ShoppingBag className="h-4 w-4" strokeWidth={1.8} aria-hidden />
        {cartCount > 0 ? (
          <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[0.58rem] font-semibold leading-none text-charcoal">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        ) : null}
      </span>
      <span className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.18em] sm:inline">
        Cart
      </span>
    </Link>
  );
}
