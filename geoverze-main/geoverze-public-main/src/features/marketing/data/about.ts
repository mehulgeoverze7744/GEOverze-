import { Compass, Layers, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Principle = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const principles: Principle[] = [
  {
    icon: Compass,
    title: "Accuracy first",
    description:
      "Every fact is sourced and reviewed. A geography platform earns trust one correct answer at a time.",
  },
  {
    icon: Sparkles,
    title: "Cinematic by default",
    description:
      "Learning should feel like an experience. Bronze, glass and atmospheric light are the material language.",
  },
  {
    icon: Layers,
    title: "Built to expand",
    description:
      "Each module — play, library, store, community — is a new room inside one coherent universe.",
  },
];
