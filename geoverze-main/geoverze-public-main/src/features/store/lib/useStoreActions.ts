/** Shared shopper actions: add to cart, claim with credits, wishlist. */
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { useCartStore } from "@/stores/cartStore";
import { useStoreStore } from "@/stores/storeStore";

import { BUNDLES, type Bundle } from "../data/offers";
import { productBySlug, type Product } from "../data/products";
import { defaultOptions, toCartLine } from "./cart";

export function useStoreActions() {
  const add = useCartStore((s) => s.add);
  const toggleWishlist = useStoreStore((s) => s.toggleWishlist);
  const wishlist = useStoreStore((s) => s.wishlist);
  const owned = useStoreStore((s) => s.owned);
  const navigate = useNavigate();

  const addProduct = (product: Product, options?: Record<string, string>, quantity = 1) => {
    if (product.stock === "sold-out") {
      toast.error(`${product.name} is sold out`, { description: "We restock most items weekly." });
      return;
    }
    add(toCartLine(product, options ?? defaultOptions(product), quantity));
    toast.success(`${product.name} added`, {
      description:
        product.price === null ? "Ready to claim with credits." : "Waiting in your cart.",
      action: { label: "View cart", onClick: () => void navigate({ to: "/geostore/cart" }) },
    });
  };

  const addBundle = (bundle: Bundle) => {
    const items = bundle.slugs.map(productBySlug).filter((p): p is Product => Boolean(p));
    for (const item of items) add(toCartLine(item, defaultOptions(item), 1));
    toast.success(`${bundle.name} added`, { description: `${items.length} items in your cart.` });
  };

  const wishlistToggle = (slug: string) => {
    const saved = wishlist.includes(slug);
    toggleWishlist(slug);
    toast[saved ? "message" : "success"](saved ? "Removed from wishlist" : "Saved to wishlist", {
      description: productBySlug(slug)?.name ?? "",
    });
  };

  return { addProduct, addBundle, wishlistToggle, wishlist, owned, bundles: BUNDLES };
}
