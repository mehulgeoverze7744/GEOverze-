import { createFileRoute } from "@tanstack/react-router";

import { ResourcePage } from "@/components/shared/resource-page";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge";
import { InspectorField } from "@/components/shared/inspector-panel";
import type { DataTableColumn } from "@/components/shared/data-table";
import { reports } from "@/lib/mock-data";
import type { Report } from "@/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — GEOverze Admin" },
      {
        name: "description",
        content: "User-submitted reports across content, billing and technical issues.",
      },
      { property: "og:title", content: "Reports — GEOverze Admin" },
      {
        property: "og:description",
        content: "User-submitted reports across content, billing and technical issues.",
      },
    ],
  }),
  component: ReportsPage,
});

const columns: DataTableColumn<Report>[] = [
  { id: "subject", header: "Subject", accessor: (r) => r.subject },
  { id: "type", header: "Type", accessor: (r) => r.type },
  { id: "reporter", header: "Reporter", accessor: (r) => r.reporter },
  {
    id: "severity",
    header: "Severity",
    accessor: (r) => r.severity,
    cell: (r) => <SeverityBadge level={r.severity} />,
  },
  {
    id: "status",
    header: "Status",
    accessor: (r) => r.status,
    cell: (r) => <StatusBadge status={r.status} />,
  },
  { id: "createdAt", header: "Created", accessor: (r) => r.createdAt, align: "right" },
];

function ReportsPage() {
  return (
    <ResourcePage
      title="Reports"
      description="Everything users have reported, grouped for triage and escalation."
      data={reports}
      columns={columns}
      getRowId={(r) => r.id}
      searchPlaceholder="Search reports…"
      filters={[
        {
          id: "type",
          label: "Type",
          accessor: (r) => r.type,
          options: ["Content", "User", "Technical", "Billing"],
        },
        {
          id: "status",
          label: "Status",
          accessor: (r) => r.status,
          options: ["open", "pending", "resolved"],
        },
      ]}
      inspectorTitle={(r) => r.subject}
      renderInspector={(r) => (
        <div>
          <InspectorField
            label="Report ID"
            value={<code className="font-mono text-xs">{r.id}</code>}
          />
          <InspectorField label="Type" value={r.type} />
          <InspectorField label="Reporter" value={r.reporter} />
          <InspectorField label="Severity" value={<SeverityBadge level={r.severity} />} />
          <InspectorField label="Status" value={<StatusBadge status={r.status} />} />
          <InspectorField label="Created" value={r.createdAt} />
        </div>
      )}
    />
  );
}
