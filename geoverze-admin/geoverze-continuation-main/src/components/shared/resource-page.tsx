import { useState, type ReactNode } from "react";

import { PageHeader } from "@/components/shared/page-header";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { InspectorPanel } from "@/components/shared/inspector-panel";
import { PageBody } from "@/components/shared/page-body";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import type { DataTableRowAction } from "@/components/shared/data-table";

interface ResourcePageProps<T> {
  title: string;
  description: string;
  data: T[];
  columns: DataTableColumn<T>[];
  filters?: DataTableFilter<T>[] | undefined;
  getRowId: (row: T) => string;
  searchPlaceholder?: string | undefined;
  inspectorTitle?: ((row: T) => string) | undefined;
  renderInspector?: ((row: T) => ReactNode) | undefined;
  actions?: ReactNode | undefined;
  loading?: boolean | undefined;
  error?: string | null | undefined;
  onRetry?: (() => void) | undefined;
  rowActions?: DataTableRowAction<T>[] | undefined;
}

export function ResourcePage<T>({
  title,
  description,
  data,
  columns,
  filters,
  getRowId,
  searchPlaceholder,
  inspectorTitle,
  renderInspector,
  actions,
  loading,
  error,
  onRetry,
  rowActions,
}: ResourcePageProps<T>) {
  const [active, setActive] = useState<T | null>(null);

  return (
    <>
      <PageHeader title={title} description={description} actions={actions} />
      <PageBody>
        {error ? (
          <EmptyState
            title="Could not load records"
            description={error}
            action={
              onRetry ? (
                <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
                  Try again
                </Button>
              ) : null
            }
          />
        ) : (
        <DataTable
          data={data}
          columns={columns}
          filters={filters}
          getRowId={getRowId}
          loading={loading}
          searchPlaceholder={searchPlaceholder}
          onRowClick={renderInspector ? (row) => setActive(row) : undefined}
          rowActions={
            rowActions ?? [{ label: "View details", onSelect: (row) => setActive(row) }]
          }
        />
        )}
      </PageBody>
      {renderInspector && (
        <InspectorPanel
          open={active !== null}
          onOpenChange={(open) => !open && setActive(null)}
          title={active && inspectorTitle ? inspectorTitle(active) : "Record details"}
          description="Read-only preview of the selected record."
        >
          {active && renderInspector(active)}
        </InspectorPanel>
      )}
    </>
  );
}
