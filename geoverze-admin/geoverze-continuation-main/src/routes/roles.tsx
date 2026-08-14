import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus, Pencil, ShieldCheck, Users } from "lucide-react";

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
import { num } from "@/lib/format";
import { notReady } from "@/lib/placeholder";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — GEOverze Admin" },
      {
        name: "description",
        content:
          "Role-based access control for GEOverze operators: eight roles, their permissions and assigned users.",
      },
      { property: "og:title", content: "Roles & Permissions — GEOverze Admin" },
      {
        property: "og:description",
        content: "Role-based access control for GEOverze admin operators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Role-based access control for the operations team. Editing arrives with the backend."
        actions={
          <Button size="sm" onClick={notReady("Creating roles requires backend integration.")}>
            <ShieldCheck className="size-4" aria-hidden="true" />
            New role
          </Button>
        }
      />

      <PageBody gap="lg">
        <section className="space-y-3">
          <SectionHeader title="Roles" description="Eight predefined operator roles." />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {roles.map((role) => (
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
                    onClick={notReady("Role editing requires backend integration.")}
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
