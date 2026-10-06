export type ContactChannel = {
  id: "general" | "institutions" | "press";
  emoji: string;
  title: string;
  description: string;
  href: string;
};

export const contactChannels: ContactChannel[] = [
  {
    id: "general",
    emoji: "✉️",
    title: "General",
    description: "hello@geoverze.com",
    href: "mailto:hello@geoverze.com",
  },
  {
    id: "institutions",
    emoji: "👥",
    title: "Institutions",
    description: "Cohorts, classrooms and teams.",
    href: "mailto:hello@geoverze.com?subject=Institutions",
  },
  {
    id: "press",
    emoji: "📰",
    title: "Press",
    description: "Media kits and interviews.",
    href: "mailto:hello@geoverze.com?subject=Press",
  },
];
