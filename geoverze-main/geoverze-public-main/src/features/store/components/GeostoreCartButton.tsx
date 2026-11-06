import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import { selectCartCount, useCartStore } from "@/stores/cartStore";

import { geostoreCartLinkClass } from "./geostore-action-link";

/**
 * Fixed Gstore cart icon — middle control in the floating header action row.
 *
 * Uses the cream/golden-border circular style to visually distinguish the cart
 * from the dark-charcoal Wishlist and Search buttons, matching the design
 * reference where the cart sits as the centrepiece of the three-icon triplet.
 */
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
      className={cn("relative", geostoreCartLinkClass(onCartPage), className)}
    >
      {/* Icon colour is inherited from the class (dark on cream bg). */}
      <ShoppingBag className="h-4 w-4" strokeWidth={1.8} aria-hidden />
      {cartCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-bronze px-1 text-[0.58rem] font-semibold leading-none text-charcoal">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      ) : null}
    </Link>
  );
}
