import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Ban,
  Download,
  RefreshCw,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Highlight } from "@/components/shared/highlight";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MembershipBadge, UserAvatar, buildUserColumns } from "@/features/users/columns";
import { filterUsers } from "@/features/users/filtering";
import { useUserMutations, useUsers } from "@/features/users/hooks";
import { UserFilters } from "@/features/users/user-filters";
import { UserStats } from "@/features/users/user-stats";
import { UserDetailDrawer, type UserDrawerTab } from "@/features/users/user-detail-drawer";
import { emptyUserFilters, type PlatformUser, type UserFilterState } from "@/features/users/types";
import { downloadCsv } from "@/lib/admin/csv";
import { num } from "@/lib/format";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User Management — GVRZE Admin" },
      {
        name: "description",
        content:
          "Search, segment and inspect GVRZE player accounts, memberships, activity and permissions.",
      },
      { property: "og:title", content: "User Management — GVRZE Admin" },
      {
        property: "og:description",
        content: "Operations workspace for GVRZE user accounts and memberships.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<UserFilterState>(emptyUserFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeUser, setActiveUser] = useState<PlatformUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<UserDrawerTab>("overview");
  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);
  const { users: platformUsers, loading, refetch } = useUsers();
  const mutations = useUserMutations();
  const resetRedirect =
    typeof window === "undefined" ? "/reset-password" : `${window.location.origin}/reset-password`;

  const rows = useMemo(
    () => filterUsers(platformUsers, query, filters),
    [platformUsers, query, filters],
  );
  const columns = useMemo(() => buildUserColumns(query), [query]);

  const openUser = (user: PlatformUser, tab: UserDrawerTab = "overview") => {
    setActiveUser(user);
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  const refresh = () => {
    void refetch().then(() => toast.success("User list refreshed."));
  };

  const exportUsers = (rows: PlatformUser[]) => {
    downloadCsv(
      "geoverze-users.csv",
      ["id", "username", "display_name", "email", "role", "status", "membership", "credits", "xp"],
      rows.map((user) => [
        user.id,
        user.username,
        user.displayName,
        user.email,
        user.role,
        user.status,
        user.membership,
        user.credits,
        user.xp,
      ]),
    );
  };

  const resetAll = () => {
    setQuery("");
    setFilters(emptyUserFilters);
  };

  return (
    <>
      <PageHeader
        title="User Management"
        description="Manage user accounts, memberships, activity and permissions."
        actions={
          <>
            <Button size="sm" onClick={() => exportUsers(rows)}>
              <Download className="size-4" aria-hidden="true" />
              Export users
            </Button>
          </>
        }
      />

      <PageBody>
        <UserStats state={loading ? "loading" : "ready"} users={platformUsers} />

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            {
              label: "Suspend selected",
              icon: <Ban className="size-4" aria-hidden="true" />,
              onSelect: () =>
                setConfirm({
                  title: `Suspend ${selectedIds.length} users?`,
                  description: "Suspended users lose access until reinstated.",
                  confirmLabel: "Suspend",
                  onConfirm: () => {
                    selectedIds.forEach((id) => mutations.status.mutate({ userId: id, next: "suspended" }));
                    setSelectedIds([]);
                  },
                }),
            },
            {
              label: "Activate selected",
              icon: <UserCheck className="size-4" aria-hidden="true" />,
              onSelect: () => {
                selectedIds.forEach((id) => mutations.status.mutate({ userId: id, next: "active" }));
                setSelectedIds([]);
              },
            },
            {
              label: "Export selected",
              icon: <Download className="size-4" aria-hidden="true" />,
              onSelect: () =>
                exportUsers(platformUsers.filter((user) => selectedIds.includes(user.id))),
            },
            {
              label: "Assign role",
              icon: <ShieldCheck className="size-4" aria-hidden="true" />,
              onSelect: () => toast.info("Grant or revoke roles from the Roles page or a user row action."),
            },
            {
              label: "Grant membership",
              icon: <Star className="size-4" aria-hidden="true" />,
              onSelect: () =>
                toast.info("Membership is owned by the billing provider. Do not change it here."),
            },
            {
              label: "Delete",
              variant: "destructive",
              icon: <Trash2 className="size-4" aria-hidden="true" />,
              onSelect: () =>
                setConfirm({
                  title: `Delete ${selectedIds.length} users?`,
                  description:
                    "Account deletion is not available from Admin. Suspend the account instead.",
                  confirmLabel: "Understood",
                  onConfirm: () => toast.info("Use Suspend to block access without deleting records."),
                }),
            },
          ]}
          actions={[
            {
              label: "Saved views",
              onSelect: () => toast.info("Saved views are not persisted yet."),
            },
            {
              label: "Refresh",
              icon: <RefreshCw className="size-4" aria-hidden="true" />,
              onSelect: refresh,
            },
            {
              label: "Export",
              icon: <Download className="size-4" aria-hidden="true" />,
              onSelect: () => exportUsers(rows),
            },
          ]}
        >
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search users"
            placeholder="Search username, display name or email…"
          />
        </ActionToolbar>

        <UserFilters
          value={filters}
          onChange={setFilters}
          countries={[...new Set(platformUsers.map((user) => user.country).filter((c) => c !== "—"))].sort()}
        />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(platformUsers.length)} users
          {query && <> matching “{query}”</>}
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(u) => u.id}
          highlight={query}
          hideToolbar={false}
          hideBulkBar
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          loading={loading}
          pageSize={25}
          searchPlaceholder="Filter within results…"
          onRowClick={(user) => openUser(user)}
          emptyTitle="No users match your search"
          emptyDescription="Try a different search term or clear the advanced filters."
          emptyAction={
            <Button size="sm" variant="outline" className="mt-2" onClick={resetAll}>
              Clear search and filters
            </Button>
          }
          rowActions={[
            { label: "View profile", onSelect: (user) => openUser(user) },
            { label: "View activity", onSelect: (user) => openUser(user, "activity") },
            {
              label: "Reset password",
              onSelect: (user) => {
                if (!user.email) {
                  toast.error("This account has no email.");
                  return;
                }
                mutations.resetPassword.mutate({ email: user.email, redirectTo: resetRedirect });
              },
            },
            {
              label: "Grant membership",
              onSelect: () =>
                toast.info("Membership is owned by the billing provider. Do not change it here."),
            },
            {
              label: "Adjust credits",
              onSelect: (user) => {
                void (async () => {
                  const raw = window.prompt(`Adjust credits for ${user.displayName} (positive grant, negative deduct)`, "100");
                  if (!raw) return;
                  const amount = Number(raw);
                  if (!Number.isFinite(amount) || amount === 0) {
                    toast.error("Enter a non-zero number.");
                    return;
                  }
                  mutations.credits.mutate({
                    userId: user.id,
                    amount,
                    reason: "Manual adjustment",
                  });
                })();
              },
            },
            {
              label: "Suspend",
              destructive: true,
              onSelect: (user) =>
                setConfirm({
                  title: `Suspend ${user.displayName}?`,
                  description: "The account loses access until reinstated.",
                  confirmLabel: "Suspend",
                  onConfirm: () => mutations.status.mutate({ userId: user.id, next: "suspended" }),
                }),
            },
            {
              label: "Ban",
              destructive: true,
              onSelect: (user) =>
                setConfirm({
                  title: `Ban ${user.displayName}?`,
                  description: "Bans are not a separate state. This will suspend the account.",
                  confirmLabel: "Suspend",
                  onConfirm: () => mutations.status.mutate({ userId: user.id, next: "suspended" }),
                }),
            },
          ]}
          renderMobileCard={(user) => (
            <div className="flex items-start gap-3">
              <UserAvatar user={user} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  <Highlight text={user.displayName} query={query} />
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @<Highlight text={user.username} query={query} /> ·{" "}
                  <Highlight text={user.email} query={query} />
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <MembershipBadge membership={user.membership} />
                  <StatusBadge status={user.status} />
                  <span className="text-xs text-muted-foreground">
                    Lv {user.level} · {num(user.credits)} cr
                  </span>
                </div>
              </div>
            </div>
          )}
        />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <UserCog className="size-3.5" aria-hidden="true" />
          Role assignments are managed on the Roles &amp; Permissions page.
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7">
                Quick links
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Related</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/roles">Roles &amp; permissions</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/creators">Creator applications</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageBody>

      <UserDetailDrawer
        user={activeUser}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        defaultTab={drawerTab}
      />

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel ?? "Confirm"}
        destructive
        onConfirm={() => {
          confirm?.onConfirm();
          setConfirm(null);
        }}
      />
    </>
  );
}
