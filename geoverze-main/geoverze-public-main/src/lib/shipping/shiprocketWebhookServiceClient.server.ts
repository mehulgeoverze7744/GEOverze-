/**
 * Server-only Supabase availability for webhook processing (no secret values logged).
 */

export type ShiprocketServiceClientAvailability = {
  available: boolean;
  hasSupabaseUrl: boolean;
  hasServiceRoleKey: boolean;
  urlSource: "none" | "supabase_url" | "vite_supabase_url";
  unavailableReason: "missing_url" | "missing_service_role_key" | "ok";
};

/** Distinguish missing Hostinger/server env from runtime DB failures (client not created yet). */
export function describeShiprocketServiceClientAvailability(): ShiprocketServiceClientAvailability {
  const fromPrimary = process.env["SUPABASE_URL"]?.trim() ?? "";
  const fromVite = process.env["VITE_SUPABASE_URL"]?.trim() ?? "";
  const url = fromPrimary || fromVite;
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"]?.trim() ?? "";

  const hasSupabaseUrl = url.length > 0;
  const hasServiceRoleKey = key.length > 0;

  let urlSource: ShiprocketServiceClientAvailability["urlSource"] = "none";
  if (fromPrimary) urlSource = "supabase_url";
  else if (fromVite) urlSource = "vite_supabase_url";

  let unavailableReason: ShiprocketServiceClientAvailability["unavailableReason"] = "ok";
  if (!hasSupabaseUrl) unavailableReason = "missing_url";
  else if (!hasServiceRoleKey) unavailableReason = "missing_service_role_key";

  return {
    available: hasSupabaseUrl && hasServiceRoleKey,
    hasSupabaseUrl,
    hasServiceRoleKey,
    urlSource,
    unavailableReason,
  };
}