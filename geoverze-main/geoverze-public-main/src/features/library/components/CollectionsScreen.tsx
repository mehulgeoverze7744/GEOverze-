import { Link } from "@tanstack/react-router";
import { Library } from "lucide-react";

import { EmptyState, PageHeader, SectionContainer } from "@/components/shared";

import { LibraryMediaImage } from "./LibraryMediaImage";

import { usePublishedCollections } from "../hooks/usePublishedCollections";

/** All curated shelves. */
export function CollectionsScreen() {
  const { collections, loading, error } = usePublishedCollections();

  if (error) {
    return (
      <SectionContainer>
        <EmptyState title="Could not load collections" description={error} />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <PageHeader
        eyebrow="GEOlibrary"
        title="Collections"
        description="Curated shelves that take you through a topic in a deliberate order."
      />
      <div className="mb-8 mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-foreground/50">Loading collections…</p>
        ) : (
          collections.map((collection) => (
            <Link
              key={collection.slug}
              to="/geolibrary/collections/$slug"
              params={{ slug: collection.slug }}
              className="glass-panel surface-gradient overflow-hidden rounded-2xl transition-all motion-base hover:border-bronze/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
            >
              <LibraryMediaImage storagePath={collection.art} fallbackArt={collection.art} icon={Library} />
              <div className="p-5">
                <h2 className="text-base font-light text-foreground">{collection.title}</h2>
                <p className="mt-2 line-clamp-2 text-[0.8rem] text-foreground/50">
                  {collection.description}
                </p>
                <p className="mt-3 text-[0.68rem] uppercase tracking-[0.2em] text-bronze/90">
                  {collection.articles.length} entries
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </SectionContainer>
  );
}
