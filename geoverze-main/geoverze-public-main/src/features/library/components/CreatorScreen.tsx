import { getRouteApi } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";

import { BrandMark, EmptyState, SectionContainer } from "@/components/shared";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryCard } from "./LibraryCard";
import { useCreatorByHandle } from "../hooks/usePublishedCreators";
import { useLibrarySubscriptionTier } from "../hooks/useLibrarySubscriptionTier";
import { getResourceAccessState } from "../lib/access-tier";

const routeApi = getRouteApi("/geolibrary/creators/$handle");

/** Official creator profile and the Library entries they publish. */
export function CreatorScreen() {
  const { handle } = routeApi.useParams();
  const { creator, articles, loading, error } = useCreatorByHandle(handle);
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);
  const { tier, signedIn } = useLibrarySubscriptionTier();

  if (loading) {
    return (
      <SectionContainer>
        <p className="text-sm text-foreground/50">Loading creator…</p>
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <SectionContainer>
        <EmptyState title="Could not load creator" description={error} />
      </SectionContainer>
    );
  }

  if (!creator) {
    return (
      <SectionContainer>
        <EmptyState title="Creator not found" description="This profile is no longer available." />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:text-left">
        <BrandMark size="xl" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">{creator.role}</p>
          <h1 className="mt-4 flex items-center justify-center gap-2 font-light tracking-tight text-foreground text-[clamp(2rem,4vw,3rem)] sm:justify-start">
            {creator.name}
            {creator.verified ? (
              <BadgeCheck className="size-6 shrink-0 text-primary" aria-label="Verified creator" />
            ) : null}
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            {creator.bio}
          </p>
          {creator.location ? (
            <p className="mt-6 text-xs text-foreground/50">{creator.location}</p>
          ) : null}
        </div>
      </div>
      <h2 className="mt-12 text-lg font-light tracking-tight text-foreground">Published entries</h2>
      <div className="mb-8 mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <LibraryCard
            key={article.slug}
            article={article}
            saved={bookmarks.includes(article.slug)}
            onToggleBookmark={toggleBookmark}
            accessState={getResourceAccessState(article.minAccessTier, tier, signedIn)}
          />
        ))}
      </div>
    </SectionContainer>
  );
}
