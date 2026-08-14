import { useState } from "react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";

import { categoryIcon } from "../data/taxonomy";
import type { Product } from "../data/products";

/**
 * Product imagery. Four procedural views derived from the slug stand in for
 * photography, with keyboard-operable thumbnails.
 */
export function ProductGallery({ product }: { product: Product }) {
  const views = [
    product.slug,
    `${product.slug}-detail`,
    `${product.slug}-angle`,
    `${product.slug}-macro`,
  ];
  const [active, setActive] = useState(0);
  const Icon = categoryIcon(product.category);

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-bronze/15 bg-charcoal/40">
        <CoverArt art={views[active] ?? product.slug} icon={Icon} ratio="video" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3" role="group" aria-label="Product views">
        {views.map((view, i) => (
          <button
            key={view}
            type="button"
            aria-pressed={i === active}
            aria-label={`View ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn(
              "overflow-hidden rounded-xl border transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
              i === active ? "border-bronze/60" : "border-bronze/12 hover:border-bronze/35",
            )}
          >
            <CoverArt art={view} ratio="square" />
          </button>
        ))}
      </div>
    </div>
  );
}
