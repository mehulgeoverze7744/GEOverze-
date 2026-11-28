import { ExternalLink, Truck } from "lucide-react";

import {
  buildGstoreShippingCustomerView,
  type GstoreShipmentSnapshot,
} from "../lib/gstoreOrderShipment";
import { SF_UI_FONT } from "../storefront/storefront-ui";

export function GstoreOrderShippingBlock({
  paymentStatus,
  orderStatus,
  trackingNumber,
  shipment,
}: {
  paymentStatus: string;
  orderStatus: string;
  trackingNumber: string | null;
  shipment: GstoreShipmentSnapshot | null;
}) {
  const view = buildGstoreShippingCustomerView({
    payment_status: paymentStatus,
    order_status: orderStatus,
    tracking_number: trackingNumber,
    shipment,
  });

  return (
    <div className={`mt-5 rounded-xl border border-[#ececec] bg-[#f7f8fa] px-4 py-4 ${SF_UI_FONT}`}>
      <div className="flex items-start gap-3">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#6b7280]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#111827]">{view.headline}</p>
          {view.detail ? (
            <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">{view.detail}</p>
          ) : null}
          {view.awbLabel ? (
            <p className="mt-2 text-[12px] text-[#4b5563]">
              AWB: <span className="font-medium text-[#111827]">{view.awbLabel}</span>
            </p>
          ) : null}
          {view.showTrackButton && view.trackingUrl ? (
            <a
              href={view.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#111827] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#1f2937]"
            >
              Track my order
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}