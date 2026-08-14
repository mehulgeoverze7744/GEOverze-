import { Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { GeoButton } from "@/components/shared/GeoButton";
import { cn } from "@/lib/utils";
import { STUDIO_ARTICLES } from "../data/articles";
import { categoryLabel } from "../data/creator";
import { STATUS_LABEL, type ContentStatus } from "../data/types";
import { CoverThumb } from "../components/CoverThumb";
import { StatusPill } from "../components/StatusPill";
import { StudioContext } from "../components/StudioContext";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel } from "../components/StudioPanel";
import { formatNumber, formatRelative } from "../lib/format";

const STATUS_FILTERS: (ContentStatus | "all")[] = [
  "all",
  "draft",
  "in-review",
  "scheduled",
  "published",
  "rejected",
  "archived",
];

/** Content Studio index: long-form articles for GEOlibrary. */
export function ArticleListScreen() {
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [query, setQuery] = useState("");

  const articles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STUDIO_ARTICLES.filter(
      (a) =>
        (status === "all" || a.status === status) &&
        (q === "" || a.title.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q))),
    );
  }, [status, query]);

  return (
    <StudioShell context={<StudioContext tipIndex={2} />}>
      <StudioHeader
        eyebrow="Create"
        title="Articles"
        description="Write, structure and publish long-form geography content into GEOlibrary."
        actions={
          <GeoButton asChild size="sm" variant="primary" className="gap-2">
            <Link to="/studio/articles/new">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
              New article
            </Link>
          </GeoButton>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex min-w-[14rem] flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-foreground/50"
            strokeWidth={1.8}
            aria-hidden
          />
          <label htmlFor="article-filter" className="sr-only">
            Filter articles
          </label>
          <input
            id="article-filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title or tag"
            className="h-9 w-full rounded-lg border border-bronze/15 bg-[oklch(0.175_0.006_60)] pl-9 pr-3 text-[0.8rem] text-foreground outline-none placeholder:text-foreground/50 focus:border-bronze/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.72rem] transition-colors",
                status === s
                  ? "border-bronze/60 bg-bronze/12 text-bronze-glow"
                  : "border-bronze/12 text-foreground/50 hover:border-bronze/30 hover:text-foreground/80",
              )}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title="No articles match those filters"
          description="Adjust the status filter or start a new draft."
        />
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <StudioPanel key={article.id} padded={false}>
              <Link
                to="/studio/articles/$articleId"
                params={{ articleId: article.id }}
                className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-bronze/[0.04]"
              >
                <CoverThumb
                  artKey={article.coverKey}
                  label={article.title}
                  className="h-16 w-24 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
                      {article.title || "Untitled article"}
                    </h3>
                    <StatusPill status={article.status} />
                  </div>
                  <p className="mt-1.5 line-clamp-1 text-[0.8rem] text-foreground/50">
                    {article.summary}
                  </p>
                  <p className="mt-1.5 text-[0.7rem] text-foreground/50">
                    {categoryLabel(article.categoryId)} · {article.blocks.length} blocks ·{" "}
                    {article.readMinutes} min read · edited {formatRelative(article.updatedAt)}
                  </p>
                </div>
                <dl className="flex shrink-0 gap-6 text-[0.75rem]">
                  <div>
                    <dt className="text-foreground/50">Views</dt>
                    <dd className="mt-0.5 tabular-nums text-foreground/75">
                      {formatNumber(article.views)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-foreground/50">Bookmarks</dt>
                    <dd className="mt-0.5 tabular-nums text-foreground/75">
                      {formatNumber(article.bookmarks)}
                    </dd>
                  </div>
                </dl>
              </Link>
            </StudioPanel>
          ))}
        </div>
      )}
    </StudioShell>
  );
}
