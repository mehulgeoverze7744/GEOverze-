import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchMultiplayerRoomState,
  setMultiplayerReady,
  startMultiplayerMatch,
} from "../data/multiplayerRoomApi";
import type { MultiplayerRoomState } from "../types";
import { useMultiplayerRoomRealtime } from "./useMultiplayerRoomRealtime";

export function useMultiplayerRoom(roomId: string | undefined) {
  const [state, setState] = useState<MultiplayerRoomState | null>(null);
  const [loading, setLoading] = useState(Boolean(roomId));
  const [error, setError] = useState<string | null>(null);
  const [readyPending, setReadyPending] = useState(false);
  const [startPending, setStartPending] = useState(false);
  const refreshSeqRef = useRef(0);
  const hasLoadedStateRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!roomId) return;

    const seq = ++refreshSeqRef.current;
    const isInitialLoad = !hasLoadedStateRef.current;

    try {
      const next = await fetchMultiplayerRoomState(roomId);
      if (refreshSeqRef.current !== seq) return;

      setState(next);
      setError(null);
      hasLoadedStateRef.current = true;
    } catch (err) {
      if (refreshSeqRef.current !== seq) return;

      if (!hasLoadedStateRef.current) {
        setError(err instanceof Error ? err.message : "Could not load room");
      }
    } finally {
      if (refreshSeqRef.current === seq && isInitialLoad) {
        setLoading(false);
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      refreshSeqRef.current += 1;
      hasLoadedStateRef.current = false;
      setState(null);
      setLoading(false);
      setError(null);
      return;
    }

    refreshSeqRef.current += 1;
    hasLoadedStateRef.current = false;
    setState(null);
    setError(null);
    setLoading(true);
    void refresh();
  }, [roomId, refresh]);

  useMultiplayerRoomRealtime(roomId, refresh);

  const toggleReady = useCallback(
    async (ready: boolean) => {
      if (!roomId) return;
      setReadyPending(true);
      setError(null);
      try {
        const next = await setMultiplayerReady(roomId, ready);
        setState(next);
        hasLoadedStateRef.current = true;
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
      const next = await startMultiplayerMatch(roomId);
      setState(next);
      hasLoadedStateRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start match");
    } finally {
      setStartPending(false);
    }
  }, [roomId]);

  return { state, loading, error, readyPending, startPending, refresh, toggleReady, startMatch };
}
