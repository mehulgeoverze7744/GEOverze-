/** Daily and weekly challenge placeholders. */
import type { Difficulty } from "@/features/play/data/categories";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  target: number;
  difficulty: Difficulty;
  timeRemaining: string;
  art: string;
};

export const DAILY_CHALLENGES: readonly Challenge[] = [
  {
    id: "d1",
    title: "Complete 3 quizzes",
    description: "Any category, any mode.",
    reward: "+100 XP",
    progress: 2,
    target: 3,
    difficulty: "Easy",
    timeRemaining: "Resets at midnight",
    art: "daily-three",
  },
  {
    id: "d2",
    title: "Score above 90%",
    description: "Finish a run with 90% accuracy or better.",
    reward: "+150 XP",
    progress: 1,
    target: 1,
    difficulty: "Medium",
    timeRemaining: "Resets at midnight",
    art: "daily-accuracy",
  },
  {
    id: "d3",
    title: "Play a Flag Quiz",
    description: "Identify banners from around the world.",
    reward: "+60 XP",
    progress: 0,
    target: 1,
    difficulty: "Easy",
    timeRemaining: "Resets at midnight",
    art: "daily-flags",
  },
  {
    id: "d4",
    title: "Try a new category",
    description: "Open a category you have never played.",
    reward: "+200 XP",
    progress: 0,
    target: 1,
    difficulty: "Medium",
    timeRemaining: "Resets at midnight",
    art: "daily-new",
  },
  {
    id: "d5",
    title: "Complete a timed quiz",
    description: "Beat the clock with the timer switched on.",
    reward: "+120 XP",
    progress: 0,
    target: 1,
    difficulty: "Hard",
    timeRemaining: "Resets at midnight",
    art: "daily-timed",
  },
] as const;

export const WEEKLY_CHALLENGES: readonly Challenge[] = [
  {
    id: "w1",
    title: "Complete 25 quizzes",
    description: "Volume across the whole week.",
    reward: "+800 XP",
    progress: 14,
    target: 25,
    difficulty: "Medium",
    timeRemaining: "4 days left",
    art: "weekly-volume",
  },
  {
    id: "w2",
    title: "Win 5 duels",
    description: "Head-to-head victories count toward credits too.",
    reward: "+600 XP · +5 Credits",
    progress: 3,
    target: 5,
    difficulty: "Hard",
    timeRemaining: "4 days left",
    art: "weekly-duels",
  },
  {
    id: "w3",
    title: "Explore 20 new countries",
    description: "Answer correctly on countries you have not covered yet.",
    reward: "+900 XP",
    progress: 11,
    target: 20,
    difficulty: "Hard",
    timeRemaining: "4 days left",
    art: "weekly-countries",
  },
  {
    id: "w4",
    title: "Perfect three runs",
    description: "Three flawless quizzes in one week.",
    reward: "Mystery reward",
    progress: 1,
    target: 3,
    difficulty: "Expert",
    timeRemaining: "4 days left",
    art: "weekly-perfect",
  },
] as const;
