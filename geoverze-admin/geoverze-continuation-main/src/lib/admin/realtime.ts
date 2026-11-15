import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

/** Subscribe to a single table and invalidate the given query keys on change. */
export function useAdminRealtime(table: string, queryKeys: QueryKey[], enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`admin:${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        for (const queryKey of queryKeys) {
          void queryClient.invalidateQueries({ queryKey });
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, table, queryKeys]);
}
