import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Gauge, HardDrive, Users, Zap } from "lucide-react";

import { ChartCard, PageBody, PageHeader, StatCard, StatGrid } from "@/components/shared";
import { Widget } from "@/components/shared/widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  activeSessions,
  errorRateTrend,
  performanceTrend,
  requestVolumeTrend,
  serviceHealth,
  storageBuckets,
} from "@/features/ops/data";
import type { ServiceStatus } from "@/features/ops/types";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";
import { notReadyNow } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/monitoring")({
  head: () => ({
    meta: [
      { title: "Monitoring — GEOverze Admin" },
      {
        name: "description",
        content: "System health, performance, storage usage and active admin sessions.",
      },
      { property: "og:title", content: "Monitoring — GEOverze Admin" },
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

const statusTone: Record<ServiceStatus, string> = {
  operational: "bg-success",
  degraded: "bg-warning",
  outage: "bg-destructive",
};

function MonitoringPage() {
  const summary = useMemo(() => {
    const uptime =
      serviceHealth.reduce((sum, service) => sum + service.uptime, 0) / serviceHealth.length;
    const latency = Math.round(
      serviceHealth.reduce((sum, service) => sum + service.latencyMs, 0) / serviceHealth.length,
    );
    const used = storageBuckets.reduce((sum, bucket) => sum + bucket.usedGb, 0);
    const capacity = storageBuckets.reduce((sum, bucket) => sum + bucket.capacityGb, 0);
    return {
      uptime: Math.round(uptime * 100) / 100,
      latency,
      incidents: serviceHealth.filter((service) => service.status !== "operational").length,
      used,
      capacity,
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Live operational health for every GEOverze service."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => notReadyNow("Live metrics stream once the backend is connected.")}
          >
            Refresh metrics
          </Button>
        }
      />

      <PageBody gap="lg">
        <StatGrid columns={5} label="System health">
          <StatCard label="Uptime" value={`${summary.uptime}%`} icon={Activity} hint="30-day avg" />
          <StatCard label="Avg. latency" value={`${summary.latency} ms`} icon={Zap} delta={-3.2} />
          <StatCard label="Open incidents" value={num(summary.incidents)} icon={Gauge} />
          <StatCard
            label="Storage used"
            value={`${num(summary.used)} GB`}
            icon={HardDrive}
            hint={`of ${num(summary.capacity)} GB`}
          />
          <StatCard label="Active sessions" value={num(activeSessions.length)} icon={Users} />
        </StatGrid>

        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard
            title="Request volume"
            series={requestVolumeTrend}
            labels={catalogMonths}
            height={160}
          />
          <ChartCard
            title="Response time"
            series={performanceTrend}
            labels={catalogMonths}
            height={160}
          />
          <ChartCard
            title="Error rate"
            series={errorRateTrend}
            labels={catalogMonths}
            height={160}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Widget title="Service status" description="Per-service availability and latency.">
            <ul className="divide-y divide-border">
              {serviceHealth.map((service) => (
                <li key={service.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className={cn("size-2 shrink-0 rounded-full", statusTone[service.status])}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{service.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {service.region} · {service.uptime}% uptime
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="secondary">{service.status}</Badge>
                    <p className="mt-1 text-xs tabular text-muted-foreground">
                      {service.latencyMs} ms · {service.errorRate}% err
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Widget>

          <Widget title="Storage" description="Bucket usage against provisioned capacity.">
            <ul className="space-y-3">
              {storageBuckets.map((bucket) => {
                const pct = Math.round((bucket.usedGb / bucket.capacityGb) * 100);
                return (
                  <li key={bucket.id}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium text-foreground">{bucket.name}</span>
                      <span className="shrink-0 text-xs tabular text-muted-foreground">
                        {num(bucket.usedGb)} / {num(bucket.capacityGb)} GB · {num(bucket.objects)}{" "}
                        objects
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          pct > 85 ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-primary/60",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Widget>
        </div>

        <Widget title="Active admin sessions" description="Signed-in operators right now.">
          <ul className="divide-y divide-border">
            {activeSessions.map((session) => (
              <li key={session.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{session.admin}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.role} · {session.device} · {session.location}
                  </p>
                </div>
                <span className="text-xs tabular text-muted-foreground">{session.ip}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => notReadyNow("Revoking sessions requires the auth backend.")}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        </Widget>
      </PageBody>
    </>
  );
}
