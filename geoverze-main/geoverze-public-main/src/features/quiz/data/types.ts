/**
 * The universal question model.
 *
 * Every quiz type in GVRZE — present and future — is expressed as one of
 * these objects. Screens never branch on the subject (flags, capitals, maps);
 * they branch on `type`, and `QuestionRenderer` owns that single switch. Adding
 * a new quiz type means adding a variant here plus one renderer component.
 */

/** Optional media attached to a question card. */
export type QuestionMedia =
  | { kind: "image"; art: string; caption?: string }
  | { kind: "illustration"; art: string; caption?: string }
  /** Flag glyph, ISO code, or country name — rendered as a real flag image. */
  | { kind: "flag"; glyph: string; caption?: string; art?: string }
  | { kind: "map"; art: string; caption?: string }
  | { kind: "audio"; caption?: string }
  | { kind: "video"; caption?: string };

export type Choice = {
  id: string;
  label: string;
  /** Cover-art seed for image-selection tiles. */
  art?: string;
  /** Emoji glyph for flag tiles. */
  glyph?: string;
  hint?: string;
};

/** A clickable region on the stylised map board (percent coordinates). */
export type MapRegion = {
  id: string;
  label: string;
  x: number;
  y: number;
};

type Base = {
  id: string;
  prompt: string;
  /** Shown after the answer is checked. */
  explanation?: string;
  media?: QuestionMedia;
};

export type QuizQuestion =
  | (Base & { type: "single"; options: Choice[]; answerId: string })
  | (Base & { type: "multiple"; options: Choice[]; answerIds: string[] })
  | (Base & { type: "boolean"; answer: boolean })
  | (Base & { type: "image"; options: Choice[]; answerId: string })
  | (Base & { type: "map"; regions: MapRegion[]; answerId: string; boardArt: string })
  | (Base & { type: "typed"; accepted: string[]; placeholder?: string })
  /** `items` is the correct chronological / ranked order. */
  | (Base & { type: "order"; items: string[] })
  /** `items[i]` matches `targets[i]`. */
  | (Base & { type: "dragdrop"; items: string[]; targets: string[] });

export type QuestionType = QuizQuestion["type"];

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  single: "Single choice",
  multiple: "Multiple choice",
  boolean: "True or false",
  image: "Image selection",
  map: "Map selection",
  typed: "Type the answer",
  order: "Arrange in order",
  dragdrop: "Drag and drop",
};

/** No question types are skipped as unfinished. */
export const PLACEHOLDER_TYPES: readonly QuestionType[] = [];

export type QuizSet = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  creator: string;
  art: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  minutes: number;
  language: string;
  rewards: { xp: number; credits: number };
  highScore: number;
  bestStreak: number;
  questions: QuizQuestion[];
};
