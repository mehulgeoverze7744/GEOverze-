import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";

import { retryGstorePaymentFn, verifyGstorePaymentFn } from "../lib/gstoreServerFns";
import { loadGstoreRazorpayScript, openGstoreRazorpayCheckout } from "../lib/gstoreRazorpayClient";
import { gstorePrimaryBtn } from "./gstoreOrderUi";

export function GstoreRetryPaymentButton({
  orderId,
  paymentId,
  orderNumber,
  onPaid,
}: {
  orderId: string;
  paymentId: string;
  orderNumber: string;
  onPaid?: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleRetry() {
    if (busy) return;
    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const accessToken = auth.session?.access_token;
      if (!accessToken) throw new Error("Sign in to retry payment.");

      const retry = await retryGstorePaymentFn({
        data: {
          access_token: accessToken,
          order_id: orderId,
          payment_id: paymentId,
        },
      });
      await loadGstoreRazorpayScript();
      await new Promise<void>((resolve, reject) => {
        openGstoreRazorpayCheckout({
          key: retry.rzp_key_id,
          order_id: retry.rzp_order_id,
          name: "GVRZE Gstore",
          description: `Retry ${orderNumber}`,
          theme: { color: "#111827" },
          handler: (response) => {
            void (async () => {
              try {
                await verifyGstorePaymentFn({
                  data: {
                    access_token: accessToken,
                    order_id: orderId,
                    payment_id: paymentId,
                    rzp_order_id: response.razorpay_order_id,
                    rzp_payment_id: response.razorpay_payment_id,
                    rzp_signature: response.razorpay_signature,
                  },
                });
                toast.success("Payment confirmed.");
                onPaid?.();
                resolve();
              } catch (err) {
                reject(err);
              }
            })();
          },
          onFailed: (description) => reject(new Error(description)),
          modal: {
            ondismiss: () => resolve(),
          },
        });
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not retry payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={gstorePrimaryBtn}
      onClick={() => void handleRetry()}
      disabled={busy}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} />
      {busy ? "Opening Razorpay…" : "Retry payment"}
    </button>
  );
}
