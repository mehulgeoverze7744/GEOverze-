export const CREATOR = "GEOverze Studio";

export const REWARDS = {
  Easy: { minutes: 6, xp: 240, credits: 60 },
  Medium: { minutes: 7, xp: 320, credits: 80 },
  Hard: { minutes: 9, xp: 400, credits: 100 },
};

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function quizId(prefix, title) {
  return `q-${prefix}-${slugify(title)}`;
}

export function s(prompt, explanation, labels, answer_id) {
  return {
    type: "single",
    prompt,
    explanation,
    options: labels.map((label, i) => ({ id: "abcd"[i], label })),
    answer_id,
  };
}

export function m(prompt, explanation, labels, answer_ids) {
  return {
    type: "multiple",
    prompt,
    explanation,
    options: labels.map((label, i) => ({ id: "abcd"[i], label })),
    answer_ids,
  };
}

export function b(prompt, explanation, answer_bool) {
  return { type: "boolean", prompt, explanation, answer_bool };
}

export function t(prompt, explanation, accepted, placeholder = "Type your answer") {
  return { type: "typed", prompt, explanation, accepted, placeholder };
}

export function img(prompt, explanation, glyph, caption, labels, answer_id, glyphs) {
  return {
    type: "image",
    prompt,
    explanation,
    media: { kind: "flag", glyph, caption },
    options: labels.map((label, i) => ({
      id: "abcd"[i],
      label,
      ...(glyphs?.[i] ? { glyph: glyphs[i] } : {}),
    })),
    answer_id,
  };
}

export function shuffle(items, seed) {
  const next = [...items];
  let state = seed;
  for (let i = next.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickDistractors(pool, correct, count, seed) {
  const others = pool.filter((item) => item !== correct);
  return shuffle(others, seed).slice(0, count);
}

export function assertQuestion(q, label) {
  if (!q?.prompt || !q.explanation || !q.type) {
    throw new Error(`${label} missing required fields`);
  }
  if ((q.type === "single" || q.type === "image") && (!q.answer_id || !q.options?.length)) {
    throw new Error(`${label} invalid ${q.type}`);
  }
  if (q.type === "multiple" && !q.answer_ids?.length) {
    throw new Error(`${label} invalid multiple`);
  }
  if (q.type === "boolean" && typeof q.answer_bool !== "boolean") {
    throw new Error(`${label} invalid boolean`);
  }
  if (q.type === "typed" && !q.accepted?.length) {
    throw new Error(`${label} invalid typed`);
  }
}
