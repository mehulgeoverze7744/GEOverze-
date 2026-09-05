import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { BookOpen, CreditCard, Gamepad2, LifeBuoy, Mail, ShoppingBag, UserCog } from "lucide-react";

export type SupportCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  to: NonNullable<LinkProps["to"]>;
};

export type SupportGroup = {
  label: string;
  categoryIds: readonly string[];
};

export const supportCategories: readonly SupportCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Learn how GEOverze works",
    icon: LifeBuoy,
    to: "/",
  },
  {
    id: "play",
    title: "Let's Play",
    description: "Quizzes, scoring, sessions and progress",
    icon: Gamepad2,
    to: "/play",
  },
  {
    id: "geolibrary",
    title: "GEOlibrary",
    description: "Articles, collections and topics",
    icon: BookOpen,
    to: "/geolibrary",
  },
  {
    id: "geostore",
    title: "GEOstore",
    description: "Orders, products and delivery",
    icon: ShoppingBag,
    to: "/geostore",
  },
  {
    id: "account",
    title: "Account & access",
    description: "Sign-in, verification and account help",
    icon: UserCog,
    to: "/settings",
  },
  {
    id: "billing",
    title: "Plans & billing",
    description: "Plans, subscriptions and billing",
    icon: CreditCard,
    to: "/pricing",
  },
] as const;

export const supportGroups: readonly SupportGroup[] = [
  {
    label: "Explore GEOverze",
    categoryIds: ["getting-started", "play", "geolibrary"],
  },
  {
    label: "Account & membership",
    categoryIds: ["account", "billing", "geostore"],
  },
] as const;

export const supportContact = {
  title: "Contact GEOverze Support",
  description: "Still need help? We're here.",
  icon: Mail,
  to: "/contact" as const,
};

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

const categoryById = new Map(supportCategories.map((category) => [category.id, category]));

export function supportCategoryById(id: string): SupportCategory | undefined {
  return categoryById.get(id);
}
