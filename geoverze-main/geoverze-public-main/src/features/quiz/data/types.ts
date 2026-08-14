/**
 * The universal question model.
 *
 * Every quiz type in GEOverze — present and future — is expressed as one of
 * these objects. Screens never branch on the subject (flags, capitals, maps);
 * they branch on `type`, and `QuestionRenderer` owns that single switch. Adding
 * a new quiz type means adding a variant here plus one renderer component.
 */

/** Optional media attached to a question card. */
export type QuestionMedia =
  | { kind: "image"; art: string; caption?: string }
  | { kind: "illustration"; art: string; caption?: string }
  /** Emoji flag keeps the engine image-free until real assets land. */
  | { kind: "flag"; glyph: string; caption?: string }
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
  /** Shown in review. Placeholder copy until the content pipeline lands. */
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
  /** Reserved types — renderers show a labelled placeholder for now. */
  | (Base & { type: "order"; items: string[] })
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

/** Types that are declared but not yet playable. */
export const PLACEHOLDER_TYPES: readonly QuestionType[] = ["order", "dragdrop"];

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
  /** Placeholder progression values until the backend owns them. */
  rewards: { xp: number; credits: number };
  highScore: number;
  bestStreak: number;
  questions: QuizQuestion[];
};
