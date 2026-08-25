import { useEffect } from "react";

import { supabase } from "@/lib/supabase/client";

/** Subscribe to room + participant changes for live multiplayer lobby sync. */
export function useMultiplayerRoomRealtime(roomId: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`multiplayer-room:${roomId}`)
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
