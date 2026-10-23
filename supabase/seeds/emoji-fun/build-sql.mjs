/**
 * Writes the emoji-fun migration, thumbnail map, and resumable image manifest.
 * Re-running updates the same ids in place. It does not delete rows.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PROMPTS, QUIZZES, REWARDS } from "./quizzes.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..", "..");
const migrationPath = join(repo, "supabase", "migrations", "20261022180000_emoji_fun_rebus_quizzes.sql");
const mapPath = join(
  repo,
  "geoverze-main",
  "geoverze-public-main",
  "src",
  "features",
  "play",
  "data",
  "emojiFunQuizThumbnails.generated.ts",
);
const manifestPath = join(here, "thumbnail-manifest.json");
const imageDir = join(repo, "geoverze-main", "geoverze-public-main", "public", "assets", "quizzes");

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function questionUuid(quizId, position) {
  const hex = createHash("sha256").update(`emoji-fun:${quizId}:${position}`).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const s = hex.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

function coverFile(quizId) {
  return `${quizId.slice(2)}-quiz.jpg`;
}

const quizRows = [];
const questionRows = [];
const mapEntries = [];
const manifest = [];

QUIZZES.forEach((quiz, quizIndex) => {
  const reward = REWARDS[quiz.difficulty];
  if (!reward) throw new Error(`Unknown difficulty ${quiz.difficulty}`);
  quizRows.push(`  (
    ${sqlString(quiz.id)},
    ${sqlString(quiz.title)},
    ${sqlString(quiz.description)},
    'emoji-fun',
    'GEOverze Studio',
    'emoji-fun',
    ${sqlString(quiz.difficulty)},
    ${reward.minutes},
    'English',
    ${reward.xp},
    ${reward.credits},
    true
  )`);

  quiz.questions.forEach((question, questionIndex) => {
    const prompt = PROMPTS[question.kind];
    if (!prompt) throw new Error(`Unknown kind ${question.kind} on ${quiz.id}`);
    const position = questionIndex + 1;
    const slot = (quizIndex + questionIndex) % 4;
    const labels = [...question.distractors];
    labels.splice(slot, 0, question.answer);
    const options = labels.map((label, index) => ({ id: "abcd"[index], label }));
    const media = { kind: "flag", glyph: question.glyph };
    questionRows.push(`(
  ${sqlString(questionUuid(quiz.id, position))}::uuid,
  ${sqlString(quiz.id)},
  ${position},
  'single',
  ${sqlString(prompt)},
  ${sqlString(question.why)},
  ${sqlString(JSON.stringify(media))}::jsonb,
  ${sqlString(JSON.stringify(options))}::jsonb,
  ${sqlString("abcd"[slot])}
)`);
  });

  const file = coverFile(quiz.id);
  mapEntries.push(`  ${JSON.stringify(quiz.id)}: {
    src: \`\${QUIZ_COVER_BASE}/${file}\`,
    alt: ${JSON.stringify(`Cover photography for ${quiz.title}`)},
    objectPosition: "center 46%",
  },`);
  manifest.push({
    id: quiz.id,
    title: quiz.title,
    difficulty: quiz.difficulty,
    file,
    scene: quiz.scene,
    status: existsSync(join(imageDir, file)) ? "generated" : "pending",
  });
});

const idList = QUIZZES.map((quiz) => sqlString(quiz.id)).join(",\n    ");

const sql = `-- =============================================================================
-- Emoji & Fun: 50 rebus quizzes, 500 single-choice questions.
--
-- Replaces the active emoji-fun collection. There is no emoji-fun seed in
-- earlier migrations; the play card previously searched the flags category.
-- This file does not modify Countries, the 13-category library, Atlas Sprint,
-- Flag Frenzy, Flag Blitz, Capital Confusion, or any other category.
--
-- Idempotent:
--   quizzes      ON CONFLICT (id) DO UPDATE, and only when the existing row
--                is already category emoji-fun
--   questions    ON CONFLICT (quiz_id, position) DO UPDATE content
--                The question primary key is left unchanged.
--   leftovers    other emoji-fun quizzes are unpublished, never deleted
--
-- quiz_attempts, rewards, bookmarks, and result rows are not touched.
-- =============================================================================

insert into public.quizzes (
  id, title, description, category_id, creator, art,
  difficulty, minutes, language, reward_xp, reward_credits, is_published
)
values
${quizRows.join(",\n")}
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category_id = excluded.category_id,
  creator = excluded.creator,
  art = excluded.art,
  difficulty = excluded.difficulty,
  minutes = excluded.minutes,
  language = excluded.language,
  reward_xp = excluded.reward_xp,
  reward_credits = excluded.reward_credits,
  is_published = excluded.is_published
where public.quizzes.category_id = 'emoji-fun';

insert into public.quiz_questions (
  id, quiz_id, position, type, prompt, explanation, media, options, answer_id
)
values
${questionRows.join(",\n")}
on conflict (quiz_id, position) do update set
  type = excluded.type,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  media = excluded.media,
  options = excluded.options,
  answer_id = excluded.answer_id,
  answer_ids = null,
  answer_bool = null,
  regions = null,
  board_art = null,
  accepted = null,
  placeholder = null,
  items = null,
  targets = null;

update public.quizzes
set is_published = false
where category_id = 'emoji-fun'
  and id not in (
    ${idList}
  );
`;

mkdirSync(dirname(migrationPath), { recursive: true });
mkdirSync(dirname(mapPath), { recursive: true });
writeFileSync(migrationPath, sql, "utf8");
writeFileSync(
  mapPath,
  `/** Generated by supabase/seeds/emoji-fun/build-sql.mjs — do not edit by hand. */
const QUIZ_COVER_BASE = "/assets/quizzes";

export const EMOJI_FUN_QUIZ_THUMBNAILS = {
${mapEntries.join("\n")}
};
`,
  "utf8",
);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const pending = manifest.filter((item) => item.status === "pending").length;
console.log(`quizzes ${QUIZZES.length}`);
console.log(`questions ${questionRows.length}`);
console.log(`migration ${migrationPath}`);
console.log(`thumbnails pending ${pending} of ${manifest.length}`);
