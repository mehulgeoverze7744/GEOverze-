/**
 * Supabase browser client — the one place the URL/anon key are read and the
 * one client instance every feature shares.
 *
 * Auth session persistence, refresh and cross-tab sync are handled entirely
 * by supabase-js itself (localStorage under its own key), which is why
 * `authStore` no longer persists anything by hand — see stores/index.ts.
 */
import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev instead of silently rendering a broken auth flow.
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
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/** Highest-privilege role wins when a user holds more than one. */
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
