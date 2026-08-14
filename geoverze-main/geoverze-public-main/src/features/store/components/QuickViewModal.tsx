import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { GeoButton, Modal } from "@/components/shared";
import { CoverArt } from "@/features/play/components/CoverArt";

import { PriceTag } from "./PriceTag";
import { RatingStars } from "./RatingStars";
import { StockPill } from "./StockPill";
import { VariantPicker } from "./VariantPicker";
import type { Product } from "../data/products";
import { categoryIcon, categoryLabel } from "../data/taxonomy";
import { defaultOptions } from "../lib/cart";

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

  if (!product) return null;
  const selected = Object.keys(options).length ? options : defaultOptions(product);

  return (
    <Modal
      open={Boolean(product)}
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
            variant="solid"
            disabled={product.stock === "sold-out"}
            onClick={() => {
              onAdd(product, selected);
              setOptions({});
              onClose();
            }}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {product.stock === "sold-out"
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
