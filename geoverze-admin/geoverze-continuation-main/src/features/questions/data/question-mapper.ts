import type { Enums, Json, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type { QuestionRecord, QuestionType } from "@/features/questions/types";

type QuestionRow = Tables<"quiz_questions">;
type DbQuestionType = Enums<"question_type">;

export type PreservedDbFields = Partial<
  Pick<
    QuestionRow,
    | "type"
    | "options"
    | "answer_id"
    | "answer_ids"
    | "answer_bool"
    | "accepted"
    | "placeholder"
    | "media"
    | "regions"
    | "board_art"
    | "items"
    | "targets"
  >
>;

/** Types the admin editor can fully round-trip to the database. */
export const EDITOR_SUPPORTED_TYPES: QuestionType[] = [
  "Multiple Choice",
  "True / False",
  "Fill in the Blank",
  "Image Based",
];

export function isComplexDbType(type: DbQuestionType): boolean {
  return type === "map" || type === "order" || type === "dragdrop";
}

export function adminTypeToDb(type: QuestionType, options: QuestionRecord["options"]): DbQuestionType {
  switch (type) {
    case "True / False":
      return "boolean";
    case "Fill in the Blank":
      return "typed";
    case "Image Based":
      return "image";
    case "Map Based":
      return "map";
    case "Ordering":
      return "order";
    case "Matching":
      return "dragdrop";
    case "Multiple Choice": {
      const correctCount = options.filter((o) => o.correct).length;
      return correctCount > 1 ? "multiple" : "single";
    }
  }
}

function toChoiceOptions(options: QuestionRecord["options"]) {
  return options.map((option) => ({
    id: option.id,
    label: option.text,
  }));
}

function buildMedia(question: QuestionRecord): Json | null {
  if (!question.mediaLabel.trim()) return null;
  if (question.type === "Image Based") {
    return { kind: "image", art: question.mediaLabel.trim() } as Json;
  }
  if (question.type === "Map Based") {
    return { kind: "map", art: question.mediaLabel.trim() } as Json;
  }
  return { kind: "image", art: question.mediaLabel.trim() } as Json;
}

function correctOptionIds(options: QuestionRecord["options"]): string[] {
  return options.filter((o) => o.correct).map((o) => o.id);
}

/** Attach preserved DB fields when reading complex question types. */
export function withPreservedFields(row: QuestionRow, record: QuestionRecord): QuestionRecord {
  if (!isComplexDbType(row.type) && row.type !== "map") return record;
  return {
    ...record,
    preservedDbFields: {
      type: row.type,
      options: row.options,
      answer_id: row.answer_id,
      answer_ids: row.answer_ids,
      answer_bool: row.answer_bool,
      accepted: row.accepted,
      placeholder: row.placeholder,
      media: row.media,
      regions: row.regions,
      board_art: row.board_art,
      items: row.items,
      targets: row.targets,
    },
  };
}

export type QuestionRecordWithPreserved = QuestionRecord & {
  preservedDbFields?: PreservedDbFields;
};

/**
 * Maps an Admin QuestionRecord to a quiz_questions insert/update payload.
 * Complex types merge preserved DB fields so the editor cannot silently wipe them.
 */
export function questionRecordToRow(
  quizId: string,
  position: number,
  question: QuestionRecordWithPreserved,
  existingId?: string,
): TablesInsert<"quiz_questions"> {
  const preserved = question.preservedDbFields;
  const dbType = preserved?.type ?? adminTypeToDb(question.type, question.options);

  if (isComplexDbType(dbType) || dbType === "map") {
    if (!preserved && (question.type === "Map Based" || question.type === "Matching" || question.type === "Ordering")) {
      throw new Error(
        `${question.type} questions cannot be created from the admin editor yet. Use supported types: Multiple Choice, True / False, Fill in the Blank, Image Based.`,
      );
    }
    return {
      ...(existingId ? { id: existingId } : {}),
      quiz_id: quizId,
      position,
      type: dbType,
      prompt: question.prompt.trim(),
      explanation: question.explanation.trim() || null,
      options: preserved?.options ?? null,
      answer_id: preserved?.answer_id ?? null,
      answer_ids: preserved?.answer_ids ?? null,
      answer_bool: preserved?.answer_bool ?? null,
      accepted: preserved?.accepted ?? null,
      placeholder: preserved?.placeholder ?? null,
      media: preserved?.media ?? buildMedia(question),
      regions: preserved?.regions ?? null,
      board_art: preserved?.board_art ?? null,
      items: preserved?.items ?? null,
      targets: preserved?.targets ?? null,
    };
  }

  const options = toChoiceOptions(question.options);
  const correctIds = correctOptionIds(question.options);
  const base: TablesInsert<"quiz_questions"> = {
    quiz_id: quizId,
    position,
    type: dbType,
    prompt: question.prompt.trim(),
    explanation: question.explanation.trim() || null,
    media: buildMedia(question),
    options: options.length > 0 ? (options as Json) : null,
    answer_id: null,
    answer_ids: null,
    answer_bool: null,
    accepted: null,
    placeholder: null,
    regions: null,
    board_art: null,
    items: null,
    targets: null,
  };
  if (existingId) base.id = existingId;

  switch (dbType) {
    case "boolean": {
      const isTrueOption = (o: QuestionRecord["options"][number]) =>
        o.id === "true" || o.text.trim().toLowerCase() === "true";
      const isFalseOption = (o: QuestionRecord["options"][number]) =>
        o.id === "false" || o.text.trim().toLowerCase() === "false";
      const trueSelected = question.options.find((o) => o.correct && isTrueOption(o));
      const falseSelected = question.options.find((o) => o.correct && isFalseOption(o));
      if (trueSelected) base.answer_bool = true;
      else if (falseSelected) base.answer_bool = false;
      else if (question.answerText.trim()) {
        base.answer_bool = question.answerText.trim().toLowerCase() === "true";
      } else if (correctIds.length === 1) {
        const opt = question.options.find((o) => o.id === correctIds[0]);
        if (opt && isTrueOption(opt)) base.answer_bool = true;
        else if (opt && isFalseOption(opt)) base.answer_bool = false;
        else base.answer_bool = false;
      } else {
        base.answer_bool = false;
      }
      if (question.type === "True / False" && question.options.length >= 2) {
        base.options = [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ] as Json;
      }
      break;
    }
    case "typed": {
      const answers = question.answerText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      base.accepted = answers.length > 0 ? answers : [question.answerText.trim()];
      base.placeholder = question.answerText.trim() || null;
      base.options = null;
      break;
    }
    case "image": {
      base.answer_id = correctIds[0] ?? null;
      break;
    }
    case "multiple": {
      base.answer_ids = correctIds;
      break;
    }
    case "single": {
      base.answer_id = correctIds[0] ?? null;
      break;
    }
  }

  return base;
}

export function questionRecordToUpdate(
  question: QuestionRecordWithPreserved,
): TablesUpdate<"quiz_questions"> {
  // Position is intentionally omitted — reorderQuestions() owns position changes.
  const row = questionRecordToRow("", 1, question, question.id);
  const { quiz_id: _quizId, position: _position, ...update } = row;
  return update;
}
