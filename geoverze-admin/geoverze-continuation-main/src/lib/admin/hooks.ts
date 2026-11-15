import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { formatAdminError } from "@/lib/supabase/query";

export function useAdminQuery<T>(queryKey: QueryKey, queryFn: () => Promise<T>) {
  const query = useQuery({ queryKey, queryFn });
  return {
    data: query.data,
    rows: (query.data as T) ?? ([] as T),
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useAdminMutation<TVariables, TData>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  invalidate: QueryKey[],
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      toast.success(successMessage);
    },
    onError: (error) => toast.error(formatAdminError(error)),
  });
}
