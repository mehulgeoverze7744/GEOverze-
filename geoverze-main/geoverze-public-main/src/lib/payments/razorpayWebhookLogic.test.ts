import assert from "node:assert/strict";
import test from "node:test";

import {
  extractGstoreWebhookRefs,
  extractSubscriptionWebhookRefs,
  resolveRazorpayWebhookEventId,
  shouldSkipProcessedWebhook,
} from "./razorpayWebhookLogic.ts";

test("shouldSkipProcessedWebhook is idempotent for already-processed events", () => {
  assert.equal(shouldSkipProcessedWebhook(null), false);
  assert.equal(shouldSkipProcessedWebhook({ processed: false }), false);
  assert.equal(shouldSkipProcessedWebhook({ processed: true }), true);
  assert.equal(shouldSkipProcessedWebhook({ processing_status: "processed" }), true);
  assert.equal(shouldSkipProcessedWebhook({ processing_status: "received" }), false);
});

test("extractGstoreWebhookRefs reads both order_id and gvrze_order_id notes", () => {
  const fromOrderId = extractGstoreWebhookRefs({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_1",
          order_id: "order_1",
          amount: 299900,
          currency: "INR",
          status: "captured",
          captured: true,
          notes: { order_id: "uuid-order", payment_id: "uuid-pay" },
        },
      },
    },
  });
  assert.equal(fromOrderId.gstoreOrderId, "uuid-order");
  assert.equal(fromOrderId.gstorePaymentId, "uuid-pay");
  assert.equal(fromOrderId.captured, true);

  const fromLegacy = extractGstoreWebhookRefs({
    event: "order.paid",
    payload: {
      payment: {
        entity: {
          id: "pay_2",
          order_id: "order_2",
          notes: { gvrze_order_id: "legacy-order" },
        },
      },
    },
  });
  assert.equal(fromLegacy.gstoreOrderId, "legacy-order");
});

test("resolveRazorpayWebhookEventId never collapses to event type alone", () => {
  assert.equal(
    resolveRazorpayWebhookEventId({
      envelopeId: "evt_1",
      eventType: "payment.captured",
      rawBodyHash: "abc",
    }),
    "evt_1",
  );
  assert.equal(
    resolveRazorpayWebhookEventId({
      envelopeId: "  ",
      eventType: "payment.captured",
      rawBodyHash: "deadbeef",
    }),
    "payment.captured:deadbeef",
  );
  assert.notEqual(
    resolveRazorpayWebhookEventId({
      eventType: "payment.captured",
      rawBodyHash: "hash-one",
    }),
    resolveRazorpayWebhookEventId({
      eventType: "payment.captured",
      rawBodyHash: "hash-two",
    }),
  );
  assert.throws(() =>
    resolveRazorpayWebhookEventId({
      eventType: "payment.captured",
      rawBodyHash: "",
    }),
  );
});

test("extractSubscriptionWebhookRefs reads internal_subscription_id notes", () => {
  const refs = extractSubscriptionWebhookRefs({
    event: "subscription.activated",
    payload: {
      subscription: {
        entity: {
          id: "sub_1",
          plan_id: "plan_1",
          status: "active",
          notes: { internal_subscription_id: "uuid-sub" },
        },
      },
      payment: { entity: { id: "pay_sub" } },
    },
  });
  assert.equal(refs.rzpSubscriptionId, "sub_1");
  assert.equal(refs.internalSubscriptionId, "uuid-sub");
  assert.equal(refs.rzpPaymentId, "pay_sub");
});

test("extractSubscriptionWebhookRefs maps membership order.paid to the order id", () => {
  const refs = extractSubscriptionWebhookRefs({
    event: "order.paid",
    payload: {
      payment: {
        entity: {
          id: "pay_mem",
          order_id: "order_mem",
          notes: {
            checkout: "membership",
            internal_subscription_id: "uuid-mem",
          },
        },
      },
    },
  });
  assert.equal(refs.rzpSubscriptionId, "order_mem");
  assert.equal(refs.internalSubscriptionId, "uuid-mem");
});

test("extractSubscriptionWebhookRefs does not treat Gstore orders as membership", () => {
  const refs = extractSubscriptionWebhookRefs({
    event: "order.paid",
    payload: {
      payment: {
        entity: {
          id: "pay_gs",
          order_id: "order_gs",
          notes: { order_type: "gstore_one_time" },
        },
      },
    },
  });
  assert.equal(refs.rzpSubscriptionId, null);
});

test("extractSubscriptionWebhookRefs reads membership notes from the order entity", () => {
  const refs = extractSubscriptionWebhookRefs({
    event: "order.paid",
    payload: {
      order: {
        entity: {
          id: "order_from_entity",
          notes: {
            checkout: "membership",
            internal_subscription_id: "uuid-order-notes",
          },
        },
      },
      payment: { entity: { id: "pay_entity" } },
    },
  });
  assert.equal(refs.rzpSubscriptionId, "order_from_entity");
  assert.equal(refs.internalSubscriptionId, "uuid-order-notes");
});
