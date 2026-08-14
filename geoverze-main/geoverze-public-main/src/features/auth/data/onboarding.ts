/** Onboarding content model: interests, skill levels, avatar identities. */
import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Flag,
  Landmark,
  Leaf,
  Map,
  Mountain,
  ScrollText,
  Sparkles,
  Theater,
} from "lucide-react";

export type Interest = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const INTERESTS: readonly Interest[] = [
  {
    id: "countries",
    label: "Countries",
    description: "Borders, regions and territories",
    icon: Compass,
  },
  { id: "flags", label: "Flags", description: "Every banner on Earth", icon: Flag },
  { id: "capitals", label: "Capitals", description: "Seats of power worldwide", icon: Landmark },
  { id: "maps", label: "Maps", description: "Read the world at a glance", icon: Map },
  { id: "history", label: "History", description: "How the map was drawn", icon: ScrollText },
  {
    id: "landmarks",
    label: "Landmarks",
    description: "Wonders, ancient and modern",
    icon: Mountain,
  },
  { id: "nature", label: "Nature", description: "Biomes, rivers and climate", icon: Leaf },
  { id: "culture", label: "Culture", description: "Languages, food and tradition", icon: Theater },
  { id: "mixed", label: "Mixed Geography", description: "A little of everything", icon: Sparkles },
] as const;

export type SkillLevelId = "beginner" | "intermediate" | "advanced" | "explorer";

export type SkillLevel = {
  id: SkillLevelId;
  label: string;
  description: string;
};

export const SKILL_LEVELS: readonly SkillLevel[] = [
  {
    id: "beginner",
    label: "Beginner",
    description: "New to geography — start with the essentials.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Comfortable with continents, capitals and major flags.",
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "You know the obscure ones and want a real challenge.",
  },
  {
    id: "explorer",
    label: "Explorer",
    description: "Adaptive difficulty — GEOverze tunes itself to you.",
  },
] as const;

export type AvatarOption = {
  id: string;
  label: string;
  /** Bronze-family hue pair used by the generated avatar mark. */
  hue: [number, number];
  glyph: string;
};

/** Deterministic, generated avatars — no external image requests. */
export const AVATARS: readonly AvatarOption[] = [
  { id: "meridian", label: "Meridian", hue: [62, 78], glyph: "◉" },
  { id: "atlas", label: "Atlas", hue: [48, 66], glyph: "▲" },
  { id: "compass", label: "Compass", hue: [74, 92], glyph: "✦" },
  { id: "equator", label: "Equator", hue: [38, 58], glyph: "≡" },
  { id: "summit", label: "Summit", hue: [84, 60], glyph: "◆" },
  { id: "voyager", label: "Voyager", hue: [56, 84], glyph: "➤" },
  { id: "delta", label: "Delta", hue: [70, 44], glyph: "△" },
  { id: "orbit", label: "Orbit", hue: [66, 88], glyph: "◌" },
] as const;

export function findAvatar(id: string) {
  return AVATARS.find((avatar) => avatar.id === id);
}

export const ONBOARDING_STEPS = ["Welcome", "Interests", "Skill", "Avatar", "Finish"] as const;
export type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4;
