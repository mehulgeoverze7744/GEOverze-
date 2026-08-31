import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Archive, Plus, RefreshCw, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { buildCollectionColumns } from "@/features/library/collections/columns";
import { filterCollections } from "@/features/library/collections/filtering";
import { useLibraryCollectionMutations } from "@/features/library/collections/hooks/useLibraryCollectionMutations";
import { useLibraryCollections } from "@/features/library/collections/hooks/useLibraryCollections";
import {
  emptyCollectionFilters,
  type CollectionFilterState,
} from "@/features/library/collections/types";
import { num } from "@/lib/format";

export const Route = createFileRoute("/library/collections/")({
  component: CollectionsDirectoryPage,
});

function CollectionsDirectoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters] = useState<CollectionFilterState>(emptyCollectionFilters);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { collections, loading, error, refetch } = useLibraryCollections();
  const mutations = useLibraryCollectionMutations();

  const rows = useMemo(
    () => filterCollections(collections, query, filters),
    [collections, query, filters],
  );
  const columns = useMemo(() => buildCollectionColumns(query), [query]);

  if (error) {
    return (
      <>
        <PageHeader title="GEOlibrary Collections" />
        <PageBody>
          <EmptyState
            title="Could not load collections"
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
        title="GEOlibrary Collections"
        description="Curated shelves and their reading order."
        actions={
          <Button size="sm" asChild>
            <Link to="/library/collections/new">
              <Plus className="size-4" aria-hidden="true" />
              New collection
            </Link>
          </Button>
        }
      />
      <PageBody>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search collections"
            placeholder="Search title, slug or curator…"
          />
          <Button size="sm" variant="outline" onClick={refetch}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(collections.length)} collections
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(item) => item.id}
          highlight={query}
          loading={loading}
          pageSize={25}
          onRowClick={(item) =>
            navigate({
              to: "/library/collections/$collectionId",
              params: { collectionId: item.id },
            })
          }
          emptyTitle="No collections match your search"
          emptyDescription="Try another search term or create a new collection."
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.curatorHandle} · {item.memberResourceIds.length} entries
              </p>
              <StatusBadge status={item.status} />
            </div>
          )}
          rowActions={[
            {
              label: "Open",
              onSelect: (item) =>
                navigate({
                  to: "/library/collections/$collectionId",
                  params: { collectionId: item.id },
                }),
            },
            { label: "Publish", onSelect: (item) => mutations.publish.mutate(item.id) },
            { label: "Archive", onSelect: (item) => mutations.archive.mutate(item.id) },
            {
              label: "Delete",
              destructive: true,
              onSelect: (item) => setDeleteId(item.id),
            },
          ]}
        />
      </PageBody>

      {deleteId ? (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && setDeleteId(null)}
          title="Delete this collection?"
          description="Membership rows are removed. GEOlibrary resources are not deleted."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            mutations.remove.mutate(deleteId);
            setDeleteId(null);
          }}
        />
      ) : null}
    </>
  );
}
