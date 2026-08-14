/**
 * Progression snapshot store.
 *
 * Single in-memory source for the placeholder player state so every
 * progression screen reads the same numbers. Not persisted — a future backend
 * will hydrate this store instead.
 */
import { create } from "zustand";

import { PLAYER, type PlayerSnapshot } from "@/features/progression/data/player";

type ProgressionState = {
  player: PlayerSnapshot;
  /** Replace the snapshot (future: from an API response). */
  setPlayer: (player: PlayerSnapshot) => void;
  reset: () => void;
};

export const useProgressionStore = create<ProgressionState>((set) => ({
  player: PLAYER,
  setPlayer: (player) => set({ player }),
  reset: () => set({ player: PLAYER }),
}));

export const selectPlayer = (s: ProgressionState) => s.player;
