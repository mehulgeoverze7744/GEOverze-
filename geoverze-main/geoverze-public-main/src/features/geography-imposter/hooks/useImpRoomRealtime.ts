import { useEffect } from "react";

import { supabase } from "@/lib/supabase/client";

/**
 * Subscribe to imp_rooms + imp_participants + imp_clues postgres_changes
 * for live room state sync. Any change triggers a full-refetch via onChange().
 */
export function useImpRoomRealtime(roomId: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`imp-room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "imp_rooms", filter: `id=eq.${roomId}` },
        () => onChange(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "imp_participants",
          filter: `room_id=eq.${roomId}`,
        },
        () => onChange(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "imp_clues",
          filter: `room_id=eq.${roomId}`,
        },
        () => onChange(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId, onChange]);
}
