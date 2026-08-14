import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import {
  CalendarDays,
  CalendarRange,
  Coins,
  Flame,
  Gift,
  Receipt,
  Trophy,
  TrendingUp,
} from "lucide-react";

export const PROGRESSION_LINKS: readonly {
  to: NonNullable<LinkProps["to"]>;
  label: string;
  icon: typeof Coins;
}[] = [
  { to: "/play/progression", label: "Progression", icon: TrendingUp },
  { to: "/play/level-system", label: "Levels", icon: Trophy },
  { to: "/play/rewards", label: "Rewards", icon: Gift },
  { to: "/play/streak", label: "Streak", icon: Flame },
  { to: "/play/daily-challenges", label: "Daily", icon: CalendarDays },
  { to: "/play/weekly-challenges", label: "Weekly", icon: CalendarRange },
  { to: "/play/leaderboard", label: "Leaderboard", icon: Coins },
  { to: "/play/credit-history", label: "Credit history", icon: Receipt },
] as const;

/** Horizontal, scrollable sub-navigation shared by every progression page. */
export function ProgressionNav() {
  return (
    <nav aria-label="Progression sections" className="-mx-1 overflow-x-auto pb-1">
      <ul className="flex min-w-max gap-2 px-1">
        {PROGRESSION_LINKS.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="inline-flex items-center gap-2 rounded-full border border-bronze/15 bg-[oklch(0.185_0.008_62)] px-4 py-2 text-xs font-medium text-foreground/60 transition-colors motion-snap hover:border-bronze/40 hover:text-foreground"
              activeProps={{
                className:
                  "inline-flex items-center gap-2 rounded-full border border-bronze/55 bg-bronze/15 px-4 py-2 text-xs font-semibold text-bronze-glow",
              }}
            >
              <item.icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
