import { createFileRoute } from "@tanstack/react-router";

import { ResourcePage } from "@/components/shared/resource-page";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge";
import { InspectorField } from "@/components/shared/inspector-panel";
import type { DataTableColumn } from "@/components/shared/data-table";
import { tickets } from "@/lib/mock-data";
import type { Ticket } from "@/types";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — GEOverze Admin" },
      {
        name: "description",
        content: "Support ticket queue with priority, channel and SLA state.",
      },
      { property: "og:title", content: "Support — GEOverze Admin" },
      {
        property: "og:description",
        content: "Support ticket queue with priority, channel and SLA state.",
      },
    ],
  }),
  component: SupportPage,
});

const columns: DataTableColumn<Ticket>[] = [
  {
    id: "id",
    header: "Ticket",
    accessor: (r) => r.id,
    cell: (r) => <code className="font-mono text-xs">{r.id}</code>,
  },
  { id: "subject", header: "Subject", accessor: (r) => r.subject },
  { id: "requester", header: "Requester", accessor: (r) => r.requester },
  { id: "channel", header: "Channel", accessor: (r) => r.channel },
  {
    id: "priority",
    header: "Priority",
    accessor: (r) => r.priority,
    cell: (r) => <SeverityBadge level={r.priority} />,
  },
  {
    id: "status",
    header: "Status",
    accessor: (r) => r.status,
    cell: (r) => <StatusBadge status={r.status} />,
  },
  { id: "updatedAt", header: "Updated", accessor: (r) => r.updatedAt, align: "right" },
];

function SupportPage() {
  return (
    <ResourcePage
      title="Support"
      description="Inbound tickets from email, in-app messaging and community channels."
      data={tickets}
      columns={columns}
      getRowId={(r) => r.id}
      searchPlaceholder="Search tickets…"
      filters={[
        {
          id: "priority",
          label: "Priority",
          accessor: (r) => r.priority,
          options: ["Low", "Medium", "High", "Critical"],
        },
        {
          id: "status",
          label: "Status",
          accessor: (r) => r.status,
          options: ["open", "pending", "resolved"],
        },
        {
          id: "channel",
          label: "Channel",
          accessor: (r) => r.channel,
          options: ["Email", "In-app", "Discord", "Web form"],
        },
      ]}
      inspectorTitle={(r) => r.subject}
      renderInspector={(r) => (
        <div>
          <InspectorField
            label="Ticket ID"
            value={<code className="font-mono text-xs">{r.id}</code>}
          />
          <InspectorField label="Requester" value={r.requester} />
          <InspectorField label="Channel" value={r.channel} />
          <InspectorField label="Priority" value={<SeverityBadge level={r.priority} />} />
          <InspectorField label="Status" value={<StatusBadge status={r.status} />} />
          <InspectorField label="Updated" value={r.updatedAt} />
        </div>
      )}
    />
  );
}
