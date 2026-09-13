import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import type { Collection } from "../data/collections";
import { categoryLabel } from "../data/taxonomy";
import {
  libraryRailCardClass,
  libraryRailMediaClass,
} from "../lib/library-rail-layout";
import { CollectionCardCover } from "./CollectionCardCover";

type LibraryCollectionCardProps = {
  collection: Collection;
  className?: string;
};

/** Featured collection tile for GEOlibrary home rails. */
export function LibraryCollectionCard({ collection, className }: LibraryCollectionCardProps) {
  return (
    <Link
      data-rail-item
      to="/geolibrary/collections/$slug"
      params={{ slug: collection.slug }}
      aria-label={collection.title}
      className={cn(
        "glass-panel surface-gradient group flex flex-col overflow-hidden rounded-2xl transition-all motion-base hover:border-bronze/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
        libraryRailCardClass,
        className,
      )}
    >
      <div className={cn(libraryRailMediaClass, "[&>*]:h-full")}>
        <CollectionCardCover collection={collection} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <p className="text-[0.58rem] uppercase tracking-[0.2em] text-bronze/85">
          {categoryLabel(collection.category)}
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-light leading-snug text-foreground">
          {collection.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-[0.8rem] leading-relaxed text-foreground/50">
          {collection.description}
        </p>
        <p className="mt-3 text-[0.68rem] uppercase tracking-[0.2em] text-bronze/90">
          {collection.articles.length} entries
        </p>
      </div>
    </Link>
  );
}
