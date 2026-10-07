import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

import { SectionContainer } from "@/components/shared";
import { PROGRESSION_LINKS } from "@/features/progression";

import "./play-hub-nav.css";

function PlayHubNavItems({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="play-hub-nav-list" aria-hidden={duplicate || undefined}>
      {PROGRESSION_LINKS.map((item) => {
        const Icon = item.to === "/play/leaderboard" ? Trophy : item.icon;
        return (
          <li key={`${duplicate ? "dup-" : ""}${item.to}`}>
            <Link
              to={item.to}
              className="play-hub-nav-link"
              tabIndex={duplicate ? -1 : undefined}
              activeProps={{ className: "play-hub-nav-link is-active" }}
            >
              <Icon className="play-hub-nav-icon" strokeWidth={2} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Let's Play hub strip — same routes as ProgressionNav, play-page styling only. */
export function PlayHubNav() {
  return (
    <nav className="play-hub-nav" aria-label="Progression sections">
      <SectionContainer size="wide">
        <div className="play-hub-nav-strip">
          <div className="play-hub-nav-track">
            <PlayHubNavItems />
            <PlayHubNavItems duplicate />
          </div>
        </div>
      </SectionContainer>
    </nav>
  );
}
