/** Placeholder achievement catalogue. */
import type { LucideIcon } from "lucide-react";
import { Compass, Crown, Flag, Footprints, Landmark, Map, Mountain, Sparkles } from "lucide-react";

export type AchievementStatus = "unlocked" | "progress" | "locked";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: AchievementStatus;
  /** 0–100. */
  progress: number;
  /** Human readable progress, e.g. "34 / 50 quizzes". */
  detail: string;
  earnedOn?: string;
  tier: "bronze" | "silver" | "gold";
};

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your very first expedition.",
    icon: Footprints,
    status: "unlocked",
    progress: 100,
    detail: "1 / 1 quiz",
    earnedOn: "Day one",
    tier: "bronze",
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Finish quizzes across five different categories.",
    icon: Compass,
    status: "unlocked",
    progress: 100,
    detail: "5 / 5 categories",
    earnedOn: "Week one",
    tier: "bronze",
  },
  {
    id: "map-master",
    name: "Map Master",
    description: "Score above 90% on twenty map-reading rounds.",
    icon: Map,
    status: "progress",
    progress: 65,
    detail: "13 / 20 rounds",
    tier: "silver",
  },
  {
    id: "flag-expert",
    name: "Flag Expert",
    description: "Identify 150 national flags without a miss.",
    icon: Flag,
    status: "progress",
    progress: 48,
    detail: "72 / 150 flags",
    tier: "silver",
  },
  {
    id: "capital-genius",
    name: "Capital Genius",
    description: "Name the capital of every country in one session.",
    icon: Landmark,
    status: "progress",
    progress: 22,
    detail: "43 / 195 capitals",
    tier: "gold",
  },
  {
    id: "continent-conqueror",
    name: "Continent Conqueror",
    description: "Reach mastery in all seven continents.",
    icon: Mountain,
    status: "locked",
    progress: 0,
    detail: "0 / 7 continents",
    tier: "gold",
  },
  {
    id: "knowledge-seeker",
    name: "Knowledge Seeker",
    description: "Read fifty GEOlibrary articles.",
    icon: Sparkles,
    status: "progress",
    progress: 34,
    detail: "17 / 50 articles",
    tier: "bronze",
  },
  {
    id: "world-traveler",
    name: "World Traveler",
    description: "Explore all 195 countries across any mode.",
    icon: Crown,
    status: "locked",
    progress: 0,
    detail: "141 / 195 countries",
    tier: "gold",
  },
] as const;

export const ACHIEVEMENT_FILTERS = [
  { id: "all", label: "All" },
  { id: "unlocked", label: "Unlocked" },
  { id: "progress", label: "In progress" },
  { id: "locked", label: "Locked" },
] as const;

export type AchievementFilterId = (typeof ACHIEVEMENT_FILTERS)[number]["id"];
