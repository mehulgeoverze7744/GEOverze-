import { Link } from "@tanstack/react-router";

import { BrandMark, EmptyState, PageHeader, SectionContainer } from "@/components/shared";

import { usePublishedCreators } from "../hooks/usePublishedCreators";

/** Official Library creator. */
export function CreatorsScreen() {
  const { creators, loading, error } = usePublishedCreators();

  if (error) {
    return (
      <SectionContainer>
        <EmptyState title="Could not load creators" description={error} />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <PageHeader
        eyebrow="GVRZE Library"
        title="Creators"
        description="The official editorial team behind GVRZE Library."
      />
      <div className="mb-8 mt-10 flex justify-center">
        {loading ? (
          <p className="text-sm text-foreground/50">Loading creators…</p>
        ) : (
          creators.map((creator) => (
            <Link
              key={creator.handle}
              to="/geolibrary/creators/$handle"
              params={{ handle: creator.handle }}
              className="glass-panel surface-gradient w-full max-w-xl rounded-2xl p-8 text-center transition-all motion-base hover:border-bronze/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 sm:p-10"
            >
              <BrandMark size="xl" className="mx-auto" />
              <p className="mt-6 text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
                {creator.role}
              </p>
              <h2 className="mt-3 text-2xl font-light text-foreground">{creator.name}</h2>
              <p className="mx-auto mt-4 max-w-md text-[0.85rem] leading-relaxed text-foreground/55">
                {creator.bio}
              </p>
              <p className="mt-6 text-[0.72rem] text-foreground/50">{creator.location}</p>
            </Link>
          ))
        )}
      </div>
    </SectionContainer>
  );
}
