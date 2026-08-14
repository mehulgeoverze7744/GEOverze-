/**
 * Supabase browser client for the Admin Dashboard.
 *
 * Connects to the SAME Supabase project as geoverze-main (same URL/anon key
 * pair, configured separately per app via this app's own .env.local). Session
 * persistence, refresh and cross-tab sync are handled by supabase-js itself.
 */
import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in the project values.",
  );
}

export const supabase = createClient<Database>(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

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
