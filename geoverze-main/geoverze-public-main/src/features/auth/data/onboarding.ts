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
    description: "Adaptive difficulty — GVRZE tunes itself to you.",
  },
] as const;

export const EXPLORER_AVATAR_IDS = [
  "meridian",
  "atlas",
  "compass",
  "equator",
  "summit",
  "voyager",
  "delta",
  "orbit",
] as const;

export type ExplorerAvatarId = (typeof EXPLORER_AVATAR_IDS)[number];

export type AvatarOption = {
  id: string;
  label: string;
  /** Bronze-family hue pair used by the generated avatar mark fallback. */
  hue: [number, number];
  glyph: string;
  /** Cropped character portrait for profile selection. */
  src?: string;
};

function explorerPortrait(id: ExplorerAvatarId) {
  return `/assets/avatars/${id}.webp`;
}

/** Eight explorer characters. Stable IDs persist on `profiles.avatar_id`. */
export const AVATARS: readonly (AvatarOption & { id: ExplorerAvatarId; src: string })[] = [
  { id: "meridian", label: "Meridian", hue: [62, 78], glyph: "◉", src: explorerPortrait("meridian") },
  { id: "atlas", label: "Atlas", hue: [48, 66], glyph: "▲", src: explorerPortrait("atlas") },
  { id: "compass", label: "Compass", hue: [74, 92], glyph: "✦", src: explorerPortrait("compass") },
  { id: "equator", label: "Equator", hue: [38, 58], glyph: "≡", src: explorerPortrait("equator") },
  { id: "summit", label: "Summit", hue: [84, 60], glyph: "◆", src: explorerPortrait("summit") },
  { id: "voyager", label: "Voyager", hue: [56, 84], glyph: "➤", src: explorerPortrait("voyager") },
  { id: "delta", label: "Delta", hue: [70, 44], glyph: "△", src: explorerPortrait("delta") },
  { id: "orbit", label: "Orbit", hue: [66, 88], glyph: "◌", src: explorerPortrait("orbit") },
] as const;

export type AvatarCategoryId = "explorer" | "superhero" | "alien" | "classic";

export type AvatarCategory = {
  id: AvatarCategoryId;
  label: string;
  /** Stable `profiles.avatar_id` values shown in this section. */
  avatarIds: readonly string[];
};

/**
 * Unified picker sections — every preset appears once; IDs match persisted profiles.
 * `galactic` / `earthbound` are the armored hero portraits (incl. the Iron Man-style armor).
 */
export const AVATAR_CATEGORIES: readonly AvatarCategory[] = [
  { id: "explorer", label: "Explorer Avatars", avatarIds: EXPLORER_AVATAR_IDS },
  { id: "superhero", label: "Superhero Avatars", avatarIds: ["galactic", "earthbound"] as const },
  { id: "alien", label: "Alien Avatars", avatarIds: ["alien", "cosmic"] as const },
  {
    id: "classic",
    label: "Previously Available Avatars",
    avatarIds: ["spy", "explorer"] as const,
  },
] as const;

/** GVRZE character portraits — stable IDs; do not remove or re-point assets. */
export const CHARACTER_AVATARS: readonly (AvatarOption & { src: string })[] = [
  {
    id: "spy",
    label: "Red-haired spy",
    hue: [38, 58],
    glyph: "◆",
    src: "/assets/avatars/spy.webp",
  },
  {
    id: "cosmic",
    label: "Cosmic explorer",
    hue: [48, 66],
    glyph: "✦",
    src: "/assets/avatars/cosmic.webp",
  },
  {
    id: "earthbound",
    label: "Earthbound Hero",
    hue: [56, 84],
    glyph: "▲",
    src: "/assets/avatars/earthbound.webp",
  },
  {
    id: "galactic",
    label: "Galactic Armor",
    hue: [62, 78],
    glyph: "◉",
    src: "/assets/avatars/galactic.webp",
  },
  {
    id: "alien",
    label: "Alien explorer",
    hue: [74, 92],
    glyph: "◌",
    src: "/assets/avatars/alien.png",
  },
  {
    id: "explorer",
    label: "Young explorer",
    hue: [66, 88],
    glyph: "➤",
    src: "/assets/avatars/explorer.webp",
  },
] as const;

export function findAvatar(id: string) {
  return (
    AVATARS.find((avatar) => avatar.id === id) ??
    CHARACTER_AVATARS.find((avatar) => avatar.id === id)
  );
}

/** Every built-in preset ID (explorer + legacy characters) — excludes custom uploads. */
export const PRESET_AVATAR_IDS: readonly string[] = [
  ...AVATARS.map((avatar) => avatar.id),
  ...CHARACTER_AVATARS.map((avatar) => avatar.id),
];

export function isPresetAvatarId(id: string | null | undefined) {
  const trimmed = id?.trim();
  return Boolean(trimmed && PRESET_AVATAR_IDS.includes(trimmed));
}

export function avatarsInCategory(categoryId: AvatarCategoryId) {
  const section = AVATAR_CATEGORIES.find((item) => item.id === categoryId);
  if (!section) return [];
  return section.avatarIds
    .map((avatarId) => findAvatar(avatarId))
    .filter((avatar): avatar is AvatarOption & { src: string } => Boolean(avatar?.src));
}

export const ONBOARDING_STEPS = ["Welcome", "Interests", "Skill", "Avatar", "Finish"] as const;
export type OnboardingStepIndex = 0 | 1 | 2 | 3 | 4;
