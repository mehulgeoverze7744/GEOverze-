/**
 * Server-only Gstore Razorpay helpers. Imported from createServerFn handlers
 * so node:crypto never lands in the browser bundle.
 */

import "@tanstack/react-start/server-only";

import {
  createRazorpayOrder,
  getRazorpayKeyId,
  isRazorpayServerConfigured,
  verifyCapturedOrderPayment,
} from "@/lib/payments/razorpayServer";

export { getRazorpayKeyId, isRazorpayServerConfigured, verifyCapturedOrderPayment };

export async function placeRazorpayOrder(input: {
  orderId: string;
  paymentId: string;
  orderNumber: string;
  totalMinor: number;
  customerEmail: string;
  notes?: Record<string, string>;
}): Promise<{ rzpOrderId: string; rzpKeyId: string }> {
  if (!isRazorpayServerConfigured()) {
    return { rzpOrderId: "", rzpKeyId: "" };
  }
  const rzpOrder = await createRazorpayOrder({
    amountMinor: input.totalMinor,
    receipt: input.orderNumber,
    notes: {
      order_id: input.orderId,
      payment_id: input.paymentId,
      gvrze_order_id: input.orderId,
      customer_email: input.customerEmail,
      order_type: "gstore_one_time",
      ...input.notes,
    },
  });
  return { rzpOrderId: rzpOrder.id, rzpKeyId: getRazorpayKeyId() };
}
