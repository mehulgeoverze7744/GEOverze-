import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, ScrollText, ShieldAlert, TriangleAlert, Users } from "lucide-react";

import { PageBody, PageHeader, StatCard, StatGrid } from "@/components/shared";
import { DataTable } from "@/components/shared/data-table";
import { InspectorField, InspectorPanel } from "@/components/shared/inspector-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auditColumns } from "@/features/ops/audit-columns";
import { auditActors, auditEvents, summarizeAudit } from "@/features/ops/data";
import { auditCategories, auditResults, type AuditEvent } from "@/features/ops/types";
import { num } from "@/lib/format";
import { notReadyNow } from "@/lib/placeholder";

export const Route = createFileRoute("/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs — GEOverze Admin" },
      {
        name: "description",
        content: "Immutable record of every administrative action across the GEOverze platform.",
      },
      { property: "og:title", content: "Audit Logs — GEOverze Admin" },
      {
        property: "og:description",
        content: "Searchable, filterable trail of admin actions with full event detail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const [active, setActive] = useState<AuditEvent | null>(null);
  const summary = useMemo(() => summarizeAudit(auditEvents), []);

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Every privileged action, with actor, target, channel and outcome."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => notReadyNow("Signed CSV exports arrive with the backend.")}
          >
            <Download className="size-4" aria-hidden="true" />
            Export trail
          </Button>
        }
      />

      <PageBody>
        <StatGrid columns={5} label="Audit statistics">
          <StatCard label="Events" value={num(summary.total)} icon={ScrollText} />
          <StatCard label="Last 24 hours" value={num(summary.last24h)} icon={ScrollText} />
          <StatCard label="Denied" value={num(summary.denied)} icon={ShieldAlert} />
          <StatCard label="Failed" value={num(summary.failed)} icon={TriangleAlert} />
          <StatCard label="Distinct actors" value={num(summary.actors)} icon={Users} />
        </StatGrid>

        <DataTable
          data={auditEvents}
          columns={auditColumns}
          getRowId={(row) => row.id}
          searchPlaceholder="Search actor, action or target…"
          pageSize={15}
          filters={[
            {
              id: "category",
              label: "Category",
              accessor: (row) => row.category,
              options: [...auditCategories],
            },
            {
              id: "result",
              label: "Result",
              accessor: (row) => row.result,
              options: [...auditResults],
            },
            { id: "actor", label: "Actor", accessor: (row) => row.actor, options: auditActors },
            {
              id: "channel",
              label: "Channel",
              accessor: (row) => row.channel,
              options: ["Console", "API", "Automation", "CLI"],
            },
          ]}
          onRowClick={(row) => setActive(row)}
          rowActions={[{ label: "View event", onSelect: (row) => setActive(row) }]}
        />
      </PageBody>

      <InspectorPanel
        open={active !== null}
        onOpenChange={(open) => !open && setActive(null)}
        title={active ? `Event ${active.id}` : "Event"}
        description="Immutable audit record — read only."
      >
        {active && (
          <div>
            <InspectorField
              label="Result"
              value={<Badge variant="secondary">{active.result}</Badge>}
            />
            <InspectorField label="Timestamp" value={active.at.replace("T", " ").slice(0, 19)} />
            <InspectorField label="Actor" value={`${active.actor} · ${active.actorRole}`} />
            <InspectorField label="Category" value={active.category} />
            <InspectorField
              label="Action"
              value={<code className="font-mono text-xs">{active.action}</code>}
            />
            <InspectorField
              label="Target"
              value={<code className="font-mono text-xs">{active.target}</code>}
            />
            <InspectorField label="Channel" value={active.channel} />
            <InspectorField label="IP address" value={active.ip} />
            <InspectorField label="Details" value={active.details} />
          </div>
        )}
      </InspectorPanel>
    </>
  );
}
