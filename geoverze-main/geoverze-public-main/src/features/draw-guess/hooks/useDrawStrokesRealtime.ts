import { useEffect, useRef } from "react";

import { supabase } from "@/lib/supabase/client";
import { fetchDrawStrokesSince } from "../data/drawRoomApi";
import type { DrawStroke } from "../types";

type ReplayHooks = {
  onReplayStart?: () => void;
  onReplayEnd?: () => void;
};

/**
 * Incremental stroke sync: replay missed rows on subscribe, then append INSERTs.
 */
export function useDrawStrokesRealtime(
  turnId: string | undefined,
  onStroke: (stroke: DrawStroke) => void,
  hooks: ReplayHooks = {},
) {
  const lastIdRef = useRef(0);
  const onStrokeRef = useRef(onStroke);
  const hooksRef = useRef(hooks);
  onStrokeRef.current = onStroke;
  hooksRef.current = hooks;

  useEffect(() => {
    lastIdRef.current = 0;
    if (!turnId) return;

    let cancelled = false;
    let retryTimer: number | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const replay = async () => {
      hooksRef.current.onReplayStart?.();
      try {
        const rows = await fetchDrawStrokesSince(turnId, lastIdRef.current);
        if (cancelled) return;
        for (const row of rows) {
          lastIdRef.current = Math.max(lastIdRef.current, row.id);
          onStrokeRef.current(row);
        }
      } finally {
        if (!cancelled) hooksRef.current.onReplayEnd?.();
      }
    };

    const subscribe = () => {
      if (cancelled) return;
      const next = supabase
        .channel(`draw-strokes:${turnId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "draw_strokes",
            filter: `turn_id=eq.${turnId}`,
          },
          (payload) => {
            const row = payload.new as DrawStroke;
            if (row.id <= lastIdRef.current) return;
            lastIdRef.current = row.id;
            onStrokeRef.current(row);
          },
        )
        .subscribe((status) => {
          if (cancelled) return;
          if (status === "SUBSCRIBED") {
            void replay();
            return;
          }
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            void supabase.removeChannel(next);
            if (retryTimer) window.clearTimeout(retryTimer);
            retryTimer = window.setTimeout(subscribe, 1200);
          }
        });
      channel = next;
    };

    subscribe();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [turnId]);
}
