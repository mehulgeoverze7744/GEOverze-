/**
 * CORS headers for Supabase Edge Functions.
 * Only allow requests from the GVRZE frontend origin.
 */

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin":
    Deno.env.get("SITE_URL") ?? "https://geoverze.com",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, X-Client-Info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
