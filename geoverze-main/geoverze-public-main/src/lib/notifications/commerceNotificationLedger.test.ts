import assert from "node:assert/strict";
import test from "node:test";

import { COMMERCE_NOTICE_MAX_ATTEMPTS } from "./commerceNotificationLedger.server.ts";

test("commerce notification retry budget is bounded", () => {
  assert.equal(COMMERCE_NOTICE_MAX_ATTEMPTS, 5);
});