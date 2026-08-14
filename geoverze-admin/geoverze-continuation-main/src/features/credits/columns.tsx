import type { DataTableColumn } from "@/components/shared/data-table";
import { Highlight } from "@/components/shared/highlight";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/users/format";
import type { CreditRule, CreditTransaction } from "@/features/credits/types";
import { num } from "@/lib/format";

function directionTone(direction: CreditTransaction["direction"]) {
  if (direction === "redeemed") return "destructive" as const;
  if (direction === "adjusted") return "outline" as const;
  return "secondary" as const;
}

export function buildTransactionColumns(query: string): DataTableColumn<CreditTransaction>[] {
  return [
    {
      id: "id",
      header: "Transaction",
      accessor: (t) => t.id,
      cell: (t) => (
        <code className="font-mono text-xs">
          <Highlight text={t.id} query={query} />
        </code>
      ),
    },
    {
      id: "user",
      header: "Member",
      accessor: (t) => t.user,
      cell: (t) => <Highlight text={t.user} query={query} />,
    },
    {
      id: "direction",
      header: "Direction",
      accessor: (t) => t.direction,
      cell: (t) => <Badge variant={directionTone(t.direction)}>{t.direction}</Badge>,
    },
    {
      id: "amount",
      header: "Amount",
      accessor: (t) => t.amount,
      align: "right",
      cell: (t) => `${t.direction === "redeemed" ? "−" : "+"}${num(t.amount)}`,
    },
    {
      id: "balanceAfter",
      header: "Balance",
      accessor: (t) => t.balanceAfter,
      align: "right",
      cell: (t) => num(t.balanceAfter),
    },
    { id: "reason", header: "Reason", accessor: (t) => t.reason },
    {
      id: "reference",
      header: "Reference",
      accessor: (t) => t.reference,
      defaultHidden: true,
    },
    { id: "actor", header: "Actor", accessor: (t) => t.actor, defaultHidden: true },
    {
      id: "createdAt",
      header: "Date",
      accessor: (t) => t.createdAt,
      align: "right",
      cell: (t) => formatDate(t.createdAt),
    },
  ];
}

export function buildRuleColumns(): DataTableColumn<CreditRule>[] {
  return [
    { id: "name", header: "Rule", accessor: (r) => r.name },
    { id: "trigger", header: "Trigger", accessor: (r) => r.trigger, className: "max-w-72" },
    {
      id: "award",
      header: "Award",
      accessor: (r) => r.award,
      align: "right",
      cell: (r) => num(r.award),
    },
    {
      id: "dailyCap",
      header: "Daily cap",
      accessor: (r) => r.dailyCap,
      align: "right",
      cell: (r) => num(r.dailyCap),
    },
    {
      id: "enabled",
      header: "State",
      accessor: (r) => (r.enabled ? "Enabled" : "Disabled"),
      cell: (r) => (
        <Badge variant={r.enabled ? "secondary" : "outline"}>
          {r.enabled ? "Enabled" : "Disabled"}
        </Badge>
      ),
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
