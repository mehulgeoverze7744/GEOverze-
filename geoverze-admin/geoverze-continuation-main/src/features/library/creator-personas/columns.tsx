import { BadgeCheck } from "lucide-react";

import type { DataTableColumn } from "@/components/shared/data-table";
import { Highlight } from "@/components/shared/highlight";
import { formatDate } from "@/features/users/format";

import type { LibraryCreatorPersona } from "./types";

export function buildCreatorPersonaColumns(
  query: string,
): DataTableColumn<LibraryCreatorPersona>[] {
  return [
    {
      id: "name",
      header: "Creator",
      accessor: (c) => c.displayName,
      className: "max-w-72",
      cell: (c) => (
        <div className="max-w-72">
          <span className="flex items-center gap-1.5 truncate font-medium text-foreground">
            {c.verified && (
              <BadgeCheck className="size-3.5 shrink-0 text-primary" aria-label="Verified" />
            )}
            <Highlight text={c.displayName} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">@{c.handle}</span>
        </div>
      ),
    },
    { id: "role", header: "Role", accessor: (c) => c.role },
    {
      id: "location",
      header: "Location",
      accessor: (c) => c.location,
      defaultHidden: true,
    },
    {
      id: "linked",
      header: "Account",
      accessor: (c) => (c.userId ? "linked" : "admin-managed"),
      cell: (c) => (
        <span className="text-xs text-muted-foreground">
          {c.userId ? "Linked user" : "Admin-managed"}
        </span>
      ),
    },
    {
      id: "joined",
      header: "Joined",
      accessor: (c) => c.joinedAt,
      cell: (c) => formatDate(c.joinedAt),
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
