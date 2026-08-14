import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { AnimatedSection, GeoButton, SectionHeading } from "@/components/shared";
import { cn } from "@/lib/utils";

import { POSTS, RECENT_POSTS, TRENDING_POSTS } from "../data/posts";
import { FEED_FILTERS, filterFeed, type FeedFilterId } from "../lib/search";
import { PostCard } from "../components/PostCard";
import { PostComposer } from "../components/PostComposer";
import {
  FeaturedExplorersPanel,
  SuggestedCommunitiesPanel,
  SuggestedCreatorsPanel,
} from "../components/Rails";

function FeedTabs({
  value,
  onChange,
}: {
  value: FeedFilterId;
  onChange: (id: FeedFilterId) => void;
}) {
  return (
    <div role="tablist" aria-label="Filter the feed" className="-mx-1 flex flex-wrap gap-1.5 px-1">
      {FEED_FILTERS.map((filter) => (
        <button
          key={filter.id}
          role="tab"
          type="button"
          aria-selected={value === filter.id}
          onClick={() => onChange(filter.id)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[0.66rem] uppercase tracking-[0.16em] transition-[color,border-color,transform] motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 active:scale-[0.97]",
            value === filter.id
              ? "border-bronze/55 bg-bronze/10 text-bronze-glow"
              : "border-bronze/15 text-foreground/50 hover:border-bronze/40 hover:text-foreground/85",
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

/** Community home: composer, highlights, and a preview of the live feed. */
export function CommunityHome() {
  return (
    <div className="space-y-8">
      <AnimatedSection>
        <p className="eyebrow">Community</p>
        <h1 className="mt-3 font-light leading-[1.05] tracking-tight text-foreground text-[clamp(1.9rem,4vw,2.9rem)]">
          Where explorers compare notes
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/60">
          Share what you learn, settle arguments about borders, celebrate a streak, and find people
          who take geography as seriously as you do.
        </p>
      </AnimatedSection>

      <PostComposer />

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Trending"
          title="Discussions worth joining"
          action={
            <GeoButton variant="ghost" size="sm" asChild>
              <Link to="/community/feed">Open feed</Link>
            </GeoButton>
          }
        />
        <div className="space-y-5">
          {TRENDING_POSTS.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading eyebrow="Latest" title="Fresh from the community" />
        <div className="space-y-5">
          {RECENT_POSTS.slice(0, 4).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        <GeoButton variant="dark" size="sm" className="w-full" asChild>
          <Link to="/community/feed">See everything</Link>
        </GeoButton>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <FeaturedExplorersPanel />
        <SuggestedCreatorsPanel />
      </div>
      <SuggestedCommunitiesPanel />
    </div>
  );
}

/** The full feed with type filters and a simple sort control. */
export function CommunityFeed() {
  const [filter, setFilter] = useState<FeedFilterId>("all");
  const [sort, setSort] = useState<"recent" | "top">("recent");

  const posts = [...filterFeed(filter)].sort((a, b) =>
    sort === "top" ? b.likes - a.likes : a.createdAt < b.createdAt ? 1 : -1,
  );

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <p className="eyebrow">Feed</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Everything happening now
        </h1>
      </AnimatedSection>

      <PostComposer />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <FeedTabs value={filter} onChange={setFilter} />
        <div className="flex shrink-0 gap-1.5">
          {(["recent", "top"] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={sort === id}
              onClick={() => setSort(id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] transition-colors motion-snap",
                sort === id
                  ? "border-bronze/50 text-bronze-glow"
                  : "border-bronze/15 text-foreground/50 hover:border-bronze/35",
              )}
            >
              {id === "recent" ? "Recent" : "Top"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[0.68rem] uppercase tracking-[0.18em] text-foreground/50">
        {posts.length} of {POSTS.length} posts
      </p>

      <div className="space-y-5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
