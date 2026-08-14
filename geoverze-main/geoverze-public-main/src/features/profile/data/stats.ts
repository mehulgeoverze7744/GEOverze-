/**
 * Placeholder profile numbers.
 *
 * Every value here is illustrative until the quiz engine and backend report
 * real telemetry. Shapes match what the future API will return.
 */
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Crosshair,
  Flame,
  Gauge,
  Globe2,
  ListChecks,
  Percent,
  Swords,
  Target,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";

export type ProfileStat = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  hint: string;
  icon: LucideIcon;
};

export const PROFILE_STATS: readonly ProfileStat[] = [
  { id: "quizzes", label: "Total quizzes", value: 248, hint: "Across every mode", icon: Zap },
  {
    id: "accuracy",
    label: "Accuracy",
    value: 87.4,
    suffix: "%",
    decimals: 1,
    hint: "Last 30 days",
    icon: Target,
  },
  {
    id: "streak",
    label: "Current streak",
    value: 12,
    suffix: " days",
    hint: "Keep it alive",
    icon: Flame,
  },
  {
    id: "longest",
    label: "Longest streak",
    value: 34,
    suffix: " days",
    hint: "Personal best",
    icon: Trophy,
  },
  { id: "countries", label: "Countries explored", value: 141, hint: "Of 195", icon: Globe2 },
  {
    id: "hours",
    label: "Hours learned",
    value: 62.5,
    decimals: 1,
    suffix: "h",
    hint: "Lifetime",
    icon: Clock,
  },
] as const;

/**
 * The full expedition record shown on the profile statistics section.
 * Mirrors the fields a `profile_stats` row will eventually provide.
 */
export const RECORD_STATS: readonly ProfileStat[] = [
  {
    id: "total-quizzes",
    label: "Total quizzes",
    value: 248,
    hint: "Every mode combined",
    icon: Zap,
  },
  {
    id: "win-rate",
    label: "Win rate",
    value: 68.5,
    suffix: "%",
    decimals: 1,
    hint: "Duels and multiplayer",
    icon: Percent,
  },
  { id: "solo-wins", label: "Solo wins", value: 96, hint: "Full-score solo runs", icon: User },
  { id: "pvp-wins", label: "PvP wins", value: 54, hint: "Head-to-head duels", icon: Swords },
  {
    id: "multiplayer-wins",
    label: "Multiplayer wins",
    value: 19,
    hint: "Lobbies of three or more",
    icon: Users,
  },
  {
    id: "questions",
    label: "Questions answered",
    value: 4_120,
    hint: "Lifetime total",
    icon: ListChecks,
  },
  {
    id: "record-accuracy",
    label: "Accuracy",
    value: 87.4,
    suffix: "%",
    decimals: 1,
    hint: "Correct of answered",
    icon: Crosshair,
  },
  {
    id: "average-score",
    label: "Average score",
    value: 84.2,
    suffix: "%",
    decimals: 1,
    hint: "Per completed quiz",
    icon: Gauge,
  },
] as const;

export const STREAK = {
  current: 12,
  longest: 34,
  weeklyGoal: 5,
  daysThisWeek: 4,
  /** Mon–Sun completion for the current week. */
  week: [true, true, false, true, true, false, false],
  /** Days completed in the current calendar month. */
  monthDone: 18,
  monthTotal: 30,
} as const;

export const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;
