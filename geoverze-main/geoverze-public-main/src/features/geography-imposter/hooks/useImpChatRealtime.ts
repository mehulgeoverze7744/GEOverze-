import { useEffect, useRef } from "react";

import { supabase } from "@/lib/supabase/client";
import type { ImpChatMessage } from "../types";

/**
 * Subscribe to new imp_chat messages with incremental append.
 * Replays missed messages on mount (since `afterId`).
 */
export function useImpChatRealtime(
  roomId: string | undefined,
  afterId: string | undefined,
  onMessages: (msgs: ImpChatMessage[]) => void,
) {
  const onMessagesRef = useRef(onMessages);
  onMessagesRef.current = onMessages;

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`imp-chat:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "imp_chat",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            body: string;
            created_at: string;
          };
          onMessagesRef.current([
            { id: row.id, user_id: row.user_id, body: row.body, created_at: row.created_at },
          ]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId]);
}
