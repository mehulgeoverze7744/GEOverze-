import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { SF_UI_FONT } from "../storefront/storefront-ui";

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100",
  confirmed: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100",
  processing: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-100",
  shipped: "bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-100",
  delivered: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100",
  cancelled: "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-100",
  refunded: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-800",
  pending: "bg-amber-50 text-amber-800",
  paid: "bg-emerald-50 text-emerald-800",
  failed: "bg-rose-50 text-rose-800",
  cancelled: "bg-slate-100 text-slate-600",
  refunded: "bg-slate-100 text-slate-600",
};

function labelize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function GstoreOrderStatusBadge({ status }: { status: string }) {
  const cls = ORDER_STATUS_COLOR[status] ?? "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        SF_UI_FONT,
        cls,
      )}
    >
      {labelize(status)}
    </span>
  );
}

export function GstorePaymentBadge({ status }: { status: string }) {
  const cls = PAYMENT_STATUS_COLOR[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        SF_UI_FONT,
        cls,
      )}
    >
      {labelize(status)}
    </span>
  );
}

export function GstoreOrderEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[#e8e8e8] bg-white px-8 py-16 text-center shadow-[0_10px_28px_-22px_rgb(17_17_17_/_0.28)]">
      <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#e8e8e8] bg-[#f7f8fa] text-[#6b7280]">
        <Icon className="h-6 w-6" strokeWidth={1.4} />
      </span>
      <h3 className={`text-[18px] font-semibold tracking-tight text-[#111827] ${SF_UI_FONT}`}>
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6b7280]">{description}</p>
      ) : null}
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}

export const gstorePrimaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#222]";

export const gstoreGhostBtn =
  "inline-flex items-center justify-center rounded-lg border border-[#e0e0e0] bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-colors hover:bg-[#f5f5f5]";
