import { Badge } from "@/components/ui/badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import type { AuditEvent } from "@/features/ops/types";
import { cn } from "@/lib/utils";

export const auditColumns: DataTableColumn<AuditEvent>[] = [
  {
    id: "at",
    header: "Timestamp",
    accessor: (row) => row.at,
    sortable: true,
    cell: (row) => <span className="tabular text-xs">{row.at.replace("T", " ").slice(0, 16)}</span>,
  },
  {
    id: "actor",
    header: "Actor",
    accessor: (row) => row.actor,
    sortable: true,
    cell: (row) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{row.actor}</p>
        <p className="truncate text-xs text-muted-foreground">{row.actorRole}</p>
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    accessor: (row) => row.category,
    sortable: true,
    cell: (row) => <Badge variant="secondary">{row.category}</Badge>,
  },
  {
    id: "action",
    header: "Action",
    accessor: (row) => row.action,
    sortable: true,
    cell: (row) => <code className="font-mono text-xs">{row.action}</code>,
  },
  {
    id: "target",
    header: "Target",
    accessor: (row) => row.target,
    cell: (row) => <code className="font-mono text-xs text-muted-foreground">{row.target}</code>,
  },
  {
    id: "channel",
    header: "Channel",
    accessor: (row) => row.channel,
    sortable: true,
    defaultHidden: true,
  },
  { id: "ip", header: "IP", accessor: (row) => row.ip, defaultHidden: true },
  {
    id: "result",
    header: "Result",
    accessor: (row) => row.result,
    sortable: true,
    cell: (row) => (
      <span
        className={cn(
          "text-xs font-medium",
          row.result === "success"
            ? "text-success"
            : row.result === "denied"
              ? "text-destructive"
              : "text-warning",
        )}
      >
        {row.result}
      </span>
    ),
  },
];
