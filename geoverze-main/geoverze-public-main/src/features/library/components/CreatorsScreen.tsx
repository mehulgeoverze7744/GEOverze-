import { Link } from "@tanstack/react-router";

import { PageHeader, SectionContainer } from "@/components/shared";

import { CREATORS } from "../data/creators";

/** Creator directory. */
export function CreatorsScreen() {
  return (
    <SectionContainer>
      <PageHeader
        eyebrow="GEOlibrary"
        title="Creators"
        description="The cartographers, writers and researchers behind the library."
      />
      <div className="mb-8 mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CREATORS.map((creator) => (
          <Link
            key={creator.handle}
            to="/geolibrary/creators/$handle"
            params={{ handle: creator.handle }}
            className="glass-panel surface-gradient rounded-2xl p-6 transition-all motion-base hover:border-bronze/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
              {creator.role}
            </p>
            <h2 className="mt-3 text-base font-light text-foreground">{creator.name}</h2>
            <p className="mt-2 line-clamp-3 text-[0.8rem] leading-relaxed text-foreground/50">
              {creator.bio}
            </p>
            <p className="mt-4 text-[0.68rem] text-foreground/50">
              {creator.followers.toLocaleString()} followers · {creator.location}
            </p>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
