import { Link } from "@tanstack/react-router";
import { Library } from "lucide-react";

import { PageHeader, SectionContainer } from "@/components/shared";
import { CoverArt } from "@/features/play/components/CoverArt";

import { COLLECTIONS } from "../data/collections";

/** All curated shelves. */
export function CollectionsScreen() {
  return (
    <SectionContainer>
      <PageHeader
        eyebrow="GEOlibrary"
        title="Collections"
        description="Curated shelves that take you through a topic in a deliberate order."
      />
      <div className="mb-8 mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((collection) => (
          <Link
            key={collection.slug}
            to="/geolibrary/collections/$slug"
            params={{ slug: collection.slug }}
            className="glass-panel surface-gradient overflow-hidden rounded-2xl transition-all motion-base hover:border-bronze/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            <CoverArt art={collection.art} icon={Library} />
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
        ))}
      </div>
    </SectionContainer>
  );
}
