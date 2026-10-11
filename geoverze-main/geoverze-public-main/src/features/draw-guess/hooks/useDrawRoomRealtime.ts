import { useEffect } from "react";

import { supabase } from "@/lib/supabase/client";

/** Full-refetch-on-change: nudges `onChange` whenever room/participant/event rows change. */
export function useDrawRoomRealtime(roomId: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`draw-room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draw_participants", filter: `room_id=eq.${roomId}` },
        () => onChange(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "draw_rooms", filter: `id=eq.${roomId}` },
        () => onChange(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "draw_events", filter: `room_id=eq.${roomId}` },
        () => onChange(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId, onChange]);
}
