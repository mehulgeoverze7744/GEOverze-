/** Shared shopper actions: add to cart, wishlist. Credit rewards use useCreditPurchase. */
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { useCartStore } from "@/stores/cartStore";
import { useStoreStore } from "@/stores/storeStore";

import { isPurchaseLocked, productBySlug, type Product } from "../data/products";
import { cartLineIdForProduct, defaultOptions, toCartLine } from "./cart";
import { isProductionRewardSlug } from "./rewards";
import { isMerchProductId } from "@/features/marketing/data/geostoreMerch";

export function useStoreActions() {
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);
  const toggleWishlist = useStoreStore((s) => s.toggleWishlist);
  const wishlist = useStoreStore((s) => s.wishlist);
  const navigate = useNavigate();

  const addProduct = (product: Product, options?: Record<string, string>, quantity = 1) => {
    if (isPurchaseLocked(product)) {
      toast.message("Coming soon", {
        description: `${product.name} isn’t available to purchase yet.`,
      });
      return;
    }

    if (isMerchProductId(product.slug) && !productBySlug(product.slug)) {
      toast.message("Available soon", {
        description: "Merchandise checkout is not live yet.",
      });
      return;
    }

    if (product.stock === "sold-out") {
      toast.error(`${product.name} is sold out`, { description: "We restock most items weekly." });
      return;
    }

    if (product.price === null && isProductionRewardSlug(product.slug)) {
      toast.message("Claim from the product page", {
        description: "Credit rewards are claimed instantly — not through the demo checkout.",
        action: {
          label: "View item",
          onClick: () =>
            void navigate({ to: "/geostore/product/$slug", params: { slug: product.slug } }),
        },
      });
      return;
    }

    add(toCartLine(product, options ?? defaultOptions(product), quantity));
    toast.success(`${product.name} added`, {
      description:
        product.price === null ? "Ready to claim with credits." : "Waiting in your cart.",
      action: { label: "View cart", onClick: () => void navigate({ to: "/geostore/cart" }) },
    });
  };

  const removeProduct = (product: Product, options?: Record<string, string>) => {
    const id = cartLineIdForProduct(product, options);
    remove(id);
    toast.message(`${product.name} removed`, {
      description: "Removed from your cart.",
    });
  };

  const wishlistToggle = (slug: string) => {
    const saved = wishlist.includes(slug);
    toggleWishlist(slug);
    toast[saved ? "message" : "success"](saved ? "Removed from wishlist" : "Saved to wishlist", {
      description: productBySlug(slug)?.name ?? "",
    });
  };

  return { addProduct, removeProduct, wishlistToggle, wishlist };
}
