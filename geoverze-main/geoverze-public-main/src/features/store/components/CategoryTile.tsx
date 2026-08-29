import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import {
  isMerchStoreCategory,
  merchCountForStoreCategory,
  type MerchStoreCategorySlug,
} from "@/features/marketing/data/geostoreMerch";
import { CoverArt } from "@/features/play/components/CoverArt";

import type { StoreCategory } from "../data/taxonomy";
import { productsInCategory } from "../data/products";

function categoryItemCount(categoryId: string): number {
  if (isMerchStoreCategory(categoryId)) {
    return merchCountForStoreCategory(categoryId as MerchStoreCategorySlug);
  }
  return productsInCategory(categoryId).length;
}

/** Category entry tile used on the store home and group shelves. */
export function CategoryTile({ category }: { category: StoreCategory }) {
  const count = categoryItemCount(category.id);

  return (
    <Link
      to="/geostore/category/$slug"
      params={{ slug: category.id }}
      className="group block overflow-hidden rounded-2xl border border-bronze/12 bg-charcoal/45 transition-all motion-base hover:border-bronze/35 hover:bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
    >
      <CoverArt
        art={`cat-${category.id}`}
        icon={category.icon}
        ratio="wide"
        className="transition-transform motion-slow group-hover:scale-[1.04]"
      />
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <h3 className="text-sm font-light tracking-tight text-foreground">{category.label}</h3>
          <p className="mt-1.5 text-xs text-foreground/50">{category.blurb}</p>
          <p className="mt-3 text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50">
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-bronze/90 transition-transform motion-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
