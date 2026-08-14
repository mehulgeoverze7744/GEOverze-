/**
 * Quiz category catalog.
 *
 * Placeholder content until the question engine and backend land. `art` keys
 * drive the procedural cover art so real photography can replace them later
 * without touching layout.
 */
import {
  Award,
  BookOpen,
  Building2,
  Flag,
  Globe2,
  Landmark,
  Leaf,
  Map,
  Mountain,
  Sparkles,
  Trophy,
  Waves,
  Wind,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";

export type QuizCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Cover-art seed: hue + pattern. See lib/coverArt.ts */
  art: string;
  difficulty: Difficulty;
  questions: number;
  minutes: number;
  /** 0-100 popularity score. */
  popularity: number;
  isNew?: boolean;
  trending?: boolean;
};

export const QUIZ_CATEGORIES: readonly QuizCategory[] = [
  {
    id: "countries",
    title: "Countries",
    description: "Borders, sizes, populations and the shapes that define every nation.",
    icon: Globe2,
    art: "countries",
    difficulty: "Easy",
    questions: 40,
    minutes: 8,
    popularity: 98,
    trending: true,
  },
  {
    id: "capitals",
    title: "Capitals",
    description: "From the obvious to the ones that catch everybody out.",
    icon: Building2,
    art: "capitals",
    difficulty: "Medium",
    questions: 35,
    minutes: 7,
    popularity: 94,
  },
  {
    id: "flags",
    title: "Flags",
    description: "Colours, crests and the stories folded into every banner.",
    icon: Flag,
    art: "flags",
    difficulty: "Easy",
    questions: 50,
    minutes: 9,
    popularity: 96,
    trending: true,
  },
  {
    id: "maps",
    title: "Maps",
    description: "Pin the place. Read the terrain. Trust your sense of scale.",
    icon: Map,
    art: "maps",
    difficulty: "Hard",
    questions: 30,
    minutes: 10,
    popularity: 88,
  },
  {
    id: "landmarks",
    title: "Landmarks",
    description: "Monuments, ruins and skylines from all six inhabited continents.",
    icon: Landmark,
    art: "landmarks",
    difficulty: "Medium",
    questions: 32,
    minutes: 7,
    popularity: 90,
  },
  {
    id: "history",
    title: "History",
    description: "Empires, borders redrawn and the moments that moved the map.",
    icon: BookOpen,
    art: "history",
    difficulty: "Hard",
    questions: 28,
    minutes: 9,
    popularity: 79,
  },
  {
    id: "mountains",
    title: "Mountains",
    description: "Ranges, summits and elevations that shape entire climates.",
    icon: Mountain,
    art: "mountains",
    difficulty: "Medium",
    questions: 26,
    minutes: 6,
    popularity: 74,
  },
  {
    id: "rivers",
    title: "Rivers",
    description: "Sources, deltas and the arteries that built civilisations.",
    icon: Waves,
    art: "rivers",
    difficulty: "Medium",
    questions: 24,
    minutes: 6,
    popularity: 71,
  },
  {
    id: "oceans",
    title: "Oceans",
    description: "Currents, trenches and the seas between the continents.",
    icon: Wind,
    art: "oceans",
    difficulty: "Hard",
    questions: 22,
    minutes: 6,
    popularity: 68,
    isNew: true,
  },
  {
    id: "culture",
    title: "Culture",
    description: "Languages, cuisine, festivals and the habits of place.",
    icon: Users,
    art: "culture",
    difficulty: "Easy",
    questions: 36,
    minutes: 8,
    popularity: 83,
  },
  {
    id: "mixed",
    title: "Mixed Geography",
    description: "Everything, shuffled. The truest test of a well-travelled mind.",
    icon: Sparkles,
    art: "mixed",
    difficulty: "Expert",
    questions: 60,
    minutes: 14,
    popularity: 92,
    trending: true,
  },
  {
    id: "nature",
    title: "Nature",
    description: "Biomes, wildlife and the wild edges of the inhabited world.",
    icon: Leaf,
    art: "nature",
    difficulty: "Easy",
    questions: 34,
    minutes: 7,
    popularity: 80,
    isNew: true,
  },
  {
    id: "unesco",
    title: "UNESCO Sites",
    description: "The protected wonders humanity agreed to keep.",
    icon: Award,
    art: "unesco",
    difficulty: "Hard",
    questions: 30,
    minutes: 9,
    popularity: 76,
    isNew: true,
  },
  {
    id: "records",
    title: "World Records",
    description: "Highest, deepest, driest, longest — the planet at its extremes.",
    icon: Trophy,
    art: "records",
    difficulty: "Expert",
    questions: 25,
    minutes: 8,
    popularity: 85,
    trending: true,
  },
];
