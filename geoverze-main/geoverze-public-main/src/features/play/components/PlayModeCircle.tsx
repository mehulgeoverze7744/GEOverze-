import type { GameMode } from "../data/gameModes";

const CIRCLE_COPY: Record<
  string,
  { badge: string; description: string; cta: string }
> = {
  solo: {
    badge: "Free play",
    description: "Your pace, your clock.",
    cta: "Play solo",
  },
  pvp: {
    badge: "1 v 1",
    description: "One-on-one duels.",
    cta: "Find new players to win more credits",
  },
  multiplayer: {
    badge: "Up to 16 players",
    description: "Shared rooms, live.",
    cta: "Gets most credits",
  },
};

/** Opaque circular lobby card for Solo, PvP and Multiplayer on /play. */
export function PlayModeCircle({
  mode,
  onSelect,
}: {
  mode: GameMode;
  onSelect: (m: GameMode) => void;
}) {
  const copy = CIRCLE_COPY[mode.id];
  const Icon = mode.icon;

  if (!copy) return null;

  return (
    <article className="play-mode-circle" data-mode={mode.id}>
      <span className="play-mode-circle__badge">{copy.badge}</span>
      <span className="play-mode-circle__icon" aria-hidden="true">
        <Icon strokeWidth={1.6} />
      </span>
      <h3 className="play-mode-circle__title">{mode.title}</h3>
      <p className="play-mode-circle__desc">{copy.description}</p>
      <button
        type="button"
        className="play-mode-circle__cta"
        onClick={() => onSelect(mode)}
      >
        {copy.cta}
      </button>
    </article>
  );
}

export const PLAY_CIRCLE_MODE_IDS = ["solo", "pvp", "multiplayer"] as const;
