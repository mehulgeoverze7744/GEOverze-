import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <PageShell>
      <Outlet />
    </PageShell>
  );
}
