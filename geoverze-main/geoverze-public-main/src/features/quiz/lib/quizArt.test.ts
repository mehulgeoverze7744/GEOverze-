import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { resolveQuizArtKey } from "./quizArt.ts";

const publicRoot = join(process.cwd(), "public");

test("outline-cl maps to a bundled SVG", () => {
  const url = resolveQuizArtKey("outline-cl");
  assert.equal(url, "/assets/quizzes/outlines/outline-cl.svg");
  assert.equal(existsSync(join(publicRoot, url!.slice(1))), true);
});

test("quiz-cover resolves emoji fun thumbnail", () => {
  const url = resolveQuizArtKey("quiz-cover:q-emo-multi-step-meridians");
  assert.ok(url?.includes("emo-multi-step-meridians"));
});