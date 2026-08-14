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
import { notReady } from "@/lib/placeholder";

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
}: ResourcePageProps<T>) {
  const [active, setActive] = useState<T | null>(null);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          actions ?? (
            <Button
              variant="outline"
              size="sm"
              onClick={notReady("This action connects to the backend later.")}
            >
              New record
            </Button>
          )
        }
      />
      <PageBody>
        <DataTable
          data={data}
          columns={columns}
          filters={filters}
          getRowId={getRowId}
          searchPlaceholder={searchPlaceholder}
          onRowClick={renderInspector ? (row) => setActive(row) : undefined}
          rowActions={[
            { label: "View details", onSelect: (row) => setActive(row) },
            { label: "Edit", onSelect: notReady("Editing is not wired up yet.") },
            {
              label: "Delete",
              destructive: true,
              onSelect: notReady("Deletion requires backend integration."),
            },
          ]}
        />
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
