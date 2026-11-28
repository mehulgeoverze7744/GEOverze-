import assert from "node:assert/strict";
import test from "node:test";

import { describeShiprocketServiceClientAvailability } from "./shiprocketWebhookServiceClient.server.ts";

test("service client availability reports missing url and key separately", () => {
  const prevUrl = process.env["SUPABASE_URL"];
  const prevVite = process.env["VITE_SUPABASE_URL"];
  const prevKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  delete process.env["SUPABASE_URL"];
  delete process.env["VITE_SUPABASE_URL"];
  delete process.env["SUPABASE_SERVICE_ROLE_KEY"];

  const missing = describeShiprocketServiceClientAvailability();
  assert.equal(missing.available, false);
  assert.equal(missing.unavailableReason, "missing_url");

  process.env["SUPABASE_URL"] = "https://example.supabase.co";
  const missingKey = describeShiprocketServiceClientAvailability();
  assert.equal(missingKey.available, false);
  assert.equal(missingKey.hasSupabaseUrl, true);
  assert.equal(missingKey.unavailableReason, "missing_service_role_key");

  process.env["SUPABASE_SERVICE_ROLE_KEY"] = "service-role-key";
  const ok = describeShiprocketServiceClientAvailability();
  assert.equal(ok.available, true);
  assert.equal(ok.urlSource, "supabase_url");

  if (prevUrl) process.env["SUPABASE_URL"] = prevUrl;
  else delete process.env["SUPABASE_URL"];
  if (prevVite) process.env["VITE_SUPABASE_URL"] = prevVite;
  else delete process.env["VITE_SUPABASE_URL"];
  if (prevKey) process.env["SUPABASE_SERVICE_ROLE_KEY"] = prevKey;
  else delete process.env["SUPABASE_SERVICE_ROLE_KEY"];
});