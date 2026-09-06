import {
  Award,
  CalendarDays,
  Crown,
  Gamepad2,
  Library,
  Radio,
  Store,
  Trophy,
  UserRound,
  Gift,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NavItem } from "@/config/site";

export type HomeFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  imageSrc?: string;
};

/** Section 1 — Why GEOverze carousel imagery (unchanged from original pillars). */
const whyCarouselImages = [
  "/assets/home/learning.jpg",
  "/assets/home/discovery.jpg",
  "/assets/home/exploration.jpg",
  "/assets/home/interactive-quizzes.jpg",
  "/assets/home/friendly-competition.jpg",
] as const;

/** WHY GEOVERZE marquee — carousel copy on preserved pillar imagery. */
const whyCarouselContent: Pick<HomeFeature, "icon" | "title" | "description">[] = [
  {
    icon: Trophy,
    title: "Leaderboards",
    description: "Global and regional standings that reward accuracy as much as speed.",
  },
  {
    icon: CalendarDays,
    title: "Daily challenges",
    description: "One shared question set each day, played by the entire community.",
  },
  {
    icon: Award,
    title: "Tournaments",
    description: "Seasonal brackets where explorers advance round by round.",
  },
  {
    icon: Radio,
    title: "Live events",
    description: "Scheduled expeditions played together in real time.",
  },
  {
    icon: Gift,
    title: "Rewards",
    description: "Recognition, credits and collectibles earned through participation.",
  },
];

export const whyCarouselCards: HomeFeature[] = whyCarouselContent.map((item, index) => ({
  ...item,
  imageSrc: whyCarouselImages[index],
}));

/** Section 5 — Ecosystem. */
export const ecosystem: {
  icon: LucideIcon;
  title: string;
  description: string;
  to: NavItem["to"];
  imageSrc?: string;
}[] = [
  {
    icon: Gamepad2,
    title: "Let's Play",
    description: "The interactive heart of GEOverze — rounds, challenges and expeditions.",
    to: "/play",
    imageSrc: "/assets/home/ecosystem/lets-play.jpg",
  },
  {
    icon: Library,
    title: "GEOlibrary",
    description: "A living reference of countries, regions and landforms.",
    to: "/geolibrary",
    imageSrc: "/assets/home/ecosystem/geolibrary.jpg",
  },
  {
    icon: Store,
    title: "GEOstore",
    description: "Atlases, collections and profile pieces to unlock as you explore.",
    to: "/geostore",
    imageSrc: "/assets/home/ecosystem/geostore.jpg",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description: "Where standings, seasons and recognition come together.",
    to: "/leaderboard",
    imageSrc: "/assets/home/ecosystem/leaderboards.jpg",
  },
  {
    icon: Crown,
    title: "Premium membership",
    description: "Deeper content and refined experiences for dedicated explorers.",
    to: "/pricing",
    imageSrc: "/assets/home/ecosystem/premium-membership.jpg",
  },
  {
    icon: UserRound,
    title: "User profiles",
    description: "Your expedition log — progress, achievements and collections.",
    to: "/profile",
    imageSrc: "/assets/home/ecosystem/user-profiles.jpg",
  },
];
