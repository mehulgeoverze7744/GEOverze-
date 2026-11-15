import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus, Pencil, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { permissionAreas, roles } from "@/features/users/roles";
import { fetchRoleCounts } from "@/features/ops/api";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminQuery } from "@/lib/admin/hooks";
import { supabase } from "@/lib/supabase/client";
import { formatAdminError } from "@/lib/supabase/query";
import { num } from "@/lib/format";
import { selectRole, useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — GVRZE Admin" },
      {
        name: "description",
        content:
          "Role-based access control for GVRZE operators: eight roles, their permissions and assigned users.",
      },
      { property: "og:title", content: "Roles & Permissions — GVRZE Admin" },
      {
        property: "og:description",
        content: "Role-based access control for GVRZE admin operators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  const counts = useAdminQuery(adminKeys.roles, fetchRoleCounts);
  const role = useAuthStore(selectRole);
  const [inviteEmail, setInviteEmail] = useState("");
  const liveRoles = roles
    .filter((role) => role.id === "super_admin" || role.id === "administrator")
    .map((role) => ({
      ...role,
      assignedUsers:
        role.id === "super_admin"
          ? counts.data?.["super_admin"] ?? 0
          : counts.data?.["admin"] ?? 0,
    }));

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Database-backed app_role values are Super Admin and Admin. Additional operator titles are documentation only until a finer RBAC model exists."
      />

      <PageBody gap="lg">
        {role === "super_admin" && (
          <form
            className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void supabase.functions
                .invoke("admin-provision", { body: { email: inviteEmail, role: "admin" } })
                .then(({ data, error }) => {
                  if (error) throw error;
                  if (data && typeof data === "object" && "error" in data) {
                    throw new Error(String((data as { error: string }).error));
                  }
                  toast.success(`Invited ${inviteEmail} as Admin.`);
                  setInviteEmail("");
                  void counts.refetch();
                })
                .catch((error) => toast.error(formatAdminError(error)));
            }}
          >
            <div className="min-w-56 flex-1 space-y-1.5">
              <p className="text-sm font-medium text-foreground">Provision administrator</p>
              <p className="text-xs text-muted-foreground">
                Super Admin only. Invites the email through a trusted Edge Function and grants the admin role.
              </p>
              <Input
                type="email"
                required
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <Button type="submit" size="sm">
              Invite admin
            </Button>
          </form>
        )}

        <section className="space-y-3">
          <SectionHeader title="Live roles" description="Granted via public.user_roles. Only a super admin can change grants." />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {liveRoles.map((role) => (
              <article
                key={role.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{role.name}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label={`Edit ${role.name}`}
                    disabled
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{role.description}</p>
                <ul className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 4).map((permission) => (
                    <li key={permission}>
                      <Badge variant="secondary" className="text-[11px] font-normal">
                        {permission}
                      </Badge>
                    </li>
                  ))}
                  {role.permissions.length > 4 && (
                    <li>
                      <Badge variant="outline" className="text-[11px] font-normal">
                        +{role.permissions.length - 4} more
                      </Badge>
                    </li>
                  )}
                </ul>
                <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" aria-hidden="true" />
                  {num(role.assignedUsers)} assigned users
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader
            title="Permission matrix"
            description="Effective grants per role across every admin capability."
          />
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-48">Capability</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center whitespace-nowrap">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissionAreas.map((area) => (
                  <TableRow key={area}>
                    <TableCell className="font-medium text-foreground">{area}</TableCell>
                    {roles.map((role) => {
                      const granted = role.permissions.includes(area);
                      return (
                        <TableCell key={role.id} className="text-center">
                          <span className="sr-only">
                            {granted ? "Granted" : "Not granted"} for {role.name}
                          </span>
                          {granted ? (
                            <Check className="mx-auto size-4 text-success" aria-hidden="true" />
                          ) : (
                            <Minus
                              className="mx-auto size-4 text-muted-foreground/50"
                              aria-hidden="true"
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </PageBody>
    </>
  );
}
