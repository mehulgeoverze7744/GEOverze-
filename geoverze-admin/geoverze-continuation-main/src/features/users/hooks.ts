import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AppRole } from "@/lib/supabase/client";
import { adminKeys } from "@/lib/admin/keys";
import { formatAdminError } from "@/lib/supabase/query";

import {
  adjustCredits,
  fetchUserDetail,
  fetchUsers,
  requestPasswordReset,
  setProfileStatus,
  setUserRole,
  updateProfileFields,
} from "./api";

export function useUsers() {
  const query = useQuery({
    queryKey: adminKeys.users,
    queryFn: fetchUsers,
  });

  return {
    users: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useUserDetail(userId: string | null) {
  return useQuery({
    queryKey: userId ? adminKeys.userDetail(userId) : ["admin", "users", "none"],
    queryFn: () => fetchUserDetail(userId!),
    enabled: Boolean(userId),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  const invalidate = async (userId?: string) => {
    await queryClient.invalidateQueries({ queryKey: adminKeys.users });
    await queryClient.invalidateQueries({ queryKey: adminKeys.dashboard });
    if (userId) await queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(userId) });
  };

  const status = useMutation({
    mutationFn: ({ userId, next }: { userId: string; next: "active" | "suspended" }) =>
      setProfileStatus(userId, next),
    onSuccess: async (_data, vars) => {
      await invalidate(vars.userId);
      toast.success(vars.next === "suspended" ? "Account suspended." : "Account reactivated.");
    },
    onError: (error) => toast.error(formatAdminError(error)),
  });

  const profile = useMutation({
    mutationFn: ({
      userId,
      fields,
    }: {
      userId: string;
      fields: { displayName?: string; bio?: string; countryCode?: string };
    }) => updateProfileFields(userId, fields),
    onSuccess: async (_data, vars) => {
      await invalidate(vars.userId);
      toast.success("Profile updated.");
    },
    onError: (error) => toast.error(formatAdminError(error)),
  });

  const role = useMutation({
    mutationFn: ({ userId, nextRole, grant }: { userId: string; nextRole: AppRole; grant: boolean }) =>
      setUserRole(userId, nextRole, grant),
    onSuccess: async (_data, vars) => {
      await invalidate(vars.userId);
      toast.success(vars.grant ? "Role granted." : "Role revoked.");
    },
    onError: (error) => toast.error(formatAdminError(error)),
  });

  const credits = useMutation({
    mutationFn: ({
      userId,
      amount,
      reason,
      note,
    }: {
      userId: string;
      amount: number;
      reason: string;
      note?: string;
    }) => adjustCredits(userId, amount, reason, note),
    onSuccess: async (_data, vars) => {
      await invalidate(vars.userId);
      await queryClient.invalidateQueries({ queryKey: adminKeys.credits });
      toast.success("Credits adjusted.");
    },
    onError: (error) => toast.error(formatAdminError(error)),
  });

  const resetPassword = useMutation({
    mutationFn: ({ email, redirectTo }: { email: string; redirectTo: string }) =>
      requestPasswordReset(email, redirectTo),
    onSuccess: () => toast.success("Password reset email sent."),
    onError: (error) => toast.error(formatAdminError(error)),
  });

  return { status, profile, role, credits, resetPassword };
}
