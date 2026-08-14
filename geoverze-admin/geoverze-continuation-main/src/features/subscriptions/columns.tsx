import type { DataTableColumn } from "@/components/shared/data-table";
import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/users/format";
import type { Subscriber } from "@/features/subscriptions/types";
import { money, num } from "@/lib/format";

export function buildSubscriberColumns(query: string): DataTableColumn<Subscriber>[] {
  return [
    {
      id: "account",
      header: "Account",
      accessor: (s) => s.account,
      className: "max-w-64",
      cell: (s) => (
        <div className="max-w-64">
          <span className="block truncate font-medium text-foreground">
            <Highlight text={s.account} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">{s.contact}</span>
        </div>
      ),
    },
    {
      id: "tier",
      header: "Plan",
      accessor: (s) => s.tier,
      cell: (s) => <Badge variant="secondary">{s.tier}</Badge>,
    },
    { id: "cycle", header: "Cycle", accessor: (s) => s.cycle },
    {
      id: "status",
      header: "Status",
      accessor: (s) => s.status,
      cell: (s) => <StatusBadge status={s.status} />,
    },
    {
      id: "seats",
      header: "Seats",
      accessor: (s) => s.seats,
      align: "right",
      cell: (s) => num(s.seats),
    },
    {
      id: "mrr",
      header: "MRR",
      accessor: (s) => s.mrr,
      align: "right",
      cell: (s) => money(s.mrr),
    },
    {
      id: "lifetimeValue",
      header: "LTV",
      accessor: (s) => s.lifetimeValue,
      align: "right",
      defaultHidden: true,
      cell: (s) => money(s.lifetimeValue),
    },
    {
      id: "startedAt",
      header: "Started",
      accessor: (s) => s.startedAt,
      align: "right",
      defaultHidden: true,
      cell: (s) => formatDate(s.startedAt),
    },
    {
      id: "renewsAt",
      header: "Renews",
      accessor: (s) => s.renewsAt,
      align: "right",
      cell: (s) => formatDate(s.renewsAt),
    },
  ];
}
