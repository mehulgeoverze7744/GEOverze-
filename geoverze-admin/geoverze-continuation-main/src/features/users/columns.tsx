import { BadgeCheck, Flame, ShieldOff } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import { daysSince } from "@/features/users/data";
import { formatDate, initials, relativeDays } from "@/features/users/format";
import type { CreatorStatus, Membership, PlatformUser } from "@/features/users/types";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

const membershipTone: Record<Membership, string> = {
  Free: "border-border-strong bg-muted text-muted-foreground",
  Plus: "border-info/30 bg-info/10 text-info",
  Premium: "border-primary/40 bg-primary/10 text-primary",
  Elite: "border-warning/40 bg-warning/10 text-warning",
};

const creatorTone: Record<CreatorStatus, string> = {
  None: "text-muted-foreground",
  Applied: "text-warning",
  Approved: "text-success",
  Rejected: "text-destructive",
};

export function MembershipBadge({ membership }: { membership: Membership }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        membershipTone[membership],
      )}
    >
      {membership}
    </span>
  );
}

export function UserAvatar({ user, size = 7 }: { user: PlatformUser; size?: number }) {
  return (
    <Avatar className={cn(size === 7 ? "size-7" : "size-10")}>
      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
        {initials(user.displayName)}
      </AvatarFallback>
    </Avatar>
  );
}

export function buildUserColumns(query: string): DataTableColumn<PlatformUser>[] {
  return [
    {
      id: "avatar",
      header: "",
      sortable: false,
      accessor: (u) => u.displayName,
      cell: (u) => <UserAvatar user={u} />,
      className: "w-10",
    },
    {
      id: "username",
      header: "Username",
      accessor: (u) => u.username,
      cell: (u) => (
        <span className="font-medium text-foreground">
          @<Highlight text={u.username} query={query} />
        </span>
      ),
    },
    {
      id: "displayName",
      header: "Display name",
      accessor: (u) => u.displayName,
      cell: (u) => <Highlight text={u.displayName} query={query} />,
    },
    {
      id: "email",
      header: "Email",
      accessor: (u) => u.email,
      cell: (u) => (
        <span className="text-muted-foreground">
          <Highlight text={u.email} query={query} />
        </span>
      ),
    },
    { id: "role", header: "Role", accessor: (u) => u.role },
    {
      id: "membership",
      header: "Membership",
      accessor: (u) => u.membership,
      cell: (u) => <MembershipBadge membership={u.membership} />,
    },
    { id: "level", header: "Level", accessor: (u) => u.level, align: "right" },
    {
      id: "xp",
      header: "XP",
      accessor: (u) => u.xp,
      align: "right",
      cell: (u) => num(u.xp),
    },
    {
      id: "credits",
      header: "Credits",
      accessor: (u) => u.credits,
      align: "right",
      cell: (u) => num(u.credits),
    },
    {
      id: "currentStreak",
      header: "Streak",
      accessor: (u) => u.currentStreak,
      align: "right",
      cell: (u) => (
        <span className="inline-flex items-center justify-end gap-1 tabular">
          <Flame
            className={cn(
              "size-3.5",
              u.currentStreak > 0 ? "text-warning" : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
          {u.currentStreak}
        </span>
      ),
    },
    { id: "country", header: "Country", accessor: (u) => u.country },
    {
      id: "creatorStatus",
      header: "Creator",
      accessor: (u) => u.creatorStatus,
      cell: (u) => <span className={creatorTone[u.creatorStatus]}>{u.creatorStatus}</span>,
    },
    {
      id: "ageVerified",
      header: "Age check",
      accessor: (u) => (u.ageVerified ? "Verified" : "Unverified"),
      defaultHidden: true,
      cell: (u) =>
        u.ageVerified ? (
          <span className="inline-flex items-center gap-1 text-success">
            <BadgeCheck className="size-3.5" aria-hidden="true" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <ShieldOff className="size-3.5" aria-hidden="true" /> Unverified
          </span>
        ),
    },
    {
      id: "registeredAt",
      header: "Registered",
      accessor: (u) => u.registeredAt,
      align: "right",
      cell: (u) => formatDate(u.registeredAt),
    },
    {
      id: "lastActiveAt",
      header: "Last active",
      accessor: (u) => u.lastActiveAt,
      align: "right",
      cell: (u) => (
        <span className="text-muted-foreground">{relativeDays(daysSince(u.lastActiveAt))}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (u) => u.status,
      cell: (u) => <StatusBadge status={u.status} />,
    },
  ];
}
