import { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase/client";

export type RoomSyncStatus = "idle" | "connecting" | "live" | "reconnecting";

export type RoomRealtimeTable = {
  table: string;
  filter: string;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
};

/**
 * One Realtime channel for a room: postgres_changes → callback, snapshot after
 * SUBSCRIBED, automatic resubscribe after drop. Callers must fetch authoritative
 * state in onReady / onEvent — this hook never polls on an interval.
 */
export function useRoomRealtime({
  channelName,
  tables,
  onEvent,
  onReady,
}: {
  channelName: string | undefined;
  tables: readonly RoomRealtimeTable[];
  onEvent: () => void;
  onReady: () => void;
}): RoomSyncStatus {
  const [status, setStatus] = useState<RoomSyncStatus>("idle");
  const onEventRef = useRef(onEvent);
  const onReadyRef = useRef(onReady);
  onEventRef.current = onEvent;
  onReadyRef.current = onReady;

  const tablesKey = tables
    .map((table) => `${table.event ?? "*"}:${table.table}:${table.filter}`)
    .join("|");

  useEffect(() => {
    if (!channelName) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    let retryTimer: number | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const subscribe = () => {
      if (cancelled) return;
      setStatus((current) => (current === "live" ? "live" : "connecting"));

      const next = supabase.channel(channelName);
      for (const table of tables) {
        next.on(
          "postgres_changes",
          {
            event: table.event ?? "*",
            schema: "public",
            table: table.table,
            filter: table.filter,
          },
          () => {
            if (!cancelled) onEventRef.current();
          },
        );
      }

      channel = next.subscribe((liveStatus, err) => {
        if (cancelled) return;
        if (liveStatus === "SUBSCRIBED") {
          setStatus("live");
          onReadyRef.current();
          return;
        }
        if (liveStatus === "CHANNEL_ERROR" || liveStatus === "TIMED_OUT") {
          setStatus("reconnecting");
          void err;
          void supabase.removeChannel(next);
          if (retryTimer) window.clearTimeout(retryTimer);
          retryTimer = window.setTimeout(subscribe, 1200);
        }
      });
    };

    subscribe();

    const onOnline = () => {
      if (cancelled) return;
      setStatus("reconnecting");
      if (channel) void supabase.removeChannel(channel);
      subscribe();
    };
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      if (retryTimer) window.clearTimeout(retryTimer);
      if (channel) void supabase.removeChannel(channel);
    };
    // tables is identified by tablesKey so callers can pass inline arrays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, tablesKey]);

  return status;
}
