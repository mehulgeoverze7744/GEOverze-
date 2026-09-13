import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { GeoButton, Modal } from "@/components/shared";
import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";

import { PriceTag } from "./PriceTag";
import { RatingStars } from "./RatingStars";
import { StockPill } from "./StockPill";
import { VariantPicker } from "./VariantPicker";
import type { Product } from "../data/products";
import { categoryIcon, categoryLabel } from "../data/taxonomy";
import { cartLineIdForProduct, defaultOptions } from "../lib/cart";
import { useStoreActions } from "../lib/useStoreActions";

/** Fast look at an item without leaving the grid. */
export function QuickViewModal({
  product,
  onClose,
  onAdd,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product, options: Record<string, string>) => void;
}) {
  const [options, setOptions] = useState<Record<string, string>>({});
  const { removeProduct } = useStoreActions();
  const selected = useMemo(() => {
    if (!product) return {};
    return Object.keys(options).length ? options : defaultOptions(product);
  }, [product, options]);
  const cartLineId = useMemo(
    () => (product ? cartLineIdForProduct(product, selected) : ""),
    [product, selected],
  );
  const inCart = useCartStore((state) =>
    cartLineId ? state.lines.some((line) => line.id === cartLineId) : false,
  );

  if (!product) return null;

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) {
          setOptions({});
          onClose();
        }
      }}
      title={product.name}
      description={product.tagline}
    >
      <div className="space-y-5">
        <CoverArt
          art={product.slug}
          icon={categoryIcon(product.category)}
          ratio="wide"
          className="rounded-xl"
        />
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50">
            {categoryLabel(product.category)}
          </span>
          <RatingStars rating={product.rating} reviews={product.reviews} />
          <StockPill stock={product.stock} />
        </div>
        <p className="text-sm leading-relaxed text-foreground/60">{product.description}</p>
        <PriceTag product={product} size="lg" />
        <VariantPicker product={product} value={selected} onChange={setOptions} />
        <div className="flex flex-wrap gap-3">
          <GeoButton
            variant={inCart ? "ghost" : "solid"}
            className={cn(
              inCart && "border border-bronze/35 text-bronze-glow hover:border-bronze/50",
            )}
            disabled={!inCart && product.stock === "sold-out"}
            onClick={() => {
              if (inCart) {
                removeProduct(product, selected);
              } else {
                onAdd(product, selected);
                setOptions({});
                onClose();
              }
            }}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {inCart
              ? "Remove from cart"
              : product.stock === "sold-out"
                ? "Sold out"
                : product.price === null
                  ? "Claim with credits"
                  : "Add to cart"}
          </GeoButton>
          <GeoButton asChild variant="ghost">
            <Link to="/geostore/product/$slug" params={{ slug: product.slug }} onClick={onClose}>
              Full details
            </Link>
          </GeoButton>
        </div>
      </div>
    </Modal>
  );
}
