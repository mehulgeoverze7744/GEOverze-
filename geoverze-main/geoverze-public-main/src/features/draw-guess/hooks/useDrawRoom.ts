import { useCallback, useEffect, useRef, useState } from "react";

import { useRoomMembershipNotices } from "@/features/rooms/hooks/useRoomMembershipNotices";
import { selectUser, useAuthStore } from "@/stores/authStore";
import {
  advanceDrawTurn,
  fetchDrawRoomState,
  leaveDrawRoom,
  restartDrawGame,
  setDrawReady,
  startDrawGame,
  touchDrawPresence,
} from "../data/drawRoomApi";
import type { DrawRoomState } from "../types";
import { useDrawRoomRealtime } from "./useDrawRoomRealtime";

export function useDrawRoom(roomId: string | undefined) {
  const user = useAuthStore(selectUser);
  const [state, setState] = useState<DrawRoomState | null>(null);
  const [loading, setLoading] = useState(Boolean(roomId));
  const [error, setError] = useState<string | null>(null);
  const [readyPending, setReadyPending] = useState(false);
  const [startPending, setStartPending] = useState(false);
  const refreshSeqRef = useRef(0);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!roomId) return;

    const seq = ++refreshSeqRef.current;
    const isInitialLoad = !hasLoadedRef.current;

    try {
      const next = await fetchDrawRoomState(roomId);
      if (refreshSeqRef.current !== seq) return;

      setState(next);
      setError(null);
      hasLoadedRef.current = true;
    } catch (err) {
      if (refreshSeqRef.current !== seq) return;
      if (!hasLoadedRef.current) {
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
      hasLoadedRef.current = false;
      setState(null);
      setLoading(false);
      setError(null);
      return;
    }

    refreshSeqRef.current += 1;
    hasLoadedRef.current = false;
    setState(null);
    setError(null);
    setLoading(true);
    void refresh();
  }, [roomId, refresh]);

  const syncStatus = useDrawRoomRealtime(roomId, refresh);
  useRoomMembershipNotices(state?.participants, user?.id);

  // Lightweight presence heartbeat — lets the server-side grace-period /
  // disconnect logic in advance_draw_turn detect stale drawers/hosts.
  useEffect(() => {
    if (!roomId) return;
    void touchDrawPresence(roomId).catch(() => undefined);
    const id = window.setInterval(() => {
      void touchDrawPresence(roomId).catch(() => undefined);
    }, 10_000);
    return () => window.clearInterval(id);
  }, [roomId]);

  // Server-authoritative tick: any connected client may nudge the state
  // machine; the RPC re-checks real timestamps so concurrent/duplicate ticks
  // from multiple players are safe no-ops.
  useEffect(() => {
    if (!roomId || state?.room.status !== "playing") return;
    const id = window.setInterval(() => {
      void advanceDrawTurn(roomId)
        .then((next) => {
          hasLoadedRef.current = true;
          setState(next);
        })
        .catch(() => undefined);
    }, 1200);
    return () => window.clearInterval(id);
  }, [roomId, state?.room.status]);

  const toggleReady = useCallback(
    async (ready: boolean) => {
      if (!roomId) return;
      setReadyPending(true);
      setError(null);
      try {
        const next = await setDrawReady(roomId, ready);
        setState(next);
        hasLoadedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update ready state");
      } finally {
        setReadyPending(false);
      }
    },
    [roomId],
  );

  const startGame = useCallback(async () => {
    if (!roomId) return;
    setStartPending(true);
    setError(null);
    try {
      const next = await startDrawGame(roomId);
      setState(next);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the game");
    } finally {
      setStartPending(false);
    }
  }, [roomId]);

  const restartGame = useCallback(async () => {
    if (!roomId) return;
    setStartPending(true);
    setError(null);
    try {
      const next = await restartDrawGame(roomId);
      setState(next);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restart the game");
    } finally {
      setStartPending(false);
    }
  }, [roomId]);

  const leave = useCallback(async () => {
    if (!roomId) return;
    try {
      await leaveDrawRoom(roomId);
    } catch {
      // best-effort — the heartbeat timing out will eventually mark us gone.
    }
  }, [roomId]);

  return {
    state,
    loading,
    error,
    readyPending,
    startPending,
    refresh,
    toggleReady,
    startGame,
    restartGame,
    leave,
    setState,
    syncStatus,
  };
}
