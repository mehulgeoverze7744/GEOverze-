import assert from "node:assert/strict";
import test from "node:test";

import { extractBearerToken } from "./adminGstoreShippingAuth.server.ts";

test("extractBearerToken parses Authorization header", () => {
  assert.equal(extractBearerToken("Bearer abc.def"), "abc.def");
  assert.equal(extractBearerToken(null), null);
  assert.equal(extractBearerToken("Basic x"), null);
});