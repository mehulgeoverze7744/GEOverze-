import assert from "node:assert/strict";
import test from "node:test";

import { shiprocketLiveEnabled } from "./shiprocketClient.server.ts";

test("operations stay in pending-only mode when live flag is off", () => {
  const prev = process.env["SHIPROCKET_LIVE_ENABLED"];
  delete process.env["SHIPROCKET_LIVE_ENABLED"];
  assert.equal(shiprocketLiveEnabled(), false);
  if (prev) process.env["SHIPROCKET_LIVE_ENABLED"] = prev;
});