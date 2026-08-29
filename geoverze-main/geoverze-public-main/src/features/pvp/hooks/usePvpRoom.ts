import { useCallback, useEffect, useState } from "react";

import { fetchPvpRoomState, setPvpReady, startPvpMatch } from "../data/pvpRoomApi";
import type { PvpRoomState } from "../types";
import { usePvpRoomRealtime } from "./usePvpRoomRealtime";

export function usePvpRoom(roomId: string | undefined) {
  const [state, setState] = useState<PvpRoomState | null>(null);
  const [loading, setLoading] = useState(Boolean(roomId));
  const [error, setError] = useState<string | null>(null);
  const [readyPending, setReadyPending] = useState(false);
  const [startPending, setStartPending] = useState(false);

  const refresh = useCallback(async () => {
    if (!roomId) return;
    setError(null);
    try {
      const next = await fetchPvpRoomState(roomId);
      setState(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load room");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      setState(null);
      setLoading(false);
      setError(null);
      return;
    }
    setState(null);
    setError(null);
    setLoading(true);
    void refresh();
  }, [roomId, refresh]);

  usePvpRoomRealtime(roomId, refresh);

  const toggleReady = useCallback(
    async (ready: boolean) => {
      if (!roomId) return;
      setReadyPending(true);
      setError(null);
      try {
        const next = await setPvpReady(roomId, ready);
        setState(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update ready state");
      } finally {
        setReadyPending(false);
      }
    },
    [roomId],
  );

  const startMatch = useCallback(async () => {
    if (!roomId) return;
    setStartPending(true);
    setError(null);
    try {
      const next = await startPvpMatch(roomId);
      setState(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start match");
    } finally {
      setStartPending(false);
    }
  }, [roomId]);

  return { state, loading, error, readyPending, startPending, refresh, toggleReady, startMatch };
}
