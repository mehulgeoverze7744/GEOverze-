import { Badge } from "@/components/ui/badge";
import { Highlight } from "@/components/shared/highlight";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import type { ModerationCase } from "@/features/moderation/types";
import { num } from "@/lib/format";

const shortDate = (iso: string) => iso.slice(0, 10);

export function buildCaseColumns(query: string): DataTableColumn<ModerationCase>[] {
  return [
    {
      id: "id",
      header: "Case",
      accessor: (c) => c.id,
      sortable: true,
      cell: (c) => (
        <code className="font-mono text-xs text-muted-foreground">
          <Highlight text={c.id} query={query} />
        </code>
      ),
    },
    {
      id: "title",
      header: "Reported content",
      accessor: (c) => c.title,
      sortable: true,
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            <Highlight text={c.title} query={query} />
          </p>
          <p className="truncate text-xs text-muted-foreground">{c.surface} surface</p>
        </div>
      ),
    },
    {
      id: "reason",
      header: "Reason",
      accessor: (c) => c.reason,
      sortable: true,
      cell: (c) => <Badge variant="secondary">{c.reason}</Badge>,
    },
    {
      id: "priority",
      header: "Priority",
      accessor: (c) => c.priority,
      sortable: true,
      cell: (c) => <SeverityBadge level={c.priority} />,
    },
    {
      id: "status",
      header: "Status",
      accessor: (c) => c.status,
      sortable: true,
      cell: (c) => <StatusBadge status={c.status} />,
    },
    { id: "reporter", header: "Reporter", accessor: (c) => c.reporter, sortable: true },
    {
      id: "reportedUser",
      header: "Reported user",
      accessor: (c) => c.reportedUser,
      sortable: true,
    },
    {
      id: "reportCount",
      header: "Reports",
      accessor: (c) => c.reportCount,
      align: "right",
      sortable: true,
      cell: (c) => num(c.reportCount),
    },
    {
      id: "evidence",
      header: "Evidence",
      accessor: (c) => c.evidence.length,
      align: "right",
      defaultHidden: true,
      cell: (c) => `${c.evidence.length} item${c.evidence.length === 1 ? "" : "s"}`,
    },
    {
      id: "assignee",
      header: "Assignee",
      accessor: (c) => c.assignee,
      sortable: true,
      defaultHidden: true,
    },
    {
      id: "appeal",
      header: "Appeal",
      accessor: (c) => (c.appealOpen ? "Open" : "None"),
      cell: (c) =>
        c.appealOpen ? (
          <Badge variant="outline">Open</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: "reportedAt",
      header: "Reported",
      accessor: (c) => c.reportedAt,
      align: "right",
      sortable: true,
      cell: (c) => <span className="tabular text-xs">{shortDate(c.reportedAt)}</span>,
    },
  ];
}
