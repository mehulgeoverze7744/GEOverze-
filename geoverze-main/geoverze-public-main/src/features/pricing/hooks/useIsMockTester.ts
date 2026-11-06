/**
 * useIsMockTester — checks whether the current user is on the mock_testers
 * allowlist.
 *
 * Uses the get_my_tester_status() Supabase RPC (SECURITY DEFINER, reads
 * mock_testers table). RLS ensures each user can only read their own row.
 *
 * Returns:
 *   isTester     — true when the user is on the allowlist
 *   testerLoading — true while the initial check is in-flight
 *
 * Used in CheckoutScreen to gate the mock checkout button — only authorized
 * testers see the mock payment path, even when mock mode is enabled globally.
 */

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export function useIsMockTester() {
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: ["isMockTester", userId] as const,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc("get_my_tester_status" as never);
      if (error) return false;
      return Boolean(data);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes — tester status rarely changes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    /** True when the signed-in user is on the mock_testers allowlist. */
    isTester: query.data ?? false,
    /** True while the initial tester status check is in-flight. */
    testerLoading: query.isPending && Boolean(userId),
  };
}
