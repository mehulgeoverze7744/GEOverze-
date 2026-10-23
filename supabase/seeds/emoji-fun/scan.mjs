import { bankA } from "./bank-a.mjs";
import { bankB } from "./bank-b.mjs";
import { bankC } from "./bank-c.mjs";
import { bankD } from "./bank-d.mjs";
import { bankE } from "./bank-e.mjs";

const quizzes = [...bankA, ...bankB, ...bankC, ...bankD, ...bankE];
const errors = [];
const glyphs = new Map();
const ids = new Set();
const titles = new Set();
let questions = 0;
const diff = { Easy: 0, Medium: 0, Hard: 0 };

for (const quiz of quizzes) {
  diff[quiz.difficulty] = (diff[quiz.difficulty] ?? 0) + 1;
  if (ids.has(quiz.id)) errors.push(`dup id ${quiz.id}`);
  if (titles.has(quiz.title)) errors.push(`dup title ${quiz.title}`);
  ids.add(quiz.id);
  titles.add(quiz.title);
  if (quiz.questions.length !== 10) errors.push(`${quiz.id} has ${quiz.questions.length}`);
  for (const q of quiz.questions) {
    questions += 1;
    if (!q.glyph || !q.answer || !q.why || q.distractors.length !== 3) {
      errors.push(`bad shape ${quiz.id} ${q.answer}`);
    }
    if (new Set([q.answer, ...q.distractors]).size !== 4) {
      errors.push(`options ${quiz.id}: ${q.answer} | ${q.distractors.join(" / ")}`);
    }
    const norm = (s) => s.toLowerCase().replace(/['’.\s-]/g, "");
    for (const d of q.distractors) {
      if (norm(d) === norm(q.answer)) errors.push(`distractor=answer ${quiz.id}: ${q.answer} / ${d}`);
      if (/\bis (set|unique|not|the capital|east|islands)\b|Wait |weaker|duplicate/i.test(d)) {
        errors.push(`junk distractor ${quiz.id}: ${q.answer} :: ${d}`);
      }
    }
    if (/Wait |weaker|duplicate/i.test(q.why)) {
      errors.push(`junk why ${quiz.id}: ${q.why}`);
    }
    if (q.glyph.toLowerCase().includes(q.answer.toLowerCase())) {
      errors.push(`answer in glyph ${quiz.id}: ${q.glyph} -> ${q.answer}`);
    }
    if (!/[^\u0000-\u007f]/.test(q.glyph)) errors.push(`no emoji ${quiz.id}: ${q.glyph} -> ${q.answer}`);
    if (glyphs.has(q.glyph)) errors.push(`dup glyph ${q.glyph} (${glyphs.get(q.glyph)} & ${quiz.id} ${q.answer})`);
    glyphs.set(q.glyph, `${quiz.id} ${q.answer}`);
  }
}

console.log({ quizzes: quizzes.length, questions, diff, errors: errors.length });
for (const e of errors) console.log(e);
