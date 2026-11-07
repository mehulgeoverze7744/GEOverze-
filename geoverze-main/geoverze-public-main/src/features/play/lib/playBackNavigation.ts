/**
 * Fallback destinations for the persistent play/quiz back control.
 * Used when there is no in-play history to restore (direct URL, refresh).
 * Never returns the marketing homepage.
 */

export type PlayBackTarget =
  | { to: "/play" }
  | { to: "/play/quiz"; search: { quiz: string } }
  | { to: "/play/pvp" }
  | { to: "/play/multiplayer" }
  | { to: "/play/draw-guess" }
  | { to: "/play/imposter" }
  | { to: "/play/tournaments" }
  | { to: "/play/collections" }
  | { to: "/play/history" };

function quizIdFromSearch(search: Record<string, unknown>): string | undefined {
  const quiz = search["quiz"];
  return typeof quiz === "string" && quiz.length > 0 ? quiz : undefined;
}

export function isPlayHubPath(pathname: string): boolean {
  return pathname === "/play" || pathname === "/play/";
}

/** Parent listing / hub for a gameplay URL when history cannot be used. */
export function playBackFallback(
  pathname: string,
  search: Record<string, unknown> = {},
): PlayBackTarget {
  const quiz = quizIdFromSearch(search);

  if (pathname.startsWith("/play/quiz/") && quiz) {
    return { to: "/play/quiz", search: { quiz } };
  }
  if (pathname.startsWith("/play/pvp/")) return { to: "/play/pvp" };
  if (pathname.startsWith("/play/multiplayer/")) return { to: "/play/multiplayer" };
  if (pathname.startsWith("/play/draw-guess/")) return { to: "/play/draw-guess" };
  if (pathname.startsWith("/play/imposter/")) return { to: "/play/imposter" };
  if (pathname.startsWith("/play/tournaments/")) return { to: "/play/tournaments" };
  if (pathname.startsWith("/play/collections/")) return { to: "/play/collections" };
  if (pathname.startsWith("/play/history/")) return { to: "/play/history" };

  return { to: "/play" };
}
