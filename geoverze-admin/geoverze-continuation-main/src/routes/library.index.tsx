import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Archive, Download, Plus, RefreshCw, Star, Trash2 } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
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
  libraryResources,
  libraryViewsSeries,
  popularCategories,
  summarizeLibrary,
  topArticles,
} from "@/features/library/data";
import { filterLibrary } from "@/features/library/filtering";
import { LibraryFilters } from "@/features/library/library-filters";
import { LibraryStats } from "@/features/library/library-stats";
import { emptyLibraryFilters, type LibraryFilterState } from "@/features/library/types";
import { useLibraryActions } from "@/features/library/use-library-actions";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";

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
  const [loading, setLoading] = useState(false);

  const actions = useLibraryActions(libraryResources);
  const rows = useMemo(
    () => filterLibrary(actions.resources, query, filters),
    [actions.resources, query, filters],
  );
  const columns = useMemo(() => buildLibraryColumns(query), [query]);
  const summary = useMemo(() => summarizeLibrary(actions.resources), [actions.resources]);
  const views = useMemo(() => libraryViewsSeries(actions.resources), [actions.resources]);
  const categories = useMemo(() => libraryCategorySeries(actions.resources), [actions.resources]);
  const regionSeries = useMemo(() => libraryRegionSeries(actions.resources), [actions.resources]);
  const featured = useMemo(
    () => actions.resources.filter((item) => item.featured).slice(0, 4),
    [actions.resources],
  );
  const top = useMemo(() => topArticles(actions.resources), [actions.resources]);
  const popular = useMemo(() => popularCategories(actions.resources), [actions.resources]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <>
      <PageHeader
        title="GEOlibrary Management"
        description="Articles, country profiles, continent collections, maps, infographics and PDFs."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={actions.placeholder("Export queued — backend integration pending.")}
            >
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
            description="Rolling 12 months across the library"
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
          <Widget title="Top articles" description="Highest lifetime views">
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
          <Widget title="Popular categories" description="Views by category">
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
                  {item.category} · {num(item.views)} views
                </p>
              </Link>
            ))}
          </section>
        )}

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            { label: "Publish selected", onSelect: () => actions.publish(selectedIds) },
            { label: "Unpublish selected", onSelect: () => actions.unpublish(selectedIds) },
            {
              label: "Archive selected",
              icon: <Archive className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestArchive(selectedIds),
            },
            {
              label: "Delete selected",
              variant: "destructive",
              icon: <Trash2 className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestDelete(selectedIds),
            },
          ]}
          actions={[
            {
              label: "Refresh",
              icon: <RefreshCw className="size-4" aria-hidden="true" />,
              onSelect: refresh,
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
          {num(rows.length)} of {num(actions.resources.length)} resources
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
                {item.category} · {item.author} · {num(item.views)} views
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
            { label: "Publish", onSelect: (item) => actions.publish([item.id]) },
            { label: "Send to review", onSelect: (item) => actions.submitForReview([item.id]) },
            { label: "Toggle featured", onSelect: (item) => actions.toggleFeatured(item.id) },
            { label: "Duplicate", onSelect: (item) => actions.duplicate(item) },
            { label: "Archive", onSelect: (item) => actions.requestArchive([item.id]) },
            {
              label: "Delete",
              destructive: true,
              onSelect: (item) => actions.requestDelete([item.id]),
            },
          ]}
        />
      </PageBody>

      {actions.confirm && (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && actions.setConfirm(null)}
          title={actions.confirm.title}
          description={actions.confirm.description}
          confirmLabel={actions.confirm.confirmLabel}
          destructive={actions.confirm.destructive}
          onConfirm={() => {
            actions.confirm?.onConfirm();
            actions.setConfirm(null);
          }}
        />
      )}
    </>
  );
}
