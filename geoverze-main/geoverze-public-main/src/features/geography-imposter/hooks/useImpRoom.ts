import { useCallback, useEffect, useRef, useState } from "react";

import { selectUser, useAuthStore } from "@/stores/authStore";
import {
  advanceImpPhase,
  fetchImpRoomState,
  leaveImpRoom,
  restartImpGame,
  setImpReady,
  startImpGame,
  touchImpPresence,
} from "../data/impRoomApi";
import type { ImpRoomState } from "../types";
import { useImpRoomRealtime } from "./useImpRoomRealtime";
import { useImpChatRealtime } from "./useImpChatRealtime";

const PRESENCE_INTERVAL_MS = 8_000;
const TICK_INTERVAL_MS = 1_500;

export interface UseImpRoomReturn {
  state: ImpRoomState | null;
  loading: boolean;
  error: string | null;
  setState: React.Dispatch<React.SetStateAction<ImpRoomState | null>>;
  // Actions
  toggleReady: (ready: boolean) => Promise<void>;
  startGame: () => Promise<void>;
  restartGame: () => Promise<void>;
  leave: () => Promise<void>;
}

export function useImpRoom(roomId: string | undefined, code: string | undefined): UseImpRoomReturn {
  const user = useAuthStore(selectUser);
  const [state, setState] = useState<ImpRoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadGen = useRef(0);

  // ── Initial load ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!roomId) return;
    const gen = ++loadGen.current;
    try {
      const s = await fetchImpRoomState(roomId);
      if (gen !== loadGen.current) return;
      setState(s);
      setError(null);
    } catch (err) {
      if (gen !== loadGen.current) return;
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      if (gen === loadGen.current) setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Full-refetch on any realtime change ─────────────────────────────────────
  const refresh = useCallback(() => {
    void load();
  }, [load]);

  useImpRoomRealtime(roomId, refresh);

  // ── Incremental chat messages ────────────────────────────────────────────────
  const lastChatIdRef = useRef<string | undefined>(undefined);

  useImpChatRealtime(roomId, lastChatIdRef.current, (newMsgs) => {
    if (newMsgs.length === 0) return;
    lastChatIdRef.current = newMsgs[newMsgs.length - 1]?.id;
    setState((prev) => {
      if (!prev) return prev;
      const existingIds = new Set(prev.chat.map((m) => m.id));
      const toAdd = newMsgs.filter((m) => !existingIds.has(m.id));
      if (toAdd.length === 0) return prev;
      return { ...prev, chat: [...prev.chat, ...toAdd] };
    });
  });

  // ── Presence heartbeat ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    void touchImpPresence(roomId);
    const id = setInterval(() => void touchImpPresence(roomId), PRESENCE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [roomId]);

  // ── Server tick (advance_imp_phase) ─────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const id = setInterval(async () => {
      const s = state;
      if (!s || s.room.status !== "playing") return;
      // Only tick during live phases (not finalizing/reveal which are server-driven)
      if (s.room.phase === "finalizing" || s.room.phase === "reveal") return;
      try {
        const next = await advanceImpPhase(roomId);
        setState(next);
      } catch {
        // swallow — next tick will retry
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [roomId, state]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const toggleReady = useCallback(
    async (ready: boolean) => {
      if (!roomId) return;
      const next = await setImpReady(roomId, ready);
      loadGen.current += 1;
      setState(next);
    },
    [roomId],
  );

  const startGame = useCallback(async () => {
    if (!roomId) return;
    const next = await startImpGame(roomId);
    loadGen.current += 1;
    setState(next);
  }, [roomId]);

  const restartGame = useCallback(async () => {
    if (!roomId) return;
    const next = await restartImpGame(roomId);
    loadGen.current += 1;
    setState(next);
  }, [roomId]);

  const leave = useCallback(async () => {
    if (!roomId) return;
    await leaveImpRoom(roomId);
  }, [roomId]);

  return { state, loading, error, setState, toggleReady, startGame, restartGame, leave };
}
