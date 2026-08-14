/**
 * Single source of truth for site chrome: brand copy, navigation and footer
 * links. Navigation is data, never JSX — future modules register here.
 */

export const site = {
  name: "GEOverze",
  /** Official slogan — used wherever the brand signs off. */
  slogan: "Know Earth",
  /** Official tagline — the second line of the brand lockup. */
  tagline: "Think Global",
  domain: "geoverze.com",
  url: "https://geoverze.com",
  description:
    "GEOverze is a cinematic geography universe — play, learn and collect your way across the planet.",
} as const;

import type { LinkProps } from "@tanstack/react-router";

export type NavLink = NonNullable<LinkProps["to"]>;

export type NavItem = {
  label: string;
  to: NavLink;
};

export const mainNav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Let's Play", to: "/play" },
  { label: "GEOlibrary", to: "/geolibrary" },
  { label: "GEOstore", to: "/geostore" },
  { label: "Community", to: "/community" },
  { label: "Pricing", to: "/pricing" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Platform",
    items: [
      { label: "Let's Play", to: "/play" },
      { label: "GEOlibrary", to: "/geolibrary" },
      { label: "GEOstore", to: "/geostore" },
      { label: "Leaderboard", to: "/leaderboard" },
      { label: "Community", to: "/community" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Pricing", to: "/pricing" },
      { label: "Support", to: "/support" },
      { label: "Profile", to: "/profile" },
      { label: "Sign In", to: "/auth/login" },
      { label: "Create Account", to: "/auth/signup" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Settings", to: "/settings" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
    ],
  },
];

/** Social presences are placeholders until the accounts go live. */
export const socialLinks: { label: string; icon: "x" | "instagram" | "youtube" | "linkedin" }[] = [
  { label: "X", icon: "x" },
  { label: "Instagram", icon: "instagram" },
  { label: "YouTube", icon: "youtube" },
  { label: "LinkedIn", icon: "linkedin" },
];
