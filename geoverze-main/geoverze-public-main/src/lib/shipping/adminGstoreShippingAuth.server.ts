/**
 * Validates admin Bearer tokens for storefront shipment API routes.
 */

import { createClient } from "@supabase/supabase-js";

export type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; message: string };

export function extractBearerToken(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const match = /^Bearer\s+(.+)$/i.exec(headerValue.trim());
  return match?.[1]?.trim() ?? null;
}

export async function verifyAdminBearerToken(token: string | null): Promise<AdminAuthResult> {
  if (!token) {
    return { ok: false, status: 401, message: "Missing Authorization bearer token" };
  }

  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
  const anon = process.env["SUPABASE_ANON_KEY"] ?? process.env["VITE_SUPABASE_ANON_KEY"] ?? "";
  if (!url || !anon) {
    return { ok: false, status: 403, message: "Server Supabase configuration unavailable" };
  }

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) {
    return { ok: false, status: 401, message: "Invalid or expired session" };
  }

  const { data: isAdmin, error: adminError } = await client.rpc("is_admin");
  if (adminError || !isAdmin) {
    return { ok: false, status: 403, message: "Admin privileges required" };
  }

  return { ok: true, userId: userData.user.id };
}