/**
 * Supabase browser client for the Admin Dashboard.
 *
 * Connects to the SAME Supabase project as geoverze-main (same URL/anon key
 * pair, configured separately per app via this app's own .env.local). Session
 * persistence, refresh and cross-tab sync are handled by supabase-js itself.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import {
  SupabaseConfigError,
  formatSupabaseEnvDiagnosticsForLog,
  getSupabaseEnvDiagnostics,
  getSupabasePublicConfig,
} from "./env";

export type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_RANK: Record<AppRole, number> = {
  user: 0,
  creator: 1,
  admin: 2,
  super_admin: 3,
};

export function highestRole(roles: AppRole[]): AppRole | null {
  if (roles.length === 0) return null;
  return roles.reduce((top, role) => (ROLE_RANK[role] > ROLE_RANK[top] ? role : top));
}

/** Admin Dashboard access requires admin or super_admin — never just "user"/"creator". */
export function isPrivilegedRole(role: AppRole | null): boolean {
  return role === "admin" || role === "super_admin";
}

let supabaseClient: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) return supabaseClient;

  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabasePublicConfig());
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      console.error(
        "[admin:supabase] client initialization failed",
        formatSupabaseEnvDiagnosticsForLog(error.diagnostics ?? getSupabaseEnvDiagnostics()),
      );
    }
    throw error;
  }

  supabaseClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}

/**
 * Shared Supabase client. Initialized lazily so importing role helpers from this
 * module does not call `createClient` during SSR module evaluation.
 */
export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, _receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
