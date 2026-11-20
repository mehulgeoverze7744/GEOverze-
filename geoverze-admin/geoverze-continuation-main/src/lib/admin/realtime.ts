import { useEffect, useId, useRef } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

import { createAdminRealtimeRegistry, type AdminRealtimeRegistry } from "./realtime-manager";

let registry: AdminRealtimeRegistry | null = null;

function getRegistry(): AdminRealtimeRegistry {
  if (!registry) registry = createAdminRealtimeRegistry(supabase);
  return registry;
}

/** Reset registry between tests — not used in production. */
export function __resetAdminRealtimeRegistryForTests(): void {
  registry = null;
}

/** Subscribe to a single table and invalidate the given query keys on change. */
export function useAdminRealtime(table: string, queryKeys: QueryKey[], enabled = true) {
  const queryClient = useQueryClient();
  const ownerId = useId();
  const queryKeysRef = useRef(queryKeys);
  queryKeysRef.current = queryKeys;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    return getRegistry().subscribe(table, ownerId, () => {
      for (const queryKey of queryKeysRef.current) {
        void queryClient.invalidateQueries({ queryKey });
      }
    });
  }, [enabled, queryClient, table, ownerId]);
}
