import { useEffect } from "react";

import type { RoomSyncStatus } from "./useRoomRealtime";

/**
 * Lightweight fallback while Realtime is not live — reconciles room state
 * without replacing postgres_changes as the primary update path.
 */
export function useRoomReconcileWhenOffline(
  roomId: string | undefined,
  syncStatus: RoomSyncStatus,
  refresh: () => void | Promise<void>,
  intervalMs = 5000,
) {
  useEffect(() => {
    if (!roomId || syncStatus === "live") return;
    const id = window.setInterval(() => {
      void refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [roomId, syncStatus, refresh, intervalMs]);
}