import { useEffect, useRef } from "react";

import { supabase } from "@/lib/supabase/client";
import { fetchDrawStrokesSince } from "../data/drawRoomApi";
import type { DrawStroke } from "../types";

/**
 * Incremental (not full-refetch) stroke sync for one turn: replays any
 * missed strokes on mount/reconnect, then appends new ones as they arrive.
 */
export function useDrawStrokesRealtime(
  turnId: string | undefined,
  onStroke: (stroke: DrawStroke) => void,
) {
  const lastIdRef = useRef(0);
  const onStrokeRef = useRef(onStroke);
  onStrokeRef.current = onStroke;

  useEffect(() => {
    lastIdRef.current = 0;
    if (!turnId) return;

    let cancelled = false;

    void fetchDrawStrokesSince(turnId, 0).then((rows) => {
      if (cancelled) return;
      for (const row of rows) {
        lastIdRef.current = Math.max(lastIdRef.current, row.id);
        onStrokeRef.current(row);
      }
    });

    const channel = supabase
      .channel(`draw-strokes:${turnId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "draw_strokes", filter: `turn_id=eq.${turnId}` },
        (payload) => {
          const row = payload.new as DrawStroke;
          if (row.id <= lastIdRef.current) return;
          lastIdRef.current = row.id;
          onStrokeRef.current(row);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [turnId]);
}
