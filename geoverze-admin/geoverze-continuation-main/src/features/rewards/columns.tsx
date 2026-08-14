import type { DataTableColumn } from "@/components/shared/data-table";
import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/users/format";
import type { Reward, RewardClaim } from "@/features/rewards/types";
import { num } from "@/lib/format";

export function buildRewardColumns(query: string): DataTableColumn<Reward>[] {
  return [
    {
      id: "name",
      header: "Reward",
      accessor: (r) => r.name,
      className: "max-w-64",
      cell: (r) => (
        <div className="max-w-64">
          <span className="block truncate font-medium text-foreground">
            <Highlight text={r.name} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">{r.id}</span>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessor: (r) => r.type,
      cell: (r) => <Badge variant="secondary">{r.type}</Badge>,
    },
    { id: "eligibility", header: "Eligibility", accessor: (r) => r.eligibility },
    {
      id: "creditsRequired",
      header: "Credit cost",
      accessor: (r) => r.creditsRequired,
      align: "right",
      cell: (r) => (r.creditsRequired ? num(r.creditsRequired) : "Free"),
    },
    {
      id: "stock",
      header: "Stock",
      accessor: (r) => (r.unlimited ? Number.MAX_SAFE_INTEGER : r.stock),
      align: "right",
      cell: (r) => (r.unlimited ? "Unlimited" : num(r.stock)),
    },
    {
      id: "claims",
      header: "Claims",
      accessor: (r) => r.claims,
      align: "right",
      cell: (r) => num(r.claims),
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: "availableFrom",
      header: "Available",
      accessor: (r) => r.availableFrom,
      align: "right",
      defaultHidden: true,
      cell: (r) => formatDate(r.availableFrom),
    },
    {
      id: "expiresAt",
      header: "Expires",
      accessor: (r) => r.expiresAt,
      align: "right",
      cell: (r) => formatDate(r.expiresAt),
    },
    {
      id: "updatedAt",
      header: "Updated",
      accessor: (r) => r.updatedAt,
      align: "right",
      defaultHidden: true,
      cell: (r) => formatDate(r.updatedAt),
    },
  ];
}

export function buildClaimColumns(): DataTableColumn<RewardClaim>[] {
  return [
    { id: "id", header: "Claim", accessor: (c) => c.id },
    { id: "rewardName", header: "Reward", accessor: (c) => c.rewardName },
    { id: "user", header: "Member", accessor: (c) => c.user },
    {
      id: "credits",
      header: "Credits",
      accessor: (c) => c.credits,
      align: "right",
      cell: (c) => num(c.credits),
    },
    {
      id: "status",
      header: "Status",
      accessor: (c) => c.status,
      cell: (c) => <StatusBadge status={c.status} />,
    },
    {
      id: "claimedAt",
      header: "Claimed",
      accessor: (c) => c.claimedAt,
      align: "right",
      cell: (c) => formatDate(c.claimedAt),
    },
  ];
}
