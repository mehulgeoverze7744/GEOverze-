import { Star } from "lucide-react";

import type { DataTableColumn } from "@/components/shared/data-table";
import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/features/users/format";

import type { LibraryCollection } from "./types";

export function buildCollectionColumns(query: string): DataTableColumn<LibraryCollection>[] {
  return [
    {
      id: "title",
      header: "Collection",
      accessor: (c) => c.title,
      className: "max-w-72",
      cell: (c) => (
        <div className="max-w-72">
          <span className="flex items-center gap-1.5 truncate font-medium text-foreground">
            {c.featured && (
              <Star className="size-3.5 shrink-0 fill-warning text-warning" aria-label="Featured" />
            )}
            <Highlight text={c.title} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">/{c.slug}</span>
        </div>
      ),
    },
    { id: "category", header: "Category", accessor: (c) => c.subjectCategory },
    { id: "continent", header: "Continent", accessor: (c) => c.continent },
    {
      id: "curator",
      header: "Curator",
      accessor: (c) => c.curatorHandle,
      cell: (c) => <Highlight text={c.curatorHandle} query={query} />,
    },
    {
      id: "entries",
      header: "Entries",
      accessor: (c) => c.memberResourceIds.length,
    },
    {
      id: "status",
      header: "Status",
      accessor: (c) => c.status,
      cell: (c) => <StatusBadge status={c.status} />,
    },
    {
      id: "updated",
      header: "Updated",
      accessor: (c) => c.updatedAt,
      cell: (c) => formatDate(c.updatedAt),
      defaultHidden: true,
    },
  ];
}
