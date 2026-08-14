/** XP earning rules — display only. */
import type { LucideIcon } from "lucide-react";
import {
  Award,
  CalendarCheck,
  CalendarRange,
  Compass,
  Flame,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

export type XpRule = {
  id: string;
  label: string;
  amount: string;
  description: string;
  icon: LucideIcon;
};

export const XP_RULES: readonly XpRule[] = [
  {
    id: "completion",
    label: "Quiz completion",
    amount: "+50 XP",
    description: "Awarded for finishing any quiz set.",
    icon: Zap,
  },
  {
    id: "perfect",
    label: "Perfect score",
    amount: "+150 XP",
    description: "Every question correct in a single run.",
    icon: Star,
  },
  {
    id: "daily",
    label: "Daily challenge",
    amount: "+100 XP",
    description: "Complete today's challenge set.",
    icon: CalendarCheck,
  },
  {
    id: "weekly",
    label: "Weekly challenge",
    amount: "+400 XP",
    description: "Finish a weekly objective before reset.",
    icon: CalendarRange,
  },
  {
    id: "first",
    label: "First quiz of the day",
    amount: "+25 XP",
    description: "A small nudge to come back daily.",
    icon: Sparkles,
  },
  {
    id: "streak",
    label: "Streak bonus",
    amount: "+10 XP per day",
    description: "Scales with your current streak length.",
    icon: Flame,
  },
  {
    id: "category",
    label: "New category completion",
    amount: "+200 XP",
    description: "First time you clear a category.",
    icon: Compass,
  },
  {
    id: "levelup",
    label: "Level up",
    amount: "+Reward",
    description: "Each level unlocks its own reward tier.",
    icon: Award,
  },
] as const;
