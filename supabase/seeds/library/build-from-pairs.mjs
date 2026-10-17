import { b, hashSeed, pickDistractors, s, shuffle, t } from "./helpers.mjs";

function norm(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function withAnswer(question, correctLabel) {
  const idx = question.options.findIndex((o) => o.label === correctLabel);
  if (idx < 0) throw new Error(`Missing option ${correctLabel}`);
  question.answer_id = question.options[idx].id;
  return question;
}

/**
 * Build unique questions from { key, value, why, accepted? } facts.
 */
export function questionsFromPairs(pairs, { target, seedKey, typedPlaceholder, ofWord = "of", label = "" }) {
  const questions = [];
  const used = new Set();
  const values = [...new Set(pairs.map((p) => p.value))];
  const seeded = shuffle(pairs, hashSeed(seedKey));

  const push = (q) => {
    const id = norm(q.prompt);
    if (!q.prompt || used.has(id)) return false;
    used.add(id);
    questions.push(q);
    return true;
  };

  for (const pair of seeded) {
    if (questions.length >= target) break;
    const dVals = pickDistractors(values, pair.value, 3, hashSeed(`${seedKey}|v|${pair.key}`));
    if (dVals.length < 3) continue;
    const labels = shuffle([pair.value, ...dVals], hashSeed(`${pair.key}|sv`));
    push(
      withAnswer(
        s(
          `${label}What is the ${pair.noun ?? "answer"} ${ofWord} ${pair.key}?`,
          pair.why,
          labels,
          "a",
        ),
        pair.value,
      ),
    );
  }

  for (const pair of seeded) {
    if (questions.length >= target) break;
    const dVals = pickDistractors(values, pair.value, 3, hashSeed(`${seedKey}|r|${pair.key}`));
    if (dVals.length < 3) continue;
    const labels = shuffle([pair.value, ...dVals], hashSeed(`${pair.key}|sr`));
    push(
      withAnswer(
        s(
          `${label}Identify the ${pair.noun ?? "answer"} linked to ${pair.key}.`,
          pair.why,
          labels,
          "a",
        ),
        pair.value,
      ),
    );
  }

  for (const pair of seeded) {
    if (questions.length >= target) break;
    push(
      b(`${label}${pair.value} is the ${pair.noun ?? "answer"} ${ofWord} ${pair.key}.`, pair.why, true),
    );
  }

  for (const pair of seeded) {
    if (questions.length >= target) break;
    const wrong = pickDistractors(values, pair.value, 1, hashSeed(`${pair.key}|false`))[0];
    if (!wrong) continue;
    push(
      b(
        `${label}${wrong} is the ${pair.noun ?? "answer"} ${ofWord} ${pair.key}.`,
        `${pair.why} The correct ${pair.noun ?? "answer"} is ${pair.value}.`,
        false,
      ),
    );
  }

  for (const pair of seeded) {
    if (questions.length >= target) break;
    push(
      t(
        `${label}Name the ${pair.noun ?? "answer"} ${ofWord} ${pair.key}.`,
        pair.why,
        pair.accepted ?? [norm(pair.value)],
        typedPlaceholder,
      ),
    );
  }

  if (questions.length < target) {
    throw new Error(`${seedKey} produced ${questions.length} questions, need ${target}`);
  }
  return questions.slice(0, target);
}

export { norm };
