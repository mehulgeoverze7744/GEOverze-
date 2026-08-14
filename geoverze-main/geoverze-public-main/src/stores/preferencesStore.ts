/**
 * User preferences. Persisted locally so a returning visitor keeps their
 * choices; nothing here is account-bound yet.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MotionPreference = "system" | "reduced" | "full";
export type UnitSystem = "metric" | "imperial";

/** Toggles that will move to the account record once the backend exists. */
export type ToggleKey =
  | "starfield"
  | "soundEffects"
  | "notifySeasons"
  | "notifyQuizzes"
  | "notifyStore"
  | "notifyProduct"
  | "notifyEmailDigest"
  | "publicProfile"
  | "showOnLeaderboards"
  | "analytics";

type PreferencesState = {
  motion: MotionPreference;
  units: UnitSystem;
  locale: string;
  toggles: Record<ToggleKey, boolean>;
  setMotion: (motion: MotionPreference) => void;
  setUnits: (units: UnitSystem) => void;
  setLocale: (locale: string) => void;
  setToggle: (key: ToggleKey, value: boolean) => void;
};

const defaultToggles: Record<ToggleKey, boolean> = {
  starfield: true,
  soundEffects: true,
  notifySeasons: true,
  notifyQuizzes: true,
  notifyStore: false,
  notifyProduct: false,
  notifyEmailDigest: true,
  publicProfile: true,
  showOnLeaderboards: true,
  analytics: false,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      motion: "system",
      units: "metric",
      locale: "en",
      toggles: defaultToggles,
      setMotion: (motion) => set({ motion }),
      setUnits: (units) => set({ units }),
      setLocale: (locale) => set({ locale }),
      setToggle: (key, value) => set((state) => ({ toggles: { ...state.toggles, [key]: value } })),
    }),
    {
      name: "geoverze.preferences",
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<PreferencesState>;
        return {
          ...state,
          toggles: { ...defaultToggles, ...(state.toggles ?? {}) },
        } as PreferencesState;
      },
    },
  ),
);

export const selectUnits = (s: PreferencesState) => s.units;
export const selectMotion = (s: PreferencesState) => s.motion;
