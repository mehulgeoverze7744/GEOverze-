import { Mail, MessageSquare, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ContactChannel = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const contactChannels: ContactChannel[] = [
  { icon: Mail, title: "General", description: "hello@geoverze.com" },
  { icon: Users, title: "Institutions", description: "Cohorts, classrooms and teams." },
  { icon: MessageSquare, title: "Press", description: "Media kits and interviews." },
];
