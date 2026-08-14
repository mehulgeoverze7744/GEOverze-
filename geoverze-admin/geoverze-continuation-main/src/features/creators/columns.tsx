import { BadgeCheck, ShieldAlert, ShieldQuestion, ShieldX } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import { formatDate, initials } from "@/features/users/format";
import type { CreatorRecord, CreatorTier, VerificationState } from "@/features/creators/types";
import { money, num } from "@/lib/format";
import { cn } from "@/lib/utils";

const tierTone: Record<CreatorTier, string> = {
  Bronze: "border-border-strong bg-muted text-muted-foreground",
  Silver: "border-info/30 bg-info/10 text-info",
  Gold: "border-warning/40 bg-warning/10 text-warning",
  Partner: "border-primary/40 bg-primary/10 text-primary",
};

const verificationTone: Record<VerificationState, string> = {
  Verified: "border-success/30 bg-success/10 text-success",
  Pending: "border-warning/30 bg-warning/10 text-warning",
  Rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  Suspended: "border-destructive/30 bg-destructive/10 text-destructive",
};

const verificationIcon = {
  Verified: BadgeCheck,
  Pending: ShieldQuestion,
  Rejected: ShieldX,
  Suspended: ShieldAlert,
} as const;

export function TierBadge({ tier }: { tier: CreatorTier }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tierTone[tier],
      )}
    >
      {tier}
    </span>
  );
}

export function VerificationBadge({ state }: { state: VerificationState }) {
  const Icon = verificationIcon[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        verificationTone[state],
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {state}
    </span>
  );
}

export function CreatorAvatar({ creator, size = 7 }: { creator: CreatorRecord; size?: number }) {
  return (
    <Avatar className={cn(size === 7 ? "size-7" : "size-10")}>
      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
        {initials(creator.displayName)}
      </AvatarFallback>
    </Avatar>
  );
}

export function buildCreatorColumns(query: string): DataTableColumn<CreatorRecord>[] {
  return [
    {
      id: "avatar",
      header: "",
      sortable: false,
      accessor: (c) => c.displayName,
      cell: (c) => <CreatorAvatar creator={c} />,
      className: "w-10",
    },
    {
      id: "displayName",
      header: "Display name",
      accessor: (c) => c.displayName,
      cell: (c) => (
        <span className="font-medium text-foreground">
          <Highlight text={c.displayName} query={query} />
        </span>
      ),
    },
    {
      id: "username",
      header: "Username",
      accessor: (c) => c.username,
      cell: (c) => (
        <span className="text-muted-foreground">
          @<Highlight text={c.username} query={query} />
        </span>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessor: (c) => c.email,
      cell: (c) => (
        <span className="text-muted-foreground">
          <Highlight text={c.email} query={query} />
        </span>
      ),
    },
    { id: "country", header: "Country", accessor: (c) => c.country },
    {
      id: "tier",
      header: "Tier",
      accessor: (c) => c.tier,
      cell: (c) => <TierBadge tier={c.tier} />,
    },
    {
      id: "verification",
      header: "Verification",
      accessor: (c) => c.verification,
      cell: (c) => <VerificationBadge state={c.verification} />,
    },
    {
      id: "totalQuizzes",
      header: "Quizzes",
      accessor: (c) => c.totalQuizzes,
      align: "right",
      cell: (c) => num(c.totalQuizzes),
    },
    {
      id: "followers",
      header: "Followers",
      accessor: (c) => c.followers,
      align: "right",
      cell: (c) => num(c.followers),
    },
    {
      id: "totalPlays",
      header: "Total plays",
      accessor: (c) => c.totalPlays,
      align: "right",
      cell: (c) => num(c.totalPlays),
    },
    {
      id: "revenue",
      header: "Revenue",
      accessor: (c) => c.revenue,
      align: "right",
      cell: (c) => money(c.revenue),
    },
    {
      id: "rating",
      header: "Rating",
      accessor: (c) => c.rating,
      align: "right",
      defaultHidden: true,
      cell: (c) => c.rating.toFixed(1),
    },
    {
      id: "joinDate",
      header: "Joined",
      accessor: (c) => c.joinDate,
      align: "right",
      cell: (c) => formatDate(c.joinDate),
    },
    {
      id: "status",
      header: "Status",
      accessor: (c) => c.status,
      cell: (c) => <StatusBadge status={c.status} />,
    },
  ];
}
