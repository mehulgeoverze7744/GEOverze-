import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Archive, Download, Plus, RefreshCw, Star, Trash2 } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Widget } from "@/components/shared/widget";
import { Button } from "@/components/ui/button";
import { buildLibraryColumns } from "@/features/library/columns";
import {
  libraryCategorySeries,
  libraryRegionSeries,
  libraryViewsSeries,
  popularCategories,
  summarizeLibrary,
  topArticles,
} from "@/features/library/data";
import { filterLibrary } from "@/features/library/filtering";
import { useLibraryMutations } from "@/features/library/hooks/useLibraryMutations";
import { useLibraryResources } from "@/features/library/hooks/useLibraryResources";
import { LibraryFilters } from "@/features/library/library-filters";
import { LibraryStats } from "@/features/library/library-stats";
import { emptyLibraryFilters, type LibraryFilterState } from "@/features/library/types";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";
import { notReady } from "@/lib/placeholder";

export const Route = createFileRoute("/library/")({
  head: () => ({
    meta: [
      { title: "GEOlibrary Directory — GEOverze Admin" },
      {
        name: "description",
        content:
          "Browse, filter and publish GEOlibrary articles, country profiles, maps, infographics and PDFs.",
      },
      { property: "og:title", content: "GEOlibrary Directory — GEOverze Admin" },
      {
        property: "og:description",
        content: "Editorial directory for every GEOlibrary resource.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LibraryDirectoryPage,
});

function LibraryDirectoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<LibraryFilterState>(emptyLibraryFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  const { resources, loading, error, refetch } = useLibraryResources();
  const mutations = useLibraryMutations();

  const rows = useMemo(
    () => filterLibrary(resources, query, filters),
    [resources, query, filters],
  );
  const columns = useMemo(() => buildLibraryColumns(query), [query]);
  const summary = useMemo(() => summarizeLibrary(resources), [resources]);
  const views = useMemo(() => libraryViewsSeries(resources), [resources]);
  const categories = useMemo(() => libraryCategorySeries(resources), [resources]);
  const regionSeries = useMemo(() => libraryRegionSeries(resources), [resources]);
  const featured = useMemo(
    () => resources.filter((item) => item.featured).slice(0, 4),
    [resources],
  );
  const top = useMemo(() => topArticles(resources), [resources]);
  const popular = useMemo(() => popularCategories(resources), [resources]);

  if (error) {
    return (
      <>
        <PageHeader title="GEOlibrary Management" />
        <PageBody>
          <EmptyState
            title="Could not load GEOlibrary"
            description={error}
            action={
              <Button size="sm" onClick={refetch}>
                Retry
              </Button>
            }
          />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="GEOlibrary Management"
        description="Articles, country profiles, continent collections, maps, infographics and PDFs."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={notReady("Export queued — backend integration pending.")}>
              <Download className="size-4" aria-hidden="true" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link to="/library/new">
                <Plus className="size-4" aria-hidden="true" />
                New resource
              </Link>
            </Button>
          </>
        }
      />

      <PageBody>
        <LibraryStats summary={summary} state={loading ? "loading" : "ready"} />

        <div className="grid gap-3 lg:grid-cols-3">
          <ChartCard
            title="Views over time"
            description="Analytics not connected — placeholder only"
            series={views}
            labels={catalogMonths}
            state={loading ? "loading" : "ready"}
          />
          <ChartCard
            title="Resources by category"
            series={categories.series}
            labels={categories.labels}
            state={loading ? "loading" : "ready"}
          />
          <ChartCard
            title="Coverage by region"
            series={regionSeries.series}
            labels={regionSeries.labels}
            state={loading ? "loading" : "ready"}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Widget title="Top articles" description="Ordered by recency until analytics ship">
            <ol className="divide-y divide-border">
              {top.map((item) => (
                <li key={item.id} className="flex items-center gap-2 py-2 text-sm">
                  <Link
                    to="/library/$resourceId"
                    params={{ resourceId: item.id }}
                    className="min-w-0 flex-1 truncate hover:underline"
                  >
                    {item.title}
                  </Link>
                  <span className="text-xs text-muted-foreground tabular">{num(item.views)}</span>
                </li>
              ))}
            </ol>
          </Widget>
          <Widget title="Popular categories" description="Distribution by resource kind">
            <ol className="divide-y divide-border">
              {popular.map((entry) => (
                <li key={entry.label} className="flex items-center gap-2 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                  <span className="text-xs text-muted-foreground tabular">{num(entry.views)}</span>
                </li>
              ))}
            </ol>
          </Widget>
        </div>

        {featured.length > 0 && (
          <section
            aria-label="Featured content"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {featured.map((item) => (
              <Link
                key={item.id}
                to="/library/$resourceId"
                params={{ resourceId: item.id }}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-strong"
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase">
                  <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
                  Featured
                </span>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.category} · {item.status}
                </p>
              </Link>
            ))}
          </section>
        )}

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            {
              label: "Publish selected",
              onSelect: () => {
                selectedIds.forEach((id) => mutations.publish.mutate(id));
                setSelectedIds([]);
              },
            },
            {
              label: "Unpublish selected",
              onSelect: () => {
                selectedIds.forEach((id) => mutations.unpublish.mutate(id));
                setSelectedIds([]);
              },
            },
            {
              label: "Archive selected",
              icon: <Archive className="size-4" aria-hidden="true" />,
              onSelect: () => {
                selectedIds.forEach((id) => mutations.archive.mutate(id));
                setSelectedIds([]);
              },
            },
            {
              label: "Delete selected",
              variant: "destructive",
              icon: <Trash2 className="size-4" aria-hidden="true" />,
              onSelect: () => setDeleteIds([...selectedIds]),
            },
          ]}
          actions={[
            {
              label: "Refresh",
              icon: <RefreshCw className="size-4" aria-hidden="true" />,
              onSelect: refetch,
            },
          ]}
        >
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search resources"
            placeholder="Search title, slug, author, country or tag…"
          />
        </ActionToolbar>

        <LibraryFilters value={filters} onChange={setFilters} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(resources.length)} resources
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(item) => item.id}
          highlight={query}
          hideToolbar
          hideBulkBar
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          loading={loading}
          pageSize={25}
          onRowClick={(item) =>
            navigate({ to: "/library/$resourceId", params: { resourceId: item.id } })
          }
          emptyTitle="No resources match your search"
          emptyDescription="Try another search term or clear the filters."
          emptyAction={
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                setQuery("");
                setFilters(emptyLibraryFilters);
              }}
            >
              Clear search and filters
            </Button>
          }
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.category} · {item.author} · {item.status}
              </p>
              <div className="flex items-center gap-2">
                <DifficultyBadge level={item.difficulty} />
                <StatusBadge status={item.status} />
              </div>
            </div>
          )}
          rowActions={[
            {
              label: "Open",
              onSelect: (item) =>
                navigate({ to: "/library/$resourceId", params: { resourceId: item.id } }),
            },
            { label: "Publish", onSelect: (item) => mutations.publish.mutate(item.id) },
            {
              label: "Send to review",
              onSelect: (item) => mutations.submitForReview.mutate(item.id),
            },
            {
              label: "Toggle featured",
              onSelect: (item) =>
                mutations.feature.mutate({ id: item.id, featured: !item.featured }),
            },
            { label: "Duplicate", onSelect: (item) => mutations.duplicate.mutate(item.id) },
            { label: "Archive", onSelect: (item) => mutations.archive.mutate(item.id) },
            {
              label: "Delete",
              destructive: true,
              onSelect: (item) => setDeleteIds([item.id]),
            },
          ]}
        />
      </PageBody>

      {deleteIds && (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && setDeleteIds(null)}
          title={
            deleteIds.length === 1 ? "Delete this resource?" : `Delete ${deleteIds.length} resources?`
          }
          description="The resource is removed from GEOlibrary. This cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            deleteIds.forEach((id) => mutations.remove.mutate(id));
            setDeleteIds(null);
            setSelectedIds([]);
          }}
        />
      )}
    </>
  );
}
