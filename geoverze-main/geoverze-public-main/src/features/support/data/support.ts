import type { LucideIcon } from "lucide-react";
import { BookOpen, CreditCard, Gamepad2, LifeBuoy, ShoppingBag, UserCog } from "lucide-react";

export type SupportCategory = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const supportCategories: SupportCategory[] = [
  {
    title: "Getting started",
    description: "What GEOverze is, how the universe is organised and where to begin exploring.",
    icon: LifeBuoy,
  },
  {
    title: "Let's Play",
    description: "Sessions, difficulty, scoring and how progress is tracked across the planet.",
    icon: Gamepad2,
  },
  {
    title: "GEOlibrary",
    description: "Using the reference library, collections and how entries are sourced.",
    icon: BookOpen,
  },
  {
    title: "GEOstore",
    description: "Orders, digital packs, physical goods and delivery expectations.",
    icon: ShoppingBag,
  },
  {
    title: "Account & access",
    description: "Sign-in, email verification, devices and recovering your progress.",
    icon: UserCog,
  },
  {
    title: "Plans & billing",
    description: "What each plan includes, switching plans and institution licensing.",
    icon: CreditCard,
  },
];

export const supportFaqs: { question: string; answer: string }[] = [
  {
    question: "Is GEOverze available to play right now?",
    answer:
      "The platform foundation and every page are live. The quiz engine, leaderboards and rewards arrive in the upcoming feature phases — each module tells you exactly what it will do when you open it.",
  },
  {
    question: "Do I need an account to explore?",
    answer:
      "Browsing the universe, the GEOlibrary overview and pricing needs nothing at all. Accounts exist to carry your progress, collections and rankings, and activate with the authentication phase.",
  },
  {
    question: "How is GEOverze different from a quiz app?",
    answer:
      "GEOverze treats the planet as a place you travel through rather than a list of questions. Play, reference and collecting share one continuous world, one visual language and one progression.",
  },
  {
    question: "Will my progress carry across devices?",
    answer:
      "Yes. Preferences save locally today, and once accounts are live your progress, collections and settings follow your account onto any device you sign in from.",
  },
  {
    question: "Can schools and institutions use GEOverze?",
    answer:
      "Institution licensing is part of the pricing model, covering classroom cohorts, shared progress views and bulk seats. Reach out through Contact and we'll plan the rollout with you.",
  },
  {
    question: "How do I report a problem or suggest something?",
    answer:
      "Use the Contact page. Reports about a specific page help most when they mention the page name and what you expected to happen.",
  },
];
