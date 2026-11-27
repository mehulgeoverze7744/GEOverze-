import type { QuestionMedia } from "../data/types";
import { resolveFlagUrl } from "./flagImage.ts";

const HAS_EXTENDED_CHAR = /[^\u0000-\u007f]/;
const REBUS_SEP = /\s\+\s|\+/;

/** Emoji Fun quiz sets from the play catalogue (`q-emo-*`). */
export function isEmojiFunQuizId(quizId?: string): boolean {
  return !!quizId?.startsWith("q-emo-");
}

/** Emoji/rebus clues stored as `kind: flag` in the seed — not ISO flags. */
export function isEmojiRebusMedia(media: QuestionMedia): boolean {
  if (media.kind === "emoji") return true;
  if (media.kind !== "flag" || !("glyph" in media) || !media.glyph) return false;
  if (resolveFlagUrl({ glyph: media.glyph, art: "art" in media ? media.art : undefined })) {
    return false;
  }
  const glyph = media.glyph.trim();
  if (!glyph) return false;
  return HAS_EXTENDED_CHAR.test(glyph) || REBUS_SEP.test(glyph);
}

export function parseEmojiRebusTokens(glyph: string): string[] {
  return glyph
    .split(/\s*\+\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}