import { supabase } from "@/lib/supabase/client";

import { parseUserMembership, type UserMembership } from "../lib/membership";

export const myMembershipQueryKey = (userId: string | undefined) =>
  ["membership", userId ?? "anon"] as const;

/** Live membership snapshot from get_my_membership (RLS / auth.uid). */
export async function fetchMyMembership(): Promise<UserMembership> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error("UNAUTHENTICATED:" + (sessionError.message ?? "Session error"));
  }
  const user = sessionData?.session?.user ?? null;
  if (!user) {
    throw new Error("UNAUTHENTICATED:No active session.");
  }

  const { data, error } = await supabase.rpc("get_my_membership");
  if (error) throw new Error(error.message);
  const parsed = parseUserMembership(data);
  if (!parsed) throw new Error("Could not read membership snapshot.");
  return parsed;
}
