import { useEffect } from "react";

import { supabase } from "@/lib/supabase/client";

/** Subscribe to room + participant changes for live lobby sync. */
export function usePvpRoomRealtime(roomId: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`pvp-room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pvp_participants",
          filter: `room_id=eq.${roomId}`,
        },
        () => onChange(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pvp_rooms",
          filter: `id=eq.${roomId}`,
        },
        () => onChange(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId, onChange]);
}
