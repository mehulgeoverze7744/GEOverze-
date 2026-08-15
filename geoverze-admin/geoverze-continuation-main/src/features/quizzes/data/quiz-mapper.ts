import type { QuestionRecord, QuestionType } from "@/features/questions/types";
import { withPreservedFields } from "@/features/questions/data/question-mapper";
import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import { categoryIdToDisplay, categoryLabelToId } from "@/lib/catalog";
import type { QuizDifficulty, QuizRecord, QuizStatus } from "@/features/quizzes/types";

type QuizRow = Tables<"quizzes">;
type QuestionRow = Tables<"quiz_questions">;
type DbQuestionType = Enums<"question_type">;

const EMPTY_DIFFICULTY_MIX: Record<QuizDifficulty, number> = {
  Easy: 0,
  Medium: 0,
  Hard: 0,
  Expert: 0,
};

type DbChoice = {
  id: string;
  label?: string;
  text?: string;
};

function toQuizStatus(isPublished: boolean): QuizStatus {
  return isPublished ? "published" : "draft";
}

function toAdminDifficulty(value: string): QuizDifficulty {
  const normalized = value as QuizDifficulty;
  if (normalized === "Easy" || normalized === "Medium" || normalized === "Hard" || normalized === "Expert") {
    return normalized;
  }
  return "Medium";
}

function dbTypeToAdmin(type: DbQuestionType): QuestionType {
  switch (type) {
    case "single":
    case "multiple":
      return "Multiple Choice";
    case "boolean":
      return "True / False";
    case "typed":
      return "Fill in the Blank";
    case "image":
      return "Image Based";
    case "map":
      return "Map Based";
    case "order":
      return "Ordering";
    case "dragdrop":
      return "Matching";
  }
}

function mapOptions(row: QuestionRow): QuestionRecord["options"] {
  const raw = (row.options ?? []) as DbChoice[];
  const correctIds = new Set<string>();
  if (row.answer_id) correctIds.add(row.answer_id);
  if (row.answer_ids) row.answer_ids.forEach((id) => correctIds.add(id));
  if (row.type === "boolean" && row.answer_bool != null) {
    correctIds.add(row.answer_bool ? "true" : "false");
  }

  return raw.map((option) => ({
    id: option.id,
    text: option.label ?? option.text ?? "",
    correct: correctIds.has(option.id),
  }));
}

function mediaLabelFromRow(row: QuestionRow): string {
  if (!row.media || typeof row.media !== "object" || Array.isArray(row.media)) return "";
  const media = row.media as Record<string, unknown>;
  if (typeof media["art"] === "string") return media["art"];
  if (typeof media["glyph"] === "string") return media["glyph"];
  return "";
}

function answerTextFromRow(row: QuestionRow): string {
  if (row.accepted?.length) return row.accepted[0] ?? "";
  if (row.answer_bool != null) return row.answer_bool ? "True" : "False";
  return "";
}

/** Maps a Supabase quiz_questions row to the Admin QuestionRecord display shape. */
export function mapQuestionRow(row: QuestionRow): QuestionRecord {
  const type = dbTypeToAdmin(row.type);
  const mediaLabel = mediaLabelFromRow(row);
  const now = new Date().toISOString();

  const record: QuestionRecord = {
    id: row.id,
    prompt: row.prompt,
    type,
    difficulty: "Medium",
    category: "",
    region: "Global",
    country: "",
    topic: "",
    tags: [],
    language: "English",
    explanation: row.explanation ?? "",
    options: mapOptions(row),
    answerText: answerTextFromRow(row),
    mediaLabel,
    requiresMedia: type === "Image Based" || type === "Map Based" || mediaLabel.length > 0,
    usageCount: 0,
    status: "published",
    author: "",
    createdAt: now,
    updatedAt: now,
  };

  return withPreservedFields(row, record);
}

export interface MapQuizRowOptions {
  questionIds?: string[];
  questionCount?: number;
}

/**
 * Maps a Supabase quizzes row to the existing Admin QuizRecord shape.
 *
 * Fields with no DB column receive neutral defaults — analytics are zeroed,
 * not fabricated. Question count is derived from quiz_questions when provided.
 */
export function mapQuizRow(row: QuizRow, options: MapQuizRowOptions = {}): QuizRecord {
  const questionIds = options.questionIds ?? [];
  const questionCount = options.questionCount ?? questionIds.length;
  const status = toQuizStatus(row.is_published);

  return {
    id: row.id,
    title: row.title,
    creatorId: "",
    creator: row.creator,
    category: categoryIdToDisplay(row.category_id),
    difficulty: toAdminDifficulty(row.difficulty),
    questionCount,
    durationMinutes: row.minutes,
    status,
    visibility: row.is_published ? "Public" : "Private",
    language: row.language,
    tags: [],
    thumbnailLabel: row.art,
    timeLimitMinutes: 0,
    passingScore: 0,
    instructions: "",
    description: row.description ?? "",
    rewardXp: row.reward_xp,
    rewardCredits: row.reward_credits,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    plays: 0,
    completionRate: 0,
    averageScore: 0,
    rating: 0,
    ratingCount: 0,
    questionIds,
    difficultyMix: { ...EMPTY_DIFFICULTY_MIX },
    playsSeries: Array.from({ length: 12 }, () => 0),
    activity: [],
    versions: [],
  };
}

/** Maps Admin QuizRecord fields to a quizzes INSERT payload. */
export function quizRecordToInsert(quiz: QuizRecord, id: string): TablesInsert<"quizzes"> {
  const categoryId = categoryLabelToId(quiz.category);
  const art = quiz.thumbnailLabel.trim() || categoryId;

  return {
    id,
    title: quiz.title.trim(),
    description: quiz.description.trim() || null,
    category_id: categoryId,
    creator: quiz.creator.trim() || "GEOverze Studio",
    art,
    difficulty: quiz.difficulty,
    minutes: Math.max(1, quiz.durationMinutes || 5),
    language: quiz.language,
    reward_xp: Math.max(0, quiz.rewardXp),
    reward_credits: Math.max(0, quiz.rewardCredits),
    is_published: false,
  };
}

/** Maps Admin QuizRecord fields to a quizzes UPDATE payload (DB columns only). */
export function quizRecordToUpdate(quiz: QuizRecord): TablesUpdate<"quizzes"> {
  const categoryId = categoryLabelToId(quiz.category);
  const art = quiz.thumbnailLabel.trim() || categoryId;

  return {
    title: quiz.title.trim(),
    description: quiz.description.trim() || null,
    category_id: categoryId,
    creator: quiz.creator.trim() || "GEOverze Studio",
    art,
    difficulty: quiz.difficulty,
    minutes: Math.max(1, quiz.durationMinutes || 5),
    language: quiz.language,
    reward_xp: Math.max(0, quiz.rewardXp),
    reward_credits: Math.max(0, quiz.rewardCredits),
  };
}
