import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { buildCreatorPersonaColumns } from "@/features/library/creator-personas/columns";
import { filterCreatorPersonas } from "@/features/library/creator-personas/filtering";
import { useLibraryCreatorMutations } from "@/features/library/creator-personas/hooks/useLibraryCreatorMutations";
import { useLibraryCreatorPersonas } from "@/features/library/creator-personas/hooks/useLibraryCreatorPersonas";
import {
  emptyCreatorPersonaFilters,
  type CreatorPersonaFilterState,
} from "@/features/library/creator-personas/types";
import { num } from "@/lib/format";

export const Route = createFileRoute("/library/creators/")({
  component: LibraryCreatorsDirectoryPage,
});

function LibraryCreatorsDirectoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters] = useState<CreatorPersonaFilterState>(emptyCreatorPersonaFilters);
  const [deleteHandle, setDeleteHandle] = useState<string | null>(null);

  const { personas, loading, error, refetch } = useLibraryCreatorPersonas();
  const mutations = useLibraryCreatorMutations();

  const rows = useMemo(
    () => filterCreatorPersonas(personas, query, filters),
    [personas, query, filters],
  );
  const columns = useMemo(() => buildCreatorPersonaColumns(query), [query]);

  if (error) {
    return (
      <>
        <PageHeader title="Library Creators" />
        <PageBody>
          <EmptyState
            title="Could not load creators"
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
        title="Library Creators"
        description="GEOlibrary creator personas, avatars and featured shelves."
        actions={
          <Button size="sm" asChild>
            <Link to="/library/creators/new">
              <Plus className="size-4" aria-hidden="true" />
              New creator
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
            label="Search creators"
            placeholder="Search name, handle or role…"
          />
          <Button size="sm" variant="outline" onClick={refetch}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(personas.length)} creators
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(item) => item.handle}
          highlight={query}
          loading={loading}
          pageSize={25}
          onRowClick={(item) =>
            navigate({ to: "/library/creators/$handle", params: { handle: item.handle } })
          }
          emptyTitle="No creators match your search"
          emptyDescription="Try another search term or create a new creator persona."
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.displayName}</p>
              <p className="text-xs text-muted-foreground">@{item.handle}</p>
            </div>
          )}
          rowActions={[
            {
              label: "Open",
              onSelect: (item) =>
                navigate({ to: "/library/creators/$handle", params: { handle: item.handle } }),
            },
            {
              label: "Delete",
              destructive: true,
              onSelect: (item) => setDeleteHandle(item.handle),
            },
          ]}
        />
      </PageBody>

      {deleteHandle ? (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && setDeleteHandle(null)}
          title="Delete this creator?"
          description="Resources authored by this handle are not deleted. Seeded personas should usually remain admin-managed."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            mutations.remove.mutate(deleteHandle);
            setDeleteHandle(null);
          }}
        />
      ) : null}
    </>
  );
}
