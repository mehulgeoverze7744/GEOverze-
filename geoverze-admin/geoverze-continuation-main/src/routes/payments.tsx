import { createFileRoute } from "@tanstack/react-router";

import { ResourcePage } from "@/components/shared/resource-page";
import { StatusBadge } from "@/components/shared/status-badge";
import { InspectorField } from "@/components/shared/inspector-panel";
import type { DataTableColumn } from "@/components/shared/data-table";
import { payments } from "@/lib/mock-data";
import { money } from "@/lib/format";
import type { Payment } from "@/types";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — GEOverze Admin" },
      { name: "description", content: "Transaction ledger with settlement and refund state." },
      { property: "og:title", content: "Payments — GEOverze Admin" },
      {
        property: "og:description",
        content: "Transaction ledger with settlement and refund state.",
      },
    ],
  }),
  component: PaymentsPage,
});

const columns: DataTableColumn<Payment>[] = [
  {
    id: "id",
    header: "Payment",
    accessor: (r) => r.id,
    cell: (r) => <code className="font-mono text-xs">{r.id}</code>,
  },
  { id: "customer", header: "Customer", accessor: (r) => r.customer },
  { id: "method", header: "Method", accessor: (r) => r.method },
  {
    id: "status",
    header: "Status",
    accessor: (r) => r.status,
    cell: (r) => <StatusBadge status={r.status} />,
  },
  {
    id: "amount",
    header: "Amount",
    accessor: (r) => r.amount,
    align: "right",
    cell: (r) => money(r.amount, r.currency),
  },
  { id: "currency", header: "Currency", accessor: (r) => r.currency, defaultHidden: true },
  { id: "processedAt", header: "Processed", accessor: (r) => r.processedAt, align: "right" },
];

function PaymentsPage() {
  return (
    <ResourcePage
      title="Payments"
      description="All inbound transactions across store, subscriptions and credits."
      data={payments}
      columns={columns}
      getRowId={(r) => r.id}
      searchPlaceholder="Search payments…"
      filters={[
        {
          id: "status",
          label: "Status",
          accessor: (r) => r.status,
          options: ["paid", "pending", "failed", "refunded"],
        },
        {
          id: "method",
          label: "Method",
          accessor: (r) => r.method,
          options: ["Card", "UPI", "PayPal", "Bank Transfer", "Apple Pay"],
        },
      ]}
      inspectorTitle={(r) => `Payment ${r.id}`}
      renderInspector={(r) => (
        <div>
          <InspectorField label="Customer" value={r.customer} />
          <InspectorField label="Method" value={r.method} />
          <InspectorField label="Status" value={<StatusBadge status={r.status} />} />
          <InspectorField label="Amount" value={money(r.amount, r.currency)} />
          <InspectorField label="Processed" value={r.processedAt} />
        </div>
      )}
    />
  );
}
