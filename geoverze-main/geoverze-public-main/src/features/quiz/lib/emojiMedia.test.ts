import assert from "node:assert/strict";
import test from "node:test";

import type { QuestionMedia } from "../data/types.ts";
import { isEmojiRebusMedia, parseEmojiRebusTokens } from "./emojiMedia.ts";

test("multi-step meridians clue is treated as emoji rebus, not a flag", () => {
  const media: QuestionMedia = {
    kind: "flag",
    glyph: "KILL + A + 👨 + 🫙 + O",
  };
  assert.equal(isEmojiRebusMedia(media), true);
  assert.deepEqual(parseEmojiRebusTokens(media.glyph), ["KILL", "A", "👨", "🫙", "O"]);
});

test("real flag glyphs still resolve as flags", () => {
  const media: QuestionMedia = {
    kind: "flag",
    glyph: "🇮🇳",
    caption: "India",
  };
  assert.equal(isEmojiRebusMedia(media), false);
});