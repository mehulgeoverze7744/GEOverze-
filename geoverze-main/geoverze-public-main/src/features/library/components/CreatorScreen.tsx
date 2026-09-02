import { getRouteApi } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";

import { EmptyState, SectionContainer } from "@/components/shared";
import { isLibraryMediaPath } from "@/lib/supabase/library-media";
import { useLibraryStore } from "@/stores/libraryStore";

import { LibraryCard } from "./LibraryCard";
import { LibraryMediaImage } from "./LibraryMediaImage";
import { useCreatorByHandle } from "../hooks/usePublishedCreators";
import { useLibrarySubscriptionTier } from "../hooks/useLibrarySubscriptionTier";
import { getResourceAccessState } from "../lib/access-tier";

const routeApi = getRouteApi("/geolibrary/creators/$handle");

/** Creator profile with their published entries. */
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
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <LibraryMediaImage
          storagePath={isLibraryMediaPath(creator.art) ? creator.art : null}
          fallbackArt={creator.art}
          alt={creator.name}
          ratio="square"
          className="mx-auto w-32 shrink-0 overflow-hidden rounded-full sm:mx-0 sm:w-40"
        />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{creator.role}</p>
          <h1 className="mt-4 flex items-center gap-2 font-light tracking-tight text-foreground text-[clamp(2rem,4vw,3rem)]">
            {creator.name}
            {creator.verified ? (
              <BadgeCheck className="size-6 shrink-0 text-primary" aria-label="Verified creator" />
            ) : null}
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            {creator.bio}
          </p>
          <p className="mt-6 text-xs text-foreground/50">
            joined {creator.joinedAt}
            {creator.location ? ` · ${creator.location}` : ""}
          </p>
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
