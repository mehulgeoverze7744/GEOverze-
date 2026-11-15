import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

import { ResourcePage } from "@/components/shared/resource-page";
import { StatusBadge } from "@/components/shared/status-badge";
import { InspectorField } from "@/components/shared/inspector-panel";
import type { DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { fetchBillingPayments, fetchGstorePayments } from "@/features/commerce/api";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminQuery } from "@/lib/admin/hooks";
import { moneyMinor } from "@/lib/format";
import type { Status } from "@/types";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — GVRZE Admin" },
      { name: "description", content: "Live Gstore and subscription payment records." },
    ],
  }),
  component: PaymentsPage,
});

type LivePayment = {
  id: string;
  customer: string;
  method: string;
  status: Status;
  amount: number;
  currency: string;
  processedAt: string;
  source: "gstore" | "billing";
  providerRef: string;
};

function mapStatus(value: string): Status {
  if (value === "paid" || value === "succeeded" || value === "captured") return "paid";
  if (value === "failed") return "failed";
  if (value === "refunded" || value === "cancelled") return "cancelled";
  return "pending";
}

const columns: DataTableColumn<LivePayment>[] = [
  {
    id: "id",
    header: "Payment",
    accessor: (r) => r.id,
    cell: (r) => <code className="font-mono text-xs">{r.id.slice(0, 8)}</code>,
  },
  { id: "source", header: "Source", accessor: (r) => r.source },
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
    cell: (r) => moneyMinor(r.amount, r.currency),
  },
  { id: "processedAt", header: "Processed", accessor: (r) => r.processedAt, align: "right" },
];

function PaymentsPage() {
  const gstore = useAdminQuery(adminKeys.payments, async () => {
    const [store, billing] = await Promise.all([fetchGstorePayments(), fetchBillingPayments()]);
    const storeRows: LivePayment[] = store.map((row) => ({
      id: row.id,
      customer: row.order_id,
      method: row.payment_method || row.provider,
      status: mapStatus(row.status),
      amount: Number(row.amount_minor),
      currency: row.currency,
      processedAt: row.verified_at ?? row.created_at,
      source: "gstore",
      providerRef: row.provider_payment_id ?? row.provider_order_id ?? "",
    }));
    const billingRows: LivePayment[] = billing.map((row) => ({
      id: row.id,
      customer: row.user_id,
      method: row.provider,
      status: mapStatus(row.status),
      amount: row.charge_amount_minor,
      currency: row.charge_currency.trim(),
      processedAt: row.paid_at ?? row.created_at,
      source: "billing",
      providerRef: row.provider_payment_id,
    }));
    return [...storeRows, ...billingRows].sort((a, b) => b.processedAt.localeCompare(a.processedAt));
  });

  const data = useMemo(() => (Array.isArray(gstore.data) ? gstore.data : []), [gstore.data]);

  return (
    <ResourcePage
      title="Payments"
      description="Gstore Razorpay charges and subscription billing payments. Refunds must go through the payment provider."
      data={data}
      loading={gstore.loading}
      error={gstore.error}
      onRetry={() => void gstore.refetch()}
      columns={columns}
      getRowId={(r) => r.id}
      searchPlaceholder="Search payments…"
      actions={
        <Button variant="outline" size="sm" onClick={() => void gstore.refetch()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      }
      filters={[
        {
          id: "status",
          label: "Status",
          accessor: (r) => r.status,
          options: ["paid", "pending", "failed", "cancelled"],
        },
        {
          id: "source",
          label: "Source",
          accessor: (r) => r.source,
          options: ["gstore", "billing"],
        },
      ]}
      inspectorTitle={(r) => `Payment ${r.id.slice(0, 8)}`}
      renderInspector={(r) => (
        <div>
          <InspectorField label="Source" value={r.source} />
          <InspectorField label="Customer / order" value={r.customer} />
          <InspectorField label="Method" value={r.method} />
          <InspectorField label="Status" value={<StatusBadge status={r.status} />} />
          <InspectorField label="Amount" value={moneyMinor(r.amount, r.currency)} />
          <InspectorField label="Provider reference" value={r.providerRef || "—"} />
          <InspectorField label="Processed" value={r.processedAt} />
        </div>
      )}
    />
  );
}
