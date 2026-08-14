/**
 * Transient matchmaking + lobby UI state.
 *
 * Purely presentational: which mode and quiz the player is queueing for, the
 * opponent the placeholder search "found", and per-player ready flags. Nothing
 * is persisted and no matching logic lives here.
 */
import { create } from "zustand";

import { MATCH_POOL, type MatchPlayer } from "@/features/matchmaking/data/players";

export type MatchPhase = "idle" | "searching" | "found";

type MatchState = {
  phase: MatchPhase;
  mode: string;
  quizId: string | null;
  roster: MatchPlayer[];
  ready: Record<string, boolean>;
  beginSearch: (mode: string, quizId: string | null) => void;
  resolveMatch: (size: number) => void;
  toggleReady: (id: string) => void;
  reset: () => void;
};

const pick = (size: number): MatchPlayer[] => {
  const shuffled = [...MATCH_POOL];
  return shuffled.slice(0, Math.max(1, Math.min(size, shuffled.length)));
};

export const useMatchStore = create<MatchState>((set) => ({
  phase: "idle",
  mode: "pvp",
  quizId: null,
  roster: [],
  ready: {},
  beginSearch: (mode, quizId) => set({ phase: "searching", mode, quizId, roster: [], ready: {} }),
  resolveMatch: (size) => {
    const roster = pick(size);
    set({
      phase: "found",
      roster,
      ready: Object.fromEntries(roster.map((p) => [p.id, true])),
    });
  },
  toggleReady: (id) => set((s) => ({ ready: { ...s.ready, [id]: !s.ready[id] } })),
  reset: () => set({ phase: "idle", roster: [], ready: {}, quizId: null }),
}));
