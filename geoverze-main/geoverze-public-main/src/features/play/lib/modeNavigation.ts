import type { LinkProps } from "@tanstack/react-router";

import type { GameMode } from "../data/gameModes";

export type ModeNavTarget = {
  to: NonNullable<LinkProps["to"]>;
  search?: LinkProps["search"];
};

/** Resolves the existing play route for a game mode (matches PlayPage.playMode). */
export function modeNavTarget(mode: Pick<GameMode, "id" | "comingSoon">): ModeNavTarget | null {
  if (mode.comingSoon) return null;
  if (mode.id === "pvp") return { to: "/play/pvp" };
  if (mode.id === "multiplayer") return { to: "/play/multiplayer" };
  return { to: "/play/lobby", search: { mode: mode.id, quiz: undefined } };
}
