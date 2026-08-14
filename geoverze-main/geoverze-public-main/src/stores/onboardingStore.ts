/**
 * Onboarding + age-gate state.
 *
 * Persisted locally so the chained signup journey survives a refresh. When a
 * real backend lands, these values are written to the user profile and this
 * store keeps only the in-flight step.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SkillLevelId } from "@/features/auth/data/onboarding";

export type AgeAnswer = "unanswered" | "adult" | "minor";

type OnboardingState = {
  step: number;
  ageAnswer: AgeAnswer;
  interests: string[];
  skillLevel: SkillLevelId | null;
  avatarId: string | null;
  completed: boolean;
  setStep: (step: number) => void;
  setAgeAnswer: (answer: AgeAnswer) => void;
  toggleInterest: (id: string) => void;
  setSkillLevel: (level: SkillLevelId) => void;
  setAvatarId: (id: string) => void;
  complete: () => void;
  reset: () => void;
};

const initial = {
  step: 0,
  ageAnswer: "unanswered" as AgeAnswer,
  interests: [] as string[],
  skillLevel: null,
  avatarId: null,
  completed: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      setStep: (step) => set({ step }),
      setAgeAnswer: (ageAnswer) => set({ ageAnswer }),
      toggleInterest: (id) =>
        set((state) => ({
          interests: state.interests.includes(id)
            ? state.interests.filter((item) => item !== id)
            : [...state.interests, id],
        })),
      setSkillLevel: (skillLevel) => set({ skillLevel }),
      setAvatarId: (avatarId) => set({ avatarId }),
      complete: () => set({ completed: true }),
      reset: () => set({ ...initial }),
    }),
    { name: "geoverze.onboarding" },
  ),
);

export const selectAgeAnswer = (s: OnboardingState) => s.ageAnswer;
export const selectInterests = (s: OnboardingState) => s.interests;
