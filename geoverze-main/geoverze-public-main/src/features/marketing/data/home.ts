import {
  Award,
  BookOpen,
  Compass,
  CalendarDays,
  Crown,
  Flag,
  Gamepad2,
  Globe2,
  Landmark,
  Layers,
  Library,
  LineChart,
  Map,
  Mountain,
  Radio,
  Sparkles,
  Store,
  Target,
  Trophy,
  UserRound,
  Users,
  Waves,
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

/** Section 1 — Why GEOverze. */
export const whyPillars: HomeFeature[] = [
  {
    icon: BookOpen,
    title: "Learning",
    description:
      "Geography presented with the clarity of a great atlas and the pacing of a modern product — structured, precise, never dry.",
    imageSrc: "/assets/home/learning.jpg",
  },
  {
    icon: Compass,
    title: "Discovery",
    description:
      "Every session surfaces something you did not know: a border, a basin, a capital, a culture worth remembering.",
    imageSrc: "/assets/home/discovery.jpg",
  },
  {
    icon: Globe2,
    title: "Exploration",
    description:
      "Move across the planet in three dimensions. The world is the interface, not a list of chapters.",
    imageSrc: "/assets/home/exploration.jpg",
  },
  {
    icon: Target,
    title: "Interactive quizzes",
    description:
      "Short, elegant rounds that ask you to recognise and reason rather than recite what you memorised.",
    imageSrc: "/assets/home/interactive-quizzes.jpg",
  },
  {
    icon: Trophy,
    title: "Friendly competition",
    description:
      "Measure yourself against the world with standings designed to motivate curiosity, not anxiety.",
    imageSrc: "/assets/home/friendly-competition.jpg",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "A shared expedition — learners, travellers and map lovers exploring the same planet together.",
    imageSrc: "/assets/home/community.jpg",
  },
];

/** Section 2 — Explore the World. */
export const exploreCategories: { icon: LucideIcon; label: string; note: string }[] = [
  { icon: Flag, label: "Countries", note: "195 sovereign states" },
  { icon: Landmark, label: "Capitals", note: "Seats of every nation" },
  { icon: Flag, label: "Flags", note: "Colours and symbolism" },
  { icon: Map, label: "Maps", note: "Borders and projections" },
  { icon: Mountain, label: "Mountains", note: "Ranges and summits" },
  { icon: Waves, label: "Rivers", note: "Basins and deltas" },
  { icon: Waves, label: "Oceans", note: "Seas, currents, trenches" },
  { icon: Landmark, label: "Landmarks", note: "Built and natural wonders" },
  { icon: Sparkles, label: "Cultures", note: "Languages and traditions" },
  { icon: Layers, label: "Continents", note: "The seven great masses" },
];

/** Section 3 — Learn Through Play. */
export const learnConcepts: HomeFeature[] = [
  {
    icon: Gamepad2,
    title: "Interactive quizzes",
    description: "Knowledge is tested through play, so recall becomes a reflex instead of a chore.",
  },
  {
    icon: Target,
    title: "Challenges",
    description: "Focused objectives give each session a purpose and a clear sense of progress.",
  },
  {
    icon: Award,
    title: "Achievements",
    description: "Milestones mark real understanding — earned across regions, themes and mastery.",
  },
  {
    icon: LineChart,
    title: "Progress & personalisation",
    description: "The experience adapts to what you know and gently returns to what you don't.",
  },
];

/** Section 4 — Compete (roadmap framing). */
export const competeItems: { icon: LucideIcon; title: string; description: string }[] = [
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

/** Section 5 — Ecosystem. */
export const ecosystem: {
  icon: LucideIcon;
  title: string;
  description: string;
  to: NavItem["to"];
}[] = [
  {
    icon: Gamepad2,
    title: "Let's Play",
    description: "The interactive heart of GEOverze — rounds, challenges and expeditions.",
    to: "/play",
  },
  {
    icon: Library,
    title: "GEOlibrary",
    description: "A living reference of countries, regions and landforms.",
    to: "/geolibrary",
  },
  {
    icon: Store,
    title: "GEOstore",
    description: "Atlases, collections and profile pieces to unlock as you explore.",
    to: "/geostore",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description: "Where standings, seasons and recognition come together.",
    to: "/leaderboard",
  },
  {
    icon: Crown,
    title: "Premium membership",
    description: "Deeper content and refined experiences for dedicated explorers.",
    to: "/pricing",
  },
  {
    icon: UserRound,
    title: "User profiles",
    description: "Your expedition log — progress, achievements and collections.",
    to: "/profile",
  },
];

/** Section 6 — Why choose GEOverze. */
export const valueProps: { title: string; description: string }[] = [
  {
    title: "Beautifully designed learning",
    description: "Every screen is composed with the care of a premium product, not a textbook.",
  },
  {
    title: "Interactive 3D exploration",
    description: "A real globe you can move around, used as the entry point to the whole platform.",
  },
  {
    title: "Premium user interface",
    description: "Bronze, glass and deep space — a consistent visual language throughout.",
  },
  {
    title: "Community driven",
    description: "Built around shared discovery, friendly competition and collective curiosity.",
  },
  {
    title: "Continuously expanding",
    description: "New regions, themes and modules arrive as the universe grows.",
  },
  {
    title: "Learning made enjoyable",
    description: "Understanding the world should feel like exploring it, not revising for it.",
  },
];
