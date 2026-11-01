import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { GAME_MODES, isGameModeAvailable, type GameMode } from "../data/gameModes";

const ORBIT_MODE_IDS = ["practice", "daily", "weekly", "tournament"] as const;

type GameModesOrbitProps = {
  onSelect: (mode: GameMode) => void;
};

function OrbitCard({
  mode,
  index,
  onSelect,
}: {
  mode: GameMode;
  index: number;
  onSelect: (mode: GameMode) => void;
}) {
  const Icon = mode.icon;
  const available = isGameModeAvailable(mode.id) && !mode.comingSoon;
  const className = cn("play-orbit-card", !available && "is-locked");

  const body = (
    <>
      <div className="play-orbit-card__media">
        {mode.imageSrc ? (
          <img src={mode.imageSrc} alt={mode.imageAlt ?? mode.title} />
        ) : null}
        {mode.comingSoon ? (
          <span className="play-orbit-card__soon">
            <Lock strokeWidth={2.2} aria-hidden />
            Coming soon
          </span>
        ) : null}
      </div>
      <div className="play-orbit-card__body">
        <span className="play-orbit-card__icon" aria-hidden>
          <Icon strokeWidth={1.7} />
        </span>
        <h3>{mode.title}</h3>
        <p>{mode.description}</p>
      </div>
    </>
  );

  if (!available) {
    return (
      <article className={className} data-mode={mode.id} style={{ zIndex: index + 1 }} aria-disabled>
        {body}
      </article>
    );
  }

  return (
    <button
      type="button"
      className={className}
      data-mode={mode.id}
      style={{ zIndex: index + 1 }}
      onClick={() => onSelect(mode)}
    >
      {body}
    </button>
  );
}

/** Practice / Daily / Weekly / Tournament — overlapping circular showcase. */
export function GameModesOrbit({ onSelect }: GameModesOrbitProps) {
  const modes = GAME_MODES.filter((mode) =>
    (ORBIT_MODE_IDS as readonly string[]).includes(mode.id),
  );

  return (
    <div className="play-orbit" aria-label="See every mode">
      <Link to="/play/modes" className="play-orbit__panel">
        <h2>
          See Every
          <br />
          Mode
        </h2>
        <p>Explore all the ways to play, practice, compete and grow on GVRZE.</p>
      </Link>

      <div className="play-orbit__cards">
        {modes.map((mode, index) => (
          <OrbitCard key={mode.id} mode={mode} index={index} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
