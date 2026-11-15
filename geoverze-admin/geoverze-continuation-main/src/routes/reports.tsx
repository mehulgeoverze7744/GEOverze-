import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { ResourcePage } from "@/components/shared/resource-page";
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge";
import { InspectorField } from "@/components/shared/inspector-panel";
import type { DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { fetchContentReports, updateContentReport } from "@/features/ops/api";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminMutation, useAdminQuery } from "@/lib/admin/hooks";
import { useAdminRealtime } from "@/lib/admin/realtime";
import type { Status } from "@/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [{ title: "Reports — GVRZE Admin" }],
  }),
  component: ReportsPage,
});

type LiveReport = {
  id: string;
  subject: string;
  type: string;
  reporter: string;
  severity: string;
  status: Status;
  createdAt: string;
  details: string;
};

const columns: DataTableColumn<LiveReport>[] = [
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
  const query = useAdminQuery(adminKeys.reports, fetchContentReports);
  useAdminRealtime("content_reports", [adminKeys.reports, adminKeys.dashboard]);
  const resolve = useAdminMutation(
    (id: string) => updateContentReport(id, { status: "resolved" }),
    [adminKeys.reports, adminKeys.dashboard],
    "Report resolved.",
  );

  const data = useMemo<LiveReport[]>(
    () =>
      (query.data ?? []).map((row) => ({
        id: row.id,
        subject: row.reason,
        type: row.target_type,
        reporter: row.reporter_id ?? "—",
        severity: row.severity,
        status: row.status as Status,
        createdAt: row.created_at,
        details: row.details,
      })),
    [query.data],
  );

  return (
    <ResourcePage
      title="Reports"
      description="Moderation reports against existing GEOverze entities. Empty until a user or admin files one."
      data={data}
      loading={query.loading}
      error={query.error}
      onRetry={() => void query.refetch()}
      columns={columns}
      getRowId={(r) => r.id}
      searchPlaceholder="Search reports…"
      actions={
        <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      }
      filters={[
        { id: "type", label: "Type", accessor: (r) => r.type, options: ["profile", "quiz", "library_resource", "other"] },
        { id: "status", label: "Status", accessor: (r) => r.status, options: ["open", "pending", "resolved", "dismissed"] },
      ]}
      rowActions={[
        { label: "Resolve", onSelect: (row) => resolve.mutate(row.id) },
        {
          label: "Dismiss",
          onSelect: (row) => {
            void updateContentReport(row.id, { status: "dismissed" }).then(() => {
              toast.success("Report dismissed.");
              void query.refetch();
            });
          },
        },
      ]}
      inspectorTitle={(r) => r.subject}
      renderInspector={(r) => (
        <div>
          <InspectorField label="Report ID" value={<code className="font-mono text-xs">{r.id}</code>} />
          <InspectorField label="Type" value={r.type} />
          <InspectorField label="Reporter" value={r.reporter} />
          <InspectorField label="Severity" value={<SeverityBadge level={r.severity} />} />
          <InspectorField label="Status" value={<StatusBadge status={r.status} />} />
          <InspectorField label="Details" value={r.details || "—"} />
          <InspectorField label="Created" value={r.createdAt} />
        </div>
      )}
    />
  );
}
