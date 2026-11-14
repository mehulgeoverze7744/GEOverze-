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
    description: "hello@gvrze.com",
    href: "mailto:hello@gvrze.com",
  },
  {
    id: "institutions",
    emoji: "👥",
    title: "Institutions",
    description: "Cohorts, classrooms and teams.",
    href: "mailto:hello@gvrze.com?subject=Institutions",
  },
  {
    id: "press",
    emoji: "📰",
    title: "Press",
    description: "Media kits and interviews.",
    href: "mailto:hello@gvrze.com?subject=Press",
  },
];
