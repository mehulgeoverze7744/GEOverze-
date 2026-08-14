import { Link } from "@tanstack/react-router";
import { CalendarDays, History, LayoutGrid, Sparkles, Trophy } from "lucide-react";

import { SectionHeading } from "@/components/shared";

const LINKS = [
  {
    to: "/play/modes" as const,
    icon: LayoutGrid,
    title: "All game modes",
    description: "Solo, duels, rooms, practice — plus what's coming next.",
  },
  {
    to: "/play/tournaments" as const,
    icon: Trophy,
    title: "Tournaments",
    description: "Open brackets, seasonal cups and invitationals.",
  },
  {
    to: "/play/events" as const,
    icon: CalendarDays,
    title: "Special events",
    description: "Limited-time trails and community expeditions.",
  },
  {
    to: "/play/collections" as const,
    icon: Sparkles,
    title: "Collections",
    description: "Curated routes that chain several sets together.",
  },
  {
    to: "/play/history" as const,
    icon: History,
    title: "Match history",
    description: "Your record, with replays for every finished run.",
  },
];

/** Hub shortcuts into the wider quiz platform. */
export function PlayQuickLinks() {
  return (
    <section aria-label="Quiz platform shortcuts">
      <SectionHeading
        eyebrow="The platform"
        title="Everywhere you can play"
        description="Beyond a single run: brackets, events, curated routes and your full match record."
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="game-surface group rounded-2xl p-5 transition-all motion-snap hover:border-bronze/60 hover:-translate-y-0.5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-bronze/30 bg-bronze/12 text-bronze">
              <link.icon className="h-4.5 w-4.5" strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className="mt-4 text-[0.95rem] font-semibold tracking-tight text-foreground">
              {link.title}
            </h3>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-foreground/55">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
