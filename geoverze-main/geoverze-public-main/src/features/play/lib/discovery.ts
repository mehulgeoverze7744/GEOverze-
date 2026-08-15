import type { DiscoveryRail, Quiz } from "../data/quizzes";

/** Resolve editorial quiz id lists against the live published catalogue. */
export function resolveQuizIds(ids: readonly string[], catalog: readonly Quiz[]): Quiz[] {
  const byId = new Map(catalog.map((quiz) => [quiz.id, quiz]));
  return ids.map((id) => byId.get(id)).filter((quiz): quiz is Quiz => Boolean(quiz));
}

/** Newest published quizzes by created_at (mapped to ageDays). */
export function newestQuizzes(catalog: readonly Quiz[], limit = 5): Quiz[] {
  return [...catalog].sort((a, b) => a.ageDays - b.ageDays).slice(0, limit);
}

/** Editorial discovery rail resolved against live data. */
export function quizzesForRail(rail: DiscoveryRail, catalog: readonly Quiz[]): Quiz[] {
  if (rail.id === "new") {
    return newestQuizzes(catalog, 5);
  }
  return resolveQuizIds(rail.quizIds, catalog);
}
