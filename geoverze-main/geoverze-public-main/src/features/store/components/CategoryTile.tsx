import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Lock } from "lucide-react";
import type { ReactNode } from "react";

import {
  isMerchStoreCategory,
  merchCountForStoreCategory,
  type MerchStoreCategorySlug,
} from "@/features/marketing/data/geostoreMerch";
import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";

import { ComingSoonLockChip } from "./ComingSoonLockChip";
import type { StoreCategory } from "../data/taxonomy";
import { categoryBannerForId } from "../data/categoryBanners";
import { productsInCategory } from "../data/products";

function categoryItemCount(categoryId: string): number {
  if (isMerchStoreCategory(categoryId)) {
    return merchCountForStoreCategory(categoryId as MerchStoreCategorySlug);
  }
  return productsInCategory(categoryId).length;
}

function CategoryTileBody({
  category,
  compact,
  comingSoon,
}: {
  category: StoreCategory;
  compact: boolean;
  comingSoon: boolean;
}) {
  const count = categoryItemCount(category.id);
  const banner = categoryBannerForId(category.id);

  return (
    <>
      <div className="relative">
        <div className={cn(comingSoon && "pointer-events-none overflow-hidden")}>
          <div className={cn(comingSoon && "origin-center scale-[1.03] blur-[2.5px]")}>
            <CoverArt
              art={`cat-${category.id}`}
              icon={category.icon}
              ratio={banner ? "banner" : "wide"}
              fit={banner ? "cover" : "contain"}
              overlay={banner ? "subtle" : "hero"}
              {...(compact ? { className: "aspect-[8/2.25]" } : {})}
              {...(banner ? { imageSrc: banner.src, imageAlt: banner.alt } : {})}
            />
          </div>
          {comingSoon ? (
            <div aria-hidden className="absolute inset-0 bg-charcoal/25 backdrop-blur-[1px]" />
          ) : null}
        </div>
        {comingSoon ? (
          <div className="absolute right-3 top-3 z-10">
            <ComingSoonLockChip compact={compact} />
          </div>
        ) : null}
      </div>
      <div
        className={
          compact
            ? "flex items-start justify-between gap-3 p-3.5 sm:p-4"
            : "flex items-start justify-between gap-4 p-5"
        }
      >
        <div className="min-w-0">
          <h3 className="text-sm font-light tracking-tight text-foreground">{category.label}</h3>
          <p
            className={
              compact ? "mt-1 text-xs text-foreground/50" : "mt-1.5 text-xs text-foreground/50"
            }
          >
            {category.blurb}
          </p>
          <p
            className={
              compact
                ? "mt-2 text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50"
                : "mt-3 text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50"
            }
          >
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>
        {comingSoon ? (
          <Lock className="h-4 w-4 shrink-0 text-bronze/80" strokeWidth={1.6} aria-hidden />
        ) : (
          <ArrowUpRight className="h-4 w-4 shrink-0 text-bronze/90 transition-transform motion-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        )}
      </div>
    </>
  );
}

/** Category entry tile used on the store home and group shelves. */
export function CategoryTile({
  category,
  compact = false,
}: {
  category: StoreCategory;
  /** ~25% smaller footprint for dense store home grids. */
  compact?: boolean;
}) {
  const comingSoon = category.comingSoon === true;
  const body: ReactNode = (
    <CategoryTileBody category={category} compact={compact} comingSoon={comingSoon} />
  );

  if (comingSoon) {
    return (
      <article
        aria-disabled="true"
        aria-label={`${category.label}, coming soon`}
        className="block cursor-default overflow-hidden rounded-2xl border border-bronze/12 bg-charcoal/45 select-none"
      >
        {body}
      </article>
    );
  }

  return (
    <Link
      to="/geostore/category/$slug"
      params={{ slug: category.id }}
      className="group/card group block cursor-pointer overflow-hidden rounded-2xl border border-bronze/12 bg-charcoal/45 transition-all motion-base hover:border-bronze/35 hover:bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
    >
      {body}
    </Link>
  );
}
