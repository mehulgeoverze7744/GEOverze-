import { Star } from "lucide-react";

import type { DataTableColumn } from "@/components/shared/data-table";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/users/format";
import type { LibraryResource } from "@/features/library/types";
import { num } from "@/lib/format";

export function buildLibraryColumns(query: string): DataTableColumn<LibraryResource>[] {
  return [
    {
      id: "title",
      header: "Resource",
      accessor: (r) => r.title,
      className: "max-w-72",
      cell: (r) => (
        <div className="max-w-72">
          <span className="flex items-center gap-1.5 truncate font-medium text-foreground">
            {r.featured && (
              <Star className="size-3.5 shrink-0 fill-warning text-warning" aria-label="Featured" />
            )}
            <Highlight text={r.title} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">/{r.slug}</span>
        </div>
      ),
    },
    { id: "category", header: "Category", accessor: (r) => r.category },
    {
      id: "country",
      header: "Country",
      accessor: (r) => r.country,
      cell: (r) => <Highlight text={r.country} query={query} />,
    },
    { id: "region", header: "Region", accessor: (r) => r.region },
    {
      id: "difficulty",
      header: "Difficulty",
      accessor: (r) => r.difficulty,
      cell: (r) => <DifficultyBadge level={r.difficulty} />,
    },
    {
      id: "tags",
      header: "Tags",
      accessor: (r) => r.tags.join(" "),
      defaultHidden: true,
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    { id: "language", header: "Language", accessor: (r) => r.language, defaultHidden: true },
    {
      id: "author",
      header: "Author",
      accessor: (r) => r.author,
      cell: (r) => <Highlight text={r.author} query={query} />,
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: "featured",
      header: "Featured",
      accessor: (r) => (r.featured ? "Yes" : "No"),
      defaultHidden: true,
    },
    {
      id: "views",
      header: "Views",
      accessor: (r) => r.views,
      align: "right",
      cell: (r) => num(r.views),
    },
    {
      id: "bookmarks",
      header: "Bookmarks",
      accessor: (r) => r.bookmarks,
      align: "right",
      cell: (r) => num(r.bookmarks),
    },
    {
      id: "createdAt",
      header: "Created",
      accessor: (r) => r.createdAt,
      align: "right",
      defaultHidden: true,
      cell: (r) => formatDate(r.createdAt),
    },
    {
      id: "updatedAt",
      header: "Updated",
      accessor: (r) => r.updatedAt,
      align: "right",
      cell: (r) => formatDate(r.updatedAt),
    },
  ];
}
