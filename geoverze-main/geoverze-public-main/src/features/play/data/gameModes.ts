/** Game mode selection cards for the Let's Play lobby. */
import { CalendarDays, CalendarRange, Dumbbell, Swords, Trophy, User, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type GameMode = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  art: string;
  cta: string;
  comingSoon?: boolean;
  imageSrc?: string;
  imageAlt?: string;
};

export const GAME_MODES: readonly GameMode[] = [
  {
    id: "solo",
    title: "Solo",
    description: "Your pace, your clock. Escalating sets that adapt as you climb.",
    icon: User,
    art: "solo",
    cta: "Play solo",
    imageSrc: "/assets/play/solo.jpg",
    imageAlt: "Solo geography game",
  },
  {
    id: "pvp",
    title: "PvP",
    description: "One-on-one duels with the same questions landing at the same instant.",
    icon: Swords,
    art: "pvp",
    cta: "Find a duel",
    imageSrc: "/assets/play/pvp.jpg",
    imageAlt: "PvP geography game",
  },
  {
    id: "multiplayer",
    title: "Multiplayer",
    description: "Rooms of up to sixteen players racing through a shared board.",
    icon: Users,
    art: "multiplayer",
    cta: "Join a room",
    imageSrc: "/assets/play/multiplayer.jpg",
    imageAlt: "Multiplayer geography game",
  },
  {
    id: "practice",
    title: "Practice",
    description: "No clock, no score. Learn the map before you compete on it.",
    icon: Dumbbell,
    art: "practice",
    cta: "Start practising",
    imageSrc: "/assets/play/practice.jpg",
    imageAlt: "Practice geography game",
  },
  {
    id: "daily",
    title: "Daily Challenge",
    description: "Ten questions, one shot, a new set every midnight.",
    icon: CalendarDays,
    art: "daily",
    cta: "Play today's set",
    imageSrc: "/assets/play/daily-challenge.jpg",
    imageAlt: "Daily Challenge geography game",
  },
  {
    id: "weekly",
    title: "Weekly Challenge",
    description: "A longer expedition with bonus rewards for finishing clean.",
    icon: CalendarRange,
    art: "weekly",
    cta: "Enter this week",
    imageSrc: "/assets/play/weekly-challenge.jpg",
    imageAlt: "Weekly Challenge geography game",
  },
  {
    id: "tournament",
    title: "Tournament",
    description: "Bracketed seasons with qualifiers, finals and a permanent record.",
    icon: Trophy,
    art: "tournament",
    cta: "Coming soon",
    comingSoon: true,
  },
];

/**
 * Modes that are designed but not built yet. Rendered as clearly locked
 * placeholders on /play/modes — never with fake data behind them.
 */
export const FUTURE_MODES: readonly GameMode[] = [
  {
    id: "tournament-ladder",
    title: "Tournament Ladder",
    description: "A persistent seeded ladder with promotion, relegation and season resets.",
    icon: Trophy,
    art: "tournament",
    cta: "Locked",
    comingSoon: true,
  },
  {
    id: "team-battle",
    title: "Team Battle",
    description: "Four-versus-four rooms where a team score is the sum of its fastest answers.",
    icon: Users,
    art: "multiplayer",
    cta: "Locked",
    comingSoon: true,
  },
  {
    id: "esports-arena",
    title: "Esports Arena",
    description: "Broadcast-ready rooms with spectators, casters and a permanent match record.",
    icon: Swords,
    art: "pvp",
    cta: "Locked",
    comingSoon: true,
  },
];
