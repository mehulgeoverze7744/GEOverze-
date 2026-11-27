const QUIZ_OUTLINE_BASE = "/assets/quizzes/outlines";

/** Default on-disk quiz cover path from a quiz id (`q-foo-bar` → `/assets/quizzes/foo-bar-quiz.jpg`). */
export function quizCoverArtForId(quizId: string): string | null {
  if (!quizId.startsWith("q-")) return null;
  return `/assets/quizzes/${quizId.slice(2)}-quiz.jpg`;
}

/** Synchronous resolution for local quiz question art keys (no network). */
export function resolveQuizArtKey(art: string | undefined | null): string | null {
  if (!art) return null;
  const trimmed = art.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("quiz-cover:")) {
    const quizId = trimmed.slice("quiz-cover:".length).trim();
    return quizCoverArtForId(quizId);
  }
  if (trimmed.startsWith("outline-")) {
    const code = trimmed.slice("outline-".length).toLowerCase();
    return `${QUIZ_OUTLINE_BASE}/outline-${code}.svg`;
  }
  if (trimmed.startsWith("quiz:")) {
    const slug = trimmed.slice("quiz:".length).trim();
    if (!slug) return null;
    const file = slug.startsWith("q-") ? slug.slice(2) : slug;
    return `/assets/quizzes/${file}-quiz.jpg`;
  }
  return null;
}