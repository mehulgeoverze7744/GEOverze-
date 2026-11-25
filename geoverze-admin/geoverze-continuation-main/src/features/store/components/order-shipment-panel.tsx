import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Package, RefreshCw, Truck } from "lucide-react";

import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { InspectorField } from "@/components/shared/inspector-panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchGstoreOrderShippingDetail,
  runGstoreShipmentAction,
  upsertGstoreProductFulfillment,
} from "@/features/commerce/shippingApi";
import type { FulfillmentRow, GstoreShipmentAction } from "@/features/store/shipment-types";
import { formatDate } from "@/features/users/format";

const ACTION_LABELS: Record<GstoreShipmentAction, string> = {
  create_shipment: "Create shipment",
  check_serviceability: "Check serviceability",
  assign_awb: "Assign AWB",
  schedule_pickup: "Schedule pickup",
  refresh_tracking: "Refresh tracking",
  retry_shipment: "Retry failed shipment",
};

type FulfillmentDraft = FulfillmentRow;

export function OrderShipmentPanel({
  orderId,
  paymentStatus,
  onChanged,
}: {
  orderId: string;
  paymentStatus: string;
  onChanged?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchGstoreOrderShippingDetail>> | null>(null);
  const [fulfillmentDrafts, setFulfillmentDrafts] = useState<FulfillmentDraft[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const next = await fetchGstoreOrderShippingDetail(orderId);
      setDetail(next);
      setFulfillmentDrafts(next.fulfillment ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [orderId]);

  const order = detail?.order ?? {};
  const shipment = detail?.shipment && typeof detail.shipment === "object" ? detail.shipment : null;
  const shipmentStatus = String(shipment?.["shipment_status"] ?? "none");

  const shippingAddress = useMemo(() => {
    const parts = [
      order["shipping_name"],
      order["shipping_line1"],
      order["shipping_line2"],
      [order["shipping_city"], order["shipping_state"], order["shipping_pincode"]].filter(Boolean).join(" "),
      order["shipping_country"],
    ].filter(Boolean);
    return parts.join(", ");
  }, [order]);

  const runAction = async (action: GstoreShipmentAction) => {
    setActionBusy(action);
    setMessage(null);
    try {
      const result = await runGstoreShipmentAction(orderId, action);
      const parts = [
        result.code?.replace(/_/g, " "),
        result.message,
        result.ok ? "Success" : "Request failed",
      ].filter(Boolean);
      setMessage(parts.join(" — "));
      await load();
      onChanged?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setActionBusy(null);
    }
  };

  const saveFulfillment = async (row: FulfillmentDraft) => {
    await upsertGstoreProductFulfillment({
      product_slug: row.product_slug,
      weight_g: row.weight_g,
      length_cm: row.length_cm,
      breadth_cm: row.breadth_cm,
      height_cm: row.height_cm,
      hsn_code: row.hsn_code,
      requires_shipping: row.requires_shipping,
      admin_notes: row.admin_notes ?? "",
    });
    await load();
    onChanged?.();
  };

  if (loading && !detail) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading shipment data…
      </div>
    );
  }

  const logisticsIncomplete = fulfillmentDrafts.some((f) => f.requires_shipping && !f.logistics_ready);

  return (
    <div className="space-y-6">
      {logisticsIncomplete && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle>Logistics incomplete</AlertTitle>
          <AlertDescription>
            Weight and dimensions are required before Shiprocket can accept this order. Enter accurate values below — do
            not guess.
          </AlertDescription>
        </Alert>
      )}

      {message && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{message}</p>
      )}

      <div>
        <InspectorField label="Order ID" value={<code className="text-xs">{orderId}</code>} />
        <InspectorField label="Order number" value={String(order["order_number"] ?? "—")} />
        <InspectorField label="Payment status" value={<StatusBadge status={paymentStatus} />} />
        <InspectorField label="Customer" value={String(order["customer_name"] ?? "—")} />
        <InspectorField label="Email" value={String(order["customer_email"] ?? "—")} />
        <InspectorField label="Shipping address" value={shippingAddress || "—"} />
        <InspectorField label="Shipment status" value={<Badge variant="secondary">{shipmentStatus.replace(/_/g, " ")}</Badge>} />
        <InspectorField label="Courier" value={String(shipment?.["courier_name"] ?? "—")} />
        <InspectorField label="AWB" value={String(shipment?.["awb"] ?? "—")} />
        <InspectorField
          label="Tracking URL"
          value={
            shipment?.["tracking_url"] ? (
              <a
                href={String(shipment["tracking_url"])}
                className="text-xs text-primary underline"
                target="_blank"
                rel="noreferrer"
              >
                Open tracking
              </a>
            ) : (
              "—"
            )
          }
        />
        <InspectorField
          label="Estimated delivery"
          value={
            shipment?.["estimated_delivery_date"]
              ? formatDate(String(shipment["estimated_delivery_date"]))
              : "—"
          }
        />
        <InspectorField label="Last tracking event" value={String(shipment?.["last_tracking_event"] ?? "—")} />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Line items</p>
        <ul className="divide-y divide-border rounded-lg border border-border text-sm">
          {(detail?.items ?? []).map((item) => (
            <li key={String(item["id"])} className="flex flex-wrap items-center gap-2 p-3">
              <Package className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 font-medium">{String(item["product_name"])}</span>
              <code className="text-xs text-muted-foreground">{String(item["sku"] || item["product_slug"])}</code>
              <span className="text-xs text-muted-foreground">×{String(item["quantity"])}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(ACTION_LABELS) as GstoreShipmentAction[]).map((action) => (
          <Button
            key={action}
            size="sm"
            variant={action === "retry_shipment" ? "outline" : "default"}
            disabled={
              Boolean(actionBusy) ||
              (action === "create_shipment" && paymentStatus !== "paid") ||
              (action === "create_shipment" && logisticsIncomplete)
            }
            onClick={() => void runAction(action)}
          >
            {actionBusy === action ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Truck className="size-4" aria-hidden="true" />
            )}
            {ACTION_LABELS[action]}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Product fulfillment</p>
        {fulfillmentDrafts.map((row, index) => (
          <div key={row.product_slug} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-medium">{row.product_slug}</code>
              <Badge variant={row.logistics_ready ? "secondary" : "destructive"}>
                {row.logistics_ready ? "Ready" : "Incomplete"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Weight (g)"
                value={row.weight_g}
                onChange={(v) => patchDraft(setFulfillmentDrafts, index, { weight_g: v })}
              />
              <TextField
                label="HSN"
                value={row.hsn_code ?? ""}
                onChange={(v) => patchDraft(setFulfillmentDrafts, index, { hsn_code: v || null })}
              />
              <NumberField
                label="Length (cm)"
                value={row.length_cm}
                onChange={(v) => patchDraft(setFulfillmentDrafts, index, { length_cm: v })}
              />
              <NumberField
                label="Breadth (cm)"
                value={row.breadth_cm}
                onChange={(v) => patchDraft(setFulfillmentDrafts, index, { breadth_cm: v })}
              />
              <NumberField
                label="Height (cm)"
                value={row.height_cm}
                onChange={(v) => patchDraft(setFulfillmentDrafts, index, { height_cm: v })}
              />
            </div>
            <Button size="sm" variant="outline" onClick={() => void saveFulfillment(fulfillmentDrafts[index])}>
              Save logistics
            </Button>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Shipment timeline</p>
        <ActivityTimeline
          events={(detail?.shipment_events ?? []).map((event) => ({
            id: event.id,
            actor: "shiprocket",
            action: event.event_description ?? event.status ?? "Update",
            target: event.status ?? "",
            time: event.event_timestamp ? formatDate(event.event_timestamp) : formatDate(event.created_at),
          }))}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Email notifications</p>
        <ul className="divide-y divide-border rounded-lg border border-border text-sm">
          {(detail?.notifications ?? []).map((n) => (
            <li key={n.id} className="space-y-1 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{n.kind.replace(/_/g, " ")}</span>
                <StatusBadge status={n.status} />
                <span className="text-xs text-muted-foreground">{n.channel}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Attempts {n.attempt_count ?? 0}
                {n.provider_message_id ? ` · Resend ${n.provider_message_id}` : ""}
              </p>
              {n.error && <p className="text-xs text-destructive">{n.error}</p>}
            </li>
          ))}
          {(detail?.notifications ?? []).length === 0 && (
            <li className="p-3 text-xs text-muted-foreground">No notification ledger rows yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (next: number | null) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        className="h-8 text-xs"
        inputMode="decimal"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value.trim();
          onChange(raw === "" ? null : Number(raw));
        }}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input className="h-8 text-xs" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function patchDraft(
  setRows: React.Dispatch<React.SetStateAction<FulfillmentDraft[]>>,
  index: number,
  patch: Partial<FulfillmentDraft>,
) {
  setRows((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
}