import { createFileRoute } from "@tanstack/react-router";
import { Activity, Gauge, Users, Zap } from "lucide-react";

import { PageBody, PageHeader, StatCard, StatGrid } from "@/components/shared";
import { Widget } from "@/components/shared/widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/features/dashboard/hooks";
import { fetchAuditLogs } from "@/features/ops/api";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminQuery } from "@/lib/admin/hooks";
import { num } from "@/lib/format";

export const Route = createFileRoute("/monitoring")({
  head: () => ({
    meta: [
      { title: "Monitoring — GVRZE Admin" },
      {
        name: "description",
        content: "System health, performance, storage usage and active admin sessions.",
      },
      { property: "og:title", content: "Monitoring — GVRZE Admin" },
      {
        property: "og:description",
        content: "System health, performance, storage usage and active admin sessions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MonitoringPage,
});

function MonitoringPage() {
  const dash = useDashboard();
  const logs = useAdminQuery(adminKeys.auditLogs, fetchAuditLogs);
  const metrics = dash.metrics;

  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Operational health from the shared GEOverze database. Infrastructure APM (uptime, latency, storage GB) is not stored in Postgres."
        actions={
          <Button variant="outline" size="sm" onClick={() => dash.refetch()}>
            Refresh metrics
          </Button>
        }
      />

      <PageBody gap="lg">
        <StatGrid columns={5} label="Operational health">
          <StatCard label="Total users" value={num(metrics?.total_users ?? 0)} icon={Users} />
          <StatCard label="DAU" value={num(metrics?.dau ?? 0)} icon={Activity} hint={`${num(metrics?.mau ?? 0)} MAU`} />
          <StatCard label="Open reports" value={num(metrics?.open_reports ?? 0)} icon={Gauge} />
          <StatCard label="Open tickets" value={num(metrics?.open_tickets ?? 0)} icon={Zap} />
          <StatCard label="Quiz attempts (7d)" value={num(metrics?.quiz_attempts_7d ?? 0)} />
        </StatGrid>

        <div className="grid gap-4 lg:grid-cols-2">
          <Widget title="Service status" description="Derived from live operational queues, not a synthetic uptime probe.">
            <ul className="divide-y divide-border">
              {[
                { name: "User directory", ok: (metrics?.total_users ?? 0) >= 0, detail: `${num(metrics?.active_users ?? 0)} active` },
                { name: "Moderation queue", ok: (metrics?.open_reports ?? 0) < 50, detail: `${num(metrics?.open_reports ?? 0)} open` },
                { name: "Support", ok: (metrics?.open_tickets ?? 0) < 50, detail: `${num(metrics?.open_tickets ?? 0)} open` },
                { name: "Gstore orders", ok: true, detail: `${num(metrics?.gstore_orders ?? 0)} total` },
                { name: "Subscriptions", ok: true, detail: `${num(metrics?.active_subscriptions ?? 0)} active` },
              ].map((service) => (
                <li key={service.name} className="flex items-center gap-3 py-2.5">
                  <span
                    className={`size-2 shrink-0 rounded-full ${service.ok ? "bg-success" : "bg-warning"}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{service.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{service.detail}</p>
                  </div>
                  <Badge variant="secondary">{service.ok ? "operational" : "attention"}</Badge>
                </li>
              ))}
            </ul>
          </Widget>

          <Widget title="Recent admin actions" description="Latest rows from admin_audit_logs.">
            <ul className="divide-y divide-border">
              {(logs.data ?? []).slice(0, 8).map((row) => (
                <li key={row.id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{row.action}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.entity_type} · {row.entity_id ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs tabular text-muted-foreground">
                    {row.created_at.replace("T", " ").slice(0, 16)}
                  </span>
                </li>
              ))}
            </ul>
          </Widget>
        </div>
      </PageBody>
    </>
  );
}
