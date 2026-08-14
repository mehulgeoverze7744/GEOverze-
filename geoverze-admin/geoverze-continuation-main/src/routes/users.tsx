import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Ban,
  Download,
  Plus,
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
import { platformUsers } from "@/features/users/data";
import { filterUsers } from "@/features/users/filtering";
import { UserFilters } from "@/features/users/user-filters";
import { UserStats } from "@/features/users/user-stats";
import { UserDetailDrawer, type UserDrawerTab } from "@/features/users/user-detail-drawer";
import { emptyUserFilters, type PlatformUser, type UserFilterState } from "@/features/users/types";
import { num } from "@/lib/format";
import { notReady } from "@/lib/placeholder";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User Management — GEOverze Admin" },
      {
        name: "description",
        content:
          "Search, segment and inspect GEOverze player accounts, memberships, activity and permissions.",
      },
      { property: "og:title", content: "User Management — GEOverze Admin" },
      {
        property: "og:description",
        content: "Operations workspace for GEOverze user accounts and memberships.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UsersPage,
});

const placeholder = notReady;

function UsersPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<UserFilterState>(emptyUserFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState<PlatformUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<UserDrawerTab>("overview");
  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const rows = useMemo(() => filterUsers(platformUsers, query, filters), [query, filters]);
  const columns = useMemo(() => buildUserColumns(query), [query]);

  const openUser = (user: PlatformUser, tab: UserDrawerTab = "overview") => {
    setActiveUser(user);
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("User list refreshed.");
    }, 600);
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
            <Button
              size="sm"
              variant="outline"
              onClick={placeholder("Create User will open a form once the backend is connected.")}
            >
              <Plus className="size-4" aria-hidden="true" />
              Create user
            </Button>
            <Button size="sm" onClick={placeholder("Export queued — backend integration pending.")}>
              <Download className="size-4" aria-hidden="true" />
              Export users
            </Button>
          </>
        }
      />

      <PageBody>
        <UserStats state={loading ? "loading" : "ready"} />

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
                  description:
                    "Suspended users lose access until reinstated. This is a placeholder action.",
                  confirmLabel: "Suspend",
                  onConfirm: () => toast.info(`${selectedIds.length} users queued for suspension.`),
                }),
            },
            {
              label: "Activate selected",
              icon: <UserCheck className="size-4" aria-hidden="true" />,
              onSelect: () => toast.info(`${selectedIds.length} users queued for activation.`),
            },
            {
              label: "Export selected",
              icon: <Download className="size-4" aria-hidden="true" />,
              onSelect: () => toast.info(`Exporting ${selectedIds.length} users (placeholder).`),
            },
            {
              label: "Assign role",
              icon: <ShieldCheck className="size-4" aria-hidden="true" />,
              onSelect: placeholder("Role assignment requires backend integration."),
            },
            {
              label: "Grant membership",
              icon: <Star className="size-4" aria-hidden="true" />,
              onSelect: placeholder("Membership grants require backend integration."),
            },
            {
              label: "Delete",
              variant: "destructive",
              icon: <Trash2 className="size-4" aria-hidden="true" />,
              onSelect: () =>
                setConfirm({
                  title: `Delete ${selectedIds.length} users?`,
                  description:
                    "Deletion is permanent and removes all activity history. This is a placeholder action.",
                  confirmLabel: "Delete",
                  onConfirm: () =>
                    toast.error("Delete is disabled until the backend is connected."),
                }),
            },
          ]}
          actions={[
            {
              label: "Saved views",
              onSelect: placeholder("Saved views arrive with backend persistence."),
            },
            {
              label: "Refresh",
              icon: <RefreshCw className="size-4" aria-hidden="true" />,
              onSelect: refresh,
            },
            {
              label: "Export",
              icon: <Download className="size-4" aria-hidden="true" />,
              onSelect: placeholder("Export queued — backend integration pending."),
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

        <UserFilters value={filters} onChange={setFilters} />

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
            { label: "Edit user", onSelect: placeholder("Editing requires backend integration.") },
            {
              label: "Reset password",
              onSelect: placeholder("Password reset is a placeholder."),
            },
            {
              label: "Grant membership",
              onSelect: placeholder("Membership grants require backend integration."),
            },
            {
              label: "Adjust credits",
              onSelect: placeholder("Credit adjustments are a placeholder."),
            },
            {
              label: "Suspend",
              destructive: true,
              onSelect: (user) =>
                setConfirm({
                  title: `Suspend ${user.displayName}?`,
                  description: "The account loses access until reinstated. Placeholder action.",
                  confirmLabel: "Suspend",
                  onConfirm: () => toast.info(`${user.displayName} queued for suspension.`),
                }),
            },
            {
              label: "Ban",
              destructive: true,
              onSelect: (user) =>
                setConfirm({
                  title: `Ban ${user.displayName}?`,
                  description: "Banning permanently blocks this account. Placeholder action.",
                  confirmLabel: "Ban",
                  onConfirm: () => toast.error(`${user.displayName} queued for ban.`),
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
              <DropdownMenuItem onSelect={placeholder("Opens Roles & Permissions.")}>
                Roles &amp; permissions
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={placeholder("Opens Creator applications.")}>
                Creator applications
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
